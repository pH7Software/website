import assert from "node:assert/strict";
import test from "node:test";

import {
  checklistProgress,
  launchChecklist,
  visibleChecklistItems,
} from "../src/lib/launch-checklist.ts";

test("every launch checklist item has a unique stable identifier", () => {
  const ids = launchChecklist.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => /^[a-z0-9-]+$/.test(id)));
});

test("the launch view includes operational, trust and launch evidence", () => {
  const items = visibleChecklistItems("niche-dating", "launch");
  const phases = new Set(items.map((item) => item.phase));

  assert.ok(phases.has("trust"));
  assert.ok(phases.has("operations"));
  assert.ok(phases.has("launch"));
  assert.ok(items.some((item) => item.id === "browser-smoke"));
  assert.ok(items.some((item) => item.id === "backups"));
});

test("matchmaking-specific work appears only for the matching product type", () => {
  assert.ok(visibleChecklistItems("matchmaking", "validate").some((item) => item.id === "matchmaker-capacity"));
  assert.ok(!visibleChecklistItems("community", "validate").some((item) => item.id === "matchmaker-capacity"));
});

test("progress counts only visible completed items", () => {
  const items = visibleChecklistItems("niche-dating", "validate");
  const result = checklistProgress(items, [items[0].id, "not-visible"]);

  assert.equal(result.completed, 1);
  assert.equal(result.total, items.length);
  assert.equal(result.percentage, Math.round(100 / items.length));
});
