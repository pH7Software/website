import { createPayPalClient, paypalOrderPayload } from "./paypal.mjs";
import { productsById } from "./catalog.mjs";
import { createDownloadToken, readDownloadToken, recoveryRateKey } from "./security.mjs";
import { isContributionAllowed, parseUsdCents } from "../../src/lib/marketplace.mjs";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };
const idempotencyPattern = /^[A-Za-z0-9_-]{16,108}$/;
const paypalOrderPattern = /^[A-Za-z0-9-]{10,64}$/;
const paypalMerchantPattern = /^[2-9A-HJ-NP-Z]{13}$/;
const maximumBodyBytes = 8192;
const downloadLifetimeMs = 24 * 60 * 60 * 1000;

class HttpError extends Error {
  constructor(status, publicMessage) {
    super(publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

const corsHeaders = (request, env) => request.headers.get("Origin") === env.MARKETPLACE_ORIGIN
  ? { "Access-Control-Allow-Origin": env.MARKETPLACE_ORIGIN, Vary: "Origin" }
  : {};

const json = (request, env, body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...jsonHeaders, ...corsHeaders(request, env) },
});

const readBodyText = async (request) => {
  const declared = Number(request.headers.get("Content-Length") ?? "0");
  if (declared > maximumBodyBytes) throw new HttpError(413, "Request is too large.");
  const text = await request.text();
  if (text.length > maximumBodyBytes) throw new HttpError(413, "Request is too large.");
  return text;
};

const parseBody = (text) => {
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
};

const readBody = async (request) => parseBody(await readBodyText(request));

const requireOrigin = (request, env) => {
  if (request.headers.get("Origin") !== env.MARKETPLACE_ORIGIN) {
    throw new HttpError(403, "Request origin is not allowed.");
  }
};

const requireIdempotencyKey = (request) => {
  const key = request.headers.get("Idempotency-Key") ?? "";
  if (!idempotencyPattern.test(key)) throw new HttpError(400, "A valid idempotency key is required.");
  return key;
};

const isSecureOrigin = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === value;
  } catch {
    return false;
  }
};

const purchasesEnabled = (env) => env.PURCHASES_ENABLED === "true"
  && ["sandbox", "production"].includes(env.PAYPAL_ENVIRONMENT)
  && (env.PAYPAL_ENVIRONMENT !== "production" || env.ALLOW_PRODUCTION === "true")
  && isSecureOrigin(env.API_ORIGIN)
  && isSecureOrigin(env.MARKETPLACE_ORIGIN)
  && typeof env.PAYPAL_CLIENT_ID === "string" && env.PAYPAL_CLIENT_ID.length >= 10
  && typeof env.PAYPAL_CLIENT_SECRET === "string" && env.PAYPAL_CLIENT_SECRET.length >= 20
  && typeof env.PAYPAL_WEBHOOK_ID === "string" && env.PAYPAL_WEBHOOK_ID.length >= 10
  && paypalMerchantPattern.test(env.PAYPAL_MERCHANT_ID ?? "")
  && typeof env.DOWNLOAD_SIGNING_SECRET === "string" && env.DOWNLOAD_SIGNING_SECRET.length >= 32;

const readVerifiedProduct = (catalog, productId, productVersion) => {
  const product = catalog.get(productId);
  if (!product
    || product.version !== productVersion
    || product.verification.status !== "verified"
    || !product.purchasable) {
    throw new HttpError(404, "Product is not available for purchase.");
  }
  return product;
};

const normalizedAmount = (amount) => {
  const cents = parseUsdCents(amount);
  if (cents === null) throw new HttpError(400, "Contribution amount is invalid.");
  return (cents / 100).toFixed(2);
};

const newDownloadToken = (order, env, now) => createDownloadToken({
  orderId: order.paypal_order_id,
  productId: order.product_id,
  productVersion: order.product_version,
  exp: now() + downloadLifetimeMs,
}, env.DOWNLOAD_SIGNING_SECRET);

const orderCapture = (response) => response.purchase_units?.[0]?.payments?.captures?.[0];

const verifiedCapture = (order, response, env) => {
  const capture = orderCapture(response);
  const unit = response.purchase_units?.[0];
  return response.status === "COMPLETED"
    && capture
    && capture.amount?.currency_code === order.currency
    && capture.amount?.value === order.amount
    && unit?.custom_id === `${order.product_id}@${order.product_version}`
    && unit?.payee?.merchant_id === env.PAYPAL_MERCHANT_ID
    && typeof capture.id === "string"
    ? capture
    : null;
};

