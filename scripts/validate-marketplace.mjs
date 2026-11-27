import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  validateMarketplaceConfig,
  validateProductCatalog,
} from "../src/lib/marketplace.mjs";
import { productManifests } from "../marketplace/catalog/index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogDirectory = path.join(root, "marketplace", "catalog");
const filenames = (await readdir(catalogDirectory))
  .filter((filename) => filename.endsWith(".json"))
  .sort();

if (filenames.length === 0) throw new Error("Marketplace catalogue has no product manifests.");

const products = [];
for (const filename of filenames) {
  const product = JSON.parse(await readFile(path.join(catalogDirectory, filename), "utf8"));
  if (filename !== `${product.id}.json`) throw new Error(`${filename}: filename must match the product identifier.`);
  products.push(product);
}

const config = validateMarketplaceConfig(JSON.parse(
  await readFile(path.join(root, "marketplace", "config.json"), "utf8"),
));
const validated = validateProductCatalog(products);
const fileProductIds = validated.map((product) => product.id).sort();
const registeredProductIds = validateProductCatalog(productManifests)
  .map((product) => product.id)
  .sort();
if (JSON.stringify(fileProductIds) !== JSON.stringify(registeredProductIds)) {
  throw new Error("Marketplace registry must contain every product manifest exactly once.");
}
if (config.checkout.enabled && !validated.some((product) => product.purchasable)) {
  throw new Error("Checkout cannot be enabled without a verified purchasable product.");
}

const requiredWorkerFiles = [
  "marketplace-worker/src/index.mjs",
  "marketplace-worker/src/paypal.mjs",
  "marketplace-worker/src/security.mjs",
  "marketplace-worker/migrations/0001_orders.sql",
  "marketplace-worker/wrangler.jsonc.example",
  "marketplace-worker/README.md",
];
for (const relative of requiredWorkerFiles) {
  await readFile(path.join(root, relative), "utf8");
}

const publicCommerceFiles = [
  ...filenames.map((filename) => path.join("marketplace", "catalog", filename)),
  "marketplace/config.json",
  ...requiredWorkerFiles,
];
const secretPatterns = [
  /A2[0-9A-Za-z_-]{70,}/,
  /PAYPAL_CLIENT_SECRET\s*[=:]\s*["'][^"']{8,}/i,
  /DOWNLOAD_SIGNING_SECRET\s*[=:]\s*["'][^"']{8,}/i,
  /database_id"\s*:\s*"(?!REPLACE_)[^"]+"/i,
];
for (const relative of publicCommerceFiles) {
  const source = await readFile(path.join(root, relative), "utf8");
  for (const pattern of secretPatterns) {
    if (pattern.test(source)) throw new Error(`${relative}: possible credential or production identifier detected.`);
  }
}

const counts = validated.reduce((result, product) => {
  result[product.verification.status] = (result[product.verification.status] ?? 0) + 1;
  return result;
}, {});
console.log(`Marketplace verified (${validated.length} manifests: ${Object.entries(counts).map(([status, count]) => `${count} ${status}`).join(", ")}; checkout ${config.checkout.enabled ? "enabled" : "disabled"}).`);
