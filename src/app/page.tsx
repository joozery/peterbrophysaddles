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

export default function Home() {
  return <><a href="#main" className="skip-link">Skip to content</a><SiteHeader /><main id="main"><Hero /><Heritage /><SaddleCollection /><CustomSaddles /><Services /><Testimonials /><Contact /></main><SiteFooter /><PromotionModal /></>;
}
