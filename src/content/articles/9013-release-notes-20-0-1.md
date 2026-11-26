---
title: "pH7Builder 20.0.1 — Security Release"
description: "pH7Builder 20.0.1 updates Symfony Mailer and MIME after two upstream TLS security advisories."
slug: "release-notes-20-0-1"
publishedAt: "2026-11-26T00:00:00Z"
sourceType: "release"
releaseStatus: "published"
sourceUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS/blob/20.x/docs/RELEASE_NOTES_20.0.1.md"
categories: ["Release notes"]
tags: ["Security", "Symfony Mailer", "PHP 8.3"]
historical: false
featured: true
draft: false
---
pH7Builder 20.0.1 updates the locked production mail dependencies after two
upstream Symfony Mailer security advisories. It replaces Symfony Mailer and
MIME 7.4.22 with 7.4.24.

The update closes CVE-2026-133751, which could allow mandatory TLS to be
bypassed by a network attacker, and CVE-2026-133755, which could allow a reply
to be injected immediately after a STARTTLS command.

There is no database migration from 20.0.0. The SQL schema remains `1.6.7`, and
PHP 8.3 through 8.5 remain supported.

Operators should deploy the complete 20.0.1 package, preserve configuration and
user data, remove or block the installer, and clear application, template and
browser/CDN caches. Source deployments should run `composer install` from the
tagged tree so Composer installs the patched lock file.

Download the release and its verification artefacts from the
[v20.0.1 GitHub release](https://github.com/pH7Software/pH7-Social-Dating-CMS/releases/tag/v20.0.1).
