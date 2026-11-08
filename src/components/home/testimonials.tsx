import { type HomeContent, defaultHome } from "@/lib/admin-types";
import { Lines, cssUrl } from "./lines";

export function Testimonials({ content = defaultHome.testimonial }: { content?: HomeContent["testimonial"] }) {
  return <section id="testimonials" className="testimonials" style={content.image ? { backgroundImage: cssUrl(content.image) } : undefined}><div className="testimonials-shade" /><div className="section-shell relative z-10 py-14 sm:py-16"><div className="max-w-xl"><p className="eyebrow">{content.eyebrow}</p><blockquote className="mt-5 font-serif text-2xl italic leading-snug sm:text-3xl">“<Lines text={content.quote} />”</blockquote>{content.author && <p className="mt-5 text-xs uppercase tracking-widest">— {content.author}</p>}<span className="mt-4 block text-gold" aria-hidden="true">◉</span></div></div></section>;
}
