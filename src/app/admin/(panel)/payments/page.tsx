import { PaymentsView } from "@/components/admin/payments-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Payments" };
export default function Page() { return <PaymentsView />; }
