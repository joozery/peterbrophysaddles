import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type AboutContent, defaultAbout } from "@/lib/admin-types";
import { getAbout } from "./admin-data";

export const ABOUT_TAG = "about-content";

/** Cached About page content. Admin saves call revalidateTag(ABOUT_TAG) so changes show straight away. */
export async function getAboutContent(): Promise<AboutContent> {
  "use cache";
  cacheTag(ABOUT_TAG);
  cacheLife("hours");
  try {
    return await getAbout();
  } catch (err) {
    console.error("about content: database unavailable, using defaults", err);
    cacheLife("seconds");
    return defaultAbout;
  }
}
