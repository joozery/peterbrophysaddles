import { ButtonLink } from "@/components/ui/button-link";
import { type HomeContent, defaultHome } from "@/lib/admin-types";
import { Lines, cssUrl } from "./lines";

export function CustomSaddles({ content = defaultHome.custom }: { content?: HomeContent["custom"] }) {
  return <section id="custom" className="custom-banner" style={content.image ? { backgroundImage: cssUrl(content.image) } : undefined}><div className="section-shell custom-banner-inner"><div className="custom-banner-copy"><p className="eyebrow">{content.eyebrow}</p><h2 className="mt-5"><Lines text={content.title} /></h2><div className="mt-4 h-px w-24 bg-gold" /><p className="body-copy mt-4 text-cream/80"><Lines text={content.body} /></p>{content.cta.label && <div className="mt-6"><ButtonLink href={content.cta.href}>{content.cta.label}</ButtonLink></div>}</div></div></section>;
}
