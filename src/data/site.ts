export const site = {
  name: "pH7Builder",
  formerName: "pH7CMS",
  origin: "https://ph7builder.com",
  description:
    "Open-source, self-hosted PHP software for building white-label dating websites, matchmaking platforms, social networks and online communities.",
  githubUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS",
  githubOrganizationUrl: "https://github.com/pH7Software",
  documentationUrl: "https://ph7builder.com/doc/",
  docsUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS/tree/20.x/docs",
  licence: {
    name: "MIT",
    url: "https://github.com/pH7Software/pH7-Social-Dating-CMS/blob/20.x/LICENSE.md",
  },
  author: {
    name: "Pierre-Henry Soria",
    url: "https://github.com/pH-7",
    linkedinUrl: "https://www.linkedin.com/in/ph7enry/",
  },
  sponsorUrl: "https://github.com/sponsors/pH-7",
  contactEmail: "hello@ph7builder.com",
  latestRelease: "20.0.0",
  latestReleaseDate: "25 November 2026",
  latestReleaseUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS/releases/tag/v20.0.0",
  latestReleaseRequirements: "PHP 8.3 through 8.5, MySQL 8.0 or newer, HTTPS, URL rewriting, and Apache or nginx",
} as const;

export const primaryNavigation = [
  { label: "Build", href: "/build/" },
  { label: "AI builders", href: "/ai-builders/" },
  { label: "Marketplace", href: "/marketplace/" },
  { label: "Services", href: "/services/" },
  { label: "Get started", href: "/get-started/" },
  { label: "Changelog", href: "/changelog/" },
] as const;

export const footerNavigation = [
  {
    title: "Build",
    links: [
      { label: "Create a blueprint", href: "/build/" },
      { label: "For AI builders", href: "/ai-builders/" },
      { label: "For vibe coders", href: "/vibe-coders/" },
      { label: "Nomad Connections", href: "/blueprints/nomad-connections/" },
      { label: "Official marketplace", href: "/marketplace/" },
      { label: "Services and pricing", href: "/services/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Launch checklist", href: "/tools/dating-site-launch-checklist/" },
      { label: "Articles", href: "/articles/" },
      { label: "Changelog", href: "/changelog/" },
      { label: "Marketplace support", href: "/marketplace/support/" },
      { label: "Documentation", href: site.docsUrl, external: true },
    ],
  },
  {
    title: "pH7Builder",
    links: [
      { label: "Get pH7Builder", href: "/get-started/" },
      { label: "About", href: "/about/" },
      { label: "GitHub", href: site.githubUrl, external: true },
      { label: "Privacy", href: "/privacy/" },
    ],
  },
] as const;
