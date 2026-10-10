import { Suspense } from "react";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { CatalogView } from "@/components/shop/catalog-view";
export default function ShopPage() { return <><Suspense fallback={<div className="h-[77px] bg-ink" />}><SiteHeader /></Suspense><main><CatalogView /></main><SiteFooter /></>; }
