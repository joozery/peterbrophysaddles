"use client";

import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, ExternalLinkIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { type AboutContent, type LinkItem, defaultAbout, updateAdmin, useAdmin, useAdminStatus } from "@/lib/admin-store";
import { Card, PageHeader, useToast } from "./admin-ui";
import { LinkFields, Text } from "./home-view";
import { ImageUpload, isImageSrc } from "./image-upload";

type Section = keyof AboutContent;

/** Up / down / remove buttons for an item in an editable list. */
function ListControls({ index, count, onMove, onRemove, min = 1 }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void; min?: number }) {
  return <div className="admin-row-actions">
    <button type="button" className="admin-icon-button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(index - 1)}><ArrowUpIcon /></button>
    <button type="button" className="admin-icon-button" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(index + 1)}><ArrowDownIcon /></button>
    <button type="button" className="admin-icon-button is-danger" aria-label="Remove" disabled={count <= min} onClick={onRemove}><TrashIcon /></button>
  </div>;
}
const move = <T,>(list: T[], from: number, to: number) => { const next = [...list]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; };

function validate(a: AboutContent): string | null {
  const links: [string, LinkItem][] = [["Story link", a.story.link], ["Materials link", a.materials.link], ["Disciplines button", a.disciplines.cta], ["Consultation button", a.consultation.cta]];
  for (const [name, l] of links) if (l.label && !l.href.startsWith("/")) return `${name}: the link must start with / (a page on this site).`;
  if ([a.story.image, a.materials.image].some(src => src && !isImageSrc(src))) return "An image path must start with / or https://.";
  if (!a.intro.title.trim()) return "The page title can’t be empty.";
  if (a.principles.items.some(i => !i.title.trim())) return "Every principle needs a title.";
  if (a.disciplines.items.some(d => !d.trim())) return "Remove empty disciplines before saving.";
  return null;
}

