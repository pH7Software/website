# pH7Builder product and website strategy

## Positioning

pH7Builder is the open-source foundation for building, owning and operating dating and matchmaking applications with AI.

The website does not position pH7Builder as a generic prompt-to-app service. It gives a capable coding agent an established PHP application to inspect, configure and extend. The customer keeps control of the application, infrastructure choices and member data, subject to the licences and services they choose.

The primary promise is:

> Start with a foundation. Build what makes your idea unique. Own the result.

Dating and matchmaking remain the entry point. Friendship, activity matching and private communities are adjacent use cases, not a reason to dilute the product into a platform for every kind of community.

## Customer journeys

### Build independently

The visitor describes an idea at `/build/`, selects Codex, Claude Code, Cursor or another capable coding agent, and receives:

- a complete execution prompt;
- a portable application blueprint;
- honest local-development and production-readiness boundaries;
- a direct path to the published pH7Builder release.

The tool runs locally in the browser. It does not call an AI model, create an account or transmit the idea.

### Work with the creator

The visitor may choose a scoped professional path:

- Launch, from $3,000 USD;
- Custom Build, from $15,000 USD;
- Managed & Ongoing, custom pricing;
- migration or AI-prototype production work after an evidence-led assessment.

These prices are starting points for review before public deployment. Undefined work uses direct enquiry, not a checkout pretending the scope is already known.

### Evaluate the software

Technical visitors can inspect the source, read the agent guidance and install the current published release. Release-specific requirements remain explicit instead of being inferred from another branch or an older package.

## Information architecture

| Route | Purpose |
| --- | --- |
| `/` | Positioning, examples and the two primary paths |
| `/build/` | Canonical execution-prompt and blueprint generator |
| `/ai-builders/` | Technical agent workflow and current capability boundaries |
| `/vibe-coders/` | Founder-oriented path from idea to build brief |
| `/get-started/` | Published release installation |
| `/services/` | Optional services and USD pricing |
| `/services/custom-development/` | Custom Build delivery approach |
| `/services/ai-prototype-to-production/` | Production engineering for existing AI-built prototypes |
| `/services/migration/` | Dating-platform migration preflight |
| `/blueprints/nomad-connections/` | Clearly labelled travel and expat dating concept |
| `/tools/dating-site-launch-checklist/` | Printable product and launch checklist |
| `/articles/` and `/changelog/` | Editorial history and release notes |
| `/about/` | Founder, history and project philosophy |

## Capability truth

### Published in 20.0.0

- MIT-licensed, self-hosted PHP application;
- Packagist project package `ph7software/ph7builder`;
- versioned GitHub release ZIP and checksum;
- browser installation workflow;
- profiles, discovery, matchmaking, messaging, memberships, moderation and administration represented in the application;
- PHP 8.3 through 8.5 compatibility declared by the published package;
- repository agent guidance and three official agent skills;
- a verified release gate, operator health report and release provenance;
- safe CSV previews and a scoped UNA 14 migration adapter.

### Roadmap, not current product claims

- a stable public application API;
- an official MCP server;
- declarative full-application manifests;
- non-interactive production installation;
- universal automatic upgrades;
- AI-powered introductions.

## Content and design decisions

- Lead with a concrete build outcome instead of a long capability catalogue.
- Keep the current blueprint-grid visual identity, system fonts and restrained motion.
- Use actual product evidence and labelled concepts. Do not invent customers, screenshots or adoption figures.
- Keep Build with AI usable without the professional path.
- Use British English and direct, practical wording.
- Keep agent discovery additive: authoritative documentation remains useful to humans.

## External reference boundary

UNA's official homepage was reviewed on 23 November 2026. Its useful strategic pattern is a clear choice between self-directed building and a custom delivery path, while preserving open-source ownership and self-hosting. pH7Builder should apply that pattern through its dating-specific foundation, portable execution prompt and independent hosting model rather than imitate UNA's broader community-platform positioning.

UNA's exact AI Builders and Vibe Coders pages were unavailable during this review. No pH7Builder capability or positioning claim relies on content that could not be inspected.

## Measures worth adding after launch

If privacy-conscious measurement is approved, record only aggregate events such as Build page visits, prompt generation, successful copy actions and service enquiry clicks. Never place the visitor's application idea in analytics, URLs, logs or third-party scripts.

## Pre-deployment decisions

- Approve the public service prices and current availability.
- Confirm that `hello@ph7builder.com` is monitored and can receive enquiries.
- Complete the browser acceptance pass at desktop and mobile widths.
- Keep marketplace checkout disabled until one exact product package and the complete PayPal sandbox purchase-to-download lifecycle pass their release gates.
- Review the Cloudflare redirect plan before replacing legacy WordPress responses.
