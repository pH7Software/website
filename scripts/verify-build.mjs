import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const productionOrigin = "https://ph7builder.com";
const failures = new Set();
const correctLicence = "https://github.com/pH7Software/pH7-Social-Dating-CMS/blob/18.x/LICENSE.md";
const retiredDestinations = /(?:clients\.hizup\.com|hizup\.net\/clients|paypal\.com\/cgi-bin\/webscr|goo\.gl\/forms|mailto:hi@ph7\.me|http:\/{3})/i;

const requiredFiles = [
  ".nojekyll",
  ".well-known/ard.json",
  "CNAME",
  "404.html",
  "favicon.svg",
  "index.html",
  "index.md",
  "llms.txt",
  "robots.txt",
  "rss.xml",
  "sitemap.xml",
  "social-card.png",
  "social-card.svg",
  "about/index.html",
  "about/index.md",
  "ai-builders/index.html",
  "ai-builders/index.md",
  "articles/index.html",
  "blueprints/nomad-connections/index.html",
  "blueprints/nomad-connections/index.md",
  "build/index.html",
  "build/index.md",
  "changelog/index.html",
  "get-started/index.html",
  "get-started/index.md",
  "doc/en/requirements/index.html",
  "doc/en/nginx-configuration/index.html",
  "privacy/index.html",
  "privacy/index.md",
  "release-notes-19-4-0/index.html",
  "release-notes-20-0-0/index.html",
  "services/index.html",
  "services/index.md",
  "services/ai-prototype-to-production/index.html",
  "services/ai-prototype-to-production/index.md",
  "services/custom-development/index.html",
  "services/migration/index.html",
  "services/migration/index.md",
  "social-dating-features/index.html",
  "dating-startup-by-step/index.html",
  "tools/dating-site-launch-checklist/index.html",
  "tools/dating-site-launch-checklist/index.md",
  "vibe-coders/index.html",
  "vibe-coders/index.md",
];

const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const item = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(item) : [item];
  }));
  return nested.flat();
};

const pageUrlFor = (file) => {
  const relative = path.relative(dist, file).split(path.sep).join("/");
  if (relative === "index.html") return `${productionOrigin}/`;
  if (relative.endsWith("/index.html")) return `${productionOrigin}/${relative.slice(0, -"index.html".length)}`;
  return `${productionOrigin}/${relative}`;
};

const pathCandidates = (pathname) => {
  const raw = pathname.replace(/^\/+/, "");
  const variants = new Set([raw]);
  try { variants.add(decodeURIComponent(raw)); } catch { /* retain the encoded path */ }
  const candidates = [];
  for (const value of variants) {
    if (!value) candidates.push(path.join(dist, "index.html"));
    else if (value.endsWith("/")) candidates.push(path.join(dist, value, "index.html"));
    else if (path.extname(value)) candidates.push(path.join(dist, value));
    else candidates.push(path.join(dist, value), path.join(dist, `${value}.html`), path.join(dist, value, "index.html"));
  }
  return candidates;
};

for (const relative of requiredFiles) {
  if (!(await exists(path.join(dist, relative)))) failures.add(`Missing required output: ${relative}`);
}

if (await exists(path.join(dist, "CNAME"))) {
  const cname = (await readFile(path.join(dist, "CNAME"), "utf8")).trim();
  if (cname !== "ph7builder.com") failures.add(`CNAME must be ph7builder.com, found: ${cname || "empty"}`);
}

const allFiles = await walk(dist);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
let internalLinks = 0;
let articlePages = 0;
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

