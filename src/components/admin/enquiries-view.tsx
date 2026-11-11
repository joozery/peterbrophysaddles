"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, EnvelopeClosedIcon, GlobeIcon, MobileIcon, PersonIcon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import { money } from "@/lib/catalog";
import { type EnquiryWithReplies, loadAdmin, newId, quoteTotal, today, updateAdmin, useAdmin } from "@/lib/admin-store";
import { Badge, ConfirmDelete, Field, FormDrawer, PageHeader, SearchBox, str, useToast } from "./admin-ui";
import { type EnquiryStatus, enquiryStatusLabel, formatDate, quoteStatusLabel, quoteTone } from "./sample-data";

const topics = ["Custom saddle", "Saddle range & fit", "Tack & leatherwork", "Saddle trees", "General enquiry"];
const statusFilters: ("all" | EnquiryStatus)[] = ["all", "new", "replied", "quoted", "closed"];

export function EnquiriesView() {
  const { enquiries, customers, orders, quotes } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("all");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [reply, setReply] = useState("");
  const { toast, run } = useToast();

  const q = query.trim().toLowerCase();
  const list = enquiries.filter(e => (filter === "all" || e.status === filter) && (!q || `${e.name} ${e.email} ${e.topic} ${e.message}`.toLowerCase().includes(q)));
  const selected = enquiries.find(e => e.id === selectedId) ?? list[0];
  const patch = (id: string, change: Partial<EnquiryWithReplies>) => updateAdmin(s => ({ ...s, enquiries: s.enquiries.map(e => e.id === id ? { ...e, ...change } : e) }));
  const isCustomer = selected && customers.some(c => c.email.toLowerCase() === selected.email.toLowerCase());
  const linkedOrder = selected?.orderId ? orders.find(o => o.id === selected.orderId) : undefined;
  const enquiryQuotes = selected ? quotes.filter(x => x.enquiryId === selected.id) : [];
  const newCount = enquiries.filter(e => e.status === "new").length;


  return <>
    <PageHeader eyebrow="Customers" title="Enquiries" description={`Messages from the website contact form and the custom saddle popup arrive here automatically.${newCount ? ` ${newCount} new.` : ""}`} actions={<>
      <button type="button" className="admin-button" disabled={refreshing} onClick={async () => { setRefreshing(true); await loadAdmin(true); setRefreshing(false); }}><ReloadIcon aria-hidden="true" />{refreshing ? "Checking…" : "Check for new"}</button>
      <button type="button" className="admin-button is-primary" onClick={() => setCreating(true)}><PlusIcon aria-hidden="true" />Log enquiry</button>
    </>} />
    <div className="admin-toolbar is-bare">
      <div className="admin-tabs" role="tablist" aria-label="Filter by status">{statusFilters.map(f => <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All" : enquiryStatusLabel[f]}<span>{f === "all" ? enquiries.length : enquiries.filter(e => e.status === f).length}</span></button>)}</div>
      <SearchBox value={query} onChange={setQuery} label="Search enquiries" />
    </div>
    <div className="admin-inbox">
      <ul className="admin-inbox-list" aria-label="Enquiries">
        {list.map(e => <li key={e.id}><button type="button" aria-current={e.id === selected?.id || undefined} onClick={() => { setSelectedId(e.id); setReply(""); }}>
          <span className="admin-inbox-row"><strong>{e.name}</strong><small>{formatDate(e.date)}</small></span>
          <span className="admin-inbox-row"><span>{e.productName ?? e.topic}</span><Badge tone={e.status}>{enquiryStatusLabel[e.status]}</Badge></span>
          <span className="admin-inbox-preview">{e.message}</span>
        </button></li>)}
        {!list.length && <li className="admin-empty">No enquiries here.</li>}
      </ul>

      {selected && <article className="admin-card admin-inbox-detail">
        <div className="admin-card-head"><div><p className="admin-eyebrow">{selected.id} · {selected.topic}</p><h2>{selected.name}</h2></div><Badge tone={selected.status}>{enquiryStatusLabel[selected.status]}</Badge></div>
        <div className="admin-contact-row">
          <a href={`mailto:${selected.email}`}><EnvelopeClosedIcon aria-hidden="true" />{selected.email}</a>
          {selected.phone && <a href={`tel:${selected.phone.replace(/\s/g, "")}`}><MobileIcon aria-hidden="true" />{selected.phone}</a>}
          {selected.discipline && <span>Discipline: {selected.discipline}</span>}
          {selected.quote ? <span>Quoted: <strong>{money(selected.quote)}</strong></span> : null}
          {selected.source && <span><GlobeIcon aria-hidden="true" /> {selected.source}</span>}
          {selected.productName && <span>Saddle: <strong>{selected.productName}</strong></span>}
        </div>
        <p className="admin-message">{selected.message}</p>

        <div className="admin-convert">
          {linkedOrder ? <><p><strong>Order {linkedOrder.id}</strong> created · {linkedOrder.paid ? "Paid" : "Awaiting payment"}</p><Link className="admin-button is-primary" href={`/admin/orders?open=${encodeURIComponent(linkedOrder.id)}`}>Open order & payment <ArrowRightIcon aria-hidden="true" /></Link></>
            : <>
              <div className="admin-convert-quotes">
                {enquiryQuotes.length ? enquiryQuotes.map(x => <Link key={x.id} href={`/admin/quotes/edit?id=${encodeURIComponent(x.id)}`} className="admin-convert-quote">
                  <strong>{x.id}</strong><span>{money(quoteTotal(x))}</span><Badge tone={quoteTone[x.status]}>{quoteStatusLabel[x.status]}</Badge>
                </Link>) : <p>Next step: prepare a quotation for {selected.name.split(" ")[0]}. Once they accept it, it becomes an order and you send the payment link.</p>}
              </div>
              <Link className={`admin-button${enquiryQuotes.length ? "" : " is-primary"}`} href={`/admin/quotes/edit?enquiry=${encodeURIComponent(selected.id)}`}><PlusIcon aria-hidden="true" />{enquiryQuotes.length ? "New quotation" : "Create quotation"}</Link>
            </>}
        </div>

        {!!selected.replies?.length && <div className="admin-thread"><h3>Replies</h3>{selected.replies.map((r, i) => <div key={i} className="admin-thread-item"><small>{formatDate(r.date)}</small><p>{r.text}</p></div>)}</div>}

        <Field label="Reply" hint="Saved to this enquiry. Email sending is not connected yet — copy the text into your email app."><textarea className="admin-input" rows={5} value={reply} onChange={e => setReply(e.target.value)} placeholder={`Hi ${selected.name.split(" ")[0]},`} /></Field>

        <div className="admin-actions-row is-spread">
          <div className="admin-actions-row">
            <ConfirmDelete compact what={`enquiry from ${selected.name}`} onConfirm={() => { const e = selected; run(() => updateAdmin(s => ({ ...s, enquiries: s.enquiries.filter(x => x.id !== e.id) })), "Enquiry deleted."); setSelectedId(undefined); }} />
            {isCustomer ? <Link className="admin-button" href={`/admin/customers?q=${encodeURIComponent(selected.email)}`}><PersonIcon aria-hidden="true" />View customer</Link>
              : <button type="button" className="admin-button" onClick={() => run(() => updateAdmin(s => ({ ...s, customers: [...s.customers, { id: newId("CU"), name: selected.name, email: selected.email, phone: selected.phone, location: "", notes: `From enquiry ${selected.id}`, createdAt: today() }] })), `${selected.name} added to customers.`)}><PersonIcon aria-hidden="true" />Add to customers</button>}
          </div>
          <div className="admin-actions-row">
            <select className="admin-input admin-input-inline" value={selected.status} aria-label="Enquiry status" onChange={e => run(() => patch(selected.id, { status: e.target.value as EnquiryStatus }), "Status updated.")}>{Object.entries(enquiryStatusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <button type="button" className="admin-button is-primary" disabled={!reply.trim()} onClick={() => run(() => { patch(selected.id, { replies: [...(selected.replies ?? []), { date: today(), text: reply.trim() }], status: selected.status === "new" ? "replied" : selected.status }); setReply(""); }, "Reply saved.")}>Save reply</button>
          </div>
        </div>
      </article>}
    </div>

    <FormDrawer open={creating} onOpenChange={setCreating} eyebrow="Enquiries" title="Log an enquiry" description="For enquiries received by phone, email or in person." submitLabel="Add enquiry"
      onSubmit={data => {
        const name = str(data, "name"), email = str(data, "email"), message = str(data, "message");
        if (!name || !message) return "Name and message are required.";
        if (email && !/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
        const enquiry: EnquiryWithReplies = { id: newId("EQ"), name, email, phone: str(data, "phone"), topic: str(data, "topic"), discipline: str(data, "discipline"), message, date: today(), status: "new" };
        updateAdmin(s => ({ ...s, enquiries: [enquiry, ...s.enquiries] }));
        setSelectedId(enquiry.id); setFilter("all");
        run(() => {}, "Enquiry added.");
      }}>
      <div className="admin-form">
        <Field label="Name"><input name="name" className="admin-input" required /></Field>
        <div className="admin-form-row"><Field label="Email"><input name="email" type="email" className="admin-input" /></Field><Field label="Phone"><input name="phone" type="tel" className="admin-input" /></Field></div>
        <div className="admin-form-row"><Field label="Topic"><select name="topic" className="admin-input">{topics.map(t => <option key={t}>{t}</option>)}</select></Field><Field label="Discipline"><input name="discipline" className="admin-input" placeholder="e.g. Campdraft" /></Field></div>
        <Field label="Message"><textarea name="message" className="admin-input" rows={5} required /></Field>
      </div>
    </FormDrawer>
    {toast}
  </>;
}
