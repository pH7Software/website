import communityEventsMini from "../../marketplace/catalog/community-events-mini.json" with { type: "json" };
import { validateProductCatalog } from "../../src/lib/marketplace.mjs";

export const productCatalog = validateProductCatalog([communityEventsMini]);
export const productsById = new Map(productCatalog.map((product) => [product.id, product]));
