import { QuotesView } from "@/components/admin/quotes-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Quotations" };
export default function Page() { return <QuotesView />; }
