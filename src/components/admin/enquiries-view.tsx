"use client";

import { useState } from "react";
import Link from "next/link";
import { EnvelopeClosedIcon, MobileIcon, PersonIcon, PlusIcon } from "@radix-ui/react-icons";
import { money } from "@/lib/catalog";
import { type EnquiryWithReplies, newId, today, updateAdmin, useAdmin } from "@/lib/admin-store";
import { Badge, ConfirmDelete, Field, FormDrawer, PageHeader, SearchBox, dollarsToCents, str, useToast } from "./admin-ui";
import { type EnquiryStatus, enquiryStatusLabel, formatDate } from "./sample-data";

const topics = ["Custom saddle", "Saddle fitting", "Tack & leatherwork", "Saddle trees", "General"];
const statusFilters: ("all" | EnquiryStatus)[] = ["all", "new", "replied", "quoted", "closed"];

export function EnquiriesView() {
  const { enquiries, customers } = useAdmin();
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

  return <>
    <PageHeader eyebrow="Customers" title="Enquiries" description="Messages from the contact and custom saddle forms." actions={<button type="button" className="admin-button is-primary" onClick={() => setCreating(true)}><PlusIcon aria-hidden="true" />Log enquiry</button>} />
    <div className="admin-toolbar is-bare">
      <div className="admin-tabs" role="tablist" aria-label="Filter by status">{statusFilters.map(f => <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All" : enquiryStatusLabel[f]}<span>{f === "all" ? enquiries.length : enquiries.filter(e => e.status === f).length}</span></button>)}</div>
      <SearchBox value={query} onChange={setQuery} label="Search enquiries" />
    </div>
    <div className="admin-inbox">
      <ul className="admin-inbox-list" aria-label="Enquiries">
        {list.map(e => <li key={e.id}><button type="button" aria-current={e.id === selected?.id || undefined} onClick={() => { setSelectedId(e.id); setReply(""); }}>
          <span className="admin-inbox-row"><strong>{e.name}</strong><small>{formatDate(e.date)}</small></span>
          <span className="admin-inbox-row"><span>{e.topic}</span><Badge tone={e.status}>{enquiryStatusLabel[e.status]}</Badge></span>
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
        </div>
        <p className="admin-message">{selected.message}</p>

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
            <form className="admin-quote" onSubmit={e => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("quote") as HTMLInputElement;
              const cents = dollarsToCents(input.value);
              if (Number.isNaN(cents) || cents <= 0) return run(() => { throw new Error("Enter a quote amount greater than $0."); }, "");
              run(() => patch(selected.id, { quote: cents, status: "quoted" }), `Quote of ${money(cents)} recorded.`);
            }}><span aria-hidden="true">$</span><input key={selected.id} name="quote" inputMode="decimal" aria-label="Quote amount in AUD" placeholder="Quote" defaultValue={selected.quote ? (selected.quote / 100).toFixed(2) : ""} /><button type="submit">{selected.quote ? "Update" : "Quote"}</button></form>
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
