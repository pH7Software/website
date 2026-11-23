# pH7Builder marketplace API

This Cloudflare Worker is the small server-side boundary required by the static
pH7Builder website. It creates and captures PayPal Orders v2 payments, verifies
PayPal webhooks, stores idempotent order state in D1 and serves verified private
packages from R2 through signed, expiring links.

It is intentionally not part of the pH7Builder application and is not a general
e-commerce backend.

## Safety defaults

- `PURCHASES_ENABLED` and `ALLOW_PRODUCTION` default to `false`.
- Production checkout requires both `PAYPAL_ENVIRONMENT=production` and
  `ALLOW_PRODUCTION=true`.
- The browser never chooses product metadata, compatibility or the minimum
  amount. The Worker reads those values from the validated catalogue.
- No PayPal secret, download signing secret, payer email or package is stored in
  the public website.
- Refund and reversal webhooks revoke future downloads.

## Required Cloudflare resources

1. Copy `wrangler.jsonc.example` to the untracked deployment configuration and
   fill in the D1 database identifier.
2. Create the D1 database and apply `migrations/0001_orders.sql`.
3. Create the private R2 bucket and upload only packages that match the public
   manifest key and SHA-256 checksum.
4. Add Worker secrets with `wrangler secret put`:
   `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, and
   `DOWNLOAD_SIGNING_SECRET`.
5. Register `https://marketplace-api.ph7builder.com/v1/webhooks/paypal` for
   `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`,
   `PAYMENT.CAPTURE.REVERSED`, and `PAYMENT.CAPTURE.DENIED`.
6. Keep purchases disabled while running PayPal sandbox tests.

Secrets must be entered directly through Cloudflare tooling. Do not place them
in a file, command argument, GitHub variable or chat message.

## Activation sequence

1. Run the root website tests and marketplace Worker tests.
2. Deploy the Worker with sandbox credentials and purchases disabled.
3. Upload the exact verified package to R2.
4. Enable sandbox purchases and test successful, cancelled, failed, duplicate,
   refunded and recovery paths with PayPal sandbox accounts.
5. Review D1 records, webhook retries, download expiry and the public terms.
6. Obtain explicit owner approval before configuring production credentials,
   accepting a real payment, issuing a real refund or enabling live checkout.

GitHub Actions can run deterministic checks and prepare an artefact. It cannot
run Codex by itself. Ongoing Codex maintenance requires an explicitly scheduled
Codex task or a human-triggered review workflow.
