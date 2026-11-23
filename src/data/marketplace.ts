import marketplaceConfig from "../../marketplace/config.json";
import communityEventsMini from "../../marketplace/catalog/community-events-mini.json";
import { validateMarketplaceConfig, validateProductCatalog } from "../lib/marketplace.mjs";
import type { MarketplaceProduct as MarketplaceProductManifest } from "../lib/marketplace.mjs";

export const marketplace = validateMarketplaceConfig(marketplaceConfig);
export const marketplaceProducts = validateProductCatalog([communityEventsMini]);
export const marketplaceProductById = new Map(
  marketplaceProducts.map((product) => [product.id, product]),
);

export type MarketplaceProduct = MarketplaceProductManifest;
