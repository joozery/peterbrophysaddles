import { type Review, type TestimonialsContent, defaultTestimonials } from "@/lib/admin-types";
import { Lines } from "@/components/home/lines";
import "./testimonial-list.css";

const paragraphs = (text: string) => text.split(/\r?\n\s*\r?\n/).map(p => p.trim()).filter(Boolean);

function Signature({ name, tag }: { name: string; tag: string }) {
  return <figcaption className="tl-signature">
    {name && <span className="tl-monogram" aria-hidden="true">{name.trim()[0]}</span>}
    <span>{name && <strong>{name}</strong>}{tag && <small>{tag}</small>}</span>
  </figcaption>;
}

function Featured({ r }: { r: Review }) {
  return <figure className="tl-featured">
    <div className="tl-featured-lead">
      <span className="tl-mark" aria-hidden="true">“</span>
      {r.badge && <p className="tl-badge">{r.badge}</p>}
      {r.headline && <p className="tl-featured-headline"><Lines text={r.headline} /></p>}
      <Signature name={r.name} tag={r.tag} />
    </div>
    <blockquote className="tl-featured-body">{paragraphs(r.body).map((p, i) => <p key={i}><Lines text={p} /></p>)}</blockquote>
  </figure>;
}

function Card({ r }: { r: Review }) {
  const body = paragraphs(r.body);
  const cls = ["tl-card", r.layout === "wide" && "tl-card--maker", !body.length && "tl-card--short"].filter(Boolean).join(" ");
  return <figure className={cls}>
    {r.badge && <p className="tl-badge">{r.badge}</p>}
    <blockquote>
      {r.headline && <p className="tl-headline">“<Lines text={r.headline} />”</p>}
      {body.map((p, i) => <p key={i} className="tl-body"><Lines text={p} /></p>)}
    </blockquote>
    <Signature name={r.name} tag={r.tag} />
  </figure>;
}

// Text comes from Admin → Testimonials (MongoDB).
export function TestimonialList({ content = defaultTestimonials }: { content?: TestimonialsContent }) {
  const { intro } = content;
  const items = content.reviews.items.filter(r => r.visible && (r.headline.trim() || r.body.trim()));
  const featured = items.filter(r => r.layout === "featured" && r.body.trim());
  const cards = items.filter(r => !featured.includes(r));
  return <section className="tl" aria-label="Customer testimonials">
    <div className="section-shell">
      {(intro.title || intro.text) && <div className="tl-intro">
        {intro.eyebrow && <p className="eyebrow">{intro.eyebrow}</p>}
        <h2><Lines text={intro.title} />{intro.accent && <em>{intro.accent}</em>}</h2>
        {intro.text && <p className="body-copy"><Lines text={intro.text} /></p>}
      </div>}
      {featured.map((r, i) => <Featured key={`f${i}`} r={r} />)}
      {cards.length > 0 && <div className="tl-grid">{cards.map((r, i) => <Card key={i} r={r} />)}</div>}
    </div>
  </section>;
}
