import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type HomeContent, defaultHome } from "@/lib/admin-types";
import { getHome } from "./admin-data";

export const HOME_TAG = "home-content";

/** Cached home page content. Admin saves call revalidateTag(HOME_TAG) so changes show straight away. */
export async function getHomeContent(): Promise<HomeContent> {
  "use cache";
  cacheTag(HOME_TAG);
  cacheLife("hours");
  try {
    return await getHome();
  } catch (err) {
    // Never break the home page: fall back to the built-in content and retry soon.
    console.error("home content: database unavailable, using defaults", err);
    cacheLife("seconds");
    return defaultHome;
  }
}
