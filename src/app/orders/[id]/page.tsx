import { Suspense } from "react";
import { ShopShell } from "@/components/shop/shop-shell";
import { OrderView } from "@/components/shop/commerce-views";
export default function Page({ params }: { params: Promise<{ id: string }> }) { return <ShopShell title="Order confirmation"><Suspense fallback={<p>Loading order…</p>}><OrderContent params={params} /></Suspense></ShopShell>; }
async function OrderContent({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <OrderView id={id} />; }
