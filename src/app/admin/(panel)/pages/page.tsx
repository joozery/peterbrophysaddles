import { PagesView } from "@/components/admin/pages-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Pages & content" };
export default function Page() { return <PagesView />; }