const recordUniqueValue = (values, value, relative, label) => {
  if (!value) {
    failures.add(`Missing ${label}: ${relative}`);
    return;
  }
  values.set(value, [...(values.get(value) ?? []), relative]);
};

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(dist, file).split(path.sep).join("/");
  const isRedirect = /http-equiv=["']refresh["']/i.test(html);
  const isIndexable = !isRedirect && !/<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);

  if (!/<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html)) failures.add(`Missing canonical link: ${relative}`);
  if (!isRedirect && !/<meta\s+[^>]*name=["']description["'][^>]*>/i.test(html)) failures.add(`Missing meta description: ${relative}`);
  if (!isRedirect && !/<meta\s+[^>]*name=["']author["'][^>]*content=["']Pierre-Henry Soria["'][^>]*>/i.test(html)) failures.add(`Missing creator metadata: ${relative}`);
  if (!isRedirect && !/<link\s+[^>]*rel=["']describedby["'][^>]*href=["']https:\/\/ph7builder\.com\/llms\.txt["'][^>]*>/i.test(html)) failures.add(`Missing llms.txt discovery link: ${relative}`);
  if (!isRedirect && !/<link\s+[^>]*rel=["']ard["'][^>]*href=["']https:\/\/ph7builder\.com\/\.well-known\/ard\.json["'][^>]*>/i.test(html)) failures.add(`Missing ARD discovery link: ${relative}`);
  if (!isRedirect && !html.includes("Pierre-Henry Soria")) failures.add(`Missing creator attribution: ${relative}`);
  if (/AGPL-3\.0|gnu\.org\/licenses\/agpl/i.test(html)) failures.add(`Incorrect AGPL licence reference: ${relative}`);
  if (!isRedirect && (!html.includes(correctLicence) || !html.includes("MIT licence"))) failures.add(`Missing MIT licence in markup or structured data: ${relative}`);
  if (/fonts\.googleapis\.com|googletagmanager|google-analytics|client\.crisp\.chat/i.test(html)) failures.add(`Contains an unapproved remote font, tracker or chat widget: ${relative}`);
  if (/<script\s+[^>]*src=["']https?:\/\//i.test(html)) failures.add(`Contains an external script: ${relative}`);
  if (/\/wp-content\/|\/wp-admin\/|socialdaringbuildersoftware\.WordPress/i.test(html)) failures.add(`Contains WordPress runtime or export residue: ${relative}`);
  if (retiredDestinations.test(html)) failures.add(`Contains a retired commercial or contact destination: ${relative}`);
  if (html.includes("class=\"article-byline\"")) articlePages += 1;

  if (!isRedirect) {
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const description = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content="([^"]*)"/i)?.[1];
    const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)?.[1];
    if (isIndexable) {
      recordUniqueValue(titles, title, relative, "title");
      recordUniqueValue(descriptions, description, relative, "meta description");
      recordUniqueValue(canonicals, canonical, relative, "canonical URL");
    }
    const headings = html.match(/<h1\b/gi) ?? [];
    if (headings.length !== 1) failures.add(`Expected one h1 in ${relative}, found ${headings.length}`);

    const jsonLdBlocks = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)];
    if (jsonLdBlocks.length === 0) failures.add(`Missing JSON-LD: ${relative}`);
    for (const block of jsonLdBlocks) {
      try {
        JSON.parse(block[1]);
      } catch (error) {
        failures.add(`Invalid JSON-LD in ${relative}: ${error instanceof Error ? error.message : "unknown parse error"}`);
      }
    }
  }

  const markdownFile = relative === "index.html"
    ? path.join(dist, "index.md")
    : relative.endsWith("/index.html")
      ? path.join(dist, relative.slice(0, -"index.html".length), "index.md")
      : undefined;
  if (markdownFile && await exists(markdownFile) && !/<link\s+[^>]*rel=["']alternate["'][^>]*type=["']text\/markdown["'][^>]*>/i.test(html)) {
    failures.add(`Missing Markdown alternate link: ${relative}`);
  }

  const hrefPattern = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  for (const match of html.matchAll(hrefPattern)) {
    const href = match[1] ?? match[2] ?? "";
    if (!href || href === "#") {
      if (href === "#") failures.add(`Empty anchor target: ${relative}`);
      continue;
    }
    if (/^(?:mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("#")) continue;
    let destination;
    try {
      destination = new URL(href, pageUrlFor(file));
    } catch {
      failures.add(`Invalid link in ${relative}: ${href}`);
      continue;
    }
    if (destination.origin !== productionOrigin) continue;
    internalLinks += 1;
    const candidates = pathCandidates(destination.pathname);
    const found = await Promise.any(candidates.map(async (candidate) => {
      if (await exists(candidate)) return true;
      throw new Error("missing");
    })).catch(() => false);
    if (!found) failures.add(`Broken internal link in ${relative}: ${destination.pathname}`);
  }
}

for (const [label, values] of [["title", titles], ["meta description", descriptions], ["canonical URL", canonicals]]) {
  for (const [value, pages] of values) {
    if (pages.length > 1) failures.add(`Duplicate ${label} in ${pages.join(", ")}: ${value}`);
  }
}

if (htmlFiles.length < 235) failures.add(`Expected the migrated website to build at least 235 HTML pages, found ${htmlFiles.length}`);
if (articlePages < 220) failures.add(`Expected at least 220 article/release pages, found ${articlePages}`);
if (internalLinks < 500) failures.add(`Expected a connected static site, found only ${internalLinks} internal links`);

const markdownFiles = allFiles.filter((file) => file.endsWith(".md"));
if (markdownFiles.length < 230) failures.add(`Expected Markdown alternatives for the article archive and key pages, found ${markdownFiles.length}`);
for (const file of markdownFiles) {
  const markdown = await readFile(file, "utf8");
  const relative = path.relative(dist, file).split(path.sep).join("/");
  if (!markdown.startsWith("# ")) failures.add(`Markdown alternative does not start with a title: ${relative}`);
  if (!markdown.includes("Canonical page:")) failures.add(`Markdown alternative does not identify its canonical page: ${relative}`);
}

if (await exists(path.join(dist, "robots.txt"))) {
  const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
  if (!robots.includes("Sitemap: https://ph7builder.com/sitemap.xml")) failures.add("robots.txt does not advertise the production sitemap");
  if (!robots.includes("Agentmap: https://ph7builder.com/.well-known/ard.json")) failures.add("robots.txt does not advertise the ARD manifest");
  for (const crawler of ["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot"]) {
    const group = new RegExp(`User-agent: ${crawler}\\nAllow: /`, "i");
    if (!group.test(robots)) failures.add(`robots.txt does not explicitly allow ${crawler}`);
  }
}

if (await exists(path.join(dist, "sitemap.xml"))) {
  const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  for (const route of ["/", "/build/", "/ai-builders/", "/services/", "/services/ai-prototype-to-production/", "/services/migration/", "/changelog/", "/social-dating-features/", "/dating-startup-by-step/", "/tools/dating-site-launch-checklist/"]) {
    if (!sitemap.includes(`<loc>${productionOrigin}${route}</loc>`)) failures.add(`Sitemap is missing: ${route}`);
  }
  const urls = (sitemap.match(/<url>/g) ?? []).length;
  if (urls < 230) failures.add(`Sitemap contains too few public URLs: ${urls}`);
  for (const value of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value[1]) || Number.isNaN(Date.parse(`${value[1]}T00:00:00Z`))) {
      failures.add(`Sitemap contains an invalid lastmod date: ${value[1]}`);
    }
  }
}

const siteSource = await readFile(new URL("../src/data/site.ts", import.meta.url), "utf8");
const currentRelease = siteSource.match(/latestRelease:\s*"([^"]+)"/)?.[1];
const upcomingRelease = siteSource.match(/upcomingRelease:\s*"([^"]+)"/)?.[1];
if (!currentRelease || !upcomingRelease) failures.add("Missing release metadata in site.ts");

if (currentRelease) {
  const installCommand = `ph7software/ph7builder:${currentRelease} my-dating-app --no-dev --prefer-dist`;
  for (const route of ["get-started", "ai-builders"]) {
    const pagePath = path.join(dist, route, "index.html");
    if (await exists(pagePath)) {
      const html = await readFile(pagePath, "utf8");
      if (!html.includes(installCommand)) failures.add(`${route} does not provide the published release install command with production flags`);
    }
  }
}

if (await exists(path.join(dist, "llms.txt"))) {
  const llms = await readFile(path.join(dist, "llms.txt"), "utf8");
  if (!llms.startsWith("# pH7Builder\n\n> pH7Builder is")) failures.add("llms.txt does not begin with the canonical identity and summary");
  if (currentRelease && upcomingRelease && (!llms.includes(`latest published release is ${currentRelease}`) || !llms.includes(`Version ${upcomingRelease} is unreleased`))) failures.add("llms.txt does not match the release metadata in site.ts");
  if (!llms.includes("/get-started/index.md")) failures.add("llms.txt does not link to the Markdown installation guide");
  if (!llms.includes("/AGENTS.md") || !llms.includes("/SKILL.md")) failures.add("llms.txt does not expose the public agent instructions");
  if (!llms.includes("/.well-known/ard.json")) failures.add("llms.txt does not expose the ARD manifest");

  const internalUrls = [...llms.matchAll(/\]\((https:\/\/ph7builder\.com\/[^)]+)\)/g)].map((match) => match[1]);
  for (const url of internalUrls) {
    const destination = new URL(url);
    const candidates = pathCandidates(destination.pathname);
    const found = await Promise.any(candidates.map(async (candidate) => {
      if (await exists(candidate)) return true;
      throw new Error("missing");
    })).catch(() => false);
    if (!found) failures.add(`Broken internal resource in llms.txt: ${destination.pathname}`);
  }
}

