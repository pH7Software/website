import type { APIRoute } from "astro";
import { site } from "../data/site";

export const GET: APIRoute = () => {
  const body = `# pH7Builder

> pH7Builder is the open-source, AI-ready foundation for independently owned dating apps, matchmaking services and online communities.

Canonical identity: pH7Builder is a self-hosted PHP application created by Pierre-Henry Soria. The latest published release is ${site.latestRelease}. Version ${site.upcomingRelease} is unreleased.

## Start
- [Homepage](${site.origin}/)
- [Get pH7Builder](${site.origin}/get-started/)
- [Source repository](${site.githubUrl})
- [Release changelog](${site.origin}/changelog/)

## Build with AI
- [pH7Builder for AI builders](${site.origin}/ai-builders/)
- [pH7Builder for vibe coders](${site.origin}/vibe-coders/)
- [Portable blueprint generator](${site.origin}/build/)
- [Nomad Connections example](${site.origin}/blueprints/nomad-connections/)

## Product guidance
- [What pH7Builder gives a dating product](${site.origin}/social-dating-features/)
- [Practical dating startup plan](${site.origin}/dating-startup-by-step/)
- [Dating product launch checklist](${site.origin}/tools/dating-site-launch-checklist/)

## Work with the creator
- [Custom development](${site.origin}/services/custom-development/)
- [About pH7Builder](${site.origin}/about/)

## Optional
- [Complete article archive](${site.origin}/articles/)
- [Privacy](${site.origin}/privacy/)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
