"use client";

import { useState } from "react";
import { ExternalLinkIcon, PlusIcon } from "@radix-ui/react-icons";
import { type HomeContent, type LinkItem, defaultHome, updateAdmin, useAdmin, useAdminStatus } from "@/lib/admin-store";
import { Card, Field, ListControls, PageHeader, move, useToast } from "./admin-ui";
import { ImageUpload, isImageSrc } from "./image-upload";

type Section = keyof HomeContent;

export function LinkFields({ label, value, onChange }: { label: string; value: LinkItem; onChange: (v: LinkItem) => void }) {
  return <div className="admin-form-row">
    <Field label={`${label} text`} hint="Leave empty to hide the button."><input className="admin-input" value={value.label} onChange={e => onChange({ ...value, label: e.target.value })} /></Field>
    <Field label={`${label} goes to`}><input className="admin-input" value={value.href} placeholder="/contact" onChange={e => onChange({ ...value, href: e.target.value })} /></Field>
  </div>;
}

export const Text = ({ label, value, onChange, rows, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) =>
  <Field label={label} hint={hint}>{rows ? <textarea className="admin-input" rows={rows} value={value} onChange={e => onChange(e.target.value)} /> : <input className="admin-input" value={value} onChange={e => onChange(e.target.value)} />}</Field>;

/** Collects problems that would break the live page (bad links or image paths). */
function validate(h: HomeContent): string | null {
  const links: [string, LinkItem][] = [["Hero main button", h.hero.primary], ["Hero second button", h.hero.secondary], ["Heritage link", h.heritage.link], ["Collection link", h.collection.link], ["Custom saddles button", h.custom.cta], ...h.services.items.map((s, i) => [`Service ${i + 1} link`, s.link] as [string, LinkItem])];
  for (const [name, l] of links) if (l.label && !l.href.startsWith("/")) return `${name}: the link must start with / (a page on this site).`;
  for (const [i, item] of h.collection.items.entries()) if (!item.href.startsWith("/")) return `Saddle card ${i + 1}: the link must start with /.`;
  const images = [h.hero.image, h.heritage.image, h.heritage.backgroundImage, h.custom.image, h.testimonial.image, ...h.hero.slides, ...h.collection.items.map(i => i.image), ...h.services.items.map(s => s.image)];
  if (images.some(src => src && !isImageSrc(src))) return "An image path must start with / or https://.";
  if (!h.hero.title.trim()) return "The hero title can’t be empty.";
  return null;
}

export function HomeView() {
  const { home } = useAdmin();
  const { user } = useAdminStatus();
  const canEdit = user?.role === "owner" || user?.role === "admin";
  const [draft, setDraft] = useState<HomeContent | null>(null);
  const [uploads, setUploads] = useState(0);
  const { toast, run, notify } = useToast();
  const h = draft ?? home;
  const set = <S extends Section>(section: S, value: Partial<HomeContent[S]>) => setDraft({ ...h, [section]: { ...h[section], ...value } });
  const busy = (b: boolean) => setUploads(n => Math.max(0, n + (b ? 1 : -1)));

  const save = () => {
    const problem = validate(h);
    if (problem) return notify(problem);
    run(() => { updateAdmin(s => ({ ...s, home: h })); setDraft(null); }, "Home page saved. Changes are live.");
  };

  const actions = <>
    <a className="admin-button" href="/" target="_blank" rel="noreferrer"><ExternalLinkIcon aria-hidden="true" />View home page</a>
    {canEdit && <><button type="button" className="admin-button" disabled={!draft} onClick={() => setDraft(null)}>Discard</button>
      <button type="button" className="admin-button is-primary" disabled={!draft || uploads > 0} onClick={save}>{uploads > 0 ? "Uploading…" : "Save & publish"}</button></>}
  </>;

  return <>
    <PageHeader eyebrow="Website" title="Home page" description="Edit the text and images on the home page. Press Enter in a title to start a new line." actions={actions} />
    {!canEdit && <p className="admin-notice">Only owners and admins can edit the home page.</p>}
    {draft && <p className="admin-notice is-sticky">You have unsaved changes. Press <strong>Save & publish</strong> to put them live.</p>}

    <fieldset className="admin-fieldset admin-home" disabled={!canEdit}>
      <Card title="1 · Hero (top of page)">
        <div className="admin-home-grid">
          <div className="admin-form">
            <Text label="Small heading" value={h.hero.eyebrow} onChange={v => set("hero", { eyebrow: v })} />
            <Text label="Title" rows={3} value={h.hero.title} onChange={v => set("hero", { title: v })} />
            <Text label="Description" rows={3} value={h.hero.description} onChange={v => set("hero", { description: v })} />
            <LinkFields label="Main button" value={h.hero.primary} onChange={v => set("hero", { primary: v })} />
            <LinkFields label="Second button" value={h.hero.secondary} onChange={v => set("hero", { secondary: v })} />
          </div>
          <div className="admin-form">
            <ImageUpload label="Background image (slide 1)" folder="pages" value={h.hero.image} onChange={v => set("hero", { image: v })} onBusyChange={busy} />
            {h.hero.slides.map((src, i) => <div key={i} className="admin-home-card">
              <div className="admin-card-head is-tight"><p className="admin-home-card-num">Slide {i + 2}</p><ListControls index={i} count={h.hero.slides.length} min={0} onMove={to => set("hero", { slides: move(h.hero.slides, i, to) })} onRemove={() => set("hero", { slides: h.hero.slides.filter((_, j) => j !== i) })} /></div>
              <ImageUpload label={`Background image (slide ${i + 2})`} folder="pages" value={src} onChange={v => set("hero", { slides: h.hero.slides.map((x, j) => j === i ? v : x) })} onBusyChange={busy} />
            </div>)}
            <button type="button" className="admin-button" disabled={h.hero.slides.length >= 7} onClick={() => set("hero", { slides: [...h.hero.slides, ""] })}><PlusIcon aria-hidden="true" />Add another background image</button>
            <p className="admin-hint">{h.hero.slides.filter(Boolean).length ? "With two or more images the background changes automatically as a slideshow." : "Add more images to turn the background into a slideshow."}</p>
            {h.hero.slides.some(Boolean) && <Field label="Seconds per slide"><input className="admin-input" type="number" min={3} max={20} value={h.hero.slideSeconds} onChange={e => set("hero", { slideSeconds: Math.min(20, Math.max(3, Number(e.target.value) || 6)) })} /></Field>}
          </div>
        </div>
      </Card>

      <Card title="2 · Our heritage">
        <div className="admin-home-grid">
          <div className="admin-form">
            <Text label="Small heading" value={h.heritage.eyebrow} onChange={v => set("heritage", { eyebrow: v })} />
            <Text label="Title" rows={3} value={h.heritage.title} onChange={v => set("heritage", { title: v })} />
            <Text label="Text" rows={4} value={h.heritage.body} onChange={v => set("heritage", { body: v })} />
            <LinkFields label="Link" value={h.heritage.link} onChange={v => set("heritage", { link: v })} />
          </div>
          <div className="admin-form">
            <ImageUpload label="Photo (left)" folder="pages" value={h.heritage.image} onChange={v => set("heritage", { image: v })} onBusyChange={busy} />
            <ImageUpload label="Text background (right)" folder="pages" value={h.heritage.backgroundImage} onChange={v => set("heritage", { backgroundImage: v })} onBusyChange={busy} />
          </div>
        </div>
      </Card>

      <Card title="3 · Saddle collection">
        <div className="admin-form">
          <div className="admin-form-row"><Text label="Small heading" value={h.collection.eyebrow} onChange={v => set("collection", { eyebrow: v })} /><Text label="Title" value={h.collection.title} onChange={v => set("collection", { title: v })} /></div>
          <Text label="Text" rows={2} value={h.collection.body} onChange={v => set("collection", { body: v })} />
          <LinkFields label="Link" value={h.collection.link} onChange={v => set("collection", { link: v })} />
        </div>
        <div className="admin-home-cards">
          {h.collection.items.map((item, i) => {
            const update = (patch: Partial<typeof item>) => set("collection", { items: h.collection.items.map((x, j) => j === i ? { ...x, ...patch } : x) });
            return <div key={i} className="admin-home-card">
              <p className="admin-home-card-num">Card {i + 1}</p>
              <ImageUpload label="Photo" folder="pages" value={item.image} onChange={v => update({ image: v })} onBusyChange={busy} />
              <Text label="Name" value={item.name} onChange={v => update({ name: v })} />
              <Text label="Link" value={item.href} onChange={v => update({ href: v })} />
            </div>;
          })}
        </div>
      </Card>

      <Card title="4 · Custom saddles banner">
        <div className="admin-home-grid">
          <div className="admin-form">
            <Text label="Small heading" value={h.custom.eyebrow} onChange={v => set("custom", { eyebrow: v })} />
            <Text label="Title" rows={2} value={h.custom.title} onChange={v => set("custom", { title: v })} />
            <Text label="Text" rows={4} value={h.custom.body} onChange={v => set("custom", { body: v })} />
            <LinkFields label="Button" value={h.custom.cta} onChange={v => set("custom", { cta: v })} />
          </div>
          <ImageUpload label="Background image" folder="pages" value={h.custom.image} onChange={v => set("custom", { image: v })} onBusyChange={busy} />
        </div>
      </Card>

      <Card title="5 · Services">
        <div className="admin-home-cards is-three">
          {h.services.items.map((item, i) => {
            const update = (patch: Partial<typeof item>) => set("services", { items: h.services.items.map((x, j) => j === i ? { ...x, ...patch } : x) });
            return <div key={i} className="admin-home-card">
              <p className="admin-home-card-num">Service {i + 1}</p>
              <ImageUpload label="Photo" folder="pages" value={item.image} onChange={v => update({ image: v })} onBusyChange={busy} />
              <Text label="Title" value={item.title} onChange={v => update({ title: v })} />
              <Text label="Text" rows={3} value={item.body} onChange={v => update({ body: v })} />
              <LinkFields label="Link" value={item.link} onChange={v => update({ link: v })} />
            </div>;
          })}
        </div>
      </Card>

      <Card title="6 · Testimonial">
        <div className="admin-home-grid">
          <div className="admin-form">
            <Text label="Small heading" value={h.testimonial.eyebrow} onChange={v => set("testimonial", { eyebrow: v })} />
            <Text label="Quote" rows={4} value={h.testimonial.quote} onChange={v => set("testimonial", { quote: v })} hint="Without quotation marks — they’re added automatically." />
            <Text label="Name / place" value={h.testimonial.author} onChange={v => set("testimonial", { author: v })} />
          </div>
          <ImageUpload label="Background image" folder="pages" value={h.testimonial.image} onChange={v => set("testimonial", { image: v })} onBusyChange={busy} />
        </div>
      </Card>

      <Card title="7 · Contact band (bottom)">
        <div className="admin-form-row is-three">
          <Text label="Small heading" value={h.contact.eyebrow} onChange={v => set("contact", { eyebrow: v })} />
          <Text label="Title" value={h.contact.title} onChange={v => set("contact", { title: v })} />
          <Text label="Button text" value={h.contact.buttonLabel} onChange={v => set("contact", { buttonLabel: v })} />
        </div>
      </Card>

      {canEdit && <div className="admin-actions-row admin-home-foot">
        <button type="button" className="admin-button" onClick={() => setDraft({ ...defaultHome })}>Restore original content</button>
        <button type="button" className="admin-button is-primary" disabled={!draft || uploads > 0} onClick={save}>{uploads > 0 ? "Uploading…" : "Save & publish"}</button>
      </div>}
    </fieldset>
    {toast}
  </>;
}
