import assert from "node:assert/strict";
import test from "node:test";

import { renderMarketplaceWorkerConfig } from "./render-marketplace-worker-config.mjs";

const template = JSON.stringify({
  vars: {
    PAYPAL_ENVIRONMENT: "sandbox",
    PAYPAL_MERCHANT_ID: "REPLACE_WITH_PAYPAL_MERCHANT_ID",
    PURCHASES_ENABLED: "false",
    ALLOW_PRODUCTION: "false",
  },
  d1_databases: [{ database_id: "REPLACE_WITH_D1_DATABASE_ID" }],
  kv_namespaces: [{ id: "REPLACE_WITH_KV_NAMESPACE_ID" }],
});

const values = {
  MARKETPLACE_D1_DATABASE_ID: "a".repeat(32),
  MARKETPLACE_KV_NAMESPACE_ID: "b".repeat(32),
  MARKETPLACE_PAYPAL_MERCHANT_ID: "MERCHANT12345",
};

test("deployment config uses reviewed identifiers while preserving safe gates", () => {
  const config = JSON.parse(renderMarketplaceWorkerConfig(template, values));

  assert.equal(config.d1_databases[0].database_id, values.MARKETPLACE_D1_DATABASE_ID);
  assert.equal(config.kv_namespaces[0].id, values.MARKETPLACE_KV_NAMESPACE_ID);
  assert.equal(config.vars.PAYPAL_MERCHANT_ID, values.MARKETPLACE_PAYPAL_MERCHANT_ID);
  assert.equal(config.vars.PAYPAL_ENVIRONMENT, "sandbox");
  assert.equal(config.vars.PURCHASES_ENABLED, "false");
  assert.equal(config.vars.ALLOW_PRODUCTION, "false");
});

test("deployment config rejects incomplete identifiers", () => {
  assert.throws(
    () => renderMarketplaceWorkerConfig(template, { ...values, MARKETPLACE_KV_NAMESPACE_ID: "missing" }),
    /MARKETPLACE_KV_NAMESPACE_ID is missing or invalid/u,
  );
});

test("deployment config refuses production activation", () => {
  const unsafeTemplate = template.replace('"ALLOW_PRODUCTION":"false"', '"ALLOW_PRODUCTION":"true"');
  assert.throws(
    () => renderMarketplaceWorkerConfig(unsafeTemplate, values),
    /keep purchases and production disabled/u,
  );
});
