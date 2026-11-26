# Build journey acceptance record

## Target journey

Idea:

> I want to create a dating app for people who enjoy travelling and living
> abroad. Members should have a current city, upcoming travel destinations,
> interests and preferences for friendship or relationships. They should be
> able to discover compatible people and message one another.

Target agent: Codex.

## Verified website stages

- `/build/` provides an idea field, example ideas, agent selection,
  execution-prompt preview, portable-blueprint preview, copy feedback and
  downloads.
- Prompt and blueprint generation are deterministic and browser-local.
- Unit coverage verifies multiline input, punctuation that resembles HTML,
  empty input, length limits and the current published-release reference.
- Browser checks cover narrow-screen overflow, agent selection, exact preview
  copying, keyboard tab navigation, focus recovery and denied clipboard access.
- The generated prompt distinguishes a working local application from a
  production-ready service and prohibits destructive resets or unapproved
  deployment.

## Published-release evidence

- GitHub publishes stable release `v20.0.1`, dated 26 November 2026.
- Packagist resolves `ph7software/ph7builder` `v20.0.1` to the tagged release
  commit.
- The package supports PHP 8.3 through 8.5 and declares its required PHP
  extensions.
- The GitHub release publishes the application ZIP, SHA-256 checksum, SPDX
  SBOM and build manifest.
- The release gate passed on the exact release commit. It covered a packaged
  fresh installation, the 19.4.0-to-20.0.0 migration, a restore rehearsal,
  static analysis, browser journeys, production dependencies and release
  metadata.
- The versioned ZIP includes locked root and installer production
  dependencies.

## Remaining product-demonstration boundary

The generic Build tool and the pH7Builder release are verified independently.
The Nomad Connections page remains a product blueprint, not a claim that a
finished travel-dating application has been deployed.

Before presenting Nomad Connections as a working flagship application:

1. Generate a fresh v20 project from its published release.
2. Implement the travel-specific fields, privacy rules and branding through
   supported extension points.
3. Verify discovery, matching, messaging, reporting and blocking in the real
   running application.
4. Prove narrow mobile, keyboard and restart persistence behaviour.
5. Publish only the measured installation and validation results.

Do not claim that pH7Builder produces a production-ready dating business in a
fixed number of minutes. The website promises a faster, established starting
point and keeps production-readiness work explicit.
