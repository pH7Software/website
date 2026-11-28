import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releasesApi = "https://api.github.com/repos/pH7Software/pH7-Social-Dating-CMS/releases/latest";

function requireStableRelease(release) {
  if (!release || release.draft || release.prerelease || !/^v\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(release.tag_name ?? "")) {
    throw new Error("GitHub did not return a stable semantic pH7Builder release.");
  }
  if (!release.published_at || Number.isNaN(Date.parse(release.published_at))) {
    throw new Error("The latest pH7Builder release has no valid publication date.");
  }
  return {
    version: release.tag_name.slice(1),
    publishedAt: release.published_at,
    releaseUrl: release.html_url,
  };
}

export function formatReleaseDate(publishedAt) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(publishedAt));
}

export function updateSiteRelease(source, release) {
  const replacements = [
    [/latestRelease: "[^"]+"/, `latestRelease: "${release.version}"`],
    [/latestReleaseDate: "[^"]+"/, `latestReleaseDate: "${formatReleaseDate(release.publishedAt)}"`],
    [/latestReleaseUrl: "[^"]+"/, `latestReleaseUrl: "${release.releaseUrl}"`],
  ];

  return replacements.reduce((updated, [pattern, replacement]) => {
    if (!pattern.test(updated)) throw new Error(`Unable to update site release metadata: ${pattern}`);
    return updated.replace(pattern, replacement);
  }, source);
}

function extractDescription(markdown) {
  const paragraph = markdown
    .replace(/^# .+\n+/u, "")
    .split(/\n\s*\n/u)
    .find((value) => value.trim() && !value.trim().startsWith("#"));
  if (!paragraph) throw new Error("Release notes do not contain a descriptive paragraph.");

  const description = paragraph
    .replace(/^Released on [^,]+,\s*/u, "")
    .replace(/\s+/gu, " ")
    .trim();
  const firstSentence = description.match(/^.+?[.!?](?:\s|$)/u)?.[0]?.trim();
  return firstSentence || description;
}

export function buildReleaseArticle(release, markdown) {
  const heading = markdown.match(/^# (.+)$/mu)?.[1]?.trim();
  if (!heading) throw new Error("Release notes must begin with a level-one heading.");

  const slug = `release-notes-${release.version.replaceAll(".", "-")}`;
  const sourceUrl = `https://github.com/pH7Software/pH7-Social-Dating-CMS/blob/v${release.version}/docs/RELEASE_NOTES_${release.version}.md`;
  const body = markdown.replace(/^# .+\n+/u, "").trim();

  return `---
title: ${JSON.stringify(heading)}
description: ${JSON.stringify(extractDescription(markdown))}
slug: ${JSON.stringify(slug)}
publishedAt: ${JSON.stringify(release.publishedAt)}
sourceType: "release"
releaseStatus: "published"
sourceUrl: ${JSON.stringify(sourceUrl)}
categories: ["Release notes"]
tags: ["Release", ${JSON.stringify(`pH7Builder ${release.version}`)}]
historical: false
featured: false
draft: false
---
${body}
`;
}

async function fetchText(fetchImpl, url, headers) {
  const response = await fetchImpl(url, { headers });
  if (!response.ok) throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`);
  return response.text();
}

export async function syncLatestRelease({ root = projectRoot, fetchImpl = fetch, token = process.env.GITHUB_TOKEN } = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "pH7Builder-website-release-sync",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetchImpl(releasesApi, { headers });
  if (!response.ok) throw new Error(`Unable to fetch the latest pH7Builder release: HTTP ${response.status}`);
  const release = requireStableRelease(await response.json());

  const sitePath = path.join(root, "src/data/site.ts");
  const originalSite = await readFile(sitePath, "utf8");
  const updatedSite = updateSiteRelease(originalSite, release);
  if (updatedSite !== originalSite) await writeFile(sitePath, updatedSite);

  const articlesDirectory = path.join(root, "src/content/articles");
  const slug = `release-notes-${release.version.replaceAll(".", "-")}`;
  const entries = await readdir(articlesDirectory);
  const existingArticles = await Promise.all(entries
    .filter((entry) => entry.endsWith(".md") || entry.endsWith(".mdx"))
    .map((entry) => readFile(path.join(articlesDirectory, entry), "utf8")));
  let articleCreated = false;
  if (!existingArticles.some((article) => article.includes(`slug: "${slug}"`))) {
    const notesUrl = `https://raw.githubusercontent.com/pH7Software/pH7-Social-Dating-CMS/v${release.version}/docs/RELEASE_NOTES_${release.version}.md`;
    const markdown = await fetchText(fetchImpl, notesUrl, headers);
    await writeFile(path.join(articlesDirectory, `${slug}.md`), buildReleaseArticle(release, markdown));
    articleCreated = true;
  }

  return { release, metadataChanged: updatedSite !== originalSite, articleCreated };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await syncLatestRelease();
  console.log(`Latest stable release: ${result.release.version}`);
  console.log(`Metadata updated: ${result.metadataChanged ? "yes" : "no"}`);
  console.log(`Release article created: ${result.articleCreated ? "yes" : "no"}`);
}
