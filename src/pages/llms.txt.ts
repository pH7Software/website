import type { APIRoute } from "astro";
import { site } from "../data/site";

export const GET: APIRoute = () => {
  const body = `# pH7Builder

> pH7Builder is open-source, self-hosted PHP software for building white-label dating websites, matchmaking platforms, social networks and online communities.

Canonical identity: pH7Builder, formerly pH7CMS, is a self-hosted PHP application created by Pierre-Henry Soria and released under the MIT licence. The latest published release is ${site.latestRelease}. Version ${site.upcomingRelease} is unreleased. pH7Builder is not a hosted SaaS product.

Important boundaries: the website blueprint tool runs locally in the browser. It does not deploy an application, call an AI model or submit the visitor's idea. A public application API and MCP server are future directions, not currently advertised capabilities.

## Verified current foundation
- Member profiles and identity.
- Discovery and matchmaking.
- Private messaging and connection flows.
- Memberships, moderation controls and administration.
- Self-hosted deployment with source-code access.
- Release ${site.latestRelease} requirements: ${site.latestReleaseRequirements}.

## Product
- [pH7Builder overview](${site.origin}/index.md): Identity, current release, licence and primary build paths.
- [Get started](${site.origin}/get-started/index.md): Published release installation and production readiness boundaries.
- [pH7Builder for AI builders](${site.origin}/ai-builders/index.md): Technical workflow, available agent context and current limitations.
- [Build with AI](${site.origin}/build/index.md): Generate a complete execution prompt and portable blueprint locally for Codex, Claude Code, Cursor or another capable coding agent.
- [Nomad Connections example](${site.origin}/blueprints/nomad-connections/index.md): Worked product blueprint for travellers and people living abroad.
- [Services and USD pricing](${site.origin}/services/index.md): Optional Launch, Custom Build and ongoing engineering paths alongside the complete free path.
- [Official marketplace](${site.origin}/marketplace/index.md): Verified first-party extensions, compatibility information and pay-what-you-wish pricing. Checkout remains closed until fulfilment and owner activation are complete.
- [AI prototype to production](${site.origin}/services/ai-prototype-to-production/index.md): Production-readiness engineering for an existing AI-built dating application.
- [Migration and modernisation](${site.origin}/services/migration/index.md): Evidence-led migration preflight for an existing dating platform.

## Agent instructions
- [Repository agent guide](https://raw.githubusercontent.com/pH7Software/pH7-Social-Dating-CMS/18.x/AGENTS.md): Architecture, coding conventions, security invariants and verification for the public source tree.
- [Installation skill](https://raw.githubusercontent.com/pH7Software/pH7-Social-Dating-CMS/18.x/.agents/skills/ph7builder-installation/SKILL.md): Evaluate or install a published pH7Builder release.
- [Module development skill](https://raw.githubusercontent.com/pH7Software/pH7-Social-Dating-CMS/18.x/.agents/skills/ph7builder-module-development/SKILL.md): Implement or review a custom module within pH7Builder conventions.
- [Upgrade preflight skill](https://raw.githubusercontent.com/pH7Software/pH7-Social-Dating-CMS/18.x/.agents/skills/ph7builder-upgrade-preflight/SKILL.md): Prepare a read-only compatibility, backup and migration assessment.
- [Agentic Resource Discovery manifest](${site.origin}/.well-known/ard.json): Machine-readable catalogue of the three official agent skills.

## Product guidance
- [What pH7Builder gives a dating product](${site.origin}/social-dating-features/index.md): Product domains and practical foundation guidance.
- [Practical dating startup plan](${site.origin}/dating-startup-by-step/index.md): Steps for validating and preparing a dating business.
- [Dating product launch checklist](${site.origin}/tools/dating-site-launch-checklist/index.md): Printable browser-only launch checklist.
- [pH7Builder for vibe coders](${site.origin}/vibe-coders/index.md): Founder-oriented path from idea to an agent-ready brief.

## Project sources
- [Source repository](${site.githubUrl}): Canonical public codebase.
- [Latest published release](${site.latestReleaseUrl}): Release package, checksums and notes for ${site.latestRelease}.
- [Official documentation address](${site.documentationUrl}): Stable pH7Builder documentation entry point.
- [Versioned release documentation](${site.docsUrl}): Installation, configuration and operating documentation maintained with the source.
- [About pH7Builder](${site.origin}/about/index.md): Mission, ownership and product direction.
- [Website privacy](${site.origin}/privacy/index.md): Static-site, local-storage and external-link data boundaries.
- [Marketplace support](${site.origin}/marketplace/support/index.md): Scope and security boundaries for official product support.

## Optional
- [Complete article archive](${site.origin}/articles/): All migrated articles and release notes; each article advertises a Markdown alternative.
- [Release changelog](${site.origin}/changelog/): Published and planned release history.
- [XML sitemap](${site.origin}/sitemap.xml): Canonical HTML pages for general search discovery.
- [RSS feed](${site.origin}/rss.xml): Recent pH7Builder articles and releases.
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
