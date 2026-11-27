# pH7Builder website

This repository contains the static Astro website for
[pH7Builder](https://ph7builder.com), the open-source foundation for
independently owned dating, matchmaking and community products.

The application itself lives in the
[pH7Builder source repository](https://github.com/pH7Software/pH7-Social-Dating-CMS).

## Requirements

- Node.js 24, as recorded in `.nvmrc`
- npm, using the committed lockfile

## Local development

```console
npm ci
npm run dev
```

The development server runs at `http://127.0.0.1:4321` by default.

## Verification

Run the complete local CI sequence before pushing:

```console
npm run build:ci
```

This command runs the unit tests, validates marketplace manifests and commerce
boundaries, checks the repository for files that should not be public,
type-checks and builds the Astro site, then verifies generated pages and links.

The checks can also be run separately:

| Command | Purpose |
| --- | --- |
| `npm test` | Run product-tool and marketplace commerce tests. |
| `npm run verify:marketplace` | Validate catalogue, pricing, release state and public commerce files. |
| `npm run verify:public-repo` | Check tracked public files for unsafe content. |
| `npm run build` | Type-check and build the production site. |
| `npm run verify:build` | Verify generated pages and internal links. |

## Repository map

- `src/pages/` contains public routes.
- `src/content/articles/` contains reviewed articles migrated from WordPress.
- `src/components/` and `src/layouts/` contain shared interface code.
- `src/data/` and `src/lib/` contain typed site data and testable logic.
- `public/` contains intentionally public static assets.
- `scripts/` contains tests and build-verification checks.
- `marketplace/catalog/` contains the versioned public product manifests.
- `marketplace-worker/` contains the disabled-by-default PayPal and fulfilment boundary.

Read [`AGENTS.md`](AGENTS.md) before making product, content or design changes.
It records the repository's evidence, voice, accessibility and release rules.

## Deployment

The production site is deployed to GitHub Pages from `main`. Pull requests run
the same build without publishing. The complete WordPress export is a local
migration input and is intentionally ignored.

## Product and migration notes

- [Product and website strategy](docs/PRODUCT_AND_WEBSITE_STRATEGY.md)
- [Brand system and visual identity](docs/BRAND.md)
- [Legacy URL migration](docs/LEGACY_URL_MIGRATION.md)
- [Build journey acceptance record](docs/BUILD_ACCEPTANCE.md)
- [Marketplace architecture and release gate](docs/MARKETPLACE.md)

## About Me

I'm [Pierre-Henry Soria](https://github.com/pH-7), the founder and software
engineer behind the pH7Builder project. I created it and continue to shape its
product direction, architecture and public releases.
