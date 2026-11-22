import { site } from "./site";

export type AgentPage = {
  path: string;
  title: string;
  description: string;
  body: string;
};

const installCommand = `composer create-project ph7software/ph7builder:${site.latestRelease} my-dating-app --no-dev --prefer-dist`;

export const agentPages: AgentPage[] = [
  {
    path: "/",
    title: "pH7Builder",
    description: "The open-source, AI-ready foundation for independently owned dating apps, matchmaking services and online communities.",
    body: `pH7Builder is a self-hosted PHP application. It gives builders an established starting point for profiles, discovery, matchmaking, messaging, memberships, moderation and administration.

## Current release

- Latest published release: **${site.latestRelease}**
- Next planned major release: **${site.upcomingRelease}**, not yet published
- Licence: [${site.licence.name}](${site.licence.url})
- Source: [GitHub](${site.githubUrl})

## Build paths

- [Create a portable product blueprint](${site.origin}/build/)
- [Use pH7Builder with an AI coding agent](${site.origin}/ai-builders/)
- [Install the published release](${site.origin}/get-started/)
- [Review optional professional services](${site.origin}/services/)
- [Review the release history](${site.origin}/changelog/)

The blueprint tool records product intent in the visitor's browser. It does not deploy an application, call an AI model or submit the idea to pH7Builder.`,
  },
  {
    path: "/about/",
    title: "About pH7Builder",
    description: "Why pH7Builder is becoming an open-source, AI-ready foundation for independently owned dating, matchmaking and community products.",
    body: `pH7Builder began as open-source dating and social software. Its purpose is to make that established foundation understandable and useful to builders working with coding agents.

The project is created and maintained by [${site.author.name}](${site.author.url}). Builders choose their own infrastructure and retain control of their application, source code and member relationships.

The portable blueprint keeps product intent separate from implementation. It helps a developer or agent understand what an application is meant to do before changing code.`,
  },
  {
    path: "/ai-builders/",
    title: "pH7Builder for AI builders",
    description: "Give an AI coding agent an established open-source dating and community foundation to understand, customise and test.",
    body: `pH7Builder is a versioned PHP application with existing product domains, repository instructions and automated checks. An agent can focus on the customer's differentiating product decisions instead of starting from an empty repository.

## Install the published release

\`\`\`console
${installCommand}
\`\`\`

Composer creates an independent application copy. Updating its dependencies does not automatically merge future pH7Builder application releases.

## Agent context available now

- A repository-wide \`AGENTS.md\` covering architecture, security invariants, conventions and verification.
- Official agent skills for installation, module development and upgrade preflight.
- A browser-only product blueprint generator.
- Documented installation and production requirements.
- Automated unit, static-analysis and repository checks.

## Important boundaries

pH7Builder does not currently advertise a public MCP server or stable public application API. Those remain future directions. Agents must inspect the installed release and map blueprint requirements to real code rather than assume proposed blueprint fields already exist.`,
  },
  {
    path: "/build/",
    title: "Build a dating app with an AI coding agent",
    description: "Describe a dating or matchmaking idea, select a coding agent and receive a complete execution prompt plus a portable pH7Builder blueprint.",
    body: `The Build tool turns a visitor's dating or matchmaking idea into two local artefacts: a complete execution prompt for a capable coding agent and a portable product blueprint that stays with the application.

The prompt covers environment inspection, stable-release selection, installation, persistent local development, customisation, synthetic demonstration data, behavioural verification and an honest handover. The blueprint records the original idea, selected agent and working principles separately from implementation.

## Privacy and operation

- The tool runs in the browser.
- The idea is not submitted to pH7Builder.
- The tool does not call an AI model.
- The visitor can choose Codex, Claude Code, Cursor or another capable coding agent.
- The visitor can copy the exact preview or download both files.

An implementation agent should have terminal and filesystem access. The generated prompt is not itself an application, and a local application is not automatically ready for production.`,
  },
  {
    path: "/get-started/",
    title: "Get started with pH7Builder",
    description: `Install the latest published pH7Builder release, ${site.latestRelease}, after checking its production requirements.`,
    body: `## Composer installation

\`\`\`console
${installCommand}
\`\`\`

Composer 2 is required for this source installation path. The target production environment must meet the version-specific requirements in the official documentation.

## Before production

- Read the [official documentation](${site.docsUrl}).
- Confirm the PHP, database, web-server and URL-rewriting requirements for release ${site.latestRelease}.
- Configure TLS, mail delivery and backups.
- Complete the guided browser installer.
- Run applicable checks before accepting real member data.

Version ${site.upcomingRelease} is not yet a published release. Do not use its requirements or upgrade path as though it were available.`,
  },
  {
    path: "/privacy/",
    title: "pH7Builder website privacy",
    description: "How the static pH7Builder website handles visitors' data and browser-only tools.",
    body: `The pH7Builder website is a static site. It does not include advertising trackers, third-party analytics, chat widgets or remote web fonts.

The blueprint generator processes its inputs in the browser and does not submit ideas to pH7Builder. The dating product launch checklist stores progress locally on the visitor's device. Clearing browser storage removes that saved progress.

Opening external links or sending email is governed by the relevant external service.`,
  },
  {
    path: "/vibe-coders/",
    title: "pH7Builder for vibe coders",
    description: "Turn a dating, matchmaking or community idea into a clear product brief for a preferred AI coding agent.",
    body: `This path is for founders and creators who have a product idea without necessarily being PHP developers.

Start by describing the audience, promise, member journey, privacy boundaries and business model. Generate a portable blueprint, then give it to a capable coding agent together with the pH7Builder repository instructions.

The agent should build on pH7Builder's existing application domains, keep the customer's differentiating logic explicit and prove important behaviour with tests. The customer retains the source code, hosting choice and member relationships.`,
  },
  {
    path: "/blueprints/nomad-connections/",
    title: "Nomad Connections blueprint",
    description: "A worked pH7Builder product blueprint for a dating business serving travellers and people living abroad.",
    body: `Nomad Connections is a concept blueprint, not a deployed application. It demonstrates how a product idea becomes a portable specification before an agent changes code.

## Product intent

- Audience: adult travellers and expats.
- Promise: help compatible people meet across current and future locations.
- Discovery: current city, preferred destinations, languages and shared travel interests.
- Privacy: exact locations are private; travel dates are private by default.
- Safety: reporting, blocking, moderation and community rules are launch requirements.

An implementation agent must map these requirements to the real pH7Builder ${site.latestRelease} codebase. The blueprint does not claim that every field or setting already exists.`,
  },
  {
    path: "/tools/dating-site-launch-checklist/",
    title: "Dating product launch checklist",
    description: "A practical, printable checklist for validating, building and launching a dating app, matchmaking service or social community.",
    body: `Choose a product type and next milestone to receive a focused checklist. Progress stays in the browser and can be printed or saved as a clean copy.

The checklist covers product decisions, trust and safety, privacy, delivery and launch operations. A checked item is a prompt for evidence, not proof by itself. Link completed work to the decision, test result, provider setting or operating document that proves it.`,
  },
  {
    path: "/services/",
    title: "pH7Builder services and pricing",
    description: "Build independently for free or work directly with the pH7Builder creator on a launch, custom product, migration or ongoing engineering.",
    body: `The free pH7Builder software and Build with AI tool remain complete. Professional help is optional.

## Starting prices in USD

- Build It Yourself: free.
- Launch: from $3,000 USD, with a typical scope of $3,000–8,000 USD.
- Custom Build: from $15,000 USD, with a typical scope of $15,000–50,000+ USD.
- Managed & Ongoing: custom pricing.

Prices are starting points. Scope, availability, responsibilities and third-party costs are agreed before work begins.

Contact: [${site.contactEmail}](mailto:${site.contactEmail})`,
  },
  {
    path: "/services/ai-prototype-to-production/",
    title: "Take an AI-built dating app to production",
    description: "Assess identity, data, matching, messaging, payments, moderation and operations before taking an AI-built dating prototype to production.",
    body: `A polished prototype is not automatically production-ready. This service follows the product's highest-risk boundaries: identity and access, sensitive member data, connection flows, payment state, moderation, deployment, backups and operating costs.

The result may strengthen the current stack, replace one unsafe boundary or introduce selected pH7Builder capabilities. It is not a promise that every external application has a simple migration path.

Contact: [${site.contactEmail}](mailto:${site.contactEmail}?subject=AI%20dating%20prototype%20review)`,
  },
  {
    path: "/services/migration/",
    title: "Dating platform migration and modernisation",
    description: "Assess a dating-platform migration without gambling with member identity, private conversations or established business behaviour.",
    body: `Migration preflight inventories the current versions, schema, custom code, integrations and scheduled work. It maps member identity, profiles, messages, media, payments, consent and retention requirements before choosing a destination or cutover plan.

No universal migration button is promised. The source platform, data quality, custom behaviour and acceptable downtime determine the work.

Contact: [${site.contactEmail}](mailto:${site.contactEmail}?subject=Dating%20platform%20migration)`,
  },
  {
    path: "/services/custom-development/",
    title: "Custom pH7Builder development",
    description: `Work directly with pH7Builder creator ${site.author.name} to plan, build or modernise a dating, matchmaking or community product.`,
    body: `Custom work starts with the highest-risk product or technical decision. Useful context includes the audience, desired connection, existing installation or repository, immediate outcome, fixed deadline, compliance concern and third-party dependencies.

The delivery approach is to frame the outcome, inspect architecture and risks, implement small reviewable changes, validate important behaviour and leave the repository clear enough for the next developer or agent to continue.

Contact: [${site.contactEmail}](mailto:${site.contactEmail})`,
  },
];

const normalizePagePath = (pagePath: string): string => {
  const normalized = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  return normalized === "/" ? normalized : `${normalized.replace(/\/+$/, "")}/`;
};

export const markdownPathForPage = (pagePath: string): string | undefined => {
  const normalized = normalizePagePath(pagePath);
  const page = agentPages.find((item) => item.path === normalized);
  return page ? (normalized === "/" ? "/index.md" : `${normalized}index.md`) : undefined;
};
