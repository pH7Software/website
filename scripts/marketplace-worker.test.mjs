import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createMarketplaceWorker } from "../marketplace-worker/src/index.mjs";
import { paypalWebhookVerificationPayload } from "../marketplace-worker/src/paypal.mjs";
import { createDownloadToken } from "../marketplace-worker/src/security.mjs";

const baseProduct = JSON.parse(await readFile(
  new URL("../marketplace/catalog/community-events-mini.json", import.meta.url),
  "utf8",
));
const product = {
  ...structuredClone(baseProduct),
  package: { ...baseProduct.package, sha256: "b".repeat(64), sizeBytes: 7 },
  verification: {
    status: "verified",
    verifiedAt: "2026-11-23",
    checks: ["php-lint", "package-structure", "core-compatibility"],
  },
  purchasable: true,
};
const catalog = new Map([[product.id, product]]);
const fixedNow = Date.parse("2026-11-23T00:00:00Z");

class MockD1 {
  constructor() {
    this.orders = [];
    this.events = new Map();
    this.recovery = new Map();
  }

  prepare(sql) {
    const database = this;
    return {
      bind(...values) {
        return {
          async first() {
            if (sql.includes("WHERE idempotency_key")) return database.orders.find((order) => order.idempotency_key === values[0]) ?? null;
            if (sql.includes("WHERE paypal_order_id")) return database.orders.find((order) => order.paypal_order_id === values[0]) ?? null;
            if (sql.includes("FROM marketplace_webhook_events")) return database.events.has(values[0]) ? { event_id: values[0] } : null;
            if (sql.includes("marketplace_recovery_limits")) {
              const attempts = (database.recovery.get(values[0]) ?? 0) + 1;
              database.recovery.set(values[0], attempts);
              return { attempts };
            }
            throw new Error(`Unexpected first query: ${sql}`);
          },
          async run() {
            if (sql.includes("INSERT INTO marketplace_orders")) {
              database.orders.push({
                idempotency_key: values[0],
                paypal_order_id: values[1],
                product_id: values[2],
                product_version: values[3],
                amount: values[4],
                currency: values[5],
                status: "CREATED",
                reference: values[6],
                created_at: values[7],
                updated_at: values[8],
                paypal_capture_id: null,
                download_count: 0,
              });
              return { success: true };
            }
            if (sql.includes("status = 'COMPLETED'")) {
              const orderId = values.at(-1);
              const order = database.orders.find((item) => item.paypal_order_id === orderId);
              if (order) {
                order.status = "COMPLETED";
                order.paypal_capture_id = values[0];
                order.updated_at = values[1];
              }
              return { success: true };
            }
            if (sql.includes("status = 'PENDING'") || sql.includes("status = 'DENIED'")) {
              const order = database.orders.find((item) => item.paypal_order_id === values[2]);
              if (order) {
                order.status = sql.includes("status = 'PENDING'") ? "PENDING" : "DENIED";
                order.paypal_capture_id = values[0];
                order.updated_at = values[1];
              }
              return { success: true };
            }
            if (sql.includes("download_count = download_count + 1")) {
              const order = database.orders.find((item) => item.paypal_order_id === values[1]);
              if (order) order.download_count += 1;
              return { success: true };
            }
            if (sql.includes("SET status = ?, paypal_capture_id")) {
              const order = database.orders.find((item) => item.paypal_order_id === values[3]);
              if (order) {
                order.status = values[0];
                order.paypal_capture_id = values[1];
                order.updated_at = values[2];
              }
              return { success: true };
            }
            if (sql.includes("SET status = ?")) {
              const order = database.orders.find((item) => item.paypal_capture_id === values[2]);
              if (order) order.status = values[0];
              return { success: true };
            }
            if (sql.includes("INSERT INTO marketplace_webhook_events")) {
              database.events.set(values[0], { type: values[1], processedAt: values[2] });
              return { success: true };
            }
            throw new Error(`Unexpected run query: ${sql}`);
          },
        };
      },
    };
  }
}

