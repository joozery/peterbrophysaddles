import { Suspense } from "react";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { CatalogView } from "@/components/shop/catalog-view";
import { getSiteProducts } from "@/lib/server/product-content";
import { getBrandName } from "@/lib/server/site-settings";
async function Catalog() { const [products, brand] = await Promise.all([getSiteProducts(), getBrandName()]); return <CatalogView products={products} brand={brand} />; }
export default function ShopPage() { return <><Suspense fallback={<div className="h-[77px] bg-ink" />}><SiteHeader /></Suspense><main><Suspense fallback={<div className="section-shell py-16" role="status">Loading saddles…</div>}><Catalog /></Suspense></main><SiteFooter /></>; }
