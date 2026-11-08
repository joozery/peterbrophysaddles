import { PromotionsView } from "@/components/admin/promotions-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Promotions" };
export default function Page() { return <PromotionsView />; }
