import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  formatUsd,
  isContributionAllowed,
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

test("public config cannot enable production checkout", () => {
  assert.throws(() => validateMarketplaceConfig({
    catalogUpdatedAt: "2026-11-23",
    checkout: { enabled: true, environment: "production", apiOrigin: "https://example.com" },
  }), /Production checkout cannot be enabled/);
});
