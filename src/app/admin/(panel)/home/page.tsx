import { HomeView } from "@/components/admin/home-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Home page" };
export default function Page() { return <HomeView />; }
