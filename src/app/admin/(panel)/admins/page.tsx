import { AdminsView } from "@/components/admin/admins-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Admin users" };
export default function Page() { return <AdminsView />; }