const paypal = () => {
  const state = {
    createCalls: 0,
    captureCalls: 0,
    verifyCalls: 0,
    captureStatus: "COMPLETED",
    mismatchedCapture: false,
    mismatchedMerchant: false,
  };
  return {
    state,
    async createOrder(_env, payload) {
      state.createCalls += 1;
      state.lastPayload = payload;
      return { id: "ORDER123456789", status: "CREATED" };
    },
    async captureOrder(_env, _orderId, idempotencyKey) {
      state.captureCalls += 1;
      state.captureIdempotencyKey = idempotencyKey;
      return {
        status: "COMPLETED",
        purchase_units: [{
          custom_id: `${product.id}@${product.version}`,
          payee: { merchant_id: state.mismatchedMerchant ? "2WRNGMERCHANT" : "2BCDEFGHJKLMN" },
          payments: { captures: [{
            id: "CAPTURE123456",
            status: state.captureStatus,
            amount: { currency_code: "USD", value: state.mismatchedCapture ? "99.00" : "29.00" },
          }] },
        }],
      };
    },
    async getOrder() {
      return {
        status: "COMPLETED",
        payer: { email_address: "buyer@example.com" },
        purchase_units: [{ payee: { merchant_id: "2BCDEFGHJKLMN" } }],
      };
    },
    async verifyWebhook(_env, _headers, rawEvent) {
      state.verifyCalls += 1;
      state.lastWebhookRaw = rawEvent;
      return { verification_status: "SUCCESS" };
    },
  };
};

const environment = (database = new MockD1()) => ({
  ORDERS: database,
  PRODUCTS: {
    async get(key) {
      return key === product.package.artifactKey
        ? { body: "package", httpEtag: '"etag"', writeHttpMetadata() {} }
        : null;
    },
  },
  API_ORIGIN: "https://marketplace-api.ph7builder.com",
  MARKETPLACE_ORIGIN: "https://ph7builder.com",
  PAYPAL_ENVIRONMENT: "sandbox",
  PAYPAL_CLIENT_ID: "sandbox-client-id",
  PAYPAL_CLIENT_SECRET: "sandbox-client-secret-for-tests",
  PAYPAL_WEBHOOK_ID: "sandbox-webhook",
  PAYPAL_MERCHANT_ID: "2BCDEFGHJKLMN",
  DOWNLOAD_SIGNING_SECRET: "a-test-secret-long-enough-for-hmac",
  PURCHASES_ENABLED: "true",
  ALLOW_PRODUCTION: "false",
});

const request = (path, options = {}) => new Request(`https://marketplace-api.ph7builder.com${path}`, {
  ...options,
  headers: {
    Origin: "https://ph7builder.com",
    ...(options.headers ?? {}),
  },
});

const orderBody = (overrides = {}) => JSON.stringify({
  productId: product.id,
  productVersion: product.version,
  amount: "29.00",
  currency: "USD",
  ...overrides,
});

const newWorker = (client, options = {}) => createMarketplaceWorker({
  catalog,
  paypal: client,
  now: () => options.now ?? fixedNow,
  randomUUID: () => "reference-123456789",
});

const createOrder = (worker, env, key = "idempotency-key-1234", body = orderBody()) => worker.fetch(request("/v1/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": key },
  body,
}), env);

test("configuration keeps production disabled without the independent production gate", async () => {
  const env = environment();
  env.PAYPAL_ENVIRONMENT = "production";
  const response = await newWorker(paypal()).fetch(request("/v1/config"), env);
  assert.deepEqual(await response.json(), { enabled: false, environment: "production" });
});

test("order creation rejects browser price tampering and incorrect currency", async () => {
  const client = paypal();
  const worker = newWorker(client);
  const env = environment();
  const low = await createOrder(worker, env, "idempotency-low-123", orderBody({ amount: "8.99" }));
  assert.equal(low.status, 400);
  const currency = await createOrder(worker, env, "idempotency-eur-123", orderBody({ currency: "EUR" }));
  assert.equal(currency.status, 400);
  assert.equal(client.state.createCalls, 0);
});

