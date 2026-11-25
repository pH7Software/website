---
title: "pH7Builder 20.0.0 — Release Notes"
description: "pH7Builder 20.0.0 adds a verified release gate, safer migration tools, PHP 8.3–8.5 support and modernised installation dependencies."
slug: "release-notes-20-0-0"
publishedAt: "2026-11-25T00:00:00Z"
sourceType: "release"
releaseStatus: "published"
sourceUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS/blob/20.x/docs/RELEASE_NOTES_20.0.0.md"
categories: ["Release notes"]
tags: ["PHP 8.3", "Security", "Migration"]
historical: false
featured: true
draft: false
---
pH7Builder 20.0.0 was released on 25 November 2026. The release makes
installation, migration, security checks and release verification more
predictable while modernising the supported PHP foundation.

## Breaking changes

- PHP 8.2 support has ended. Version 20.0.0 supports PHP 8.3 through 8.5.
  pH7Builder 19.4.0 remains the final release for PHP 8.2.
- The deprecated Braintree Drop-in checkout has been removed. Operators using
  Braintree must move to a supported payment integration before upgrading.

## Installer and dependency updates

- The installation wizard now requires Smarty 5.8.5 or newer and the release
  locks Smarty 5.9.0. Site themes continue to use PH7Tpl.
- Xefi Faker replaces FakerPHP while retaining all 29 profile-generator
  locales. Invalid locale submissions remain rejected server-side.
- Clickatell support now uses the existing MIT-licensed HTTP client and
  Clickatell's current API instead of the retired GPL wrapper.

## Reliability and security

- The release gate verifies a packaged fresh installation, the 19.4.0 to
  20.0.0 migration, a restore rehearsal, static analysis, browser journeys,
  production dependencies and release metadata.
- The GitHub release includes the application ZIP, a SHA-256 checksum, an SPDX
  SBOM and a build manifest.
- A read-only operator health report checks runtime compatibility, writable
  paths, cron, mail, caches, migrations and unsafe production settings.
- Output encoding, CSRF comparison, FFmpeg argument validation, compiler
  transport security, module permissions and IP-ban permissions have been
  strengthened.
- jQuery has been updated to 3.8.0 to address its upstream selector ReDoS
  issue.

## Migration and product experience

- Safe CSV migration previews and a read-only, resumable UNA 14 migration
  adapter are included. Compatibility with other UNA versions is not claimed.
- Profile generation and milestone celebration remain optional module features
  on fresh installations and upgrades.
- Mobile splash and signup layouts are improved, splash video loading is
  deferred, empty profile-rating pages remain usable and maps no longer load
  without an API key.

## Database and upgrade notes

The SQL schema advances to `1.6.7`. Existing installations must apply
`_repository/upgrade/19.4.0-20.0.0/data/sql/MySQL/upgrade.sql`. The migration is
idempotent and preserves the existing enabled behaviour of the affected
modules.

Use PHP 8.3, 8.4 or 8.5 before upgrading. The locked Xefi Faker dependency does
not yet support PHP 8.6, so the installer rejects that runtime instead of
claiming unverified compatibility.

Automatic in-place upgrades remain unavailable. Rehearse the documented manual
upgrade on staging and verify a real restore before changing production. The
bundled legacy Stripe flow also remains disabled until it is migrated and
independently verified.

Download the release and its verification artefacts from the
[v20.0.0 GitHub release](https://github.com/pH7Software/pH7-Social-Dating-CMS/releases/tag/v20.0.0).
