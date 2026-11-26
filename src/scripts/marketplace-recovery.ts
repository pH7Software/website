export {};

type RecoveryResponse = { downloadUrl?: string; error?: string };

const form = document.querySelector<HTMLFormElement>("[data-purchase-recovery]");
const statusMessage = form?.querySelector<HTMLElement>("[data-recovery-status]");
const result = form?.querySelector<HTMLElement>("[data-recovery-result]");

const showStatus = (message: string) => {
  if (statusMessage) statusMessage.textContent = message;
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const apiOrigin = form.dataset.apiOrigin;
  const orderId = form.elements.namedItem("orderId");
  const email = form.elements.namedItem("email");
  if (!apiOrigin || !(orderId instanceof HTMLInputElement) || !(email instanceof HTMLInputElement)) {
    showStatus("Purchase recovery is not configured.");
    return;
  }

  const submit = form.querySelector<HTMLButtonElement>("button[type='submit']");
  if (submit) submit.disabled = true;
  showStatus("Checking the completed purchase with PayPal…");
  if (result) result.hidden = true;

  try {
    const response = await fetch(`${apiOrigin}/v1/recover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: orderId.value.trim(), email: email.value.trim() }),
    });
    const body = await response.json().catch(() => ({})) as RecoveryResponse;
    if (!response.ok || typeof body.downloadUrl !== "string") {
      throw new Error(typeof body.error === "string" ? body.error : "Purchase could not be verified.");
    }

    if (result) {
      const link = document.createElement("a");
      link.className = "button button-small";
      link.href = body.downloadUrl;
      link.textContent = "Download verified package";
      result.replaceChildren(link);
      result.hidden = false;
    }
    showStatus("Purchase verified. This download link expires after 24 hours.");
  } catch (error) {
    showStatus(error instanceof Error ? error.message : "Purchase could not be verified.");
  } finally {
    if (submit) submit.disabled = false;
  }
});
