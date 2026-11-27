import communityEventsMini from "./community-events-mini.json" with { type: "json" };

// Keep this registry as the single reviewed entry point for both the public
// catalogue and the payment Worker. Adding a manifest here makes it visible to
// both without duplicating product imports across two runtimes.
export const productManifests = Object.freeze([
  communityEventsMini,
]);
