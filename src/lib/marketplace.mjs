const productIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const semanticVersionPattern = /^\d+\.\d+\.\d+$/;
const sha256Pattern = /^[a-f0-9]{64}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const allowedVerificationStatuses = new Set(["candidate", "verified", "retired"]);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const isPositiveInteger = (value) => Number.isSafeInteger(value) && value > 0;

export const parseUsdCents = (value) => {
  const normalized = typeof value === "number" ? value.toFixed(2) : String(value).trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(normalized)) return null;

  const [dollars, fraction = ""] = normalized.split(".");
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
};

export const formatUsd = (value) => {
  const cents = parseUsdCents(value);
  if (cents === null) throw new Error("Cannot format an invalid USD amount.");

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
};

export const validateMarketplaceConfig = (config) => {
  assert(config && typeof config === "object", "Marketplace config must be an object.");
  assert(datePattern.test(config.catalogUpdatedAt), "Marketplace config needs a valid catalogue update date.");
  assert(config.checkout && typeof config.checkout === "object", "Marketplace checkout config is missing.");
  assert(typeof config.checkout.enabled === "boolean", "Marketplace checkout enabled flag must be boolean.");
  assert(["sandbox", "production"].includes(config.checkout.environment), "Marketplace checkout environment is invalid.");
  assert(/^https:\/\//.test(config.checkout.apiOrigin), "Marketplace API origin must use HTTPS.");
  if (config.checkout.environment === "production") {
    assert(config.checkout.enabled === false, "Production checkout cannot be enabled from the public catalogue config.");
  }

  return Object.freeze(config);
};

export const validateProductManifest = (product) => {
  assert(product && typeof product === "object", "Product manifest must be an object.");
  assert(productIdPattern.test(product.id), `Invalid product identifier: ${product.id ?? "missing"}`);
  assert(typeof product.name === "string" && product.name.length >= 4, `${product.id}: product name is missing.`);
  assert(typeof product.summary === "string" && product.summary.length >= 30, `${product.id}: product summary is too short.`);
  assert(Array.isArray(product.description) && product.description.length >= 1, `${product.id}: product description is missing.`);
  assert(Array.isArray(product.outcomes) && product.outcomes.length >= 2, `${product.id}: product outcomes are missing.`);
  assert(semanticVersionPattern.test(product.version), `${product.id}: product version must be semantic.`);
  assert(datePattern.test(product.releasedAt) && datePattern.test(product.updatedAt), `${product.id}: release dates are invalid.`);
  assert(semanticVersionPattern.test(product.compatibility?.pH7Builder?.min), `${product.id}: minimum pH7Builder version is invalid.`);
  assert(semanticVersionPattern.test(product.compatibility?.pH7Builder?.maxExclusive), `${product.id}: maximum pH7Builder version is invalid.`);
  assert(/^\^\d+\.\d+$/.test(product.compatibility?.php), `${product.id}: PHP compatibility is invalid.`);
  assert(Array.isArray(product.dependencies), `${product.id}: dependencies must be an array.`);
  assert(Array.isArray(product.contents) && product.contents.length >= 3, `${product.id}: package contents are incomplete.`);
  assert(product.installation?.target === `_repository/module/${product.id}/`, `${product.id}: installation target is invalid.`);
  assert(Array.isArray(product.installation?.steps) && product.installation.steps.length >= 3, `${product.id}: installation steps are incomplete.`);
  assert(typeof product.installation?.uninstall === "string" && product.installation.uninstall.length >= 30, `${product.id}: uninstall policy is missing.`);

  const pricing = product.pricing;
  assert(pricing?.currency === "USD", `${product.id}: only USD pricing is supported.`);
  assert(isPositiveInteger(pricing.minimum) && pricing.minimum >= 9, `${product.id}: minimum price must be at least US$9.`);
  assert(isPositiveInteger(pricing.suggested) && pricing.suggested >= pricing.minimum, `${product.id}: suggested price is invalid.`);
  assert(Array.isArray(pricing.options) && pricing.options.length === 3, `${product.id}: exactly three price options are required.`);
  assert(pricing.options.every((amount) => isPositiveInteger(amount) && amount >= pricing.minimum), `${product.id}: price options are invalid.`);
  assert(new Set(pricing.options).size === pricing.options.length, `${product.id}: price options must be unique.`);
  assert(pricing.options.every((amount, index) => index === 0 || amount > pricing.options[index - 1]), `${product.id}: price options must be ascending.`);
  assert(pricing.options.includes(pricing.suggested), `${product.id}: suggested price must be one of the options.`);

  assert(product.licence?.url === "/marketplace/terms/", `${product.id}: marketplace licence URL is invalid.`);
  assert(isPositiveInteger(product.support?.periodDays), `${product.id}: support period is invalid.`);
  assert(Array.isArray(product.changelog) && product.changelog[0]?.version === product.version, `${product.id}: current changelog entry is missing.`);
  assert(product.package?.filename === `${product.id}-${product.version}.zip`, `${product.id}: package filename is invalid.`);
  assert(product.package?.artifactKey === `${product.id}/${product.version}/${product.package.filename}`, `${product.id}: artifact key is invalid.`);
  assert(allowedVerificationStatuses.has(product.verification?.status), `${product.id}: verification status is invalid.`);
  assert(typeof product.purchasable === "boolean", `${product.id}: purchasable flag must be boolean.`);

  if (product.verification.status === "verified") {
    assert(datePattern.test(product.verification.verifiedAt), `${product.id}: verification date is invalid.`);
    assert(Array.isArray(product.verification.checks) && product.verification.checks.length >= 3, `${product.id}: verification evidence is incomplete.`);
    assert(sha256Pattern.test(product.package.sha256), `${product.id}: verified package checksum is invalid.`);
    assert(isPositiveInteger(product.package.sizeBytes), `${product.id}: verified package size is invalid.`);
  } else {
    assert(product.purchasable === false, `${product.id}: unverified products cannot be purchasable.`);
  }

  return Object.freeze(product);
};

export const validateProductCatalog = (products) => {
  assert(Array.isArray(products), "Product catalogue must be an array.");
  const validated = products.map(validateProductManifest);
  const ids = validated.map((product) => product.id);
  assert(new Set(ids).size === ids.length, "Product identifiers must be unique.");
  return Object.freeze(validated);
};

export const isContributionAllowed = (product, amount, currency = "USD") => {
  const cents = parseUsdCents(amount);
  return currency === product.pricing.currency
    && cents !== null
    && cents >= product.pricing.minimum * 100;
};
