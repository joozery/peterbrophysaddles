import { DashboardView } from "@/components/admin/dashboard-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export default function Page() { return <DashboardView />; }
