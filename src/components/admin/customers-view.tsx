"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlusIcon } from "@radix-ui/react-icons";
import { money } from "@/lib/catalog";
import { type Customer, newId, today, updateAdmin, useAdmin } from "@/lib/admin-store";
import { Badge, Card, ConfirmDelete, Field, FormDrawer, PageHeader, SearchBox, str, useToast } from "./admin-ui";
import { enquiryStatusLabel, formatDate, orderStatusLabel, orderTotal } from "./sample-data";

export function CustomersView() {
  const { customers, orders, enquiries } = useAdmin();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [editing, setEditing] = useState<Customer | "new" | null>(null);
  const { toast, run, notify } = useToast();

  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  const stats = (c: Customer) => {
    const own = orders.filter(o => same(o.email, c.email) && o.status !== "cancelled");
    return { orders: own, spent: own.filter(o => o.paid).reduce((sum, o) => sum + orderTotal(o), 0), enquiries: enquiries.filter(e => same(e.email, c.email)) };
  };
  const q = query.trim().toLowerCase();
  const rows = customers.filter(c => !q || `${c.name} ${c.email} ${c.location} ${c.phone}`.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  const current = editing && editing !== "new" ? editing : null;
  const currentStats = current ? stats(current) : null;

  return <>
    <PageHeader eyebrow="Customers" title="Customers" description="Everyone who has ordered or enquired." actions={<button type="button" className="admin-button is-primary" onClick={() => setEditing("new")}><PlusIcon aria-hidden="true" />Add customer</button>} />
    <Card flush>
      <div className="admin-toolbar"><p className="admin-muted">{customers.length} customers</p><SearchBox value={query} onChange={setQuery} label="Search name, email or town" /></div>
      <div className="admin-table-wrap"><table className="admin-table is-clickable">
        <thead><tr><th>Customer</th><th>Location</th><th className="num">Orders</th><th className="num">Enquiries</th><th className="num">Total paid</th></tr></thead>
        <tbody>
          {rows.map(c => { const s = stats(c); return <tr key={c.id} tabIndex={0} onClick={() => setEditing(c)} onKeyDown={e => { if (e.key === "Enter") setEditing(c); }}>
            <td><div className="admin-product"><span className="admin-avatar is-light" aria-hidden="true">{c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</span><span><strong>{c.name}</strong><small>{c.email}</small></span></div></td>
            <td>{c.location || <span className="admin-muted">—</span>}</td>
            <td className="num">{s.orders.length}</td>
            <td className="num">{s.enquiries.length}</td>
            <td className="num">{money(s.spent)}</td>
          </tr>; })}
          {!rows.length && <tr><td colSpan={5} className="admin-empty">No customers found.</td></tr>}
        </tbody>
      </table></div>
    </Card>

    <FormDrawer key={current?.id ?? (editing ? "new" : "closed")} open={!!editing} onOpenChange={o => { if (!o) setEditing(null); }} eyebrow="Customer" title={current?.name ?? "Add customer"} description={current ? `Customer since ${formatDate(current.createdAt)}` : undefined} submitLabel={current ? "Save customer" : "Add customer"}
      footerStart={current && <ConfirmDelete what={current.name} onConfirm={() => { const c = current; run(() => updateAdmin(s => ({ ...s, customers: s.customers.filter(x => x.id !== c.id) })), `${c.name} deleted. Their orders are kept.`); setEditing(null); }} />}
      onSubmit={data => {
        const name = str(data, "name"), email = str(data, "email").toLowerCase();
        if (!name) return "Name is required.";
        if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
        if (customers.some(c => same(c.email, email) && c.id !== current?.id)) return "Another customer already uses this email.";
        const patch = { name, email, phone: str(data, "phone"), location: str(data, "location"), notes: str(data, "notes") };
        if (current) updateAdmin(s => ({ ...s, customers: s.customers.map(c => c.id === current.id ? { ...c, ...patch } : c) }));
        else updateAdmin(s => ({ ...s, customers: [...s.customers, { id: newId("CU"), createdAt: today(), ...patch }] }));
        notify(`${name} saved.`);
      }}>
      <div className="admin-form">
        <Field label="Name"><input name="name" className="admin-input" required defaultValue={current?.name} /></Field>
        <div className="admin-form-row"><Field label="Email"><input name="email" type="email" className="admin-input" required defaultValue={current?.email} /></Field><Field label="Phone"><input name="phone" type="tel" className="admin-input" defaultValue={current?.phone} /></Field></div>
        <Field label="Location"><input name="location" className="admin-input" placeholder="Town, State" defaultValue={current?.location} /></Field>
        <Field label="Notes" hint="Horse details, seat size, preferences…"><textarea name="notes" className="admin-input" rows={3} defaultValue={current?.notes} /></Field>
      </div>
      {currentStats && <>
        <div className="admin-field-group"><h3>Orders · {money(currentStats.spent)} paid</h3>
          {currentStats.orders.length ? currentStats.orders.map(o => <Link key={o.id} href={`/admin/orders?q=${o.id}`} className="admin-line is-link"><span>{o.id} · {formatDate(o.date)}</span><Badge tone={o.status}>{orderStatusLabel[o.status]}</Badge></Link>) : <p className="admin-muted">No orders yet.</p>}
        </div>
        <div className="admin-field-group"><h3>Enquiries</h3>
          {currentStats.enquiries.length ? currentStats.enquiries.map(e => <div key={e.id} className="admin-line"><span>{e.topic} · {formatDate(e.date)}</span><Badge tone={e.status}>{enquiryStatusLabel[e.status]}</Badge></div>) : <p className="admin-muted">No enquiries.</p>}
        </div>
      </>}
    </FormDrawer>
    {toast}
  </>;
}
