export const productTypes = [
  { value: "niche-dating", label: "Niche dating app" },
  { value: "matchmaking", label: "Private matchmaking service" },
  { value: "community", label: "Social community" },
] as const;

export const milestones = [
  { value: "validate", label: "Validate the idea" },
  { value: "build", label: "Build the first version" },
  { value: "launch", label: "Prepare to launch" },
] as const;

export type ProductType = (typeof productTypes)[number]["value"];
export type Milestone = (typeof milestones)[number]["value"];

export type ChecklistItem = {
  id: string;
  phase: "positioning" | "market" | "product" | "trust" | "operations" | "launch";
  title: string;
  detail: string;
  products: ProductType[];
  milestones: Milestone[];
};

const allProducts: ProductType[] = ["niche-dating", "matchmaking", "community"];
const allMilestones: Milestone[] = ["validate", "build", "launch"];
const buildAndLaunch: Milestone[] = ["build", "launch"];

export const launchChecklist: ChecklistItem[] = [
  { id: "member-promise", phase: "positioning", title: "Write the one-sentence member promise", detail: "Name who should meet, why the connection matters and what makes the experience focused.", products: allProducts, milestones: allMilestones },
  { id: "first-market", phase: "positioning", title: "Choose one first market with a realistic path to density", detail: "Prefer a city, profession, interest or existing community you can actually reach.", products: allProducts, milestones: allMilestones },
  { id: "not-for", phase: "positioning", title: "State who the first version is not for", detail: "A narrow boundary prevents the product and launch message from becoming generic.", products: allProducts, milestones: allMilestones },
  { id: "success-behaviour", phase: "positioning", title: "Define the member behaviour that signals real value", detail: "Use a meaningful outcome such as a qualified introduction or safe conversation, not only registrations.", products: allProducts, milestones: allMilestones },
  { id: "competitor-interviews", phase: "market", title: "Interview people currently using the nearest alternative", detail: "Ask about the last real experience, workaround and frustration instead of pitching the idea.", products: allProducts, milestones: allMilestones },
  { id: "acquisition-path", phase: "market", title: "Identify the first repeatable member acquisition path", detail: "Document where the first 100 relevant people already spend attention.", products: allProducts, milestones: allMilestones },
  { id: "empty-marketplace", phase: "market", title: "Plan how the product avoids an empty marketplace", detail: "Decide whether to launch by invitation, geography, cohort or a concierge introduction process.", products: allProducts, milestones: allMilestones },
  { id: "pricing-hypothesis", phase: "market", title: "Write a pricing hypothesis before building payment flows", detail: "Name who pays, for what outcome, how often and which costs grow with usage.", products: allProducts, milestones: allMilestones },
  { id: "matchmaker-capacity", phase: "market", title: "Set a realistic introduction capacity per matchmaker", detail: "Include research, member communication, scheduling and follow-up time.", products: ["matchmaking"], milestones: allMilestones },
  { id: "profile-contract", phase: "product", title: "Choose only profile fields that improve a decision", detail: "Every question creates completion effort and sensitive data that must be protected.", products: allProducts, milestones: buildAndLaunch },
  { id: "discovery-rules", phase: "product", title: "Define discovery and matching rules in plain language", detail: "Explain eligibility, hard filters, preferences and what happens when the pool is small.", products: allProducts, milestones: buildAndLaunch },
  { id: "first-session", phase: "product", title: "Design the first useful member session", detail: "A new member should understand the promise, complete the right profile and see a credible next step.", products: allProducts, milestones: buildAndLaunch },
  { id: "critical-journeys", phase: "product", title: "Write acceptance checks for the critical member journeys", detail: "Cover signup, login, profile completion, discovery, connection, messaging, reporting and account deletion.", products: allProducts, milestones: buildAndLaunch },
  { id: "mobile-keyboard", phase: "product", title: "Verify narrow mobile layouts and keyboard operation", detail: "Test the real interactions rather than checking whether implementation strings exist.", products: allProducts, milestones: buildAndLaunch },
  { id: "notification-policy", phase: "product", title: "Decide which events deserve an email or notification", detail: "Avoid training members to ignore messages through noisy or duplicate alerts.", products: allProducts, milestones: buildAndLaunch },
  { id: "community-participation", phase: "product", title: "Define how a new member joins a useful conversation", detail: "Seed topics and participation rituals without pretending an empty forum is already a community.", products: ["community"], milestones: buildAndLaunch },
  { id: "minimum-age", phase: "trust", title: "Set the minimum age and eligibility rules", detail: "Make them visible during signup and consistent with the launch market.", products: allProducts, milestones: allMilestones },
  { id: "location-privacy", phase: "trust", title: "Choose the least precise location the product actually needs", detail: "Exact location should not be exposed simply because it is available.", products: ["niche-dating", "community"], milestones: buildAndLaunch },
  { id: "visibility-defaults", phase: "trust", title: "Review profile visibility defaults", detail: "Sensitive fields should be private unless visibility is required and clearly understood.", products: allProducts, milestones: buildAndLaunch },
  { id: "report-block", phase: "trust", title: "Make reporting and blocking easy to find", detail: "Verify ownership, authorization and the full moderator follow-up path.", products: allProducts, milestones: buildAndLaunch },
  { id: "moderation-policy", phase: "trust", title: "Write the moderation policy before the first report", detail: "Define response priority, evidence handling, escalation and account action.", products: allProducts, milestones: buildAndLaunch },
  { id: "deletion-export", phase: "trust", title: "Test account deletion and data handling", detail: "Document what is deleted, retained or anonymised, and why.", products: allProducts, milestones: ["launch"] },
  { id: "legal-review", phase: "trust", title: "Get market-specific legal and privacy advice", detail: "Software defaults are not a substitute for advice about the countries and business model involved.", products: allProducts, milestones: ["launch"] },
  { id: "admin-owner", phase: "operations", title: "Name the owner for member support and abuse reports", detail: "A monitored inbox and response expectation are more useful than an unowned contact form.", products: allProducts, milestones: ["launch"] },
  { id: "service-inventory", phase: "operations", title: "List every external service and its failure mode", detail: "Include email, payments, storage, maps, SMS, analytics and any AI API.", products: allProducts, milestones: buildAndLaunch },
  { id: "unit-economics", phase: "operations", title: "Estimate the variable cost per active and paying member", detail: "Model email, storage, SMS, payment, moderation and AI usage at realistic volume.", products: allProducts, milestones: allMilestones },
  { id: "backups", phase: "operations", title: "Create backups and prove a restore", detail: "A green backup job is not evidence until a recent copy can be restored safely.", products: allProducts, milestones: ["launch"] },
  { id: "secrets", phase: "operations", title: "Keep production credentials out of the repository", detail: "Use environment-specific secrets and retain public-repository scanning before every release.", products: allProducts, milestones: buildAndLaunch },
  { id: "upgrade-boundary", phase: "operations", title: "Record which areas are custom and which come from upstream", detail: "Small commits and a product blueprint make future pH7Builder upgrades safer.", products: allProducts, milestones: buildAndLaunch },
  { id: "domain-email", phase: "launch", title: "Verify domain, TLS and transactional email authentication", detail: "Check DNS, SPF, DKIM and DMARC in the live provider rather than assuming propagation.", products: allProducts, milestones: ["launch"] },
  { id: "production-config", phase: "launch", title: "Review production configuration against the official guide", detail: "Keep debug output, writable paths, scheduled work and web-server rules appropriate for production.", products: allProducts, milestones: ["launch"] },
  { id: "security-check", phase: "launch", title: "Run dependency, secret and application security checks", detail: "Separate confirmed findings from hypotheses and fix issues at the right boundary.", products: allProducts, milestones: ["launch"] },
  { id: "performance-budget", phase: "launch", title: "Set a performance budget for the main public and member pages", detail: "Measure real production assets, database work and third-party requests on mobile conditions.", products: allProducts, milestones: ["launch"] },
  { id: "browser-smoke", phase: "launch", title: "Run a browser smoke test against the deployed environment", detail: "Cover signup, login, recovery, profile, discovery, messaging, report and admin response.", products: allProducts, milestones: ["launch"] },
  { id: "launch-cohort", phase: "launch", title: "Invite a small, relevant launch cohort", detail: "Observe where members stop, which matches feel credible and which trust questions appear.", products: allProducts, milestones: ["launch"] },
  { id: "support-loop", phase: "launch", title: "Create a weekly evidence review", detail: "Review activation, qualified connections, reports, cancellations, support themes and acquisition quality.", products: allProducts, milestones: ["launch"] },
];

export const visibleChecklistItems = (product: ProductType, milestone: Milestone): ChecklistItem[] =>
  launchChecklist.filter((item) => item.products.includes(product) && item.milestones.includes(milestone));

export const checklistProgress = (items: ChecklistItem[], completedIds: Iterable<string>) => {
  const completed = new Set(completedIds);
  const completedCount = items.filter((item) => completed.has(item.id)).length;
  return {
    completed: completedCount,
    total: items.length,
    percentage: items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100),
  };
};