const findOrder = (env, orderId) => env.ORDERS.prepare(
  "SELECT * FROM marketplace_orders WHERE paypal_order_id = ? LIMIT 1",
).bind(orderId).first();

const issueDownload = async (env, catalog, token, now) => {
  const claims = await readDownloadToken(token, env.DOWNLOAD_SIGNING_SECRET, now());
  if (!claims) throw new HttpError(404, "Download link is invalid or expired.");
  const product = catalog.get(claims.productId);
  if (!product || product.version !== claims.productVersion || product.verification.status !== "verified") {
    throw new HttpError(404, "Package is unavailable.");
  }
  const order = await findOrder(env, claims.orderId);
  if (!order
    || order.status !== "COMPLETED"
    || order.product_id !== claims.productId
    || order.product_version !== claims.productVersion) {
    throw new HttpError(404, "Download is unavailable.");
  }

  const object = await env.PRODUCTS.get(product.package.artifactKey);
  if (!object) throw new HttpError(503, "Package storage is temporarily unavailable.");
  const headers = new Headers({
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${product.package.filename}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Package-SHA256": product.package.sha256,
  });
  if (typeof object.writeHttpMetadata === "function") object.writeHttpMetadata(headers);
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  await env.ORDERS.prepare(
    "UPDATE marketplace_orders SET download_count = download_count + 1, last_downloaded_at = ? WHERE paypal_order_id = ?",
  ).bind(new Date(now()).toISOString(), claims.orderId).run();
  return new Response(object.body, { headers });
};

const createOrder = async (request, env, catalog, paypal, now, randomUUID) => {
  requireOrigin(request, env);
  if (!purchasesEnabled(env)) throw new HttpError(503, "Purchases are temporarily paused.");
  const idempotencyKey = requireIdempotencyKey(request);
  const body = await readBody(request);
  const product = readVerifiedProduct(catalog, body.productId, body.productVersion);
  if (body.currency !== "USD") throw new HttpError(400, "Only USD contributions are supported.");
  const amount = normalizedAmount(body.amount);
  if (!isContributionAllowed(product, amount, body.currency)) {
    throw new HttpError(400, `Contribution must be at least $${product.pricing.minimum.toFixed(2)} USD.`);
  }

  const existing = await env.ORDERS.prepare(
    "SELECT * FROM marketplace_orders WHERE idempotency_key = ? LIMIT 1",
  ).bind(idempotencyKey).first();
  if (existing) {
    if (existing.product_id !== product.id || existing.product_version !== product.version || existing.amount !== amount) {
      throw new HttpError(409, "Idempotency key was already used for another order.");
    }
    return json(request, env, { orderId: existing.paypal_order_id, status: existing.status }, 200);
  }

  const reference = randomUUID();
  const order = await paypal.createOrder(env, paypalOrderPayload({
    product,
    amount,
    reference,
    merchantId: env.PAYPAL_MERCHANT_ID,
    marketplaceOrigin: env.MARKETPLACE_ORIGIN,
  }), idempotencyKey);
  if (!paypalOrderPattern.test(order.id ?? "") || order.status !== "CREATED") {
    throw new HttpError(502, "PayPal did not create a valid order.");
  }
  await env.ORDERS.prepare(
    `INSERT INTO marketplace_orders
      (idempotency_key, paypal_order_id, product_id, product_version, amount, currency, status, reference, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'CREATED', ?, ?, ?)`,
  ).bind(
    idempotencyKey,
    order.id,
    product.id,
    product.version,
    amount,
    "USD",
    reference,
    new Date(now()).toISOString(),
    new Date(now()).toISOString(),
  ).run();
  console.info("marketplace_order_created", { productId: product.id, orderId: order.id });
  return json(request, env, { orderId: order.id, status: "CREATED" }, 201);
};

