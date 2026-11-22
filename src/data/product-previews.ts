export const productPreviews = [
  {
    id: "dating",
    tabLabel: "Social dating",
    productName: "Nomad Hearts",
    productMark: "NH",
    prompt: "Build a warm dating network for people living between cities, with travel plans, shared interests and privacy-first discovery.",
    features: ["Profiles", "Travel plans", "Discovery", "Messaging"],
    ctaLabel: "Explore Nomad Connections",
    href: "/blueprints/nomad-connections/",
  },
  {
    id: "community",
    tabLabel: "Social network",
    productName: "Common Ground",
    productMark: "CG",
    prompt: "Build a focused social network where local creatives can share work, join small groups and turn online conversations into real activities.",
    features: ["Activity feed", "Groups", "Events", "Member controls"],
    ctaLabel: "See the guided path",
    href: "/vibe-coders/",
  },
  {
    id: "matchmaking",
    tabLabel: "Matchmaking",
    productName: "Sincere",
    productMark: "SI",
    prompt: "Build a private matchmaking service with application-based membership, controlled visibility and carefully explained introductions.",
    features: ["Applications", "Private profiles", "Introductions", "Concierge notes"],
    ctaLabel: "Create this blueprint",
    href: "/build/",
  },
] as const;

export type ProductPreviewId = (typeof productPreviews)[number]["id"];
