import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type ContentPage, seedPages } from "@/lib/admin-types";
import { getPages } from "./admin-data";

export const PAGES_TAG = "content-pages";

/** Cached page titles/intros/images from Admin → Pages & content. Refreshed when an admin saves a page. */
export async function getContentPages(): Promise<Record<string, ContentPage>> {
  "use cache";
  cacheTag(PAGES_TAG);
  cacheLife("hours");
  try {
    return await getPages();
  } catch (err) {
    console.error("content pages: database unavailable, using defaults", err);
    cacheLife("seconds");
    return Object.fromEntries(seedPages().map(p => [p.slug, p]));
  }
}
