import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_BUSINESS_NAME, SOCIAL_LINKS, type Settings, defaultSettings } from "@/lib/admin-types";
import { getSettings } from "./admin-data";

export const SETTINGS_TAG = "site-settings";

export type SiteSettings = { brand: string; social: { key: string; label: string; url: string }[] };

/** Public bits of Admin → Settings (business name, social links). Cached; settings saves call revalidateTag(SETTINGS_TAG). */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");
  let s: Settings = defaultSettings;
  try { s = await getSettings(); }
  catch (err) { console.error("settings: database unavailable, using defaults", err); cacheLife("seconds"); }
  return {
    brand: s.businessName?.trim() || DEFAULT_BUSINESS_NAME,
    // Only links that point at the right site are shown (blank or invalid = hidden).
    social: SOCIAL_LINKS.map(({ key, label, host }) => ({ key, label, url: (s[key] ?? "").trim(), ok: host })).filter(l => l.ok.test(l.url)).map(({ key, label, url }) => ({ key, label, url })),
  };
}

/** Business name from Admin → Settings, used as the brand name across the public site. */
export async function getBrandName(): Promise<string> {
  return (await getSiteSettings()).brand;
}
