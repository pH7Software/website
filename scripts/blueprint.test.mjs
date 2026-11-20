import assert from "node:assert/strict";
import test from "node:test";

import {
  generateBlueprintYaml,
  generateStarterPrompt,
  nomadBlueprintInput,
  slugifyProductName,
} from "../src/lib/blueprint.ts";

test("the portable blueprint preserves product intent and published foundation version", () => {
  const result = generateBlueprintYaml(nomadBlueprintInput);

  assert.match(result, /name: "Nomad Connections"/);
  assert.match(result, /published_version: "19\.4\.0"/);
  assert.match(result, /exact location and travel dates are private by default/i);
  assert.match(result, /messaging: enabled/);
  assert.match(result, /Do not assume blueprint keys already exist/);
});

test("the YAML generator quotes user-controlled values and removes control characters", () => {
  const result = generateBlueprintYaml({
    ...nomadBlueprintInput,
    productName: "People: nearby\u0000\nnext month",
    idea: "A # focused idea",
  });

  assert.match(result, /name: "People: nearby next month"/);
  assert.match(result, /purpose: "A # focused idea"/);
  assert.doesNotMatch(result, /\u0000/);
});

test("the starter prompt requires repository inspection before code generation", () => {
  const result = generateStarterPrompt(nomadBlueprintInput);

  assert.match(result, /read its AGENTS\.md, CONTRIBUTING\.md/);
  assert.match(result, /Use browser tests for real interaction flows/);
  assert.match(result, /Do not generate code until that map is grounded in the repository/);
});

test("product filenames are portable and have a safe fallback", () => {
  assert.equal(slugifyProductName("Nomad Connections ✈️"), "nomad-connections");
  assert.equal(slugifyProductName("   "), "ph7builder-product");
});
