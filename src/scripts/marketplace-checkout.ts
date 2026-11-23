export {};

type MarketplaceApiConfig = {
  enabled: boolean;
  environment: "sandbox" | "production";
  clientId?: string;
};

type PayPalApproval = { orderId: string };

type PayPalSession = {
  start: (options: { presentationMode: "auto" }, order: Promise<{ orderId: string }>) => Promise<void>;
};

type PayPalSdk = {
  findEligibleMethods: (options: { currencyCode: "USD" }) => Promise<{ isEligible: (method: string) => boolean }>;
  createPayPalOneTimePaymentSession: (callbacks: {
    onApprove: (data: PayPalApproval) => Promise<void>;
    onCancel: () => void;
    onError: () => void;
  }) => PayPalSession;
};

declare global {
  interface Window {
    paypal?: {
      createInstance: (options: {
        clientId: string;
        components: string[];
        pageType: "product-details";
      }) => Promise<PayPalSdk>;
    };
  }
}

const panel = document.querySelector<HTMLElement>("[data-marketplace-checkout='enabled']");
const form = panel?.querySelector<HTMLFormElement>(".contribution-form");
const statusMessage = panel?.querySelector<HTMLElement>("[data-checkout-status]");
const result = panel?.querySelector<HTMLElement>("[data-checkout-result]");
const finalAmount = panel?.querySelector<HTMLElement>("[data-final-amount]");
const minimum = Number(panel?.dataset.minimum ?? "0");

const selectedAmount = () => {
  const selected = form?.querySelector<HTMLInputElement>("input[name='contribution']:checked");
  if (!selected) return null;
  if (selected.value !== "custom") return Number(selected.value).toFixed(2);

  const custom = form?.elements.namedItem("customAmount");
  return custom instanceof HTMLInputElement && custom.value !== ""
    ? Number(custom.value).toFixed(2)
    : null;
};

const showStatus = (message: string) => {
  if (statusMessage) statusMessage.textContent = message;
};

const updateAmount = () => {
  const amount = selectedAmount();
  if (finalAmount) finalAmount.textContent = amount ? `$${amount} USD` : "Choose an amount";
};

const loadPayPal = async (environment: MarketplaceApiConfig["environment"]) => {
  if (window.paypal) return;
  const existing = document.querySelector<HTMLScriptElement>("script[data-paypal-sdk]");
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("PayPal could not be loaded.")), { once: true });
    });
    return;
  }

  const script = document.createElement("script");
  script.dataset.paypalSdk = "v6";
  script.src = environment === "production"
    ? "https://www.paypal.com/web-sdk/v6/core"
    : "https://www.sandbox.paypal.com/web-sdk/v6/core";
  script.async = true;
  document.head.append(script);
  await new Promise<void>((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("PayPal could not be loaded.")), { once: true });
  });
};

const requestJson = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Checkout request failed.");
  return body;
};

form?.addEventListener("change", updateAmount);
form?.addEventListener("input", updateAmount);

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const amount = selectedAmount();
  if (!amount || Number(amount) < minimum) {
    showStatus(`Choose at least $${minimum.toFixed(2)} USD.`);
    return;
  }

  const apiOrigin = panel?.dataset.apiOrigin;
  const productId = panel?.dataset.productId;
  const productVersion = panel?.dataset.productVersion;
  if (!apiOrigin || !productId || !productVersion) {
    showStatus("Checkout is not configured.");
    return;
  }

  const submit = form.querySelector<HTMLButtonElement>("button[type='submit']");
  if (submit) submit.disabled = true;
  showStatus("Preparing secure PayPal checkout…");

  try {
    const config = await requestJson(`${apiOrigin}/v1/config`) as MarketplaceApiConfig;
    if (!config.enabled || !config.clientId) throw new Error("Purchases are temporarily paused.");
    await loadPayPal(config.environment);
    if (!window.paypal) throw new Error("PayPal could not be initialized.");

    const sdk = await window.paypal.createInstance({
      clientId: config.clientId,
      components: ["paypal-payments"],
      pageType: "product-details",
    });
    const eligibility = await sdk.findEligibleMethods({ currencyCode: "USD" });
    if (!eligibility.isEligible("paypal")) throw new Error("PayPal is not available for this browser.");

    const idempotencyKey = crypto.randomUUID();
    const createOrder = async () => {
      const order = await requestJson(`${apiOrigin}/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ productId, productVersion, amount, currency: "USD" }),
      });
      return { orderId: order.orderId as string };
    };

    const session = sdk.createPayPalOneTimePaymentSession({
      onApprove: async ({ orderId }) => {
        showStatus("Verifying payment…");
        const capture = await requestJson(`${apiOrigin}/v1/orders/${encodeURIComponent(orderId)}/capture`, {
          method: "POST",
          headers: { "Idempotency-Key": `capture-${idempotencyKey}` },
        });
        if (result) {
          result.hidden = false;
          result.replaceChildren();
          const heading = document.createElement("strong");
          heading.textContent = "Payment verified.";
          const link = document.createElement("a");
          link.className = "button button-small";
          link.href = capture.downloadUrl as string;
          link.textContent = "Download verified package";
          result.append(heading, document.createElement("br"), link);
        }
        showStatus("Keep your PayPal order ID for purchase recovery.");
      },
      onCancel: () => showStatus("Checkout cancelled. No payment was captured."),
      onError: () => showStatus("PayPal could not complete checkout. No download was granted."),
    });

    await session.start({ presentationMode: "auto" }, createOrder());
  } catch (error) {
    showStatus(error instanceof Error ? error.message : "Checkout could not be started.");
  } finally {
    if (submit) submit.disabled = false;
  }
});

updateAmount();
