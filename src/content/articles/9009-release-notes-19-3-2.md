---
title: "pH7Builder 19.3.2 — Release Notes"
description: "A documentation-only patch that clarifies the pH7Builder description and production installation path."
slug: "release-notes-19-3-2"
publishedAt: "2026-10-15T00:00:00Z"
sourceType: "release"
releaseStatus: "published"
sourceUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS/blob/18.x/docs/RELEASE_NOTES_19.3.2.md"
categories: ["Release notes"]
tags: []
historical: false
featured: false
draft: false
---
Released on 15 October 2026, this patch release refreshes the README's
description of pH7Builder and points production installation instructions to
the Production Quick Start. It does not change runtime behavior.

## Compatibility and upgrade

PHP 8.2+, MySQL 8.0+, schema `1.6.6` and the locked Composer dependencies are
unchanged. No database migration is needed from 19.3.1.

Deploy the complete package, preserve configuration and user data, remove the
installer on existing sites, and clear application, template and CDN caches.
There are no application configuration or custom-theme changes in this release.

The `pH7Builder-v19.3.2.zip` asset includes production dependencies. Verify its
attached SHA-256 checksum, then use the [Quick Start](https://github.com/pH7Software/pH7-Social-Dating-CMS/blob/18.x/docs/QUICK_START.md) and
[Launch Checklist](https://github.com/pH7Software/pH7-Social-Dating-CMS/blob/18.x/docs/LAUNCH_CHECKLIST.md).

[All changes since 19.3.1](https://github.com/pH7Software/pH7-Social-Dating-CMS/compare/v19.3.1...v19.3.2)
