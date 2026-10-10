import { ButtonLink } from "@/components/ui/button-link";

export function CustomSaddles() {
  return <section id="custom" className="custom-banner" style={{ backgroundImage: "url(/cover/bane.png)" }}><div className="section-shell custom-banner-inner"><div className="custom-banner-copy"><p className="eyebrow">Custom saddles</p><h2 className="mt-5">Built around<br />you and your horse</h2><div className="mt-4 h-px w-24 bg-gold" /><p className="body-copy mt-4 text-cream/80">Every horse and rider are different. Our custom saddles are made to fit, perform and last — with careful attention to saddle fit, style, materials and the finer details.</p><div className="mt-6"><ButtonLink href="/contact">Enquire about a custom saddle</ButtonLink></div></div></div></section>;
}
