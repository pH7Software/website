import { productManifests } from "../../marketplace/catalog/index.mjs";
import { validateProductCatalog } from "../../src/lib/marketplace.mjs";

export const productCatalog = validateProductCatalog(productManifests);
export const productsById = new Map(productCatalog.map((product) => [product.id, product]));
