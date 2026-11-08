"use client";

import Link from "next/link";
import { ArrowRightIcon, ArchiveIcon, ChatBubbleIcon, ReaderIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { money } from "@/lib/catalog";
import { useAdmin } from "@/lib/admin-store";
import { Badge, Card, PageHeader, StatCard } from "./admin-ui";
import { enquiryStatusLabel, formatDate, orderStatusLabel, orderTotal } from "./sample-data";

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

export function DashboardView() {
  const { orders, enquiries, products } = useAdmin();
  const active = orders.filter(o => o.status !== "cancelled");
  const revenue = active.filter(o => o.paid).reduce((sum, o) => sum + orderTotal(o), 0);
  const inProgress = orders.filter(o => o.status === "pending" || o.status === "in-production").length;
  const newEnquiries = enquiries.filter(e => e.status === "new").length;
  const lowStock = products.filter(p => !p.custom && p.active && p.stock <= 1);

  const recentOrders = [...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentEnquiries = [...enquiries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const production = ["pending", "in-production", "ready", "shipped"] as const;
  const trackedOrders = active.length;

  return <div className="admin-dashboard">
    <PageHeader eyebrow="Your workshop, at a glance" title={greeting()} description="Here's what's happening in the workshop." actions={<><Link href="/" className="admin-button">Visit website <ArrowRightIcon /></Link><Link href="/admin/enquiries" className="admin-button is-primary"><ChatBubbleIcon /> Open enquiries</Link></>} />
    <section className="admin-welcome">
      <div><span className="admin-welcome-label"><span /> PETER BROPHY SADDLES · WORKSHOP</span><h2>A little overview.<br /><em>A clear way forward.</em></h2><p>Every great saddle starts with a conversation.<br />Keep your enquiries, orders and collection in hand.</p><Link href="/admin/enquiries">Manage your enquiries <ArrowRightIcon /></Link></div>
      <div className="admin-focus"><span className="admin-focus-icon"><ChatBubbleIcon /></span><p>WAITING FOR YOUR REPLY</p><strong>{newEnquiries.toString().padStart(2, "0")}</strong><span>{newEnquiries === 1 ? "new enquiry" : "new enquiries"}</span><Link href="/admin/enquiries">Go to inbox <ArrowRightIcon /></Link></div>
    </section>
    <div className="admin-stats">
      <StatCard label="Paid revenue" value={money(revenue)} note="All paid orders" />
      <StatCard label="Orders in progress" value={String(inProgress)} note="Pending or in production" />
      <StatCard label="New enquiries" value={String(newEnquiries)} note={newEnquiries ? "Awaiting reply" : "All caught up"} tone={newEnquiries ? "warn" : "good"} />
      <StatCard label="Low stock" value={String(lowStock.length)} note={lowStock.length ? "1 or fewer left" : "Stock healthy"} tone={lowStock.length ? "warn" : "good"} />
    </div>
    <div className="admin-dashboard-section"><div><p className="admin-eyebrow">The day-to-day</p><h2>Inside the workshop</h2></div><span>All-time overview · AUD</span></div>
    <div className="admin-grid-2">
      <Card title="Recent orders" flush action={<Link href="/admin/orders" className="admin-link">All orders <ArrowRightIcon /></Link>}>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="num">Total</th></tr></thead>
          <tbody>{recentOrders.map(o => <tr key={o.id}><td><Link className="admin-link" href="/admin/orders">{o.id}</Link><small>{formatDate(o.date)}</small></td><td>{o.customer}</td><td><Badge tone={o.status}>{orderStatusLabel[o.status]}</Badge></td><td className="num">{money(orderTotal(o))}</td></tr>)}{!recentOrders.length && <tr><td colSpan={4} className="admin-empty"><ReaderIcon /><strong>Your next chapter starts here</strong><span>New orders will appear here as they come in.</span><Link href="/admin/orders" className="admin-link">Manage orders <ArrowRightIcon /></Link></td></tr>}</tbody>
        </table></div>
      </Card>
      <div className="admin-stack">
        <Card title="Latest enquiries" action={<Link href="/admin/enquiries" className="admin-link">Inbox <ArrowRightIcon /></Link>}>
          {!recentEnquiries.length && <div className="admin-small-empty"><ChatBubbleIcon /><p>No enquiries yet.<small>New conversations will appear here.</small></p></div>}<ul className="admin-list">{recentEnquiries.map(e => <li key={e.id}><div><strong>{e.name}</strong><small>{e.topic} · {formatDate(e.date)}</small></div><Badge tone={e.status}>{enquiryStatusLabel[e.status]}</Badge></li>)}</ul>
        </Card>
        <Card title="Stock alerts" action={<Link href="/admin/products" className="admin-link">Manage <ArrowRightIcon /></Link>}>
          {lowStock.length ? <ul className="admin-list">{lowStock.map(p => <li key={p.id}><div><strong>{p.name}</strong><small>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</small></div><Badge tone={p.stock === 0 ? "cancelled" : "pending"}>{p.stock === 0 ? "Out" : "Low"}</Badge></li>)}</ul> : <p className="admin-stock-good"><CheckCircledIcon /> All active standard products are well stocked.</p>}
        </Card>
      </div>
    </div>
    <section className="admin-production admin-card"><div className="admin-card-head"><h2>Order journey</h2><Link href="/admin/orders" className="admin-link">Manage orders <ArrowRightIcon /></Link></div><div className="admin-production-grid">{production.map((step, index) => {
      const count = active.filter(order => order.status === step).length;
      return <div key={step} className={`admin-production-step step-${index}`}><div><span className="admin-step-number">0{index + 1}</span><strong>{count}</strong></div><p>{orderStatusLabel[step]}</p><div className="admin-production-track"><span style={{ width: `${trackedOrders ? count / trackedOrders * 100 : 0}%` }} /></div></div>;
    })}</div></section>
    <div className="admin-quick-links">{[{ href: "/admin/products", icon: ArchiveIcon, title: "Your collection", copy: "Manage saddles & stock" }, { href: "/admin/enquiries", icon: ChatBubbleIcon, title: "Conversations", copy: "Reply, quote & follow up" }, { href: "/admin/orders", icon: ReaderIcon, title: "Workshop orders", copy: "Keep every order on track" }].map(({ href, icon: Icon, title, copy }) => <Link href={href} key={href}><span className="admin-quick-icon"><Icon /></span><div><strong>{title}</strong><small>{copy}</small></div><ArrowRightIcon /></Link>)}</div>
    <footer className="admin-dashboard-footer"><span>Peter Brophy Saddles</span><span>Made with care. Managed with ease.</span></footer>
  </div>;
}
