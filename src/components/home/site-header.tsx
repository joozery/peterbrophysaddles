import { getSiteProducts } from "@/lib/server/product-content";
import { buildNavigation } from "./site-navigation";
import { SiteHeaderView } from "./site-header-view";

/** Site header with the Saddle Range / Saddle Trees menus built from Admin → Products (cached, refreshed on save). */
export async function SiteHeader() {
  return <SiteHeaderView navigation={buildNavigation(await getSiteProducts())} />;
}