test("order creation uses verified manifest data and is idempotent", async () => {
  const client = paypal();
  const worker = newWorker(client);
  const env = environment();
  const first = await createOrder(worker, env);
  assert.equal(first.status, 201);
  assert.deepEqual(await first.json(), { orderId: "ORDER123456789", status: "CREATED" });
  assert.equal(client.state.lastPayload.purchase_units[0].custom_id, `${product.id}@${product.version}`);
  assert.equal(client.state.lastPayload.purchase_units[0].payee.merchant_id, "2BCDEFGHJKLMN");
  assert.equal(client.state.lastPayload.purchase_units[0].amount.value, "29.00");
  assert.equal(
    client.state.lastPayload.payment_source.paypal.experience_context.return_url,
    "https://ph7builder.com/marketplace/community-events-mini/",
  );
  const duplicate = await createOrder(worker, env);
  assert.equal(duplicate.status, 200);
  assert.equal(client.state.createCalls, 1);
});

test("capture rejects a PayPal amount that does not match the stored order", async () => {
  const client = paypal();
  const worker = newWorker(client);
  const env = environment();
  await createOrder(worker, env);
  client.state.mismatchedCapture = true;
  const response = await worker.fetch(request("/v1/orders/ORDER123456789/capture", {
    method: "POST",
    headers: { "Idempotency-Key": "capture-key-123456" },
  }), env);
  assert.equal(response.status, 502);
  assert.equal(env.ORDERS.orders[0].status, "CREATED");
});

test("capture rejects a payment routed to another merchant", async () => {
  const client = paypal();
  const worker = newWorker(client);
  const env = environment();
  await createOrder(worker, env);
  client.state.mismatchedMerchant = true;
  const response = await worker.fetch(request("/v1/orders/ORDER123456789/capture", {
    method: "POST",
    headers: { "Idempotency-Key": "capture-key-merchant" },
  }), env);
  assert.equal(response.status, 502);
  assert.equal(env.ORDERS.orders[0].status, "CREATED");
});

test("pending capture grants nothing until a verified completion webhook arrives", async () => {
  const client = paypal();
  client.state.captureStatus = "PENDING";
  const worker = newWorker(client);
  const env = environment();
  await createOrder(worker, env);
  const pending = await worker.fetch(request("/v1/orders/ORDER123456789/capture", {
    method: "POST",
    headers: { "Idempotency-Key": "capture-key-pending" },
  }), env);
  assert.equal(pending.status, 202);
  assert.deepEqual(await pending.json(), {
    status: "PENDING",
    orderId: "ORDER123456789",
    message: "PayPal is still processing this payment.",
  });
  assert.equal(env.ORDERS.orders[0].status, "PENDING");

  const event = {
    id: "WH-COMPLETE-123",
    event_type: "PAYMENT.CAPTURE.COMPLETED",
    resource: {
      id: "CAPTURE123456",
      amount: { currency_code: "USD", value: "29.00" },
      payee: { merchant_id: "2BCDEFGHJKLMN" },
      supplementary_data: { related_ids: { order_id: "ORDER123456789" } },
    },
  };
  const rawEvent = JSON.stringify(event, null, 2);
  const webhook = await worker.fetch(new Request("https://marketplace-api.ph7builder.com/v1/webhooks/paypal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: rawEvent,
  }), env);
  assert.equal(webhook.status, 200);
  assert.equal(client.state.lastWebhookRaw, rawEvent);
  assert.equal(env.ORDERS.orders[0].status, "COMPLETED");
});

test("completed capture grants an expiring link to the manifest package only", async () => {
  const client = paypal();
  const worker = newWorker(client);
  const env = environment();
  await createOrder(worker, env);
  const capture = await worker.fetch(request("/v1/orders/ORDER123456789/capture", {
    method: "POST",
    headers: { "Idempotency-Key": "capture-key-123456" },
  }), env);
  assert.equal(capture.status, 200);
  const { downloadUrl } = await capture.json();
  assert.equal(client.state.captureIdempotencyKey, "capture-reference-123456789");
  const download = await worker.fetch(new Request(downloadUrl), env);
  assert.equal(download.status, 200);
  assert.equal(download.headers.get("X-Package-SHA256"), product.package.sha256);
  assert.equal(await download.text(), "package");
  assert.equal(env.ORDERS.orders[0].download_count, 1);

  const expiredWorker = newWorker(client, { now: fixedNow + 24 * 60 * 60 * 1000 + 1 });
  const expired = await expiredWorker.fetch(new Request(downloadUrl), env);
  assert.equal(expired.status, 404);
});

