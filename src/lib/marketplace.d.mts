export type VerificationStatus = "candidate" | "verified" | "retired";

export type MarketplaceConfig = {
  catalogUpdatedAt: string;
  checkout: {
    enabled: boolean;
    environment: "sandbox" | "production";
    apiOrigin: string;
  };
};

export type MarketplaceProduct = {
  id: string;
  name: string;
  category: string;
  summary: string;
  description: string[];
  outcomes: string[];
  version: string;
  releasedAt: string;
  updatedAt: string;
  compatibility: {
    pH7Builder: { min: string; maxExclusive: string };
    php: string;
  };
  dependencies: string[];
  contents: string[];
  installation: {
    target: string;
    steps: string[];
    uninstall: string;
  };
  pricing: {
    currency: "USD";
    minimum: number;
    suggested: number;
    options: number[];
  };
  licence: { name: string; url: string };
  support: { periodDays: number; policy: string };
  changelog: Array<{ version: string; date: string; items: string[] }>;
  package: {
    filename: string;
    artifactKey: string;
    sha256: string;
    sizeBytes: number;
  };
  verification: {
    status: VerificationStatus;
    verifiedAt: string | null;
    checks: string[];
  };
  purchasable: boolean;
};

export function parseUsdCents(value: string | number): number | null;
export function normalizeUsdAmount(value: string | number): string | null;
export function formatUsd(value: string | number): string;
export function validateMarketplaceConfig(config: unknown): Readonly<MarketplaceConfig>;
export function validateProductManifest(product: unknown): Readonly<MarketplaceProduct>;
export function validateProductCatalog(products: unknown[]): ReadonlyArray<Readonly<MarketplaceProduct>>;
export function isContributionAllowed(
  product: MarketplaceProduct,
  amount: string | number,
  currency?: string,
): boolean;
