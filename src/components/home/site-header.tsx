import { getSiteProducts } from "@/lib/server/product-content";
import { getBrandName } from "@/lib/server/site-settings";
import { buildNavigation } from "./site-navigation";
import { SiteHeaderView } from "./site-header-view";

/** Site header with the Saddle Range / Saddle Trees menus built from Admin → Products (cached, refreshed on save). */
export async function SiteHeader() {
  const [products, brand] = await Promise.all([getSiteProducts(), getBrandName()]);
  return <SiteHeaderView navigation={buildNavigation(products)} brand={brand} />;
}
