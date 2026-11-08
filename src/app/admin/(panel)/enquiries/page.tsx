import { EnquiriesView } from "@/components/admin/enquiries-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Enquiries" };
export default function Page() { return <EnquiriesView />; }
