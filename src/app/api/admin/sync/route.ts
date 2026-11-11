import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { fail, readJson, requireUser } from "@/lib/server/auth";
import { applyOps } from "@/lib/server/admin-data";
import { HOME_TAG } from "@/lib/server/home-content";
import { PAGES_TAG } from "@/lib/server/page-content";
import { ABOUT_TAG } from "@/lib/server/about-content";
import { PRICING_TAG } from "@/lib/server/pricing-content";
import { TESTIMONIALS_TAG } from "@/lib/server/testimonials-content";
import { PRODUCTS_TAG } from "@/lib/server/product-content";

// Applies a batch of create/update/delete changes from the admin UI, checked against the user's role.
export async function POST(request: Request) {
  const user = await requireUser(request);
  if (user instanceof Response) return user;
  const body = await readJson<{ ops?: unknown }>(request);
  try {
    const error = await applyOps(body?.ops, user.role);
    if (error) return fail(error.startsWith("Your role") ? 403 : 400, error);
    // Home page edits must show immediately, so expire the cached content now (no stale window).
    const ops = body?.ops as { singleton?: string; list?: string }[];
    if (ops.some(op => op?.singleton === "home")) revalidateTag(HOME_TAG, { expire: 0 });
    if (ops.some(op => op?.list === "pages")) revalidateTag(PAGES_TAG, { expire: 0 });
    if (ops.some(op => op?.singleton === "about")) revalidateTag(ABOUT_TAG, { expire: 0 });
    if (ops.some(op => op?.singleton === "pricing")) revalidateTag(PRICING_TAG, { expire: 0 });
    if (ops.some(op => op?.singleton === "testimonials")) revalidateTag(TESTIMONIALS_TAG, { expire: 0 });
    if (ops.some(op => op?.list === "products")) revalidateTag(PRODUCTS_TAG, { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (err) { console.error("sync", err); return fail(503, "Could not save to the database."); }
}
