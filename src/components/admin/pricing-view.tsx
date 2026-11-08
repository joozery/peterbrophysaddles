"use client";

import { useState } from "react";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { type PricingContent, defaultPricing, updateAdmin, useAdmin, useAdminStatus } from "@/lib/admin-store";
import { Card, PageHeader, useToast } from "./admin-ui";
import { LinkFields, Text } from "./home-view";
import { ImageUpload, isImageSrc } from "./image-upload";

type Section = keyof PricingContent;
const FB_URL = /^https:\/\/(www\.|m\.)?facebook\.com\/\S+$/;

function validate(p: PricingContent): string | null {
  if (!p.intro.title.trim()) return "The page title can’t be empty.";
  if (p.main.cta.label && !p.main.cta.href.startsWith("/")) return "Button link must start with / (a page on this site).";
  if (p.main.image && !isImageSrc(p.main.image)) return "Image path must start with / or https://.";
  if (p.facebook.url && !FB_URL.test(p.facebook.url)) return "Facebook link must look like https://www.facebook.com/your-page";
  return null;
}

export function PricingView() {
  const { pricing } = useAdmin();
  const { user } = useAdminStatus();
  const canEdit = user?.role === "owner" || user?.role === "admin";
  const [draft, setDraft] = useState<PricingContent | null>(null);
  const [uploads, setUploads] = useState(0);
  const { toast, run, notify } = useToast();
  const p = draft ?? pricing;
  const set = <S extends Section>(section: S, value: Partial<PricingContent[S]>) => setDraft({ ...p, [section]: { ...p[section], ...value } });

  const save = () => {
    const problem = validate(p);
    if (problem) return notify(problem);
    run(() => { updateAdmin(s => ({ ...s, pricing: p })); setDraft(null); }, "Pricing page saved. Changes are live.");
  };
  const saveButton = <button type="button" className="admin-button is-primary" disabled={!draft || uploads > 0} onClick={save}>{uploads > 0 ? "Uploading…" : "Save & publish"}</button>;

  return <>
    <PageHeader eyebrow="Website" title="Pricing page" description="The Saddle Pricing page (About → Saddle Pricing). Leave a blank line in the text to start a new paragraph."
      actions={<><a className="admin-button" href="/saddle-pricing" target="_blank" rel="noreferrer"><ExternalLinkIcon aria-hidden="true" />View page</a>
        {canEdit && <><button type="button" className="admin-button" disabled={!draft} onClick={() => setDraft(null)}>Discard</button>{saveButton}</>}</>} />
    {!canEdit && <p className="admin-notice">Only owners and admins can edit this page.</p>}
    {draft && <p className="admin-notice is-sticky">You have unsaved changes. Press <strong>Save & publish</strong> to put them live.</p>}

    <fieldset className="admin-fieldset admin-home" disabled={!canEdit}>
      <Card title="1 · Heading">
        <div className="admin-form">
          <Text label="Small heading" value={p.intro.eyebrow} onChange={v => set("intro", { eyebrow: v })} />
          <div className="admin-form-row"><Text label="Title" value={p.intro.title} onChange={v => set("intro", { title: v })} /><Text label="Italic line" value={p.intro.accent} onChange={v => set("intro", { accent: v })} hint="Gold italics under the title. Leave empty to hide." /></div>
        </div>
      </Card>

      <Card title="2 · Main text & photo">
        <div className="admin-home-grid">
          <div className="admin-form">
            <Text label="Text" rows={8} value={p.main.body} onChange={v => set("main", { body: v })} hint="The first paragraph is shown larger. Blank line = new paragraph." />
            <LinkFields label="Button" value={p.main.cta} onChange={v => set("main", { cta: v })} />
          </div>
          <div className="admin-form">
            <ImageUpload label="Photo" folder="pages" value={p.main.image} onChange={v => set("main", { image: v })} onBusyChange={b => setUploads(n => Math.max(0, n + (b ? 1 : -1)))} />
            <Text label="Photo description (for screen readers & Google)" value={p.main.imageAlt} onChange={v => set("main", { imageAlt: v })} />
            <Text label="Photo caption" value={p.main.caption} onChange={v => set("main", { caption: v })} />
          </div>
        </div>
      </Card>

      <Card title="3 · Facebook">
        <div className="admin-form">
          <div className="admin-form-row"><Text label="Title" value={p.facebook.title} onChange={v => set("facebook", { title: v })} /><Text label="Button text" value={p.facebook.buttonLabel} onChange={v => set("facebook", { buttonLabel: v })} /></div>
          <Text label="Text" value={p.facebook.text} onChange={v => set("facebook", { text: v })} />
          <Text label="Facebook page link" value={p.facebook.url} onChange={v => set("facebook", { url: v.trim() })} hint="e.g. https://www.facebook.com/your-page — the button only appears once this is filled in." />
          {!p.facebook.url && <p className="admin-hint is-warn">No Facebook link yet — the button is hidden on the website.</p>}
        </div>
      </Card>

      {canEdit && <div className="admin-actions-row admin-home-foot">
        <button type="button" className="admin-button" onClick={() => setDraft(structuredClone(defaultPricing))}>Restore original content</button>
        {saveButton}
      </div>}
    </fieldset>
    {toast}
  </>;
}