export function AboutView() {
  const { about } = useAdmin();
  const { user } = useAdminStatus();
  const canEdit = user?.role === "owner" || user?.role === "admin";
  const [draft, setDraft] = useState<AboutContent | null>(null);
  const [uploads, setUploads] = useState(0);
  const { toast, run, notify } = useToast();
  const a = draft ?? about;
  const set = <S extends Section>(section: S, value: Partial<AboutContent[S]>) => setDraft({ ...a, [section]: { ...a[section], ...value } });
  const busy = (b: boolean) => setUploads(n => Math.max(0, n + (b ? 1 : -1)));

  const save = () => {
    const problem = validate(a);
    if (problem) return notify(problem);
    run(() => { updateAdmin(s => ({ ...s, about: a })); setDraft(null); }, "About page saved. Changes are live.");
  };
  const saveButton = <button type="button" className="admin-button is-primary" disabled={!draft || uploads > 0} onClick={save}>{uploads > 0 ? "Uploading…" : "Save & publish"}</button>;

  const principles = a.principles.items;
  const disciplines = a.disciplines.items;

  return <>
    <PageHeader eyebrow="Website" title="About page" description="Edit every text and image on the About page. “Italic line” appears in gold italics under a title. Leave a blank line in long text to start a new paragraph."
      actions={<><a className="admin-button" href="/about" target="_blank" rel="noreferrer"><ExternalLinkIcon aria-hidden="true" />View About page</a>
        {canEdit && <><button type="button" className="admin-button" disabled={!draft} onClick={() => setDraft(null)}>Discard</button>{saveButton}</>}</>} />
    {!canEdit && <p className="admin-notice">Only owners and admins can edit the About page.</p>}
    {draft && <p className="admin-notice is-sticky">You have unsaved changes. Press <strong>Save & publish</strong> to put them live.</p>}

    <fieldset className="admin-fieldset admin-home" disabled={!canEdit}>
      <Card title="1 · Introduction (top of page)">
        <div className="admin-form">
          <Text label="Small heading" value={a.intro.eyebrow} onChange={v => set("intro", { eyebrow: v })} />
          <div className="admin-form-row"><Text label="Title" value={a.intro.title} onChange={v => set("intro", { title: v })} /><Text label="Italic line" value={a.intro.accent} onChange={v => set("intro", { accent: v })} /></div>
          <Text label="Intro text" rows={3} value={a.intro.text} onChange={v => set("intro", { text: v })} />
          <Text label="“Discover our story” link text" value={a.intro.linkLabel} onChange={v => set("intro", { linkLabel: v })} hint="Scrolls down to the story. Leave empty to hide." />
        </div>
      </Card>

      <Card title="2 · Our story">
        <div className="admin-home-grid">
          <div className="admin-form">
            <Text label="Small heading" value={a.story.eyebrow} onChange={v => set("story", { eyebrow: v })} />
            <Text label="Title" rows={2} value={a.story.title} onChange={v => set("story", { title: v })} />
            <Text label="Lead paragraph (larger text)" rows={3} value={a.story.lead} onChange={v => set("story", { lead: v })} />
            <Text label="More text" rows={6} value={a.story.body} onChange={v => set("story", { body: v })} hint="Blank line = new paragraph." />
            <LinkFields label="Link" value={a.story.link} onChange={v => set("story", { link: v })} />
          </div>
          <div className="admin-form">
            <ImageUpload label="Photo" folder="pages" value={a.story.image} onChange={v => set("story", { image: v })} onBusyChange={busy} />
            <Text label="Photo description (for screen readers & Google)" value={a.story.imageAlt} onChange={v => set("story", { imageAlt: v })} />
            <Text label="Photo caption" value={a.story.caption} onChange={v => set("story", { caption: v })} />
            <div className="admin-form-row"><Text label="Badge number" value={a.story.statNumber} onChange={v => set("story", { statNumber: v })} hint="e.g. 20+. Empty hides the badge." /><Text label="Badge text" rows={2} value={a.story.statLabel} onChange={v => set("story", { statLabel: v })} /></div>
          </div>
        </div>
      </Card>

      <Card title="3 · Principles">
        <div className="admin-form">
          <div className="admin-form-row"><Text label="Small heading" value={a.principles.eyebrow} onChange={v => set("principles", { eyebrow: v })} /><Text label="Title" rows={2} value={a.principles.title} onChange={v => set("principles", { title: v })} /></div>
          <Text label="Side text" rows={2} value={a.principles.text} onChange={v => set("principles", { text: v })} />
        </div>
        <div className="admin-home-cards is-three">
          {principles.map((item, i) => {
            const update = (patch: Partial<typeof item>) => set("principles", { items: principles.map((x, j) => j === i ? { ...x, ...patch } : x) });
            return <div key={i} className="admin-home-card">
              <div className="admin-card-head is-tight"><p className="admin-home-card-num">Principle {String(i + 1).padStart(2, "0")}</p><ListControls index={i} count={principles.length} onMove={to => set("principles", { items: move(principles, i, to) })} onRemove={() => set("principles", { items: principles.filter((_, j) => j !== i) })} /></div>
              <Text label="Title" value={item.title} onChange={v => update({ title: v })} />
              <Text label="Text" rows={5} value={item.body} onChange={v => update({ body: v })} />
            </div>;
          })}
        </div>
        <button type="button" className="admin-button admin-mt" disabled={principles.length >= 6} onClick={() => set("principles", { items: [...principles, { title: "", body: "" }] })}><PlusIcon aria-hidden="true" />Add principle</button>
      </Card>

      <Card title="4 · Materials">
        <div className="admin-home-grid">
          <div className="admin-form">
            <Text label="Small heading" value={a.materials.eyebrow} onChange={v => set("materials", { eyebrow: v })} />
            <div className="admin-form-row"><Text label="Title" value={a.materials.title} onChange={v => set("materials", { title: v })} /><Text label="Italic line" value={a.materials.accent} onChange={v => set("materials", { accent: v })} /></div>
            <Text label="Text" rows={7} value={a.materials.body} onChange={v => set("materials", { body: v })} hint="Blank line = new paragraph." />
            <LinkFields label="Link" value={a.materials.link} onChange={v => set("materials", { link: v })} />
          </div>
          <div className="admin-form">
            <ImageUpload label="Photo" folder="pages" value={a.materials.image} onChange={v => set("materials", { image: v })} onBusyChange={busy} />
            <Text label="Photo description" value={a.materials.imageAlt} onChange={v => set("materials", { imageAlt: v })} />
            <Text label="Photo caption" value={a.materials.caption} onChange={v => set("materials", { caption: v })} />
          </div>
        </div>
      </Card>

      <Card title="5 · Riding disciplines">
        <div className="admin-home-grid">
          <div className="admin-form">
            <Text label="Small heading" value={a.disciplines.eyebrow} onChange={v => set("disciplines", { eyebrow: v })} />
            <div className="admin-form-row"><Text label="Title" value={a.disciplines.title} onChange={v => set("disciplines", { title: v })} /><Text label="Italic line" value={a.disciplines.accent} onChange={v => set("disciplines", { accent: v })} /></div>
            <Text label="Text" rows={4} value={a.disciplines.body} onChange={v => set("disciplines", { body: v })} />
            <LinkFields label="Button" value={a.disciplines.cta} onChange={v => set("disciplines", { cta: v })} />
          </div>
          <div className="admin-form">
            <p className="admin-label">Disciplines (numbered automatically)</p>
            <ol className="admin-mini-list">
              {disciplines.map((d, i) => <li key={i}>
                <span className="admin-home-card-num">{String(i + 1).padStart(2, "0")}</span>
                <input className="admin-input" aria-label={`Discipline ${i + 1}`} value={d} onChange={e => set("disciplines", { items: disciplines.map((x, j) => j === i ? e.target.value : x) })} />
                <ListControls index={i} count={disciplines.length} onMove={to => set("disciplines", { items: move(disciplines, i, to) })} onRemove={() => set("disciplines", { items: disciplines.filter((_, j) => j !== i) })} />
              </li>)}
            </ol>
            <button type="button" className="admin-button" disabled={disciplines.length >= 16} onClick={() => set("disciplines", { items: [...disciplines, ""] })}><PlusIcon aria-hidden="true" />Add discipline</button>
          </div>
        </div>
      </Card>

      <Card title="6 · Heritage statement">
        <div className="admin-form">
          <Text label="Small heading" value={a.legacy.eyebrow} onChange={v => set("legacy", { eyebrow: v })} />
          <div className="admin-form-row"><Text label="Title" value={a.legacy.title} onChange={v => set("legacy", { title: v })} /><Text label="Italic line" value={a.legacy.accent} onChange={v => set("legacy", { accent: v })} /></div>
          <Text label="Text" rows={4} value={a.legacy.body} onChange={v => set("legacy", { body: v })} />
        </div>
      </Card>

      <Card title="7 · Consultation band (bottom)">
        <div className="admin-form">
          <div className="admin-form-row"><Text label="Small heading" value={a.consultation.eyebrow} onChange={v => set("consultation", { eyebrow: v })} /><Text label="Title" rows={2} value={a.consultation.title} onChange={v => set("consultation", { title: v })} /></div>
          <Text label="Text" rows={2} value={a.consultation.body} onChange={v => set("consultation", { body: v })} />
          <LinkFields label="Button" value={a.consultation.cta} onChange={v => set("consultation", { cta: v })} />
        </div>
      </Card>

      {canEdit && <div className="admin-actions-row admin-home-foot">
        <button type="button" className="admin-button" onClick={() => setDraft(structuredClone(defaultAbout))}>Restore original content</button>
        {saveButton}
      </div>}
    </fieldset>
    {toast}
  </>;
}
