"use client";

import { useState } from "react";
import { Switch } from "radix-ui";
import { type Settings, api, updateAdmin, useAdmin, useAdminStatus } from "@/lib/admin-store";
import { Card, Field, PageHeader, useToast } from "./admin-ui";

const toggles: { key: "notifyOrders" | "notifyEnquiries" | "showPrices"; label: string }[] = [
  { key: "notifyOrders", label: "Email me when a new order is placed" },
  { key: "notifyEnquiries", label: "Email me when a new enquiry arrives" },
  { key: "showPrices", label: "Show prices on the public shop" },
];

function PasswordCard() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  return <Card title="Your password">
    <form className="admin-form" onSubmit={async e => {
      e.preventDefault();
      const form = e.currentTarget;
      const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
      if (data.next !== data.confirm) return setMessage({ ok: false, text: "New passwords don’t match." });
      setBusy(true); setMessage(null);
      try { await api("/api/admin/auth/password", { method: "POST", body: JSON.stringify({ current: data.current, next: data.next }) }); form.reset(); setMessage({ ok: true, text: "Password changed." }); }
      catch (err) { setMessage({ ok: false, text: err instanceof Error ? err.message : "Could not change password." }); }
      finally { setBusy(false); }
    }}>
      <Field label="Current password"><input name="current" type="password" className="admin-input" required autoComplete="current-password" /></Field>
      <div className="admin-form-row">
        <Field label="New password"><input name="next" type="password" className="admin-input" required minLength={10} autoComplete="new-password" /></Field>
        <Field label="Confirm new password"><input name="confirm" type="password" className="admin-input" required minLength={10} autoComplete="new-password" /></Field>
      </div>
      {message && <p role="status" className={message.ok ? "admin-hint is-good" : "admin-form-error is-inline"}>{message.text}</p>}
      <div className="admin-actions-row"><button type="submit" className="admin-button is-primary" disabled={busy}>{busy ? "Saving…" : "Change password"}</button></div>
    </form>
  </Card>;
}

export function SettingsView() {
  const { settings } = useAdmin();
  const { user } = useAdminStatus();
  const canEdit = user?.role === "owner";
  const [draft, setDraft] = useState<Settings | null>(null);
  const { toast, run, notify } = useToast();
  const s = draft ?? settings;
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setDraft({ ...s, [key]: value });

  const save = () => {
    if (!s.businessName.trim()) return notify("Business name is required.");
    if (s.email && !/^\S+@\S+\.\S+$/.test(s.email)) return notify("Enter a valid contact email.");
    run(() => { updateAdmin(state => ({ ...state, settings: { ...s, businessName: s.businessName.trim(), email: s.email.trim() } })); setDraft(null); }, "Settings saved.");
  };

  return <>
    <PageHeader eyebrow="Account" title="Settings" description="Business details, preferences and your password." actions={canEdit && <>
      <button type="button" className="admin-button" disabled={!draft} onClick={() => setDraft(null)}>Discard</button>
      <button type="button" className="admin-button is-primary" disabled={!draft} onClick={save}>Save settings</button>
    </>} />
    {!canEdit && <p className="admin-notice">Only owners can change business settings. You can still change your own password below.</p>}
    <div className="admin-grid-2 is-even">
      <Card title="Business details">
        <fieldset className="admin-form admin-fieldset" disabled={!canEdit}>
          <Field label="Business name"><input className="admin-input" value={s.businessName} onChange={e => set("businessName", e.target.value)} /></Field>
          <Field label="Contact email"><input className="admin-input" type="email" placeholder="hello@example.com" value={s.email} onChange={e => set("email", e.target.value)} /></Field>
          <Field label="Phone"><input className="admin-input" type="tel" placeholder="04xx xxx xxx" value={s.phone} onChange={e => set("phone", e.target.value)} /></Field>
          <Field label="Workshop address"><textarea className="admin-input" rows={3} placeholder="Street, town, state, postcode" value={s.address} onChange={e => set("address", e.target.value)} /></Field>
        </fieldset>
      </Card>
      <div className="admin-stack">
        <Card title="Notifications & display">
          <ul className="admin-toggles">{toggles.map(t => <li key={t.key}><label htmlFor={t.key}>{t.label}</label><Switch.Root id={t.key} className="admin-switch" checked={s[t.key]} disabled={!canEdit} onCheckedChange={v => set(t.key, v)}><Switch.Thumb className="admin-switch-thumb" /></Switch.Root></li>)}</ul>
          <p className="admin-hint">Email notifications start working once email sending is connected.</p>
        </Card>
        <PasswordCard />
      </div>
    </div>
    {toast}
  </>;
}
