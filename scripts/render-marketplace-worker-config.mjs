import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredValues = {
  MARKETPLACE_D1_DATABASE_ID: /^[a-f0-9]{32}$/u,
  MARKETPLACE_KV_NAMESPACE_ID: /^[a-f0-9]{32}$/u,
  MARKETPLACE_PAYPAL_MERCHANT_ID: /^[A-Za-z0-9_-]{8,64}$/u,
};

const replacements = {
  MARKETPLACE_D1_DATABASE_ID: "REPLACE_WITH_D1_DATABASE_ID",
  MARKETPLACE_KV_NAMESPACE_ID: "REPLACE_WITH_KV_NAMESPACE_ID",
  MARKETPLACE_PAYPAL_MERCHANT_ID: "REPLACE_WITH_PAYPAL_MERCHANT_ID",
};

export function renderMarketplaceWorkerConfig(template, values) {
  let rendered = template;

  for (const [name, pattern] of Object.entries(requiredValues)) {
    const value = values[name];
    if (!pattern.test(value ?? "")) throw new Error(`${name} is missing or invalid.`);

    const placeholder = replacements[name];
    if (!rendered.includes(placeholder)) throw new Error(`Worker template is missing ${placeholder}.`);
    rendered = rendered.replaceAll(placeholder, value);
  }

  if (rendered.includes("REPLACE_WITH_")) throw new Error("Worker configuration still contains a placeholder.");

  const config = JSON.parse(rendered);
  if (config.vars?.PAYPAL_ENVIRONMENT !== "sandbox") throw new Error("Automated deployment must remain in PayPal sandbox mode.");
  if (config.vars?.PURCHASES_ENABLED !== "false" || config.vars?.ALLOW_PRODUCTION !== "false") {
    throw new Error("Automated deployment must keep purchases and production disabled.");
  }

  return `${JSON.stringify(config, null, 2)}\n`;
}

export async function writeMarketplaceWorkerConfig({
  root = projectRoot,
  values = process.env,
} = {}) {
  const workerDirectory = path.join(root, "marketplace-worker");
  const template = await readFile(path.join(workerDirectory, "wrangler.jsonc.example"), "utf8");
  const output = renderMarketplaceWorkerConfig(template, values);
  const outputPath = path.join(workerDirectory, "wrangler.ci.jsonc");
  await writeFile(outputPath, output, { mode: 0o600 });
  return outputPath;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await writeMarketplaceWorkerConfig();
  console.log("Marketplace Worker configuration prepared for a disabled sandbox deployment.");
}
