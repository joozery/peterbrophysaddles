import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { productPhoto, type Product } from "@/lib/catalog";
import "./saddle-detail.css";

/** Cards linking to each product's detail page. */
export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return <section className="section-shell pb-16"><div className="saddle-related-grid">{products.map(p => <Link key={p.id} href={`/saddle-range/${p.id}`} className="saddle-related-card">
    <div className="relative aspect-[4/3] overflow-hidden"><Image src={productPhoto(p)} alt={p.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" unoptimized={productPhoto(p).startsWith("https://")} /></div>
    <div className="flex items-center justify-between gap-4 py-4"><h3>{p.name}</h3><ChevronRightIcon aria-hidden="true" /></div>
    {p.description && <p className="body-copy line-clamp-3 pb-2 text-sm">{p.description}</p>}
  </Link>)}</div></section>;
}
