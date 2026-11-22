export type ServiceOffer = {
  id: "self-build" | "launch" | "custom-build" | "managed";
  name: string;
  price: string;
  range?: string;
  description: string;
  includes: readonly string[];
  cta: string;
  href: string;
  featured?: boolean;
};

export const serviceOffers: readonly ServiceOffer[] = [
  {
    id: "self-build",
    name: "Build It Yourself",
    price: "Free",
    description: "For founders and developers who want to build with their own coding agent and keep the whole application under their control.",
    includes: [
      "Open-source pH7Builder",
      "Personalised execution prompt",
      "Portable product blueprint",
      "Documentation and self-hosting",
    ],
    cta: "Build with AI",
    href: "/build/",
  },
  {
    id: "launch",
    name: "Launch",
    price: "From $3,000 USD",
    range: "Typical scope: $3,000–8,000 USD",
    description: "For a focused first release that needs experienced help with setup, branding, configuration and production preparation.",
    includes: [
      "Installation and configuration",
      "Brand and theme customisation",
      "Hosting and deployment preparation",
      "Launch checklist and handover",
    ],
    cta: "Discuss your launch",
    href: "mailto:hello@ph7builder.com?subject=pH7Builder%20launch%20project",
  },
  {
    id: "custom-build",
    name: "Custom Build",
    price: "From $15,000 USD",
    range: "Typical scope: $15,000–50,000+ USD",
    description: "For a differentiated dating or matchmaking product with unique workflows, integrations or business rules.",
    includes: [
      "Custom product functionality",
      "Matching and discovery improvements",
      "Integrations and production engineering",
      "Web or mobile delivery where agreed",
    ],
    cta: "Discuss your project",
    href: "/services/custom-development/",
    featured: true,
  },
  {
    id: "managed",
    name: "Managed & Ongoing",
    price: "Custom pricing",
    description: "For established products that need a clearly bounded ongoing engineering and maintenance arrangement.",
    includes: [
      "Planned software updates",
      "Monitoring and performance work",
      "Ongoing product development",
      "Support or managed hosting where agreed",
    ],
    cta: "Discuss ongoing support",
    href: "mailto:hello@ph7builder.com?subject=pH7Builder%20ongoing%20support",
  },
] as const;
