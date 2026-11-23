# Build journey acceptance record

## Target journey

Idea:

> I want to create a dating app for people who enjoy travelling and living abroad. Members should have a current city, upcoming travel destinations, interests and preferences for friendship or relationships. They should be able to discover compatible people and message one another.

Target agent: Codex.

## Verified website stages

- The Astro project started from a clean `main` baseline.
- The existing production build, link checks and eight tests passed before changes.
- `/build/` now provides the idea field, example ideas, agent selection, execution-prompt preview, portable-blueprint preview, copy feedback and downloads.
- Prompt generation is deterministic and browser-local.
- Unit coverage verifies multiline input, punctuation that resembles HTML, empty input, length limits and the current published-release reference.
- Local Chrome rendered the homepage and Build page successfully. A 390 px emulated viewport reported no horizontal overflow.
- Browser interaction checks confirmed that multiline and special-character input reaches the preview, Cursor selection changes the generated prompt, the copied text exactly matches the visible prompt, the blueprint receives the idea, empty input returns focus to the idea field, keyboard arrow navigation changes tabs, and denied clipboard access produces a useful fallback message.

## Published-release evidence

- GitHub latest stable release: `v19.4.0`, published 12 November 2026.
- Packagist resolves `ph7software/ph7builder` `v19.4.0`.
- The package declares PHP `^8.2` and the required PHP extensions.
- The GitHub release publishes `pH7Builder-v19.4.0.zip` and its SHA-256 file.
- The 171 MB release archive downloaded successfully and its calculated SHA-256 matched the published checksum: `1503ba04cfbc8e0ee4481e74fe731d7e0e75228873525a02a957288d9db7e2ca`.
- The release archive contains both root and installer production dependencies, including `_protected/vendor/autoload.php` and `_install/vendor/autoload.php`.
- The 20.x branch declares PHP `^8.3` for the unreleased 20.0.0 line and must not be presented as stable 19.4.0 behaviour.

## Environment limitations found

- Local Composer 2.9.3 exited with signal 139 while downloading Packagist metadata under both PHP 8.5.1 and PHP 8.2.33. A writable isolated cache and an unsandboxed retry did not change the result.
- Docker CLI 29.9.3 is installed, but the Docker daemon is unavailable and the Compose plugin is not installed.
- MySQL 8.4.11 is installed and responding locally, but a supported rewriting web-server workflow was not prepared during this pass.

These are local environment blockers. They do not prove a pH7Builder package defect, and the full idea-to-running-application milestone is not complete.

## Remaining acceptance work

1. Run the generated Codex prompt in an environment with working Docker Compose or a healthy Composer network stack.
2. Install exactly `ph7software/ph7builder:19.4.0` in a clean directory.
3. Complete the supported browser installer and record manual interventions.
4. Implement the travel-specific profile fields and branding in the running application.
5. Verify discovery, matching, messaging, narrow mobile behaviour and keyboard operation.
6. Restart the environment and prove that code, configuration and database state persist.
7. Repeat prompt generation with a substantially different niche.

Do not use the preferred “Build your unique dating app in minutes” headline until those timing stages are measured. The website uses “Start building your unique dating app in minutes” instead.
