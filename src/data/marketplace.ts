import marketplaceConfig from "../../marketplace/config.json";
import { productManifests } from "../../marketplace/catalog/index.mjs";
import { validateMarketplaceConfig, validateProductCatalog } from "../lib/marketplace.mjs";
import type { MarketplaceProduct as MarketplaceProductManifest } from "../lib/marketplace.mjs";

export const marketplace = validateMarketplaceConfig(marketplaceConfig);
export const marketplaceProducts = Object.freeze(
  [...validateProductCatalog(productManifests)]
    .sort((first, second) => first.name.localeCompare(second.name)),
);
export const marketplaceProductById = new Map(
  marketplaceProducts.map((product) => [product.id, product]),
);

export type MarketplaceProduct = MarketplaceProductManifest;
