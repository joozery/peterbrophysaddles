import Image from "next/image";
import { TextLink } from "@/components/ui/button-link";
import { type HomeContent, defaultHome } from "@/lib/admin-types";
import { Lines, cssUrl } from "./lines";

export function Heritage({ content = defaultHome.heritage }: { content?: HomeContent["heritage"] }) {
  const background = content.backgroundImage ? `linear-gradient(90deg, #eee8dc99, #eee8dc33), ${cssUrl(content.backgroundImage)}` : undefined;
  return <section id="about" className="heritage grid md:grid-cols-2">
    <div className="relative min-h-80">{content.image && <Image src={content.image} alt="Peter Brophy Saddles craftsmanship" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized={content.image.startsWith("https://")} />}</div>
    <div className="heritage-copy" style={{ backgroundImage: background, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}><p className="eyebrow">{content.eyebrow}</p><h2 className="mt-5"><Lines text={content.title} /></h2><p className="body-copy mt-6"><Lines text={content.body} /></p><div className="mt-5 h-px w-24 bg-gold" />{content.link.label && <div className="mt-4"><TextLink href={content.link.href}>{content.link.label}</TextLink></div>}</div>
  </section>;
}
