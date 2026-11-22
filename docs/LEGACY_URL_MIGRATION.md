# Legacy URL migration

## Sources inspected

- the migrated WordPress article collection in `src/content/articles/`;
- the local WordPress export, which remains ignored and must not be committed;
- `src/data/redirects.ts`;
- the generated sitemap and internal-link verifier;
- retained `/doc/en/` routes and historical article slugs.

The static build currently produces more than 220 historical article and release pages. Useful articles retain their original public slugs and add a current pH7Builder call to action through the shared article layout.

## Redirect map

The canonical redirect source is `src/data/redirects.ts`. Important intent changes include:

| Legacy route | Current destination | Reason |
| --- | --- | --- |
| `/blog/` | `/articles/` | Preserve the editorial archive |
| `/download/`, `/get/` | `/get-started/` | Current published release path |
| `/pricing/`, `/packages/`, `/order/` | `/services/` | Current free and professional paths |
| `/contact/` | `/services/` | Verified direct enquiry route |
| `/mission/` | `/about/` | Current project purpose and founder context |
| `/cookie-policy/` | `/privacy/` | Current static-site privacy position |
| `/startup-kit-social-business/` | `/tools/dating-site-launch-checklist/` | Closest useful replacement tool |

Other mappings remain in the typed redirect source and are checked as part of the production build.

## Hosting limitation

GitHub Pages cannot emit arbitrary HTTP 301 responses from repository files. The generated legacy pages therefore use a canonical target, `noindex` and immediate HTML refresh as a fallback.

Before retiring WordPress, configure equivalent permanent redirects at Cloudflare. Test each source URL directly and avoid redirect chains. Do not redirect every unknown page to the homepage.

## Pre-cutover checks

1. Export the current WordPress sitemap and compare every valuable URL with the Astro sitemap.
2. Check high-traffic landing pages and backlinks in Search Console if access is available.
3. Confirm that historical downloads either remain available or lead to a precise current release page.
4. Configure and test Cloudflare 301 rules for mapped routes.
5. Verify `ph7cms.com` and any retained subdomains independently.
6. Crawl production after cutover for broken links, chains, soft 404s and unexpected canonical URLs.
