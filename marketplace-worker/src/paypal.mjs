const paypalBaseUrl = (environment) => environment === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

const readJson = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const error = new Error("PayPal request failed.");
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
};

export const createPayPalClient = ({ fetchImpl = fetch } = {}) => {
  const accessToken = async (env) => {
    const response = await fetchImpl(`${paypalBaseUrl(env.PAYPAL_ENVIRONMENT)}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const data = await readJson(response);
    if (typeof data.access_token !== "string") throw new Error("PayPal did not return an access token.");
    return data.access_token;
  };

  const request = async (env, path, options = {}) => {
    const token = await accessToken(env);
    return readJson(await fetchImpl(`${paypalBaseUrl(env.PAYPAL_ENVIRONMENT)}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    }));
  };

  return {
    createOrder: (env, payload, requestId) => request(env, "/v2/checkout/orders", {
      method: "POST",
      headers: { "PayPal-Request-Id": requestId },
      body: JSON.stringify(payload),
    }),
    captureOrder: (env, orderId, requestId) => request(env, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: { "PayPal-Request-Id": requestId },
    }),
    getOrder: (env, orderId) => request(env, `/v2/checkout/orders/${encodeURIComponent(orderId)}`),
    verifyWebhook: (env, headers, event) => request(env, "/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: event,
      }),
    }),
  };
};

export const paypalOrderPayload = ({ product, amount, reference, marketplaceOrigin }) => ({
  intent: "CAPTURE",
  purchase_units: [{
    reference_id: reference,
    custom_id: `${product.id}@${product.version}`,
    description: product.name,
    amount: { currency_code: "USD", value: amount },
  }],
  payment_source: {
    paypal: {
      experience_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${marketplaceOrigin}/marketplace/${product.id}/`,
        cancel_url: `${marketplaceOrigin}/marketplace/${product.id}/`,
      },
    },
  },
});
