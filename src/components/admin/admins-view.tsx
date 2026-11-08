"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { type AdminRole, type AdminUser, api, useAdminStatus } from "@/lib/admin-store";
import { Badge, Card, ConfirmDelete, Field, FormDrawer, PageHeader, SearchBox, str, useToast } from "./admin-ui";
import { formatDate } from "./sample-data";

export const roleLabel: Record<AdminRole, string> = { owner: "Owner", admin: "Admin", staff: "Staff" };
const roleTone: Record<AdminRole, string> = { owner: "custom", admin: "in-production", staff: "closed" };
const ROLES: AdminRole[] = ["owner", "admin", "staff"];

// Mirrors the server-side permissions in src/lib/server/admin-data.ts and the users API.
const permissions: { label: string; roles: AdminRole[] }[] = [
  { label: "View dashboard, orders & enquiries", roles: ["owner", "admin", "staff"] },
  { label: "Create orders, reply to enquiries", roles: ["owner", "admin", "staff"] },
  { label: "Edit products, stock & prices", roles: ["owner", "admin"] },
  { label: "Edit promotions & page content", roles: ["owner", "admin"] },
  { label: "Manage customers, upload images", roles: ["owner", "admin"] },
  { label: "Delete orders & enquiries", roles: ["owner", "admin"] },
  { label: "Manage admin users & settings", roles: ["owner"] },
];

