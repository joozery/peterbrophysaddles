import { AboutView } from "@/components/admin/about-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "About page" };
export default function Page() { return <AboutView />; }
