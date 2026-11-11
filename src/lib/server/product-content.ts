import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type Product, categoryOf, products as catalog } from "@/lib/catalog";
import { type AdminProduct, sortProducts } from "@/lib/admin-types";
import { getProducts } from "./admin-data";

export const PRODUCTS_TAG = "products";

/** Seeded products point at the small /images/<key>.webp photos; the site shows the larger saddle photos for those. */
const builtIn = (image: string) => /^\/images\/([a-z]+)\.webp$/.exec(image)?.[1];

function toProduct(p: AdminProduct): Product {
  const key = builtIn(p.image) ?? catalog.find(c => c.id === p.id)?.image ?? "";
  const known = catalog.some(c => c.image === key);
  return {
    id: p.id, name: p.name, price: p.price, stock: p.stock, custom: p.custom, category: categoryOf(p),
    image: known ? key : "", photo: known && (!p.image || builtIn(p.image)) ? undefined : p.image || undefined,
    gallery: (p.gallery ?? []).filter(Boolean),
    description: p.description?.trim() || undefined,
    specs: (p.specs ?? []).filter(s => s.label?.trim() && s.value?.trim()),
  };
}

/** Visible products from Admin → Products & stock, cached. Admin saves call revalidateTag(PRODUCTS_TAG). */
export async function getSiteProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");
  try {
    return sortProducts((await getProducts()).filter(p => p.active)).map(toProduct);
  } catch (err) {
    console.error("products: database unavailable, using built-in catalogue", err);
    cacheLife("seconds");
    return catalog;
  }
}
