import { PricingView } from "@/components/admin/pricing-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Pricing page" };
export default function Page() { return <PricingView />; }