if (await exists(path.join(dist, ".well-known/ard.json"))) {
  const manifestPath = path.join(dist, ".well-known/ard.json");
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    failures.add("ARD manifest is not valid JSON");
  }
  if (manifest) {
    if (!Array.isArray(manifest.entries) || manifest.entries.length !== 3) {
      failures.add("ARD manifest must catalogue the three official pH7Builder skills");
    } else {
      const identifiers = new Set();
      for (const entry of manifest.entries) {
        if (entry["@context"] !== "https://agenticresourcediscovery.org/context/v1") failures.add(`ARD entry has an invalid context: ${entry.displayName ?? "unnamed"}`);
        if (typeof entry.identifier !== "string" || !entry.identifier.startsWith("urn:air:ph7builder.com:skills:")) failures.add(`ARD entry has an invalid publisher identifier: ${entry.displayName ?? "unnamed"}`);
        if (identifiers.has(entry.identifier)) failures.add(`ARD entry identifier is duplicated: ${entry.identifier}`);
        identifiers.add(entry.identifier);
        if (typeof entry.displayName !== "string" || entry.displayName.length === 0) failures.add("ARD entry is missing a display name");
        if (entry.type !== "application/agent-skills+md") failures.add(`ARD entry has an invalid media type: ${entry.displayName ?? "unnamed"}`);
        if ((typeof entry.url === "string") === (typeof entry.data === "string")) failures.add(`ARD entry must provide exactly one of url or data: ${entry.displayName ?? "unnamed"}`);
        if (typeof entry.url !== "string" || !entry.url.startsWith("https://")) failures.add(`ARD entry must use an HTTPS skill URL: ${entry.displayName ?? "unnamed"}`);
        if (!Array.isArray(entry.representativeQueries) || entry.representativeQueries.length < 2 || entry.representativeQueries.length > 5) failures.add(`ARD entry needs two to five representative queries: ${entry.displayName ?? "unnamed"}`);
      }
    }
  }
}

