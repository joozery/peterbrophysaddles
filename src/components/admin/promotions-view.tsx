"use client";

import Image from "next/image";
import { useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { Switch } from "radix-ui";
import { money } from "@/lib/catalog";
import { type DiscountCode, type Promotion, defaultPromotion, newId, today, updateAdmin, useAdmin } from "@/lib/admin-store";
import { Badge, Card, ConfirmDelete, Field, FormDrawer, PageHeader, dollarsToCents, str, useToast } from "./admin-ui";
import { formatDate } from "./sample-data";
import { ImageUpload, isImageSrc } from "./image-upload";

export function PromotionsView() {
  const { promotion, discountCodes } = useAdmin();
  const [draft, setDraft] = useState<Promotion | null>(null);
  const [editingCode, setEditingCode] = useState<DiscountCode | "new" | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast, run, notify } = useToast();
  const p = draft ?? promotion;
  const set = <K extends keyof Promotion>(key: K, value: Promotion[K]) => setDraft({ ...p, [key]: value });
  const code = editingCode && editingCode !== "new" ? editingCode : null;

  return <>
    <PageHeader eyebrow="Marketing" title="Promotions" description="The home page popup and discount codes." />

    <div className="admin-grid-2 is-even">
      <Card title="Home page popup" action={<label className="admin-switch-label">{p.enabled ? "Showing" : "Off"}<Switch.Root className="admin-switch" checked={p.enabled} onCheckedChange={v => set("enabled", v)} aria-label="Show popup on the home page"><Switch.Thumb className="admin-switch-thumb" /></Switch.Root></label>}>
        <div className="admin-form">
          <div className="admin-form-row"><Field label="Small heading"><input className="admin-input" value={p.eyebrow} onChange={e => set("eyebrow", e.target.value)} /></Field><Field label="Highlight"><input className="admin-input" value={p.highlight} onChange={e => set("highlight", e.target.value)} placeholder="10% off" /></Field></div>
          <Field label="Title"><input className="admin-input" value={p.title} onChange={e => set("title", e.target.value)} /></Field>
          <Field label="Description"><textarea className="admin-input" rows={3} value={p.description} onChange={e => set("description", e.target.value)} /></Field>
          <div className="admin-form-row"><Field label="Button text"><input className="admin-input" value={p.ctaLabel} onChange={e => set("ctaLabel", e.target.value)} /></Field><Field label="Button link"><input className="admin-input" value={p.ctaHref} onChange={e => set("ctaHref", e.target.value)} placeholder="/contact" /></Field></div>
          <ImageUpload label="Popup image" folder="promotions" value={p.image} onChange={url => set("image", url)} onBusyChange={setUploading} />
          <div className="admin-form-row"><Field label="Delay (seconds)"><input className="admin-input" type="number" min={0} max={30} step={0.5} value={p.delaySeconds} onChange={e => set("delaySeconds", Number(e.target.value))} /></Field></div>
          <Field label="Small print"><input className="admin-input" value={p.terms} onChange={e => set("terms", e.target.value)} /></Field>
          <div className="admin-actions-row">
            <button type="button" className="admin-button" onClick={() => setDraft({ ...defaultPromotion })}>Restore default</button>
            <button type="button" className="admin-button" disabled={!draft} onClick={() => setDraft(null)}>Discard</button>
            <button type="button" className="admin-button is-primary" disabled={!draft || uploading} onClick={() => {
              if (!p.ctaHref.startsWith("/")) return notify("Button link must be a page on this site, starting with /.");
              if (!isImageSrc(p.image)) return notify("Add a popup image (upload, or a path starting with / or https://).");
              if (!(p.delaySeconds >= 0 && p.delaySeconds <= 30)) return notify("Delay must be between 0 and 30 seconds.");
              run(() => { updateAdmin(s => ({ ...s, promotion: p })); setDraft(null); }, "Popup saved. Open the home page in a new tab to see it.");
            }}>Save popup</button>
          </div>
        </div>
      </Card>

      <div className="admin-stack">
        <Card title="Preview">
          <div className={`admin-promo-preview${p.enabled ? "" : " is-off"}`}>
            <div className="admin-promo-photo">{isImageSrc(p.image) && <Image src={p.image} alt="" fill sizes="200px" unoptimized />}</div>
            <div className="admin-promo-copy"><small>{p.eyebrow}</small><strong><span>{p.highlight}</span>{p.title}</strong><p>{p.description}</p><em>{p.ctaLabel} ›</em></div>
          </div>
          {!p.enabled && <p className="admin-hint">The popup is switched off and won’t show on the home page.</p>}
          {draft && <p className="admin-hint is-warn">Unsaved changes</p>}
        </Card>

        <Card title="Discount codes" flush action={<button type="button" className="admin-button" onClick={() => setEditingCode("new")}><PlusIcon aria-hidden="true" />New code</button>}>
          <div className="admin-table-wrap"><table className="admin-table is-clickable">
            <thead><tr><th>Code</th><th>Discount</th><th>Status</th><th className="num">Uses</th></tr></thead>
            <tbody>
              {discountCodes.map(d => { const expired = !!d.expires && d.expires < today(); return <tr key={d.id} tabIndex={0} onClick={() => setEditingCode(d)} onKeyDown={e => { if (e.key === "Enter") setEditingCode(d); }}>
                <td><strong className="admin-code">{d.code}</strong>{d.expires && <small>Until {formatDate(d.expires)}</small>}</td>
                <td>{d.type === "percent" ? `${d.value}%` : money(d.value)}</td>
                <td><Badge tone={expired ? "cancelled" : d.active ? "shipped" : "closed"}>{expired ? "Expired" : d.active ? "Active" : "Paused"}</Badge></td>
                <td className="num">{d.uses}</td>
              </tr>; })}
              {!discountCodes.length && <tr><td colSpan={4} className="admin-empty">No discount codes yet.</td></tr>}
            </tbody>
          </table></div>
          <p className="admin-hint admin-card-foot">Codes are stored for reference — checkout doesn’t apply them yet.</p>
        </Card>
      </div>
    </div>

    <FormDrawer key={code?.id ?? (editingCode ? "new" : "closed")} open={!!editingCode} onOpenChange={o => { if (!o) setEditingCode(null); }} eyebrow="Discount code" title={code?.code ?? "New discount code"} submitLabel={code ? "Save code" : "Create code"}
      footerStart={code && <ConfirmDelete what={`code ${code.code}`} onConfirm={() => { const c = code; run(() => updateAdmin(s => ({ ...s, discountCodes: s.discountCodes.filter(x => x.id !== c.id) })), `${c.code} deleted.`); setEditingCode(null); }} />}
      onSubmit={data => {
        const codeText = str(data, "code").toUpperCase().replace(/\s+/g, "");
        const type = str(data, "type") as DiscountCode["type"];
        const raw = str(data, "value");
        const value = type === "percent" ? Number(raw) : dollarsToCents(raw);
        if (!/^[A-Z0-9_-]{3,20}$/.test(codeText)) return "Code must be 3–20 letters, numbers, - or _.";
        if (discountCodes.some(d => d.code === codeText && d.id !== code?.id)) return "That code already exists.";
        if (type === "percent" ? !(Number.isInteger(value) && value >= 1 && value <= 100) : !(value > 0)) return type === "percent" ? "Percent must be a whole number from 1 to 100." : "Amount must be greater than $0.";
        const patch = { code: codeText, type, value, active: data.get("active") === "on", expires: str(data, "expires") };
        if (code) updateAdmin(s => ({ ...s, discountCodes: s.discountCodes.map(d => d.id === code.id ? { ...d, ...patch } : d) }));
        else updateAdmin(s => ({ ...s, discountCodes: [...s.discountCodes, { id: newId("DC"), uses: 0, ...patch }] }));
        notify(`${codeText} saved.`);
      }}>
      <div className="admin-form">
        <Field label="Code"><input name="code" className="admin-input admin-code" required defaultValue={code?.code} placeholder="SPRING10" /></Field>
        <div className="admin-form-row">
          <Field label="Type"><select name="type" className="admin-input" defaultValue={code?.type ?? "percent"}><option value="percent">Percent off</option><option value="fixed">Fixed amount (AUD)</option></select></Field>
          <Field label="Value" hint="10 = 10% or $10"><input name="value" inputMode="decimal" className="admin-input" required defaultValue={code ? (code.type === "percent" ? code.value : (code.value / 100).toFixed(2)) : ""} /></Field>
        </div>
        <Field label="Expires (optional)"><input name="expires" type="date" className="admin-input" defaultValue={code?.expires} /></Field>
        <label className="admin-check"><input type="checkbox" name="active" defaultChecked={code ? code.active : true} />Active</label>
      </div>
    </FormDrawer>
    {toast}
  </>;
}
