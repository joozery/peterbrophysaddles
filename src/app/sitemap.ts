import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { getSiteProducts } from "@/lib/server/product-content";

const pages: [string, number][] = [
  ["", 1], ["/about", 0.8], ["/saddle-range", 0.9], ["/custom-saddles", 0.9], ["/saddle-trees", 0.9], ["/tack", 0.7], ["/leather-work", 0.6],
  ["/quality-materials", 0.6], ["/saddle-pricing", 0.7], ["/testimonials", 0.6], ["/contact", 0.8],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getSiteProducts();
  return [
    ...pages.map(([path, priority]) => ({ url: `${SITE_URL}${path}`, changeFrequency: "monthly" as const, priority })),
    ...products.map(p => ({ url: `${SITE_URL}/saddle-range/${p.id}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
