import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  contributionLabel,
  contributionMessage,
  formatUsd,
  isContributionAllowed,
  marketplaceAvailability,
  normalizeUsdAmount,
  parseUsdCents,
  validateMarketplaceConfig,
  validateProductCatalog,
  validateProductManifest,
} from "../src/lib/marketplace.mjs";

const product = JSON.parse(await readFile(
  new URL("../marketplace/catalog/community-events-mini.json", import.meta.url),
  "utf8",
));

const verifiedProduct = () => ({
  ...structuredClone(product),
  package: {
    ...product.package,
    sha256: "a".repeat(64),
    sizeBytes: 4096,
  },
  verification: {
    status: "verified",
    verifiedAt: "2026-11-23",
    checks: ["php-lint", "package-structure", "core-compatibility"],
  },
  purchasable: true,
});

test("catalogue accepts a complete candidate but prevents its purchase", () => {
  assert.equal(validateProductManifest(product).verification.status, "candidate");
  assert.equal(product.compatibility.php, ">=8.3 <8.6");
  assert.equal(product.purchasable, false);
  assert.throws(
    () => validateProductManifest({ ...structuredClone(product), purchasable: true }),
    /unverified products cannot be purchasable/,
  );
});

test("verified products require release evidence", () => {
  assert.equal(validateProductManifest(verifiedProduct()).purchasable, true);
  const missingChecksum = verifiedProduct();
  missingChecksum.package.sha256 = "missing";
  assert.throws(() => validateProductManifest(missingChecksum), /checksum/);
});

test("catalogue rejects duplicate identifiers and weak pricing", () => {
  assert.throws(() => validateProductCatalog([product, product]), /identifiers must be unique/);
  const weakPricing = structuredClone(product);
  weakPricing.pricing.minimum = 5;
  assert.throws(() => validateProductManifest(weakPricing), /at least US\$9/);
});

test("USD parsing is exact to cents", () => {
  assert.equal(parseUsdCents("9"), 900);
  assert.equal(parseUsdCents("19.95"), 1995);
  assert.equal(parseUsdCents("1.999"), null);
  assert.equal(parseUsdCents(9.001), null);
  assert.equal(parseUsdCents(19.95), 1995);
  assert.equal(parseUsdCents("-9"), null);
  assert.equal(normalizeUsdAmount("19.9"), "19.90");
  assert.equal(formatUsd("19.95"), "$19.95");
  assert.equal(isContributionAllowed(verifiedProduct(), "9.00"), true);
  assert.equal(isContributionAllowed(verifiedProduct(), "8.99"), false);
  assert.equal(isContributionAllowed(verifiedProduct(), "29.00", "EUR"), false);
});

test("contribution labels frame value without changing the product", () => {
  assert.equal(contributionLabel(product, 19), "Accessible");
  assert.equal(contributionLabel(product, 29), "Recommended");
  assert.equal(contributionLabel(product, 49), "Back future updates");
});

test("contribution feedback explains value without inventing scarcity", () => {
  const pricing = { minimum: 9, suggested: 29 };
  assert.match(contributionMessage({ amount: "8.99", ...pricing }), /minimum contribution/);
  assert.match(contributionMessage({ amount: "19.00", ...pricing }), /complete extension/);
  assert.match(contributionMessage({ amount: "29.00", ...pricing }), /Recommended/);
  assert.match(contributionMessage({ amount: "49.00", ...pricing }), /same complete extension/);
  assert.doesNotMatch(contributionMessage({ amount: "49.00", ...pricing }), /limited|expires|hurry/i);
});

test("availability reflects verification and checkout state", () => {
  assert.deepEqual(marketplaceAvailability(product, false), {
    label: "In release review",
    message: "Checkout opens only after the package, compatibility and delivery checks pass.",
    available: false,
  });
  assert.equal(marketplaceAvailability(verifiedProduct(), false).available, false);
  assert.equal(marketplaceAvailability(verifiedProduct(), true).available, true);
});

test("public config cannot enable production checkout", () => {
  assert.throws(() => validateMarketplaceConfig({
    catalogUpdatedAt: "2026-11-23",
    checkout: { enabled: true, environment: "production", apiOrigin: "https://example.com" },
  }), /Production checkout cannot be enabled/);
});
