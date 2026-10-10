import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { products, type Product } from "@/lib/catalog";
import { PurchasePanel } from "@/components/shop/catalog-view";
import { SaddleDetailsAccordion } from "./saddle-details-accordion";
import "./saddle-detail.css";

export function SaddleDetail({ product }: { product: Product }) {
  const related = products.filter(p => p.id !== product.id && !p.custom).slice(0, 3);
  return <>
    <section className="section-shell saddle-detail"><nav aria-label="Breadcrumb" className="saddle-breadcrumb"><Link href="/">Home</Link><ChevronRightIcon aria-hidden="true" /><Link href="/saddle-range">Saddle Range</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">{product.name}</span></nav>
      <div className="saddle-detail-grid"><div className="saddle-photo"><Image src={`/images/saddles/${product.image}-v2.png`} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 55vw" className="object-cover object-[center_15%]" /><span className="saddle-photo-caption">Crafted for horse & rider</span></div>
        <div className="saddle-info"><p className="eyebrow">The saddle collection</p><h1>{product.name}</h1><p className="saddle-intro">A higher standard.<br />Every detail considered.</p><p className="body-copy">Traditional leather craftsmanship, considered fit and attention to the finer details. Find the right saddle for your horse and the way you ride.</p><div className="saddle-purchase"><PurchasePanel product={product} /><p className="saddle-demo">Demo purchase · Sample price and stock. No real payment is collected.</p></div><SaddleDetailsAccordion /><Link href="/contact" className="saddle-help">Need help choosing your saddle? <ChevronRightIcon aria-hidden="true" /></Link></div>
      </div>
      <p className="saddle-image-note">Image generated from the original reference. Confirm actual product details and fit before purchasing.</p>
    </section>
    <section className="saddle-related"><div className="section-shell"><div className="saddle-related-heading"><div><p className="eyebrow">Find your fit</p><h2>Explore the collection</h2></div><Link href="/saddle-range" className="text-link">All saddles <ChevronRightIcon aria-hidden="true" width={12} height={12} /></Link></div><div className="saddle-related-grid">{related.map(p => <Link key={p.id} href={`/saddle-range/${p.id}`} className="saddle-related-card"><div className="relative aspect-[4/3] overflow-hidden"><Image src={`/images/saddles/${p.image}-v2.png`} alt={p.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover object-[center_30%]" /></div><div className="flex items-center justify-between gap-4 py-4"><h3>{p.name}</h3><ChevronRightIcon aria-hidden="true" /></div></Link>)}</div></div></section>
  </>;
}
