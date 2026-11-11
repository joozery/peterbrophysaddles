import { QuoteEditor } from "@/components/admin/quote-editor";
// Rendered on the client after sign-in (see AdminShell, already inside <Suspense>) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Quotation" };
export default function Page() { return <QuoteEditor />; }
