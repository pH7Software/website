import assert from "node:assert/strict";
import test from "node:test";

import { buildReleaseArticle, formatReleaseDate, updateSiteRelease } from "./sync-latest-release.mjs";

const release = {
  version: "20.1.0",
  publishedAt: "2027-01-09T12:34:56Z",
  releaseUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS/releases/tag/v20.1.0",
};

test("release metadata uses the stable tag and UTC publication date", () => {
  const source = `latestRelease: "20.0.1",
latestReleaseDate: "26 November 2026",
latestReleaseUrl: "https://example.test/v20.0.1",`;
  const updated = updateSiteRelease(source, release);

  assert.match(updated, /latestRelease: "20\.1\.0"/);
  assert.match(updated, /latestReleaseDate: "9 January 2027"/);
  assert.match(updated, /releases\/tag\/v20\.1\.0/);
  assert.equal(formatReleaseDate(release.publishedAt), "9 January 2027");
});

test("release article preserves authoritative notes and immutable source", () => {
  const article = buildReleaseArticle(release, `# pH7Builder 20.1.0 — Maintenance Release

Released on 9 January 2027, pH7Builder 20.1.0 improves the verified upgrade path.

## Upgrade notes

Use the complete tagged package.
`);

  assert.match(article, /title: "pH7Builder 20\.1\.0 — Maintenance Release"/);
  assert.match(article, /description: "pH7Builder 20\.1\.0 improves the verified upgrade path\."/);
  assert.match(article, /blob\/v20\.1\.0\/docs\/RELEASE_NOTES_20\.1\.0\.md/);
  assert.match(article, /## Upgrade notes\n\nUse the complete tagged package\./);
  assert.doesNotMatch(article, /^# pH7Builder/m);
});