test("verified refund webhook revokes downloads and duplicate delivery is harmless", async () => {
  const client = paypal();
  const worker = newWorker(client);
  const env = environment();
  await createOrder(worker, env);
  const capture = await worker.fetch(request("/v1/orders/ORDER123456789/capture", {
    method: "POST",
    headers: { "Idempotency-Key": "capture-key-123456" },
  }), env);
  const { downloadUrl } = await capture.json();
  const event = {
    id: "WH-REFUND-123",
    event_type: "PAYMENT.CAPTURE.REFUNDED",
    resource: { id: "REFUND123", supplementary_data: { related_ids: { capture_id: "CAPTURE123456" } } },
  };
  const webhookRequest = () => new Request("https://marketplace-api.ph7builder.com/v1/webhooks/paypal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  const first = await worker.fetch(webhookRequest(), env);
  const duplicate = await worker.fetch(webhookRequest(), env);
  assert.equal(first.status, 200);
  assert.deepEqual(await duplicate.json(), { received: true, duplicate: true });
  assert.equal(env.ORDERS.orders[0].status, "REFUNDED");
  assert.equal((await worker.fetch(new Request(downloadUrl), env)).status, 404);
});

test("unverified webhook cannot change an order", async () => {
  const client = paypal();
  client.verifyWebhook = async () => ({ verification_status: "FAILURE" });
  const worker = newWorker(client);
  const env = environment();
  const response = await worker.fetch(new Request("https://marketplace-api.ph7builder.com/v1/webhooks/paypal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "WH-FAKE-123", event_type: "PAYMENT.CAPTURE.REFUNDED", resource: {} }),
  }), env);
  assert.equal(response.status, 400);
  assert.equal(env.ORDERS.events.size, 0);
});

test("purchase recovery validates PayPal payer email without storing it", async () => {
  const client = paypal();
  const worker = newWorker(client);
  const env = environment();
  await createOrder(worker, env);
  await worker.fetch(request("/v1/orders/ORDER123456789/capture", {
    method: "POST",
    headers: { "Idempotency-Key": "capture-key-123456" },
  }), env);
  const wrong = await worker.fetch(request("/v1/recover", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.1" },
    body: JSON.stringify({ orderId: "ORDER123456789", email: "wrong@example.com" }),
  }), env);
  assert.equal(wrong.status, 404);
  const recovered = await worker.fetch(request("/v1/recover", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.1" },
    body: JSON.stringify({ orderId: "ORDER123456789", email: "buyer@example.com" }),
  }), env);
  assert.equal(recovered.status, 200);
  assert.match((await recovered.json()).downloadUrl, /\/v1\/download\//);
  assert.equal("email" in env.ORDERS.orders[0], false);
});

test("download tokens reject path-shaped product identifiers", async () => {
  const env = environment();
  const token = await createDownloadToken({
    orderId: "ORDER123456789",
    productId: "../../secret",
    productVersion: "1.0.0",
    exp: fixedNow + 1000,
  }, env.DOWNLOAD_SIGNING_SECRET);
  const response = await newWorker(paypal()).fetch(
    new Request(`https://marketplace-api.ph7builder.com/v1/download/${token}`),
    env,
  );
  assert.equal(response.status, 404);
});

test("PayPal webhook verification keeps the original event JSON", () => {
  const headers = new Headers({
    "paypal-auth-algo": "SHA256withRSA",
    "paypal-cert-url": "https://api.paypal.com/cert.pem",
    "paypal-transmission-id": "transmission-123",
    "paypal-transmission-sig": "signature-123",
    "paypal-transmission-time": "2026-11-27T00:00:00Z",
  });
  const rawEvent = '{\n  "id": "WH-RAW-123",\n  "event_type": "PAYMENT.CAPTURE.COMPLETED"\n}';
  const payload = paypalWebhookVerificationPayload(headers, rawEvent, "webhook-123");
  assert.ok(payload.endsWith(`"webhook_event":${rawEvent}}`));
  assert.equal(JSON.parse(payload).webhook_event.id, "WH-RAW-123");
});
