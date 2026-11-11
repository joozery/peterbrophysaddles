"use client";

import { useState } from "react";
import { Switch } from "radix-ui";
import { ArrowDownIcon, ArrowUpIcon, ExternalLinkIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import { type Review, type ReviewLayout, type TestimonialsContent, defaultTestimonials, updateAdmin, useAdmin, useAdminStatus } from "@/lib/admin-store";
import { Badge, Card, ConfirmDelete, Field, FormDrawer, PageHeader, SearchBox, move, str, useToast } from "./admin-ui";
import { Text } from "./home-view";

const MAX_REVIEWS = 40;
const layouts: Record<ReviewLayout, { label: string; short: string; tone: string }> = {
  featured: { label: "Featured story — large dark block at the top", short: "Featured", tone: "ready" },
  wide: { label: "Wide dark card — spans two columns", short: "Wide", tone: "in-production" },
  standard: { label: "Standard card", short: "Standard", tone: "closed" },
};
const blankReview = (): Review => ({ name: "", tag: "", headline: "", body: "", badge: "", layout: "standard", visible: true });
const excerpt = (text: string, n = 90) => { const t = text.replace(/\s+/g, " ").trim(); return t.length > n ? `${t.slice(0, n).trimEnd()}…` : t; };

/** Page heading (title, gold line, intro). Kept as a small draft form with its own Save. */
function IntroCard({ intro, canEdit }: { intro: TestimonialsContent["intro"]; canEdit: boolean }) {
  const [draft, setDraft] = useState<TestimonialsContent["intro"] | null>(null);
  const { toast, run } = useToast();
  const v = draft ?? intro;
  const set = (patch: Partial<typeof v>) => setDraft({ ...v, ...patch });
  return <Card title="Page heading" action={canEdit && <div className="admin-row-actions">
    <button type="button" className="admin-button" disabled={!draft} onClick={() => setDraft(null)}>Discard</button>
    <button type="button" className="admin-button is-primary" disabled={!draft} onClick={() => run(() => { updateAdmin(s => ({ ...s, testimonials: { ...s.testimonials, intro: v } })); setDraft(null); }, "Heading saved.")}>Save</button>
  </div>}>
    <fieldset className="admin-fieldset admin-form" disabled={!canEdit}>
      <div className="admin-form-row"><Text label="Small heading" value={v.eyebrow} onChange={x => set({ eyebrow: x })} /><Text label="Title" value={v.title} onChange={x => set({ title: x })} /></div>
      <div className="admin-form-row"><Text label="Gold italic line" value={v.accent} onChange={x => set({ accent: x })} hint="Shown under the title. Leave empty to hide." /><Text label="Intro text" rows={2} value={v.text} onChange={x => set({ text: x })} /></div>
    </fieldset>
    {toast}
  </Card>;
}

export function TestimonialsView() {
  const { testimonials } = useAdmin();
  const { user } = useAdminStatus();
  const canEdit = user?.role === "owner" || user?.role === "admin";
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [query, setQuery] = useState("");
  const { toast, run } = useToast();
  const items = testimonials.reviews.items;

  /** Every change in the table saves immediately (like Products). */
  const saveItems = (next: Review[], message: string) => run(() => updateAdmin(s => ({ ...s, testimonials: { ...s.testimonials, reviews: { items: next } } })), message);

  const q = query.trim().toLowerCase();
  const rows = items.map((r, index) => ({ r, index })).filter(({ r }) => !q || [r.name, r.tag, r.headline, r.body].some(x => x.toLowerCase().includes(q)));
  const shown = items.filter(r => r.visible).length;
  const current = editing === "new" ? blankReview() : editing !== null ? items[editing] : null;

  return <>
    <PageHeader eyebrow="Website" title="Testimonials" description="Customer reviews on the Testimonials page. Changes in the table go live straight away. The quote banner at the top of the page is edited under Home page → Testimonial."
      actions={<><a className="admin-button" href="/testimonials" target="_blank" rel="noreferrer"><ExternalLinkIcon aria-hidden="true" />View page</a>
        {canEdit && <button type="button" className="admin-button is-primary" disabled={items.length >= MAX_REVIEWS} onClick={() => setEditing("new")}><PlusIcon aria-hidden="true" />Add review</button>}</>} />
    {!canEdit && <p className="admin-notice">Only owners and admins can edit this page.</p>}

    <div className="admin-stack">
      <Card flush>
        <div className="admin-toolbar"><p className="admin-muted">{items.length} reviews · {shown} shown on website</p><SearchBox value={query} onChange={setQuery} label="Search reviews" /></div>
        <div className="admin-table-wrap"><table className="admin-table admin-reviews">
          <thead><tr><th className="num">#</th><th>Customer</th><th>Highlight</th><th>Layout</th><th>Show</th><th className="num"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{rows.map(({ r, index }) => <tr key={index} className={r.visible ? undefined : "is-muted"}>
            <td className="num admin-muted">{String(index + 1).padStart(2, "0")}</td>
            <td><div className="admin-product">
              <span className="admin-review-monogram" aria-hidden="true">{r.name.trim()[0] ?? "?"}</span>
              <span><strong>{r.name || "Unnamed"}</strong><small>{r.tag || "—"}</small></span>
            </div></td>
            <td className="admin-review-quote">
              <span>“{excerpt(r.headline || r.body, 70)}”</span>
              <small>{r.body.trim() ? `${r.body.trim().split(/\s+/).length} words` : "Short review — highlight only"}{r.badge && <> · <span className="admin-review-badge">{r.badge}</span></>}</small>
            </td>
            <td><Badge tone={layouts[r.layout].tone}>{layouts[r.layout].short}</Badge></td>
            <td><Switch.Root className="admin-switch" aria-label={`Show ${r.name} on website`} checked={r.visible} disabled={!canEdit} onCheckedChange={v => saveItems(items.map((x, j) => j === index ? { ...x, visible: v } : x), v ? `${r.name} is now shown.` : `${r.name} is now hidden.`)}><Switch.Thumb className="admin-switch-thumb" /></Switch.Root></td>
            <td className="num">{canEdit && <div className="admin-row-actions">
              <button type="button" className="admin-icon-button" aria-label={`Move ${r.name} up`} disabled={index === 0 || !!q} onClick={() => saveItems(move(items, index, index - 1), "Order updated.")}><ArrowUpIcon /></button>
              <button type="button" className="admin-icon-button" aria-label={`Move ${r.name} down`} disabled={index === items.length - 1 || !!q} onClick={() => saveItems(move(items, index, index + 1), "Order updated.")}><ArrowDownIcon /></button>
              <button type="button" className="admin-icon-button" aria-label={`Edit ${r.name}`} onClick={() => setEditing(index)}><Pencil1Icon /></button>
              <ConfirmDelete compact what={`${r.name || "this"} review`} onConfirm={() => saveItems(items.filter((_, j) => j !== index), "Review deleted.")} />
            </div>}</td>
          </tr>)}
          {!rows.length && <tr><td colSpan={6} className="admin-empty">{items.length ? "No reviews match your search." : "No reviews yet — the reviews section is hidden on the website."}</td></tr>}</tbody>
        </table></div>
      </Card>

      <IntroCard intro={testimonials.intro} canEdit={canEdit} />

      {canEdit && <div className="admin-actions-row">
        <button type="button" className="admin-button" onClick={() => saveItems(structuredClone(defaultTestimonials.reviews.items), "Original reviews restored.")}>Restore original reviews</button>
      </div>}
    </div>

    <FormDrawer key={String(editing)} open={current !== null} onOpenChange={open => !open && setEditing(null)}
      eyebrow="Testimonials" title={editing === "new" ? "Add review" : `Edit ${current?.name || "review"}`} description="Saves and goes live straight away."
      submitLabel={editing === "new" ? "Add review" : "Save review"}
      onSubmit={data => {
        const layout = str(data, "layout") as ReviewLayout;
        const next: Review = { name: str(data, "name"), tag: str(data, "tag"), headline: str(data, "headline"), body: String(data.get("body") ?? "").trim(), badge: str(data, "badge"), layout: layout in layouts ? layout : "standard", visible: data.get("visible") === "on" };
        if (!next.name) return "Please enter the customer’s name.";
        if (!next.headline && !next.body) return "Add a highlight quote or the full review.";
        if (next.layout === "featured" && !next.body) return "A featured story needs the full review text.";
        if (editing === "new") saveItems([...items, next], "Review added.");
        else if (typeof editing === "number") saveItems(items.map((x, j) => j === editing ? next : x), "Review saved.");
      }}>
      {current && <div className="admin-form">
        <div className="admin-form-row">
          <Field label="Customer name"><input name="name" className="admin-input" required maxLength={80} defaultValue={current.name} /></Field>
          <Field label="Saddle / place" hint="e.g. Cutting saddle, Scotland"><input name="tag" className="admin-input" maxLength={120} defaultValue={current.tag} /></Field>
        </div>
        <Field label="Highlight quote" hint="Short line shown large. For very short reviews put the whole review here and leave the full review empty."><textarea name="headline" className="admin-input" rows={2} maxLength={300} defaultValue={current.headline} /></Field>
        <Field label="Full review" hint="Without quotation marks. Blank line = new paragraph."><textarea name="body" className="admin-input" rows={10} maxLength={6000} defaultValue={current.body} /></Field>
        <div className="admin-form-row">
          <Field label="Layout"><select name="layout" className="admin-input" defaultValue={current.layout}>{Object.entries(layouts).map(([v, l]) => <option key={v} value={v}>{l.label}</option>)}</select></Field>
          <Field label="Badge (optional)" hint="Small gold label, e.g. “From a fellow saddle maker”."><input name="badge" className="admin-input" maxLength={80} defaultValue={current.badge} /></Field>
        </div>
        <label className="admin-check"><input type="checkbox" name="visible" defaultChecked={current.visible} />Show on website</label>
      </div>}
    </FormDrawer>
    {toast}
  </>;
}
