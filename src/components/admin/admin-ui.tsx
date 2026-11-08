"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AlertDialog, Dialog } from "radix-ui";
import { Cross2Icon, MagnifyingGlassIcon, TrashIcon } from "@radix-ui/react-icons";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="admin-page-header">
    <div>{eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="admin-muted">{description}</p>}</div>
    {actions && <div className="admin-page-actions">{actions}</div>}
  </div>;
}

export function StatCard({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "warn" | "good" }) {
  return <div className="admin-card admin-stat"><p className="admin-stat-label">{label}</p><p className="admin-stat-value">{value}</p>{note && <p className={`admin-stat-note${tone ? ` is-${tone}` : ""}`}>{note}</p>}</div>;
}

export function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`admin-badge tone-${tone}`}>{children}</span>;
}

export function Card({ title, action, children, flush }: { title?: string; action?: ReactNode; children: ReactNode; flush?: boolean }) {
  return <section className={`admin-card${flush ? " is-flush" : ""}`}>
    {(title || action) && <div className="admin-card-head">{title && <h2>{title}</h2>}{action}</div>}
    {children}
  </section>;
}

export function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return <label className="admin-search"><MagnifyingGlassIcon aria-hidden="true" /><input type="search" placeholder={label} aria-label={label} value={value} onChange={e => onChange(e.target.value)} /></label>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="admin-label">{label}{children}{hint && <small className="admin-hint">{hint}</small>}</label>;
}

/** Side drawer holding a form. `onSubmit` receives the form's FormData; return a string to show an error and keep the drawer open. */
export function FormDrawer({ open, onOpenChange, eyebrow, title, description, children, onSubmit, submitLabel = "Save", footerStart, submitDisabled }: {
  open: boolean; onOpenChange: (open: boolean) => void; eyebrow?: string; title: string; description?: string; children: ReactNode;
  onSubmit?: (data: FormData) => string | void; submitLabel?: string; footerStart?: ReactNode; submitDisabled?: boolean;
}) {
  const [error, setError] = useState("");
  const change = (next: boolean) => { if (!next) setError(""); onOpenChange(next); };
  return <Dialog.Root open={open} onOpenChange={change}>
    <Dialog.Portal><Dialog.Overlay className="admin-overlay" /><Dialog.Content className="admin-drawer">
      <form className="admin-drawer-form" onSubmit={e => {
        e.preventDefault();
        if (!onSubmit) return;
        try { const result = onSubmit(new FormData(e.currentTarget)); if (result) setError(result); else change(false); }
        catch (err) { setError(err instanceof Error ? err.message : "Could not save. Browser storage may be full or blocked."); }
      }}>
        <div className="admin-drawer-head"><div>{eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}<Dialog.Title>{title}</Dialog.Title>{description ? <Dialog.Description className="admin-muted">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}</div><Dialog.Close type="button" className="admin-icon-button" aria-label="Close"><Cross2Icon /></Dialog.Close></div>
        <div className="admin-drawer-body">{children}</div>
        {error && <p role="alert" className="admin-form-error">{error}</p>}
        <div className="admin-drawer-foot">{footerStart && <div className="admin-foot-start">{footerStart}</div>}<Dialog.Close type="button" className="admin-button">Cancel</Dialog.Close>{onSubmit && <button type="submit" className="admin-button is-primary" disabled={submitDisabled}>{submitDisabled ? "Uploading…" : submitLabel}</button>}</div>
      </form>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}

/** Delete button guarded by a confirmation dialog. */
export function ConfirmDelete({ what, onConfirm, compact }: { what: string; onConfirm: () => void; compact?: boolean }) {
  return <AlertDialog.Root>
    <AlertDialog.Trigger asChild>{compact ? <button type="button" className="admin-icon-button is-danger" aria-label={`Delete ${what}`}><TrashIcon /></button> : <button type="button" className="admin-button is-danger"><TrashIcon aria-hidden="true" />Delete</button>}</AlertDialog.Trigger>
    <AlertDialog.Portal><AlertDialog.Overlay className="admin-overlay is-top" /><AlertDialog.Content className="admin-confirm">
      <AlertDialog.Title>Delete {what}?</AlertDialog.Title>
      <AlertDialog.Description className="admin-muted">This permanently deletes it from the database. It can’t be undone.</AlertDialog.Description>
      <div className="admin-actions-row"><AlertDialog.Cancel className="admin-button">Cancel</AlertDialog.Cancel><AlertDialog.Action className="admin-button is-danger-solid" onClick={onConfirm}>Delete</AlertDialog.Action></div>
    </AlertDialog.Content></AlertDialog.Portal>
  </AlertDialog.Root>;
}

/** Small transient status message. */
export function useToast() {
  const [message, setMessage] = useState("");
  useEffect(() => { if (!message) return; const t = setTimeout(() => setMessage(""), 3200); return () => clearTimeout(t); }, [message]);
  const toast = <p role="status" aria-live="polite" className={`admin-toast${message ? " is-visible" : ""}`}>{message}</p>;
  /** Runs an action, showing `success` or the error message. */
  const run = (action: () => void, success: string) => {
    try { action(); setMessage(success); } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save."); }
  };
  return { toast, notify: setMessage, run };
}

export const str = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
/** Parse a dollar amount like "3,200.50" into cents; returns NaN when invalid. */
export const dollarsToCents = (value: string) => { const n = Number(value.replace(/[,$\s]/g, "")); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN; };
