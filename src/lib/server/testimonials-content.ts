import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type TestimonialsContent, defaultTestimonials } from "@/lib/admin-types";
import { getTestimonials } from "./admin-data";

export const TESTIMONIALS_TAG = "testimonials-content";

/** Cached Testimonials page content. Admin saves call revalidateTag(TESTIMONIALS_TAG). */
export async function getTestimonialsContent(): Promise<TestimonialsContent> {
  "use cache";
  cacheTag(TESTIMONIALS_TAG);
  cacheLife("hours");
  try {
    return await getTestimonials();
  } catch (err) {
    console.error("testimonials content: database unavailable, using defaults", err);
    cacheLife("seconds");
    return defaultTestimonials;
  }
}
