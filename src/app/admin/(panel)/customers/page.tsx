import { CustomersView } from "@/components/admin/customers-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Customers" };
export default function Page() { return <CustomersView />; }