if (await exists(path.join(dist, "index.html"))) {
  const homepage = await readFile(path.join(dist, "index.html"), "utf8");
  if (!homepage.includes("Build it yourself") || !homepage.includes("Work with the creator")) failures.add("Homepage does not expose the independent and professional paths");
  if (!homepage.includes("pH7Builder, formerly pH7CMS") || !homepage.includes("PHP 8.2+") || !homepage.includes("MySQL 8.0+")) failures.add("Homepage does not expose the current product identity and requirements");
  if (!homepage.includes('"SoftwareApplication"') || !homepage.includes('"SoftwareSourceCode"') || !homepage.includes('"Organization"')) failures.add("Homepage structured data does not identify the software and publisher entities");
  if (!homepage.includes('"alternateName":"pH7CMS"') || !homepage.includes('"softwareVersion":"19.4.0"')) failures.add("Homepage structured data does not identify the former name and published version");
}

if (await exists(path.join(dist, "build/index.html"))) {
  const buildPage = await readFile(path.join(dist, "build/index.html"), "utf8");
  if (!buildPage.includes("No account. No AI API. No idea stored or transmitted.")) failures.add("Build page is missing its local-only privacy disclosure");
  if (!buildPage.includes("A customised production business takes further engineering")) failures.add("Build page is missing the production-readiness boundary");
  if (!buildPage.includes("data-share-card-canvas") || !buildPage.includes("Only the public product name and audience above can appear")) failures.add("Build page is missing the privacy-conscious share card");
}

if (await exists(path.join(dist, "services/index.html"))) {
  const servicesPage = await readFile(path.join(dist, "services/index.html"), "utf8");
  for (const price of ["Free", "From $3,000 USD", "From $15,000 USD", "Custom pricing"]) {
    if (!servicesPage.includes(price)) failures.add(`Services page is missing the proposed price: ${price}`);
  }
}

if (failures.size > 0) {
  console.error("Production build verification failed:");
  for (const failure of [...failures].sort()) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Production build verified (${htmlFiles.length} HTML pages, ${articlePages} article/release pages, ${internalLinks} internal links).`);
