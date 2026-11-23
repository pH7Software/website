import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { legacyRedirects } from "../data/redirects";
import { marketplaceProducts } from "../data/marketplace";
import { site } from "../data/site";

const staticRoutes = [
  { path: "/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/about/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/ai-builders/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/articles/", updatedAt: new Date("2026-11-21T00:00:00Z") },
  { path: "/blueprints/nomad-connections/", updatedAt: new Date("2026-11-21T00:00:00Z") },
  { path: "/build/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/changelog/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/get-started/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/marketplace/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/marketplace/refunds/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/marketplace/support/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/privacy/", updatedAt: new Date("2026-11-21T00:00:00Z") },
  { path: "/services/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/services/ai-prototype-to-production/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/services/custom-development/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/services/migration/", updatedAt: new Date("2026-11-23T00:00:00Z") },
  { path: "/tools/dating-site-launch-checklist/", updatedAt: new Date("2026-11-21T00:00:00Z") },
  { path: "/vibe-coders/", updatedAt: new Date("2026-11-21T00:00:00Z") },
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
    ...staticRoutes,
    ...marketplaceProducts
      .filter((product) => product.verification.status !== "retired")
      .map((product) => ({ path: `/marketplace/${product.id}/`, updatedAt: new Date(`${product.updatedAt}T00:00:00Z`) })),
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
