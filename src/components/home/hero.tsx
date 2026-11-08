import { ButtonLink } from "@/components/ui/button-link";
import { type HomeContent, defaultHome } from "@/lib/admin-types";
import { Lines, cssUrl } from "./lines";

export function Hero({ content = defaultHome.hero }: { content?: HomeContent["hero"] }) {
  return <section id="home" className="hero"><div className="hero-image" style={content.image ? { backgroundImage: cssUrl(content.image) } : undefined} /><div className="hero-shade" /><div className="section-shell relative z-10 py-20 lg:py-28">
    <p className="eyebrow text-cream">{content.eyebrow} <span className="ml-5 text-gold" aria-hidden="true">— ✦ —</span></p>
    <h1 className="mt-5 max-w-2xl"><Lines text={content.title} /></h1>
    <p className="hero-description max-w-[34rem]"><Lines text={content.description} /></p>
    <div className="mt-7 flex flex-wrap gap-4">
      {content.primary.label && <ButtonLink href={content.primary.href}>{content.primary.label}</ButtonLink>}
      {content.secondary.label && <ButtonLink href={content.secondary.href} outline>{content.secondary.label}</ButtonLink>}
    </div>
  </div></section>;
}
