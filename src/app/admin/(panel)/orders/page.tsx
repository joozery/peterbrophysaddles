import { OrdersView } from "@/components/admin/orders-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Orders" };
export default function Page() { return <OrdersView />; }
