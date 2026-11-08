import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { ButtonLink, TextLink } from "@/components/ui/button-link";
import { type AboutContent, defaultAbout } from "@/lib/admin-types";
import { Lines, Paragraphs, Title } from "@/components/home/lines";
import "./about-page.css";

const remote = (src: string) => src.startsWith("https://");

// Text and images come from Admin → About page (MongoDB). Layout and classes are unchanged.
export function AboutPageContent({ content = defaultAbout }: { content?: AboutContent }) {
  const { intro, story, principles, materials, disciplines, legacy, consultation } = content;
  return <div className="about-page">
    <section className={`section-shell about-intro`}>
      <nav className="about-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">About</span></nav>
      <div className="about-introGrid"><div><p className="eyebrow">{intro.eyebrow}</p><h1><Title text={intro.title} accent={intro.accent} /></h1></div><div className="about-introCopy"><p><Lines text={intro.text} /></p>{intro.linkLabel && <a href="#our-story">{intro.linkLabel} <ArrowRightIcon aria-hidden="true" /></a>}</div></div>
    </section>

    <section className={`section-shell about-story`} id="our-story" aria-labelledby="about-story-title">
      <figure className="about-storyPhoto">{story.image && <Image src={story.image} alt={story.imageAlt} fill sizes="(max-width: 800px) 100vw, 45vw" preload unoptimized={remote(story.image)} />}{story.caption && <figcaption>{story.caption}</figcaption>}{story.statNumber && <div className="about-experience"><strong>{story.statNumber}</strong><span><Lines text={story.statLabel} /></span></div>}</figure>
      <div className="about-storyCopy"><p className="eyebrow">{story.eyebrow}</p><h2 id="about-story-title"><Lines text={story.title} /></h2><p className="about-lead"><Lines text={story.lead} /></p><Paragraphs text={story.body} />{story.link.label && <TextLink href={story.link.href}>{story.link.label}</TextLink>}</div>
    </section>

    <section className="about-principles" aria-labelledby="about-principles-title"><div className="section-shell"><div className="about-sectionHeading"><div><p className="eyebrow">{principles.eyebrow}</p><h2 id="about-principles-title"><Lines text={principles.title} /></h2></div><p><Lines text={principles.text} /></p></div><div className="about-values">{principles.items.map((value, i) => <article key={i}><span>{String(i + 1).padStart(2, "0")}</span><h3>{value.title}</h3><p>{value.body}</p></article>)}</div></div></section>

    <section className={`section-shell about-materials`} aria-labelledby="about-materials-title"><div><p className="eyebrow">{materials.eyebrow}</p><h2 id="about-materials-title"><Title text={materials.title} accent={materials.accent} /></h2><Paragraphs text={materials.body} />{materials.link.label && <TextLink href={materials.link.href}>{materials.link.label}</TextLink>}</div><figure className="about-materialPhoto">{materials.image && <Image src={materials.image} alt={materials.imageAlt} fill sizes="(max-width: 800px) 100vw, 45vw" unoptimized={remote(materials.image)} />}{materials.caption && <figcaption>{materials.caption}</figcaption>}</figure></section>

    <section className="about-disciplines" aria-labelledby="about-disciplines-title"><div className={`section-shell about-disciplineGrid`}><div><p className="eyebrow">{disciplines.eyebrow}</p><h2 id="about-disciplines-title"><Title text={disciplines.title} accent={disciplines.accent} /></h2><p><Lines text={disciplines.body} /></p>{disciplines.cta.label && <ButtonLink href={disciplines.cta.href}>{disciplines.cta.label}</ButtonLink>}</div><div className="about-disciplineList">{disciplines.items.map((discipline, index) => <div key={`${discipline}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><h3>{discipline}</h3></div>)}</div></div></section>

    <section className={`section-shell about-legacy`}><span className="about-legacyMark" aria-hidden="true">PB</span><p className="eyebrow">{legacy.eyebrow}</p><h2><Title text={legacy.title} accent={legacy.accent} /></h2><p><Lines text={legacy.body} /></p></section>

    <section className="about-consultation" aria-labelledby="about-consultation-title"><div className={`section-shell about-consultationInner`}><div><p className="eyebrow">{consultation.eyebrow}</p><h2 id="about-consultation-title"><Lines text={consultation.title} /></h2><p><Lines text={consultation.body} /></p></div>{consultation.cta.label && <ButtonLink href={consultation.cta.href}>{consultation.cta.label}</ButtonLink>}</div></section>
  </div>;
}
