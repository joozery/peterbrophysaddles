import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type PricingContent, defaultPricing } from "@/lib/admin-types";
import { getPricing } from "./admin-data";

export const PRICING_TAG = "pricing-content";

/** Cached Saddle Pricing content. Admin saves call revalidateTag(PRICING_TAG). */
export async function getPricingContent(): Promise<PricingContent> {
  "use cache";
  cacheTag(PRICING_TAG);
  cacheLife("hours");
  try {
    return await getPricing();
  } catch (err) {
    console.error("pricing content: database unavailable, using defaults", err);
    cacheLife("seconds");
    return defaultPricing;
  }
}
