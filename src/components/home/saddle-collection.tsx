import { ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Image from "next/image";
import { TextLink } from "@/components/ui/button-link";
import { type HomeContent, defaultHome } from "@/lib/admin-types";
import { Lines } from "./lines";

export function SaddleCollection({ content = defaultHome.collection }: { content?: HomeContent["collection"] }) {
  return <section id="collection" className="section-shell collection-section"><div className="flex flex-wrap items-center justify-between gap-5"><div><p className="eyebrow">{content.eyebrow}</p><h2 className="mt-3"><Lines text={content.title} /></h2></div>{content.link.label && <TextLink href={content.link.href}>{content.link.label}</TextLink>}</div>
    <p className="body-copy mt-3 max-w-2xl"><Lines text={content.body} /></p>
    <div id="saddle-grid" className="saddle-grid mt-7">{content.items.map((item, i) => <Link key={`${item.href}-${i}`} href={item.href} className="saddle-card group">
      {item.image && <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw" className="object-cover transition duration-500 group-hover:scale-105" unoptimized={item.image.startsWith("https://")} />}
      <div className="saddle-card-shade" /><div className="relative z-10 mt-auto p-3"><h3>{item.name}</h3><p className="mt-3 inline-flex items-center gap-1 text-xs text-cream/80">View collection <ChevronRightIcon aria-hidden="true" className="action-icon" /></p></div>
    </Link>)}</div>
  </section>;
}
