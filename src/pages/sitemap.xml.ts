import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { legacyRedirects } from "../data/redirects";
import { site } from "../data/site";

const staticRoutes = [
  "/",
  "/about/",
  "/ai-builders/",
  "/articles/",
  "/blueprints/nomad-connections/",
  "/build/",
  "/changelog/",
  "/get-started/",
  "/privacy/",
  "/tools/dating-site-launch-checklist/",
  "/vibe-coders/",
];

const escapeXml = (value: string): string => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");

export const GET: APIRoute = async () => {
  const articles = await getCollection("articles", ({ data }) => !data.draft && !(data.slug in legacyRedirects));
  const entries = [
    ...staticRoutes.map((path) => ({ path, updatedAt: undefined as Date | undefined })),
    ...articles.map((article) => ({ path: `/${article.data.slug}/`, updatedAt: article.data.updatedAt ?? article.data.publishedAt })),
  ];
  const unique = [...new Map(entries.map((entry) => [entry.path, entry])).values()]
    .sort((a, b) => a.path.localeCompare(b.path));
  const body = unique.map((entry) => {
    const lastModified = entry.updatedAt ? `\n    <lastmod>${entry.updatedAt.toISOString().slice(0, 10)}</lastmod>` : "";
    return `  <url>\n    <loc>${escapeXml(new URL(entry.path, site.origin).toString())}</loc>${lastModified}\n  </url>`;
  }).join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
