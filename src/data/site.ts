export const site = {
  name: "pH7Builder",
  origin: "https://ph7builder.com",
  description:
    "The open-source, AI-ready foundation for independently owned dating apps, matchmaking services and online communities.",
  githubUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS",
  docsUrl: "https://github.com/pH7Software/pH7-Social-Dating-CMS/tree/18.x/docs",
  licence: {
    name: "MIT",
    url: "https://github.com/pH7Software/pH7-Social-Dating-CMS/blob/18.x/LICENSE.md",
  },
  author: {
    name: "Pierre-Henry Soria",
    url: "https://github.com/pH-7",
    linkedinUrl: "https://www.linkedin.com/in/ph7enry/",
  },
  sponsorUrl: "https://github.com/sponsors/pH-7",
  contactEmail: "hello@ph7builder.com",
  latestRelease: "19.4.0",
  upcomingRelease: "20.0.0",
} as const;

export const primaryNavigation = [
  { label: "Build", href: "/build/" },
  { label: "AI builders", href: "/ai-builders/" },
  { label: "Get started", href: "/get-started/" },
  { label: "Articles", href: "/articles/" },
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
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Launch checklist", href: "/tools/dating-site-launch-checklist/" },
      { label: "Articles", href: "/articles/" },
      { label: "Changelog", href: "/changelog/" },
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
