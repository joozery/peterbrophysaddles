import { products } from "@/lib/catalog";
import { SaddleDetail } from "@/components/saddles/saddle-detail";
import { ContactPageContent } from "@/components/contact/contact-page";
import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { Heritage } from "@/components/home/heritage";
import { SaddleCollection } from "@/components/home/saddle-collection";
import { CustomSaddles } from "@/components/home/custom-saddles";
import { Testimonials } from "@/components/home/testimonials";
import { Contact } from "@/components/home/contact";
import { ButtonLink } from "@/components/ui/button-link";

const pages: Record<string, { title: string; description: string; image?: string }> = {
  "about": { title: "About Peter Brophy", description: "Traditional craftsmanship. Modern performance. Australian-made saddles and leatherwork, crafted with experience, precision and a deep understanding of horse and rider." },
  "saddle-range": { title: "Saddle Range", description: "Saddles for every discipline. Explore our range and discuss the right saddle for you and your horse." },
  "custom-saddles": { title: "Custom Saddles", description: "Built around you and your horse. Discuss fit, style, materials and the finer details of your custom saddle." },
  "contact": { title: "Contact Us", description: "Let’s create something special. Prepare an enquiry about your horse, riding discipline and saddle requirements." },
  "saddle-pricing": { title: "Saddle Pricing", description: "Enquire about pricing for your chosen saddle, materials and custom details. Published prices are not available yet." },
  "saddle-trees": { title: "Saddle Trees", description: "The foundation of a great saddle. Discuss tree selection and fit options for your horse.", image: "/asset/Saddletrees.png" },
  "tack": { title: "Tack", description: "Premium tack and leatherwork to complement your saddle, from headstalls to breastplates.", image: "/asset/Tackleatherwork.png" },
  "leather-work": { title: "Leather work", description: "Carefully crafted leatherwork with attention to materials, strength and the finer details.", image: "/asset/Tackleatherwork.png" },
  "quality-materials": { title: "Quality Materials", description: "Carefully selected leathers and hardware for strength, beauty and long-lasting performance.", image: "/asset/Qualitymaterials.png" },
  "testimonials": { title: "Testimonials", description: "Experience Peter Brophy Saddles through the words of our riders." },
};
const saddleTypes = [["wade", "Wade"], ["campdraft", "Campdraft"], ["stock", "Stock"], ["reining", "Reining"], ["cutting", "Cutting"], ["western", "Custom Western"], ["vaquero", "Old Timer/Vaquero"]];
const saddleSlugs = ["wade-saddles", "campdraft-saddles", "stock-saddles", "reining-saddles", "cutting-saddles", "custom-western-saddles", "old-timer-vaquero-saddles"];
saddleTypes.forEach(([image, label], index) => {
  pages[`saddle-range/${saddleSlugs[index]}`] = { title: `${label} Saddles`, description: `Explore ${label.toLowerCase()} saddles from Peter Brophy Saddles. Discuss your riding needs, fit and preferred details with us.`, image: `/images/saddles/${image}-v2.png` };
});

type Props = { params: Promise<{ slug: string[] }> };
export function generateStaticParams() { return Object.keys(pages).map(path => ({ slug: path.split("/") })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug.join("/")];
  return page ? { title: `${page.title} | Peter Brophy Saddles`, description: page.description } : {};
}
function PagePlaceholder() {
  return <div className="section-shell py-16" role="status" aria-label="Loading page"><div className="h-3 w-40 rounded bg-stone-300/50" /><div className="mt-6 h-12 w-3/4 rounded bg-stone-300/50" /><div className="mt-6 h-4 max-w-xl rounded bg-stone-300/50" /><div className="mt-3 h-4 max-w-md rounded bg-stone-300/50" /><span className="sr-only">Loading page…</span></div>;
}

export default function ContentPage({ params }: Props) {
  return <><Suspense fallback={<div className="h-[77px] bg-ink" />}><SiteHeader /></Suspense><main><Suspense fallback={<PagePlaceholder />}><PageContent params={params} /></Suspense></main><SiteFooter /></>;
}

async function PageContent({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const page = pages[path];
  if (!page) notFound();
  if (path === "contact") return <ContactPageContent />;
  if (path.startsWith("saddle-range/")) {
    const product = products.find(product => product.id === slug[1]);
    if (!product) notFound();
    return <SaddleDetail product={product} />;
  }
  return <>
    <section className="section-shell py-12 sm:py-16"><nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap gap-3 text-xs text-stone-500"><Link href="/">Home</Link><span aria-hidden="true">/</span>{path.startsWith("saddle-range/") && <><Link href="/saddle-range">Saddle Range</Link><span aria-hidden="true">/</span></>}<span aria-current="page">{page.title}</span></nav><p className="eyebrow">Peter Brophy Saddles</p><h1 className="mt-4">{page.title}</h1><p className="body-copy mt-5 max-w-2xl">{page.description}</p></section>
    {path === "about" ? <Heritage /> : path === "saddle-range" ? <SaddleCollection /> : path === "custom-saddles" ? <CustomSaddles /> : path === "testimonials" ? <Testimonials /> : page.image ? <section className="section-shell grid items-center gap-10 pb-16 md:grid-cols-2"><div className="relative aspect-[4/3] overflow-hidden"><Image src={page.image} alt={page.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div><div><h2>Made with purpose</h2><p className="body-copy my-6">Start a conversation about your horse, your riding and the details that matter to you.</p><ButtonLink href={path.startsWith("saddle-range/") ? `/products/${slug[1]}` : "/contact"}>{path.startsWith("saddle-range/") ? "View product" : "Enquire now"}</ButtonLink></div></section> : null}
    <Contact />
  </>;
}
