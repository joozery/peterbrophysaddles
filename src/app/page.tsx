import { SiteHeader } from "@/components/home/site-header";
import { Hero } from "@/components/home/hero";
import { Heritage } from "@/components/home/heritage";
import { SaddleCollection } from "@/components/home/saddle-collection";
import { CustomSaddles } from "@/components/home/custom-saddles";
import { Services } from "@/components/home/services";
import { Testimonials } from "@/components/home/testimonials";
import { Contact } from "@/components/home/contact";
import { SiteFooter } from "@/components/home/site-footer";
import { PromotionModal } from "@/components/home/promotion-modal";
import { getHomeContent } from "@/lib/server/home-content";
import { getSiteProducts } from "@/lib/server/product-content";
import { getBrandName } from "@/lib/server/site-settings";

// Text and images come from Admin → Home page (MongoDB), cached and refreshed on save.
export default async function Home() {
  const [home, products, brand] = await Promise.all([getHomeContent(), getSiteProducts(), getBrandName()]);
  return <><a href="#main" className="skip-link">Skip to content</a><SiteHeader /><main id="main"><Hero content={home.hero} /><Heritage content={home.heritage} brand={brand} /><SaddleCollection content={home.collection} products={products} /><CustomSaddles content={home.custom} /><Services content={home.services} /><Testimonials content={home.testimonial} /><Contact content={home.contact} brand={brand} /></main><SiteFooter /><PromotionModal /></>;
}
