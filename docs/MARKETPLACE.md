# Official marketplace architecture

The marketplace keeps pH7Builder's MIT-licensed core complete. It sells only
small official extensions that are independently useful and use the existing
module system.

## Boundaries

- GitHub Pages serves the Astro catalogue and product pages.
- `marketplace/catalog/*.json` is the public source of truth for product copy,
  compatibility, pay-what-you-wish pricing and release state.
- The public repository contains no paid packages or buyer records.
- A small Cloudflare Worker creates and captures PayPal Orders v2 payments,
  verifies webhook signatures, records idempotent state in D1 and serves exact
  private R2 objects through 24-hour HMAC-signed links.
- The private `pH7Software/marketplace-products` repository owns product source,
  tests and deterministic packaging.

This boundary is required because a static GitHub Pages site cannot safely
verify payments, keep packages private or issue revocable download access.

## Hosting and cost boundary

The public marketplace stays with the rest of `ph7builder.com` on GitHub Pages.
It is already deployed from the reviewed `main` branch by the repository's
Pages workflow. Moving only the catalogue to Cloudflare Pages would create a
second static deployment without removing any required server-side component.

The private commerce boundary uses Cloudflare Workers, D1 and private R2
storage. This is compatible with Cloudflare's free allowances for an initial,
low-volume launch. As reviewed on 27 November 2026, the official limits include
100,000 Worker requests per day, 5 million D1 rows read and 100,000 rows written
per day with 5 GB total D1 storage, and 10 GB-month of Standard R2 storage with
1 million Class A and 10 million Class B operations per month. Current limits
must be rechecked before activation:

- <https://developers.cloudflare.com/workers/platform/pricing/>
- <https://developers.cloudflare.com/d1/platform/pricing/>
- <https://developers.cloudflare.com/r2/pricing/>

The marketplace has no runtime dependency on Krystal, cPanel or FTP. Exceeding
a free allowance must not silently enable a paid plan. Review actual usage and
obtain owner approval before accepting a recurring Cloudflare cost. If the
Worker, D1 or R2 is unavailable or at quota, checkout and fulfilment must fail
closed rather than trusting browser state or issuing an unverified download.

## Release states

`candidate` is public for review but cannot be purchased. `verified` requires
an exact semantic version, non-placeholder SHA-256 checksum, package size and
at least three recorded checks. `retired` is excluded from catalogue routes.
The validator rejects a purchasable product unless it is verified.

Community Events Mini is the first candidate because events are additive and do
not duplicate the free profile fields, moderation, SEO, email or analytics
features already present in pH7Builder. It remains unavailable until browser
installation, member/admin flows, concurrent capacity and full PayPal sandbox
fulfilment have release evidence.

## Adding an official product

The catalogue is deliberately easy to extend without adding a CMS or copying
product data between the website and Worker:

1. Add one reviewed JSON manifest to `marketplace/catalog/`. Its filename must
   match the stable product identifier.
2. Register that manifest once in `marketplace/catalog/index.mjs`. The Astro
   catalogue and payment Worker both consume this shared registry.
3. Keep the product source, tests, documentation and deterministic package in
   the private marketplace-products repository.
4. Run `npm run verify:marketplace` and `npm run build:ci`. Validation rejects
   missing buying guidance, invalid pricing, duplicate identifiers, omitted
   registry entries and unverified purchase states.
5. Leave the product as a non-purchasable candidate until the exact private
   artefact, checksum, compatibility evidence and complete sandbox fulfilment
   pass.

Public pages are generated from the manifest. Adding a product must not require
a hand-written catalogue card, product route or duplicate Worker metadata.

## Product communication

Every extension must make the decision easier before it makes the sale. Its
manifest identifies the buyer, practical outcome, best-fit situations, honest
limits and shortest path to value. The page then shows the exact package,
compatibility, installation impact, support boundary and final contribution.

Use persuasion through specificity, reduced risk and a clear cost of leaving
the operator problem unsolved. Do not use fake stock, invented demand, false
discounts or countdowns. Digital packages do not become scarce merely because
a timer says so. If a future offer has a genuine availability window, it needs
an explicit reason, exact dates and matching server-side enforcement before it
can be displayed.

All pay-what-you-wish amounts receive the same complete package. Higher
contributions support maintenance; they never unlock hidden product behaviour.

## Payment and delivery flow

1. The browser requests safe checkout configuration from the Worker.
2. The Worker validates the product, version, currency and minimum contribution
   against its own catalogue before creating a PayPal order.
3. PayPal approval returns an order ID. The Worker captures it with a
   server-derived idempotency key and verifies amount, currency, product and
   merchant before recording completion. Pending captures remain unavailable
   until PayPal sends a verified completion webhook.
4. The Worker signs a short-lived token bound to the stored order, product and
   version. Downloads resolve only to the manifest-selected R2 key.
5. A verified refund, reversal, denial or dispute webhook revokes future
   downloads. Dispute resolution does not automatically restore access because
   a verified financial outcome must be reconciled first.
6. Recovery requires the PayPal order ID and matching PayPal payer email. The
   email is checked against PayPal and is not stored locally.

Webhook verification preserves the exact event JSON received from PayPal when
it calls PayPal's signature-verification endpoint. Parsing and serialising the
event first can invalidate verification even when its data appears unchanged.

The Worker logs event identifiers and state changes, never credentials or payer
details. A browser redirect alone cannot grant a package.

## Activation checklist

1. Verify the private product release and reproduce its ZIP checksum.
2. Install the package on every supported pH7Builder version and finish its
   product-specific browser, permission, data-integrity and uninstall checks.
3. Replace manifest package placeholders and record exact verification checks.
4. Create private R2 and D1 resources, apply the reviewed schema, and add Worker
   secrets directly through Cloudflare tooling.
5. Route `marketplace-api.ph7builder.com` directly to the Worker and deploy it
   with purchases disabled. No Krystal origin is involved.
6. Run sandbox create, approve, cancel, failure, duplicate, recovery, expiry,
   refund, dispute and webhook-retry tests.
7. Review the visible licence, support and refund terms.
8. Request explicit owner authorisation before any production credential,
   payment, refund or purchase activation.

Turning on `marketplace/config.json` alone cannot activate production. The
public config forbids that state, while the Worker also requires its independent
production gate.

## Maintenance

Normal pull requests run deterministic catalogue, Worker, safety and site
checks. The scheduled workflow repeats those checks weekly to catch dependency,
link and build drift. It does not run Codex or publish packages. Product changes
remain normal reviewed pull requests; an external Codex schedule can propose
maintenance, but tests and owner-controlled release gates decide publication.

To pause sales immediately, set Worker `PURCHASES_ENABLED=false`. To retire one
product, set `purchasable=false` before changing its verification status to
`retired`; existing completed orders remain in D1 for support and audit needs.