const captureOrder = async (request, env, paypal, orderId, now) => {
  requireOrigin(request, env);
  if (!purchasesEnabled(env)) throw new HttpError(503, "Purchases are temporarily paused.");
  if (!paypalOrderPattern.test(orderId)) throw new HttpError(404, "Order was not found.");
  const order = await findOrder(env, orderId);
  if (!order) throw new HttpError(404, "Order was not found.");
  if (order.status === "COMPLETED") {
    const token = await newDownloadToken(order, env, now);
    return json(request, env, { status: "COMPLETED", downloadUrl: `${env.API_ORIGIN}/v1/download/${token}` });
  }
  if (order.status === "PENDING") {
    return json(request, env, {
      status: "PENDING",
      orderId,
      message: "PayPal is still processing this payment.",
    }, 202);
  }
  if (order.status !== "CREATED" && order.status !== "APPROVED") {
    throw new HttpError(409, "Order cannot be captured.");
  }

  const response = await paypal.captureOrder(env, orderId, `capture-${order.reference}`);
  const capture = verifiedCapture(order, response, env);
  if (!capture) throw new HttpError(502, "Captured payment did not match the order.");
  if (capture.status === "PENDING") {
    await env.ORDERS.prepare(
      "UPDATE marketplace_orders SET status = 'PENDING', paypal_capture_id = ?, updated_at = ? WHERE paypal_order_id = ? AND status IN ('CREATED', 'APPROVED')",
    ).bind(capture.id, new Date(now()).toISOString(), orderId).run();
    return json(request, env, {
      status: "PENDING",
      orderId,
      message: "PayPal is still processing this payment.",
    }, 202);
  }
  if (["DECLINED", "FAILED"].includes(capture.status)) {
    await env.ORDERS.prepare(
      "UPDATE marketplace_orders SET status = 'DENIED', paypal_capture_id = ?, updated_at = ? WHERE paypal_order_id = ? AND status IN ('CREATED', 'APPROVED')",
    ).bind(capture.id, new Date(now()).toISOString(), orderId).run();
    throw new HttpError(409, "PayPal did not complete this payment.");
  }
  if (capture.status !== "COMPLETED") throw new HttpError(502, "PayPal returned an unsupported capture state.");
  await env.ORDERS.prepare(
    "UPDATE marketplace_orders SET status = 'COMPLETED', paypal_capture_id = ?, updated_at = ? WHERE paypal_order_id = ? AND status IN ('CREATED', 'APPROVED')",
  ).bind(capture.id, new Date(now()).toISOString(), orderId).run();
  const completedOrder = { ...order, status: "COMPLETED", paypal_capture_id: capture.id };
  const token = await newDownloadToken(completedOrder, env, now);
  console.info("marketplace_order_completed", { productId: order.product_id, orderId });
  return json(request, env, { status: "COMPLETED", downloadUrl: `${env.API_ORIGIN}/v1/download/${token}` });
};

const recoverPurchase = async (request, env, paypal, now) => {
  requireOrigin(request, env);
  const body = await readBody(request);
  if (!paypalOrderPattern.test(body.orderId ?? "") || typeof body.email !== "string" || body.email.length > 254) {
    throw new HttpError(400, "Purchase details are invalid.");
  }
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const hour = Math.floor(now() / 3_600_000);
  const rateKey = await recoveryRateKey(ip, env.DOWNLOAD_SIGNING_SECRET, hour);
  const attempt = await env.ORDERS.prepare(
    `INSERT INTO marketplace_recovery_limits (rate_key, attempts, expires_at)
     VALUES (?, 1, ?) ON CONFLICT(rate_key) DO UPDATE SET attempts = attempts + 1
     RETURNING attempts`,
  ).bind(rateKey, new Date((hour + 2) * 3_600_000).toISOString()).first();
  if ((attempt?.attempts ?? 6) > 5) throw new HttpError(429, "Too many recovery attempts. Try again later.");

  const order = await findOrder(env, body.orderId);
  if (!order || order.status !== "COMPLETED") throw new HttpError(404, "Purchase could not be verified.");
  const remote = await paypal.getOrder(env, body.orderId);
  const email = remote.payer?.email_address;
  const merchantId = remote.purchase_units?.[0]?.payee?.merchant_id;
  if (remote.status !== "COMPLETED"
    || merchantId !== env.PAYPAL_MERCHANT_ID
    || typeof email !== "string"
    || email.toLowerCase() !== body.email.trim().toLowerCase()) {
    throw new HttpError(404, "Purchase could not be verified.");
  }
  const token = await newDownloadToken(order, env, now);
  return json(request, env, { downloadUrl: `${env.API_ORIGIN}/v1/download/${token}` });
};

const webhookOrderId = (event) => event.resource?.supplementary_data?.related_ids?.order_id;
const webhookCaptureId = (event) => event.resource?.supplementary_data?.related_ids?.capture_id ?? event.resource?.id;