export function AdminsView() {
  const { user: me } = useAdminStatus();
  const isOwner = me?.role === "owner";
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [query, setQuery] = useState("");
  const { toast, notify } = useToast();

  const refresh = useCallback(() => api<{ users: AdminUser[] }>("/api/admin/users").then(r => setUsers(r.users)).catch(err => setLoadError(err.message)), []);
  useEffect(() => { refresh(); }, [refresh]);

  const current = editing && editing !== "new" ? editing : null;
  const list = users ?? [];
  const q = query.trim().toLowerCase();
  const rows = list.filter(a => !q || `${a.name} ${a.email}`.toLowerCase().includes(q));
  const lastOwner = (a: AdminUser) => a.role === "owner" && a.active && list.filter(x => x.role === "owner" && x.active).length <= 1;

  // FormDrawer expects a synchronous handler, so we validate here, then save in the background.
  const save = (data: FormData): string | void => {
    const password = str(data, "password");
    const body = { name: str(data, "name"), email: str(data, "email"), role: str(data, "role"), active: data.get("active") === "on", password: password || undefined };
    if (!body.name) return "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(body.email)) return "Enter a valid email address.";
    if (!current && password.length < 10) return "Set a temporary password of at least 10 characters.";
    if (current && password && password.length < 10) return "New password must be at least 10 characters.";
    if (current && lastOwner(current) && (body.role !== "owner" || !body.active)) return "There must be at least one active owner. Make someone else an owner first.";
    const request = current ? api(`/api/admin/users/${current.id}`, { method: "PATCH", body: JSON.stringify(body) }) : api("/api/admin/users", { method: "POST", body: JSON.stringify(body) });
    request.then(() => { notify(current ? `${body.name} saved.` : `${body.name} added. Share the temporary password with them.`); refresh(); })
      .catch(err => notify(`Not saved: ${err.message}`));
  };

  return <>
    <PageHeader eyebrow="Account" title="Admin users" description="Who can sign in to the admin panel and what they can do." actions={isOwner && <button type="button" className="admin-button is-primary" onClick={() => setEditing("new")}><PlusIcon aria-hidden="true" />Add admin</button>} />
    {!isOwner && <p className="admin-notice">Only owners can add or change admin users.</p>}

    <div className="admin-grid-2">
      <Card flush>
        <div className="admin-toolbar"><p className="admin-muted">{users ? `${list.length} users · ${list.filter(a => a.active).length} active` : "Loading…"}</p><SearchBox value={query} onChange={setQuery} label="Search admin users" /></div>
        <div className="admin-table-wrap"><table className={`admin-table${isOwner ? " is-clickable" : ""}`}>
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last active</th></tr></thead>
          <tbody>
            {rows.map(a => <tr key={a.id} tabIndex={isOwner ? 0 : undefined} onClick={() => isOwner && setEditing(a)} onKeyDown={e => { if (isOwner && e.key === "Enter") setEditing(a); }}>
              <td><div className="admin-product"><span className="admin-avatar is-light" aria-hidden="true">{a.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</span><span><strong>{a.name}{a.id === me?.id && <span className="admin-you"> (you)</span>}</strong><small>{a.email}</small></span></div></td>
              <td><Badge tone={roleTone[a.role]}>{roleLabel[a.role]}</Badge></td>
              <td><Badge tone={a.active ? "shipped" : "closed"}>{a.active ? "Active" : "Deactivated"}</Badge></td>
              <td>{a.lastActive ? formatDate(a.lastActive) : <span className="admin-muted">Never</span>}</td>
            </tr>)}
            {users && !rows.length && <tr><td colSpan={4} className="admin-empty">No admin users found.</td></tr>}
            {loadError && <tr><td colSpan={4} className="admin-empty" role="alert">{loadError}</td></tr>}
          </tbody>
        </table></div>
      </Card>

      <Card title="Role permissions">
        <table className="admin-perm">
          <thead><tr><th><span className="sr-only">Permission</span></th>{ROLES.map(r => <th key={r}>{roleLabel[r]}</th>)}</tr></thead>
          <tbody>{permissions.map(p => <tr key={p.label}><td>{p.label}</td>{ROLES.map(r => <td key={r}>{p.roles.includes(r) ? <CheckIcon className="is-yes" aria-label="Allowed" /> : <Cross2Icon className="is-no" aria-label="Not allowed" />}</td>)}</tr>)}</tbody>
        </table>
      </Card>
    </div>

    <FormDrawer key={current?.id ?? (editing ? "new" : "closed")} open={!!editing} onOpenChange={o => { if (!o) setEditing(null); }} eyebrow="Admin user" title={current?.name ?? "Add admin user"} description={current ? `Added ${formatDate(current.invitedAt)}` : "Set a temporary password and share it with them privately."} submitLabel={current ? "Save user" : "Add user"}
      footerStart={current && (lastOwner(current) ? <span className="admin-hint">The only owner can’t be removed.</span> : current.id === me?.id ? <span className="admin-hint">You can’t delete yourself.</span>
        : <ConfirmDelete what={current.name} onConfirm={() => { const a = current; setEditing(null); api(`/api/admin/users/${a.id}`, { method: "DELETE" }).then(() => { notify(`${a.name} removed.`); refresh(); }).catch(err => notify(`Not removed: ${err.message}`)); }} />)}
      onSubmit={save}>
      <div className="admin-form">
        <Field label="Name"><input name="name" className="admin-input" required defaultValue={current?.name} /></Field>
        <Field label="Email" hint="Used to sign in."><input name="email" type="email" className="admin-input" required defaultValue={current?.email} /></Field>
        <Field label={current ? "Reset password (optional)" : "Temporary password"} hint={current ? "Leave blank to keep their password. Resetting signs them out everywhere." : "At least 10 characters. They can change it in Settings after signing in."}>
          <input name="password" type="password" className="admin-input" autoComplete="new-password" minLength={10} required={!current} />
        </Field>
        <fieldset className="admin-roles"><legend>Role</legend>
          {ROLES.map(r => <label key={r} className="admin-role-option"><input type="radio" name="role" value={r} defaultChecked={(current?.role ?? "staff") === r} /><span><strong>{roleLabel[r]}</strong><small>{r === "owner" ? "Full access, including admin users and settings." : r === "admin" ? "Manage products, content, customers and orders." : "Day-to-day: orders and enquiries."}</small></span></label>)}
        </fieldset>
        <label className="admin-check"><input type="checkbox" name="active" defaultChecked={current ? current.active : true} />Account active <span className="admin-muted">(deactivating signs them out)</span></label>
      </div>
    </FormDrawer>
    {toast}
  </>;
}
