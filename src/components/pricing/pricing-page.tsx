import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { ButtonLink } from "@/components/ui/button-link";
import { type PricingContent, defaultPricing } from "@/lib/admin-types";
import { Lines, Paragraphs, Title } from "@/components/home/lines";
import "./pricing-page.css";

// Text and images come from Admin → Pricing page (MongoDB).
export function PricingPageContent({ content = defaultPricing }: { content?: PricingContent }) {
  const { intro, main, facebook } = content;
  const fbUrl = /^https:\/\/(www\.|m\.)?facebook\.com\//.test(facebook.url) ? facebook.url : "";
  return <div className="pricing-page">
    <section className="section-shell pricing-intro">
      <nav className="pricing-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRightIcon aria-hidden="true" /><Link href="/about">About</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">{intro.title}</span></nav>
      <p className="eyebrow">{intro.eyebrow}</p>
      <h1><Title text={intro.title} accent={intro.accent} /></h1>
    </section>

    <section className="section-shell pricing-main">
      <figure className="pricing-photo">{main.image && <Image src={main.image} alt={main.imageAlt} fill sizes="(max-width: 860px) 100vw, 50vw" preload unoptimized={main.image.startsWith("https://")} />}{main.caption && <figcaption>{main.caption}</figcaption>}</figure>
      <div className="pricing-copy">
        <span className="pricing-rule" aria-hidden="true" />
        <Paragraphs text={main.body} className="pricing-lead" />
        {main.cta.label && <ButtonLink href={main.cta.href}>{main.cta.label}</ButtonLink>}
      </div>
    </section>

    {(facebook.title || facebook.text) && <section className="pricing-social" aria-labelledby="pricing-social-title"><div className="section-shell pricing-socialInner">
      <span className="pricing-fbMark" aria-hidden="true">f</span>
      <div><h2 id="pricing-social-title">{facebook.title}</h2>{facebook.text && <p><Lines text={facebook.text} /></p>}</div>
      {fbUrl && facebook.buttonLabel && <a className="pricing-fbButton" href={fbUrl} target="_blank" rel="noreferrer">{facebook.buttonLabel} <ArrowRightIcon aria-hidden="true" /></a>}
    </div></section>}
  </div>;
}
