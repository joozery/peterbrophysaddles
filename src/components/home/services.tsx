import Image from "next/image";
import { TextLink } from "@/components/ui/button-link";
import { type HomeContent, defaultHome } from "@/lib/admin-types";
import { Lines } from "./lines";

export function Services({ content = defaultHome.services }: { content?: HomeContent["services"] }) {
  return <section aria-label="Our craftsmanship and services" className="section-shell services-grid">{content.items.map((service, i) => <article key={`${service.title}-${i}`}><div className="relative aspect-[1.9] overflow-hidden">{service.image && <Image src={service.image} alt={service.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized={service.image.startsWith("https://")} />}</div><h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.15em]">{service.title}</h3><p className="body-copy mt-2"><Lines text={service.body} /></p>{service.link.label && <div className="mt-4"><TextLink href={service.link.href}>{service.link.label}</TextLink></div>}</article>)}</section>;
}
