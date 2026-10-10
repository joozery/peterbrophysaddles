import { ButtonLink } from "@/components/ui/button-link";

export function Hero() {
  return <section id="home" className="hero"><div className="hero-image" /><div className="hero-shade" /><div className="section-shell relative z-10 py-20 lg:py-28">
    <p className="eyebrow text-cream">Peter Brophy Saddles <span className="ml-5 text-gold" aria-hidden="true">— ✦ —</span></p>
    <h1 className="mt-5 max-w-2xl">Custom saddles<br />for a higher<br />standard</h1>
    <p className="hero-description">Australian-made saddles and leatherwork,<br className="hidden sm:block" /> crafted with experience, precision and a deep<br className="hidden sm:block" /> understanding of horse and rider.</p>
    <div className="mt-7 flex flex-wrap gap-4"><ButtonLink href="/saddle-range">Explore saddle collection</ButtonLink><ButtonLink href="/about" outline>About our work</ButtonLink></div>
  </div></section>;
}
