import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const productionOrigin = "https://ph7builder.com";
const failures = new Set();
const retiredDestinations = /(?:clients\.hizup\.com|hizup\.net\/clients|paypal\.com\/cgi-bin\/webscr|goo\.gl\/forms|mailto:hi@ph7\.me|http:\/{3})/i;

const requiredFiles = [
  ".nojekyll",
  "CNAME",
  "404.html",
  "favicon.svg",
  "index.html",
  "llms.txt",
  "robots.txt",
  "rss.xml",
  "sitemap.xml",
  "social-card.svg",
  "about/index.html",
  "ai-builders/index.html",
  "articles/index.html",
  "blueprints/nomad-connections/index.html",
  "build/index.html",
  "changelog/index.html",
  "get-started/index.html",
  "privacy/index.html",
  "release-notes-19-4-0/index.html",
  "release-notes-20-0-0/index.html",
  "services/index.html",
  "services/custom-development/index.html",
  "social-dating-features/index.html",
  "dating-startup-by-step/index.html",
  "tools/dating-site-launch-checklist/index.html",
  "vibe-coders/index.html",
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

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(dist, file).split(path.sep).join("/");
  const isRedirect = /http-equiv=["']refresh["']/i.test(html);

  if (!/<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html)) failures.add(`Missing canonical link: ${relative}`);
  if (!isRedirect && !/<meta\s+[^>]*name=["']description["'][^>]*>/i.test(html)) failures.add(`Missing meta description: ${relative}`);
  if (!isRedirect && !html.includes("Pierre-Henry Soria")) failures.add(`Missing creator attribution: ${relative}`);
  if (/fonts\.googleapis\.com|googletagmanager|google-analytics|client\.crisp\.chat/i.test(html)) failures.add(`Contains an unapproved remote font, tracker or chat widget: ${relative}`);
  if (/<script\s+[^>]*src=["']https?:\/\//i.test(html)) failures.add(`Contains an external script: ${relative}`);
  if (/\/wp-content\/|\/wp-admin\/|socialdaringbuildersoftware\.WordPress/i.test(html)) failures.add(`Contains WordPress runtime or export residue: ${relative}`);
  if (retiredDestinations.test(html)) failures.add(`Contains a retired commercial or contact destination: ${relative}`);
  if (html.includes("class=\"article-byline\"")) articlePages += 1;

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

if (htmlFiles.length < 235) failures.add(`Expected the migrated website to build at least 235 HTML pages, found ${htmlFiles.length}`);
if (articlePages < 220) failures.add(`Expected at least 220 article/release pages, found ${articlePages}`);
if (internalLinks < 500) failures.add(`Expected a connected static site, found only ${internalLinks} internal links`);

if (await exists(path.join(dist, "robots.txt"))) {
  const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
  if (!robots.includes("Sitemap: https://ph7builder.com/sitemap.xml")) failures.add("robots.txt does not advertise the production sitemap");
}

if (await exists(path.join(dist, "sitemap.xml"))) {
  const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  for (const route of ["/", "/build/", "/ai-builders/", "/changelog/", "/social-dating-features/", "/dating-startup-by-step/", "/tools/dating-site-launch-checklist/"]) {
    if (!sitemap.includes(`<loc>${productionOrigin}${route}</loc>`)) failures.add(`Sitemap is missing: ${route}`);
  }
  const urls = (sitemap.match(/<url>/g) ?? []).length;
  if (urls < 230) failures.add(`Sitemap contains too few public URLs: ${urls}`);
}

if (await exists(path.join(dist, "llms.txt"))) {
  const llms = await readFile(path.join(dist, "llms.txt"), "utf8");
  if (!llms.startsWith("# pH7Builder\n\n> pH7Builder is")) failures.add("llms.txt does not begin with the canonical identity and summary");
  if (!llms.includes("latest published release is 19.4.0") || !llms.includes("Version 20.0.0 is unreleased")) failures.add("llms.txt does not distinguish the published and upcoming releases");
}

if (await exists(path.join(dist, "build/index.html"))) {
  const buildPage = await readFile(path.join(dist, "build/index.html"), "utf8");
  if (!buildPage.includes("does not deploy an app") || !buildPage.includes("does not submit your idea")) failures.add("Blueprint page is missing its local-only scope disclosure");
}

if (failures.size > 0) {
  console.error("Production build verification failed:");
  for (const failure of [...failures].sort()) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Production build verified (${htmlFiles.length} HTML pages, ${articlePages} article/release pages, ${internalLinks} internal links).`);
