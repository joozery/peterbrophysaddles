import { ProductsView } from "@/components/admin/products-view";
// Rendered on the client after sign-in (see AdminShell) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Products & stock" };
export default function Page() { return <ProductsView />; }
