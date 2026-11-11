import { ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Image from "next/image";
import { TextLink } from "@/components/ui/button-link";
import { type HomeContent, defaultHome } from "@/lib/admin-types";
import { productPhoto, saddleTypes, type Product } from "@/lib/catalog";
import { Lines } from "./lines";
import { CollectionSlider } from "./collection-slider";

/** Heading text comes from Admin → Home; the cards are the saddle types from Admin → Products (built-in cards if there are none). */
export function SaddleCollection({ content = defaultHome.collection, products = [] }: { content?: HomeContent["collection"]; products?: Product[] }) {
  const types = saddleTypes(products);
  const items = types.length ? types.map(t => ({ name: t.plural, image: productPhoto(t.product), href: `/saddle-range/${t.product.id}` })) : content.items;
  return <section id="collection" className="section-shell collection-section"><div className="flex flex-wrap items-center justify-between gap-5"><div><p className="eyebrow">{content.eyebrow}</p><h2 className="mt-3"><Lines text={content.title} /></h2></div>{content.link.label && <TextLink href={content.link.href}>{content.link.label}</TextLink>}</div>
    <p className="body-copy mt-3 max-w-2xl"><Lines text={content.body} /></p>
    <CollectionSlider>{items.map((item, i) => <Link key={`${item.href}-${i}`} href={item.href} className="saddle-card group">
      {item.image && <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 78vw, (max-width: 950px) 33vw, 20vw" className="object-cover transition duration-500 group-hover:scale-105" unoptimized={item.image.startsWith("https://")} />}
      <div className="saddle-card-shade" /><div className="relative z-10 mt-auto p-3"><h3>{item.name}</h3><p className="mt-3 inline-flex items-center gap-1 text-xs text-cream/80">View collection <ChevronRightIcon aria-hidden="true" className="action-icon" /></p></div>
    </Link>)}</CollectionSlider>
  </section>;
}
