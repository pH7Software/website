import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { legacyRedirects } from "../data/redirects";
import { site } from "../data/site";

const escapeXml = (value: string): string => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");

export const GET: APIRoute = async () => {
  const articles = (await getCollection("articles", ({ data }) => !data.draft && !(data.slug in legacyRedirects)))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
    .slice(0, 40);
  const items = articles.map((article) => {
    const url = `${site.origin}/${article.data.slug}/`;
    return `    <item>
      <title>${escapeXml(article.data.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${article.data.publishedAt.toUTCString()}</pubDate>
      <dc:creator>${escapeXml(site.author.name)}</dc:creator>
      <description>${escapeXml(article.data.description)}</description>
    </item>`;
  }).join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>pH7Builder</title>
    <link>${site.origin}/</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
