"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlusIcon } from "@radix-ui/react-icons";
import { money } from "@/lib/catalog";
import { type OrderWithNote, newId, today, updateAdmin, useAdmin } from "@/lib/admin-store";
import { Badge, Card, ConfirmDelete, Field, FormDrawer, PageHeader, SearchBox, str, useToast } from "./admin-ui";
import { type OrderStatus, formatDate, orderStatusLabel, orderTotal } from "./sample-data";

const filters: ("all" | OrderStatus)[] = ["all", "pending", "in-production", "ready", "shipped", "cancelled"];

function downloadCsv(orders: OrderWithNote[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [["Order", "Date", "Customer", "Email", "Location", "Items", "Status", "Paid", "Total AUD"], ...orders.map(o => [o.id, o.date, o.customer, o.email, o.location, o.items.map(i => `${i.name} x${i.quantity}`).join("; "), orderStatusLabel[o.status], o.paid ? "Yes" : "No", (orderTotal(o) / 100).toFixed(2)])];
  const url = URL.createObjectURL(new Blob([rows.map(r => r.map(esc).join(",")).join("\n")], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `orders-${today()}.csv` });
  a.click(); URL.revokeObjectURL(url);
}

export function OrdersView() {
  const { orders, products, customers } = useAdmin();
  const params = useSearchParams();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [editing, setEditing] = useState<OrderWithNote | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast, run } = useToast();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(o => (filter === "all" || o.status === filter) && (!q || `${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q)));
  }, [orders, filter, query]);
  const sellable = products.filter(p => !p.custom);

  return <>
    <PageHeader eyebrow="Sales" title="Orders" description="Track every saddle from order to delivery." actions={<>
      <button type="button" className="admin-button" onClick={() => downloadCsv(rows)} disabled={!rows.length}>Export CSV</button>
      <button type="button" className="admin-button is-primary" onClick={() => setCreating(true)}><PlusIcon aria-hidden="true" />New order</button>
    </>} />
    <Card flush>
      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label="Filter by status">
          {filters.map(f => <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All" : orderStatusLabel[f]}<span>{f === "all" ? orders.length : orders.filter(o => o.status === f).length}</span></button>)}
        </div>
        <SearchBox value={query} onChange={setQuery} label="Search orders or customers" />
      </div>
      <div className="admin-table-wrap"><table className="admin-table is-clickable">
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Status</th><th className="num">Total</th></tr></thead>
        <tbody>
          {rows.map(o => <tr key={o.id} tabIndex={0} onClick={() => setEditing(o)} onKeyDown={e => { if (e.key === "Enter") setEditing(o); }}>
            <td><strong>{o.id}</strong><small>{formatDate(o.date)}</small></td>
            <td>{o.customer}<small>{o.location}</small></td>
            <td>{o.items.map(i => `${i.name}${i.quantity > 1 ? ` × ${i.quantity}` : ""}`).join(", ")}</td>
            <td><Badge tone={o.paid ? "paid" : "unpaid"}>{o.paid ? "Paid" : "Unpaid"}</Badge></td>
            <td><Badge tone={o.status}>{orderStatusLabel[o.status]}</Badge></td>
            <td className="num">{money(orderTotal(o))}</td>
          </tr>)}
          {!rows.length && <tr><td colSpan={6} className="admin-empty">No orders match this filter.</td></tr>}
        </tbody>
      </table></div>
    </Card>

    {/* Edit order */}
    <FormDrawer open={!!editing} onOpenChange={o => { if (!o) setEditing(null); }} eyebrow="Order" title={editing?.id ?? ""} description={editing ? `Placed ${formatDate(editing.date)}` : undefined}
      footerStart={editing && <ConfirmDelete what={`order ${editing.id}`} onConfirm={() => { const id = editing.id; run(() => updateAdmin(s => ({ ...s, orders: s.orders.filter(o => o.id !== id) })), `Order ${id} deleted.`); setEditing(null); }} />}
      onSubmit={data => {
        if (!editing) return;
        const status = str(data, "status") as OrderStatus;
        const patch = { status, paid: data.get("paid") === "on", note: str(data, "note") };
        updateAdmin(s => ({ ...s, orders: s.orders.map(o => o.id === editing.id ? { ...o, ...patch } : o) }));
        run(() => {}, `Order ${editing.id} saved.`);
      }}>
      {editing && <>
        <div className="admin-field-group"><h3>Customer</h3><p><strong>{editing.customer}</strong></p><p className="admin-muted">{editing.email}</p><p className="admin-muted">{editing.location}</p></div>
        <div className="admin-field-group"><h3>Items</h3>{editing.items.map(i => <div key={i.name} className="admin-line"><span>{i.name} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>)}<div className="admin-line is-total"><span>Total</span><span>{money(orderTotal(editing))}</span></div></div>
        <div className="admin-field-group"><h3>Status</h3>
          <Field label="Order status"><select name="status" className="admin-input" defaultValue={editing.status}>{Object.entries(orderStatusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <label className="admin-check"><input type="checkbox" name="paid" defaultChecked={editing.paid} />Payment received</label>
          <Field label="Internal note"><textarea name="note" className="admin-input" rows={3} defaultValue={editing.note ?? ""} placeholder="e.g. Tree fitted, waiting on tooling" /></Field>
        </div>
      </>}
    </FormDrawer>

    {/* New order */}
    <FormDrawer open={creating} onOpenChange={setCreating} eyebrow="Sales" title="New order" description="Record a phone, workshop or custom order." submitLabel="Create order"
      onSubmit={data => {
        const name = str(data, "customer"), email = str(data, "email").toLowerCase(), product = sellable.find(p => p.id === str(data, "product"));
        const quantity = Number(data.get("quantity"));
        if (!name || !email) return "Customer name and email are required.";
        if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
        if (!product) return "Choose a product.";
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return "Quantity must be between 1 and 99.";
        const order: OrderWithNote = { id: newId("PB"), customer: name, email, location: str(data, "location"), date: today(), items: [{ name: product.name, quantity, price: product.price }], status: str(data, "status") as OrderStatus, paid: data.get("paid") === "on", note: str(data, "note") };
        updateAdmin(s => ({ ...s, orders: [order, ...s.orders], customers: s.customers.some(c => c.email === email) ? s.customers : [...s.customers, { id: newId("CU"), name, email, phone: "", location: order.location, notes: "", createdAt: today() }] }));
        run(() => {}, `Order ${order.id} created.`);
      }}>
      <div className="admin-form">
        <Field label="Customer name"><input name="customer" className="admin-input" required list="admin-customer-names" /></Field>
        <datalist id="admin-customer-names">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
        <div className="admin-form-row"><Field label="Email"><input name="email" type="email" className="admin-input" required /></Field><Field label="Location"><input name="location" className="admin-input" placeholder="Town, State" /></Field></div>
        <div className="admin-form-row"><Field label="Product"><select name="product" className="admin-input" required>{sellable.map(p => <option key={p.id} value={p.id}>{p.name} — {money(p.price)}</option>)}</select></Field><Field label="Quantity"><input name="quantity" type="number" min={1} max={99} defaultValue={1} className="admin-input" /></Field></div>
        <Field label="Status"><select name="status" className="admin-input" defaultValue="pending">{Object.entries(orderStatusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <label className="admin-check"><input type="checkbox" name="paid" />Payment received</label>
        <Field label="Internal note"><textarea name="note" className="admin-input" rows={3} /></Field>
      </div>
    </FormDrawer>
    {toast}
  </>;
}
