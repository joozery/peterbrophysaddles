/** Canonical public origin, used for canonical links, sitemap and structured data. Override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.peterbrophysaddlesandtrees.com.au").replace(/\/+$/, "");
export const absoluteUrl = (path: string) => /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${encodeURI(path)}`;
