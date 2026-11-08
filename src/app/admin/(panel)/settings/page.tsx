import { SettingsView } from "@/components/admin/settings-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Settings" };
export default function Page() { return <SettingsView />; }
