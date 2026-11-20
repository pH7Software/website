# pH7Builder website agent guide

## Purpose

This repository contains the static Astro website for `ph7builder.com`. It
positions pH7Builder as an open-source, AI-ready foundation for dating,
matchmaking and community products while preserving the useful editorial
history of the former WordPress site.

Before editing, read the nearby files and treat `package.json`,
`astro.config.mjs`, `src/content.config.ts`, this guide and the verification
scripts as the executable sources of truth. Keep changes focused and preserve
unrelated work.

## Product decisions

- Lead with what a visitor can build, not a long feature inventory.
- Keep two clear paths: build independently with an AI coding agent, or work
  directly with Pierre-Henry Soria on custom delivery.
- The `/build/` tool creates a portable specification and starter prompt in
  the browser. It never claims to deploy an application and must not transmit
  the visitor's idea.
- Keep release status precise. Published versions and unreleased versions must
  never be described interchangeably.
- Never invent customers, testimonials, results, adoption figures or security
  guarantees.
- Preserve ownership language accurately: customers own their application
  code, hosting choices and member data, subject to the licences of components
  they choose.

## Architecture

- `src/layouts/`: shared document, article and tool layouts.
- `src/components/`: reusable visual and interactive pieces.
- `src/pages/`: public routes. Keep established WordPress slugs available when
  they have search or reader value.
- `src/content/articles/`: reviewed WordPress article migrations.
- `src/data/`: typed product, navigation, release and redirect data.
- `src/lib/`: pure browser-independent logic. Interactive tools should keep
  their generation logic here so it can be unit tested.
- `public/`: intentionally public static assets only.
- `scripts/`: deterministic tests and public-build checks.

Do not commit WordPress exports, comments, private metadata, credentials,
runtime output or machine-local files. The export filename patterns are
intentionally ignored.

## Content and voice

- Article authorship is always `Pierre-Henry Soria`, linking to
  `https://github.com/pH-7`.
- Preserve Pierre-Henry's direct, practical voice. Prefer short sentences,
  concrete decisions and honest constraints. Avoid generic AI phrasing,
  inflated claims, empty transitions and repeated conclusions.
- Historical release posts may retain their original context, but must display
  a clear archive notice and point readers to the current changelog.
- Every article ends with the shared pH7Builder start call to action.
- Use `pH7Builder` for the current product. Use `pH7CMS` only in historical
  context where changing it would rewrite the record.
- Keep titles, descriptions and alt text useful. Decorative images use an empty
  alt attribute.

## Design and accessibility

- Use the repository's local system font stacks. Do not add a remote font,
  analytics script, chat widget or behavioural tracker without a documented
  product need and privacy review.
- Keep the blueprint-grid visual language, strong typography and restrained
  motion. Respect `prefers-reduced-motion`.
- All interactions must work by keyboard, expose useful names and preserve
  visible focus. Do not replace native controls without a demonstrated need.
- Test narrow mobile, wide desktop, light print output and high-contrast/focus
  states. The launch checklist must remain printable.

## Verification

Run checks proportionate to the change and expand before publication:

```console
npm test
npm run build:ci
```

For visual or interactive changes, also run `npm run dev`, inspect the relevant
routes in Chrome at desktop and mobile widths, and test keyboard operation.
Never claim a check passed when it was skipped or failed.

## Git and publication

- Keep one purpose per commit. Use short present-tense subjects that explain
  the reason for the change.
- Review the complete staged diff before committing.
- Keep the public repository free of exports, personal data, secrets,
  generated build output and downloaded source material.
- Do not change DNS or publish a build until the local production build and
  internal-link checks pass.
