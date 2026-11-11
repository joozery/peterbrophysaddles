import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { categoryOf, productPhoto, saddleTypes, specOptions, type Product } from "@/lib/catalog";
import "./saddle-range.css";

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const specValue = (p: Product, label: RegExp) => p.specs?.find(s => label.test(s.label))?.value;
const variantLabel = (p: Product) => p.name.match(/#\d+\s*$/)?.[0].trim() ?? p.name;
const isRemote = (src: string) => src.startsWith("https://");
/** Short teaser from a description: whole words, about one line. */
function summary(text: string, max = 110) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:–-]+$/, "")}…`;
}

/** Saddle Range page: one feature section per saddle type, then saddle trees and help. */
export function SaddleRange({ products }: { products: Product[] }) {
  const types = saddleTypes(products);
  const trees = products.filter(p => categoryOf(p) === "saddle-trees");
  return <>
    <div>{/* the sticky "Jump to" bar stops at the end of this block */}
    <nav className="range-jump section-shell" aria-label="Saddle types">
      <span className="range-jump-label">Jump to</span>
      {types.map(t => <a key={t.name} href={`#${slug(t.name)}`}>{t.plural}</a>)}
      {!!trees.length && <a href="#saddle-trees">Saddle Trees</a>}
    </nav>

    <div className="range-list">{types.map((t, i) => {
      const lead = t.product, tree = specValue(lead, /tree/i), weight = specValue(lead, /weight/i), seats = specValue(lead, /seat/i);
      const photo = productPhoto(lead);
      return <section key={t.name} id={slug(t.name)} className="range-type" aria-labelledby={`${slug(t.name)}-title`}>
        <div className="section-shell range-type-grid">
          <Link href={`/saddle-range/${lead.id}`} className="range-photo" tabIndex={-1} aria-hidden="true">
            <Image src={photo} alt="" fill sizes="(max-width: 860px) 100vw, 50vw" className="object-cover" unoptimized={isRemote(photo)} />
            <span className="range-photo-index">{String(i + 1).padStart(2, "0")}</span>
          </Link>
          <div className="range-info">
            <p className="eyebrow">{t.variants.length > 1 ? `${t.variants.length} styles available` : "Saddle collection"}</p>
            <h2 id={`${slug(t.name)}-title`}>{t.plural}</h2>
            {lead.description && <p className="body-copy range-description">{lead.description}</p>}
            {(tree || weight || seats) && <dl className="range-specs">
              {tree && <div><dt>Tree</dt><dd>{tree}</dd></div>}
              {weight && <div><dt>Weight</dt><dd>{weight}</dd></div>}
              {seats && <div className="is-wide"><dt>Seat sizes</dt><dd><ul>{specOptions(seats).map(s => <li key={s}>{s}</li>)}</ul></dd></div>}
            </dl>}
            {t.variants.length > 1 && <div className="range-variants">
              <p className="range-variants-title">Choose a style</p>
              <ul>{t.variants.map(v => { const src = productPhoto(v); return <li key={v.id}><Link href={`/saddle-range/${v.id}`} className="range-variant">
                <span className="range-variant-thumb"><Image src={src} alt="" fill sizes="72px" className="object-cover" unoptimized={isRemote(src)} /></span>
                <span><strong>{v.name}</strong><small>{v.description ? summary(v.description) : "View details"}</small></span>
                <ChevronRightIcon aria-hidden="true" />
              </Link></li>; })}</ul>
            </div>}
            <div className="range-actions">
              <Link href={`/saddle-range/${lead.id}`} className="button-link button-gold">View {t.variants.length > 1 ? variantLabel(lead) : "details"} <ChevronRightIcon aria-hidden="true" /></Link>
              <Link href={`/contact?product=${encodeURIComponent(lead.id)}`} className="text-link">Enquire about this saddle <ChevronRightIcon aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>;
    })}</div>

    {!!trees.length && <section id="saddle-trees" className="range-trees">
      <div className="section-shell">
        <div className="range-trees-head"><div><p className="eyebrow">The foundation</p><h2>Saddle Trees</h2></div><p className="body-copy">Rigid PU and carbon fibre trees — light, strong and shaped for your horse’s freedom of movement.</p></div>
        <div className="range-trees-grid">{trees.map(p => { const src = productPhoto(p), cantle = specValue(p, /cantle/i), w = specValue(p, /weight/i); return <Link key={p.id} href={`/saddle-range/${p.id}`} className="range-tree">
          <span className="range-tree-photo"><Image src={src} alt="" fill sizes="(max-width: 640px) 100vw, 40vw" className="object-cover" unoptimized={isRemote(src)} /></span>
          <span className="range-tree-body"><strong>{p.name}</strong><small>{[cantle && `Cantle ${cantle}`, w].filter(Boolean).join(" · ")}</small></span>
          <ChevronRightIcon aria-hidden="true" />
        </Link>; })}</div>
      </div>
    </section>}
    </div>

    <section className="section-shell range-help">
      <div><p className="eyebrow">Need help choosing?</p><h2>Find the right fit</h2></div>
      <p className="body-copy">Tell us about your horse, your discipline and how you ride. We’ll help you choose the saddle, tree and seat size — and confirm every detail in a quotation before you order.</p>
      <Link href="/contact" className="button-link button-gold">Talk to us <ChevronRightIcon aria-hidden="true" /></Link>
    </section>
  </>;
}
