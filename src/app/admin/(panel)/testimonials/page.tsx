import { TestimonialsView } from "@/components/admin/testimonials-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Testimonials" };
export default function Page() { return <TestimonialsView />; }
