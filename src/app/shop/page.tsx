import { Suspense } from "react";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { CatalogView } from "@/components/shop/catalog-view";
import { getSiteProducts } from "@/lib/server/product-content";
async function Catalog() { return <CatalogView products={await getSiteProducts()} />; }
export default function ShopPage() { return <><Suspense fallback={<div className="h-[77px] bg-ink" />}><SiteHeader /></Suspense><main><Suspense fallback={<div className="section-shell py-16" role="status">Loading saddles…</div>}><Catalog /></Suspense></main><SiteFooter /></>; }
