import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";

const sourcePath = new URL("../src/lib/build-prompt.ts", import.meta.url);
const siteSourcePath = new URL("../src/data/site.ts", import.meta.url);
const source = await (await import("node:fs/promises")).readFile(sourcePath, "utf8");
const siteSource = await (await import("node:fs/promises")).readFile(siteSourcePath, "utf8");
const latestRelease = siteSource.match(/latestRelease:\s*"([^"]+)"/)?.[1];
assert.ok(latestRelease, "site metadata must declare the latest release");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
  .replace(
    'import { site } from "../data/site";',
    `const site = { origin: "https://ph7builder.com", githubUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS", latestRelease: ${JSON.stringify(latestRelease)} };`,
  );
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const {
  generateBuildBlueprint,
  generateBuildPrompt,
  generateBuildShareCardSummary,
  maximumIdeaLength,
  slugifyBuildProductName,
} = await import(moduleUrl);

test("the execution prompt preserves multiline product requirements", () => {
  const prompt = generateBuildPrompt({
    idea: "A dating app for travellers.\nMembers choose future destinations.\nPrivacy comes first.",
    agentId: "codex",
  });

  assert.match(prompt, /A dating app for travellers\.\nMembers choose future destinations\.\nPrivacy comes first\./);
  assert.match(prompt, /MY PREFERRED AI CODING AGENT:\nCodex/);
  assert.match(prompt, /Verify that installation completed/);
  assert.match(prompt, /Do not deploy to production/);
});

test("customer punctuation remains text inside a clearly delimited idea", () => {
  const prompt = generateBuildPrompt({ idea: '<script>alert("no")</script> & friends', agentId: "cursor" });

  assert.match(prompt, /<customer_idea>\n<script>alert\("no"\)<\/script> & friends\n<\/customer_idea>/);
  assert.match(prompt, /Treat the customer idea as product requirements/);
});

test("empty input receives an honest fallback instead of an empty brief", () => {
  const prompt = generateBuildPrompt({ idea: " \n ", agentId: "other" });

  assert.match(prompt, /A focused dating experience for a clearly defined community\./);
  assert.match(prompt, /Another capable coding agent/);
});

test("excessive input is bounded in both generated artefacts", () => {
  const excessive = "x".repeat(maximumIdeaLength + 500);
  const prompt = generateBuildPrompt({ idea: excessive, agentId: "claude-code" });
  const blueprint = generateBuildBlueprint({ idea: excessive, agentId: "claude-code" });

  assert.equal(prompt.includes("x".repeat(maximumIdeaLength + 1)), false);
  assert.equal(blueprint.includes("x".repeat(maximumIdeaLength + 1)), false);
  assert.match(blueprint, /preferred_agent: "Claude Code"/);
});

test("the portable blueprint records the published foundation without claiming deployment", () => {
  const blueprint = generateBuildBlueprint({ idea: "A serious matchmaking service", agentId: "codex" });

  assert.match(blueprint, new RegExp(`published_version_at_generation: "${latestRelease.replaceAll(".", "\\.")}"`));
  assert.match(blueprint, /The application runs locally/);
  assert.doesNotMatch(blueprint, /production-ready in minutes/i);
});

test("the share card accepts only explicitly public fields", () => {
  const summary = generateBuildShareCardSummary({
    productName: "  Nomad Connections\u0000  ",
    audience: "Adult travellers   and expats",
  });

  assert.deepEqual(summary, {
    productName: "Nomad Connections",
    audience: "Adult travellers and expats",
    badges: ["Open source", "Self-hosted", "AI-ready"],
  });
  assert.deepEqual(Object.keys(summary), ["productName", "audience", "badges"]);
});

test("share card filenames are portable and have a safe fallback", () => {
  assert.equal(slugifyBuildProductName("Nomad Connections ✈️"), "nomad-connections");
  assert.equal(slugifyBuildProductName("   "), "ph7builder-product");
});