const processWebhook = async (request, env, paypal, now) => {
  const rawEvent = await readBodyText(request);
  const event = parseBody(rawEvent);
  if (typeof event.id !== "string" || event.id.length > 127 || typeof event.event_type !== "string") {
    throw new HttpError(400, "Webhook event is invalid.");
  }
  const verification = await paypal.verifyWebhook(env, request.headers, rawEvent);
  if (verification.verification_status !== "SUCCESS") throw new HttpError(400, "Webhook signature is invalid.");

  const existing = await env.ORDERS.prepare(
    "SELECT event_id FROM marketplace_webhook_events WHERE event_id = ? LIMIT 1",
  ).bind(event.id).first();
  if (existing) return json(request, env, { received: true, duplicate: true });

  const timestamp = new Date(now()).toISOString();
  if (["PAYMENT.CAPTURE.PENDING", "PAYMENT.CAPTURE.COMPLETED"].includes(event.event_type)) {
    const orderId = webhookOrderId(event);
    const order = paypalOrderPattern.test(orderId ?? "") ? await findOrder(env, orderId) : null;
    const amount = event.resource?.amount;
    if (order
      && amount?.currency_code === order.currency
      && amount?.value === order.amount
      && event.resource?.payee?.merchant_id === env.PAYPAL_MERCHANT_ID
      && (!event.resource?.custom_id || event.resource.custom_id === `${order.product_id}@${order.product_version}`)) {
      const status = event.event_type === "PAYMENT.CAPTURE.COMPLETED" ? "COMPLETED" : "PENDING";
      const mutableStates = status === "COMPLETED"
        ? "('CREATED', 'APPROVED', 'PENDING', 'COMPLETED')"
        : "('CREATED', 'APPROVED', 'PENDING')";
      await env.ORDERS.prepare(
        `UPDATE marketplace_orders SET status = ?, paypal_capture_id = ?, updated_at = ? WHERE paypal_order_id = ? AND status IN ${mutableStates}`,
      ).bind(status, event.resource.id, timestamp, orderId).run();
    }
  } else if (["PAYMENT.CAPTURE.REFUNDED", "PAYMENT.CAPTURE.REVERSED", "PAYMENT.CAPTURE.DENIED"].includes(event.event_type)) {
    const status = event.event_type === "PAYMENT.CAPTURE.REFUNDED"
      ? "REFUNDED"
      : event.event_type === "PAYMENT.CAPTURE.REVERSED" ? "REVERSED" : "DENIED";
    await env.ORDERS.prepare(
      "UPDATE marketplace_orders SET status = ?, updated_at = ? WHERE paypal_capture_id = ?",
    ).bind(status, timestamp, webhookCaptureId(event)).run();
  }

  await env.ORDERS.prepare(
    "INSERT INTO marketplace_webhook_events (event_id, event_type, processed_at) VALUES (?, ?, ?)",
  ).bind(event.id, event.event_type, timestamp).run();
  console.info("marketplace_webhook_processed", { eventId: event.id, eventType: event.event_type });
  return json(request, env, { received: true });
};

export const createMarketplaceWorker = ({
  catalog = productsById,
  paypal = createPayPalClient(),
  now = () => Date.now(),
  randomUUID = () => crypto.randomUUID(),
} = {}) => ({
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (request.method === "OPTIONS") {
        requireOrigin(request, env);
        return new Response(null, {
          status: 204,
          headers: {
            ...corsHeaders(request, env),
            "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Max-Age": "600",
          },
        });
      }
      if (request.method === "GET" && url.pathname === "/v1/config") {
        requireOrigin(request, env);
        const enabled = purchasesEnabled(env);
        return json(request, env, {
          enabled,
          environment: env.PAYPAL_ENVIRONMENT === "production" ? "production" : "sandbox",
          ...(enabled ? { clientId: env.PAYPAL_CLIENT_ID } : {}),
        });
      }
      if (request.method === "POST" && url.pathname === "/v1/orders") {
        return await createOrder(request, env, catalog, paypal, now, randomUUID);
      }
      const captureMatch = request.method === "POST" && url.pathname.match(/^\/v1\/orders\/([^/]+)\/capture$/);
      if (captureMatch) return await captureOrder(request, env, paypal, decodeURIComponent(captureMatch[1]), now);
      if (request.method === "POST" && url.pathname === "/v1/recover") {
        return await recoverPurchase(request, env, paypal, now);
      }
      if (request.method === "POST" && url.pathname === "/v1/webhooks/paypal") {
        return await processWebhook(request, env, paypal, now);
      }
      const downloadMatch = request.method === "GET" && url.pathname.match(/^\/v1\/download\/([^/]+)$/);
      if (downloadMatch) return await issueDownload(env, catalog, decodeURIComponent(downloadMatch[1]), now);
      return json(request, env, { error: "Not found." }, 404);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status >= 500) console.error("marketplace_request_failed", { path: url.pathname, status });
      return json(request, env, { error: error instanceof HttpError ? error.publicMessage : "Request could not be completed." }, status);
    }
  },
});

export default createMarketplaceWorker();
