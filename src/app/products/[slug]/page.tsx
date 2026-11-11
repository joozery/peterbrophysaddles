import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { productPhoto, products } from "@/lib/catalog";
import { getSiteProducts } from "@/lib/server/product-content";
import { ShopShell } from "@/components/shop/shop-shell";
import { PurchasePanel } from "@/components/shop/catalog-view";
export function generateStaticParams() { return products.map(p => ({ slug: p.id })); }
export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) { return <Suspense fallback={<ShopShell title="Saddle details"><p>Loading product…</p></ShopShell>}><ProductContent params={params} /></Suspense>; }
async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await getSiteProducts()).find(p => p.id === slug);
  if (!product) notFound();
  return <ShopShell title={product.name}><div className="grid gap-10 md:grid-cols-2"><div className="relative aspect-[2/3]"><Image src={productPhoto(product)} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized={productPhoto(product).startsWith("https://")} /></div><div className="py-6"><p className="body-copy mb-8">{product.description ?? "Traditional craftsmanship for horse and rider. Discuss fit and specifications with us before ordering. Images are AI-generated illustrations based on the original references."}</p>{!!product.specs?.length && <dl className="mb-8 grid gap-3 border-t border-stone-300 pt-4 text-sm">{product.specs.map(({ label, value }, i) => <div key={`${label}-${i}`} className="grid grid-cols-[minmax(120px,38%)_1fr] gap-4"><dt className="text-stone-500">{label}</dt><dd>{value}</dd></div>)}</dl>}<PurchasePanel product={product} /><p className="mt-8 text-sm text-stone-500">Send us an enquiry and we’ll confirm fit, delivery and a quotation. Payment is by card (secure Stripe link) or direct bank transfer.</p></div></div></ShopShell>;
}
