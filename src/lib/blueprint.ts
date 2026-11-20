export const availableFeatures = [
  "Profiles",
  "Discovery",
  "Matchmaking",
  "Messaging",
  "Memberships",
  "Moderation",
  "Events",
  "Forums",
] as const;

export type BlueprintFeature = (typeof availableFeatures)[number];

export type BlueprintInput = {
  productName: string;
  idea: string;
  audience: string;
  launchMarket: string;
  businessModel: string;
  differentiation: string;
  safetyRequirement: string;
  privacyRequirement: string;
  mustHave: string;
  features: BlueprintFeature[];
};

export const defaultBlueprintInput: BlueprintInput = {
  productName: "My Dating Product",
  idea: "A focused dating experience for a clearly defined community.",
  audience: "Adults aged 18 and over",
  launchMarket: "One focused community or location",
  businessModel: "Freemium membership",
  differentiation: "A member experience designed around a specific shared context.",
  safetyRequirement: "Members can report and block another account.",
  privacyRequirement: "Sensitive profile information is private by default.",
  mustHave: "Members can create a profile, discover compatible people and communicate safely.",
  features: ["Profiles", "Discovery", "Matchmaking", "Messaging", "Memberships", "Moderation"],
};

export const nomadBlueprintInput: BlueprintInput = {
  productName: "Nomad Connections",
  idea: "A dating product for people who enjoy travelling and living abroad.",
  audience: "Adult travellers and expats",
  launchMarket: "Digital nomads in one launch city",
  businessModel: "Freemium membership",
  differentiation: "Destination-aware discovery based on travel plans, languages and lifestyle.",
  safetyRequirement: "Members can report and block another account, and moderators can review abuse reports.",
  privacyRequirement: "Exact location and travel dates are private by default.",
  mustHave: "Members can discover compatible people who expect to be in the same city at the same time.",
  features: ["Profiles", "Discovery", "Matchmaking", "Messaging", "Memberships", "Moderation"],
};

const clean = (value: string): string => value
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const yamlString = (value: string): string => JSON.stringify(clean(value));

export const slugifyProductName = (value: string): string => {
  const slug = clean(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return slug || "ph7builder-product";
};

const normalizedInput = (input: BlueprintInput): BlueprintInput => {
  const selectedFeatures = new Set(input.features);
  return {
    productName: clean(input.productName) || defaultBlueprintInput.productName,
    idea: clean(input.idea) || defaultBlueprintInput.idea,
    audience: clean(input.audience) || defaultBlueprintInput.audience,
    launchMarket: clean(input.launchMarket) || defaultBlueprintInput.launchMarket,
    businessModel: clean(input.businessModel) || defaultBlueprintInput.businessModel,
    differentiation: clean(input.differentiation) || defaultBlueprintInput.differentiation,
    safetyRequirement: clean(input.safetyRequirement) || defaultBlueprintInput.safetyRequirement,
    privacyRequirement: clean(input.privacyRequirement) || defaultBlueprintInput.privacyRequirement,
    mustHave: clean(input.mustHave) || defaultBlueprintInput.mustHave,
    features: availableFeatures.filter((feature) => selectedFeatures.has(feature)),
  };
};

export const generateBlueprintYaml = (input: BlueprintInput): string => {
  const data = normalizedInput(input);
  const featureLines = data.features.length > 0
    ? data.features.map((feature) => `    ${feature.toLowerCase()}: enabled`).join("\n")
    : "    profiles: enabled";

  return `# pH7Builder portable product blueprint
# This file records product intent. An implementation agent must map it to the real codebase.
schema_version: 1

product:
  name: ${yamlString(data.productName)}
  purpose: ${yamlString(data.idea)}
  audience: ${yamlString(data.audience)}
  launch_market: ${yamlString(data.launchMarket)}
  business_model: ${yamlString(data.businessModel)}

foundation:
  package: "ph7software/ph7builder"
  published_version: "19.4.0"
  repository: "https://github.com/pH7Software/pH7-Social-Dating-CMS"

experience:
  differentiation: ${yamlString(data.differentiation)}
  features:
${featureLines}

safety:
  requirement: ${yamlString(data.safetyRequirement)}

privacy:
  requirement: ${yamlString(data.privacyRequirement)}

acceptance_requirements:
  - ${yamlString(data.mustHave)}
  - "Critical member journeys work by keyboard and on a narrow mobile viewport."
  - "State-changing actions preserve authorization and CSRF protection."
  - "Custom behaviour has outcome-focused regression coverage."

implementation_notes:
  - "Inspect the current pH7Builder implementation before choosing extension points."
  - "Do not assume blueprint keys already exist as configuration settings."
  - "Keep customer-specific work separate from upstream core where a clean extension point exists."
  - "Record material product decisions and verify the production build before deployment."
`;
};

export const generateStarterPrompt = (input: BlueprintInput): string => {
  const data = normalizedInput(input);
  const featureList = data.features.length > 0 ? data.features.join(", ") : "Profiles";

  return `Build ${data.productName} on the pH7Builder open-source foundation.

Product idea
${data.idea}

Audience and launch
- Audience: ${data.audience}
- Initial market: ${data.launchMarket}
- Business model: ${data.businessModel}

What makes it different
${data.differentiation}

Foundation areas to evaluate
${featureList}

Non-negotiable requirements
- Safety: ${data.safetyRequirement}
- Privacy: ${data.privacyRequirement}
- Core outcome: ${data.mustHave}

Working instructions
1. Install or inspect ph7software/ph7builder and read its AGENTS.md, CONTRIBUTING.md and nearby conventions before changing code.
2. Treat the accompanying blueprint as product intent, not as proof that its keys already map to pH7Builder settings.
3. First map each requirement to existing functionality. Reuse working profiles, discovery, matchmaking, messaging, memberships and moderation where applicable.
4. Propose the smallest maintainable extension for the missing behaviour. Prefer documented module and extension boundaries over customer-specific edits in core.
5. Preserve authorization, CSRF, output encoding, prepared SQL and resource ownership checks.
6. Add outcome-focused regression tests for new business behaviour. Use browser tests for real interaction flows instead of checking source-code strings.
7. Run focused checks first, then the repository's deterministic suite, static analysis and public-repository hygiene checks.
8. Keep commits small and explain the reason for each change. Update the blueprint when implementation decisions change the product contract.

Begin by returning a short implementation map: what pH7Builder already provides, what needs custom work, the highest-risk assumptions and the tests that will prove the result. Do not generate code until that map is grounded in the repository.
`;
};
