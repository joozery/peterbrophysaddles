"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, CheckIcon, CopyIcon, EnvelopeClosedIcon, ExternalLinkIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { money } from "@/lib/catalog";
import { DEFAULT_QUOTE_TERMS, type OrderWithNote, type Quote, type QuoteItem, newId, quoteTotal, today, updateAdmin, useAdmin, useAdminStatus } from "@/lib/admin-store";
import { Badge, Card, ConfirmDelete, Field, PageHeader, dollarsToCents, move, useToast } from "./admin-ui";
import { quoteStatusLabel, quoteTone } from "./sample-data";

const addDays = (iso: string, days: number) => { const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
const token = () => { const b = new Uint8Array(24); crypto.getRandomValues(b); return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const blankItem = (): QuoteItem => ({ description: "", details: "", quantity: 1, price: 0 });

export function QuoteEditor() {
  const params = useSearchParams();
  const id = params.get("id") ?? "new";
  const router = useRouter();
  const { quotes, enquiries, settings } = useAdmin();
  const { user } = useAdminStatus();
  // Right after the first save the URL still says "new" for a moment — remember which quotation we just saved.
  const [savedId, setSavedId] = useState<string | null>(null);
  const isNew = id === "new" && !savedId;
  const saved = quotes.find(q => q.id === (savedId ?? id));
  const [draft, setDraft] = useState<Quote | null>(() => {
    if (id !== "new") return null;
    const enquiry = enquiries.find(e => e.id === params.get("enquiry"));
    const date = today();
    return {
      id: newId("Q"), token: token(), enquiryId: enquiry?.id, customer: enquiry?.name ?? "", email: enquiry?.email ?? "", phone: enquiry?.phone ?? "", address: "",
      title: enquiry?.productName ? `${enquiry.productName}` : enquiry?.topic === "Custom saddle" ? "Custom saddle" : "",
      date, validUntil: addDays(date, 30),
      items: [{ ...blankItem(), description: enquiry?.productName ?? (enquiry?.topic === "Custom saddle" ? "Custom saddle" : "") }],
      notes: "", terms: DEFAULT_QUOTE_TERMS, status: "draft", createdBy: "",
    };
  });
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);
  const { toast, run, notify } = useToast();

  if (!isNew && !saved) return <><PageHeader eyebrow="Sales" title="Quotation not found" /><Link className="admin-button" href="/admin/quotes"><ArrowLeftIcon aria-hidden="true" />All quotations</Link></>;
  const q = draft ?? saved!;
  const dirty = !!draft;
  const total = quoteTotal(q);
  const locked = q.status === "accepted" || !!q.orderId;
  const set = (patch: Partial<Quote>) => setDraft({ ...q, ...patch });
  const setItem = (i: number, patch: Partial<QuoteItem>) => set({ items: q.items.map((x, j) => j === i ? { ...x, ...patch } : x) });
  const enquiry = q.enquiryId ? enquiries.find(e => e.id === q.enquiryId) : undefined;
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const link = `${origin}/quote/${q.token}`;

  function validate(x: Quote): string | null {
    if (!x.customer.trim()) return "Add the customer’s name.";
    if (x.email && !/^\S+@\S+\.\S+$/.test(x.email)) return "Enter a valid customer email.";
    if (!x.items.length) return "Add at least one line item.";
    for (const [i, it] of x.items.entries()) {
      if (!it.description.trim()) return `Line ${i + 1}: add a description.`;
      if (!Number.isInteger(it.quantity) || it.quantity < 1) return `Line ${i + 1}: quantity must be 1 or more.`;
      if (!(it.price >= 0)) return `Line ${i + 1}: enter a price.`;
    }
    if (quoteTotal(x) <= 0) return "The quotation total must be more than $0.";
    return null;
  }

  /** Saves the quotation (and keeps the enquiry's quoted amount in step). */
  function save(next: Quote, message: string) {
    const problem = validate(next);
    if (problem) { notify(problem); return false; }
    const doc = { ...next, createdBy: next.createdBy || user?.name || "Admin" };
    run(() => updateAdmin(s => ({
      ...s,
      quotes: s.quotes.some(x => x.id === doc.id) ? s.quotes.map(x => x.id === doc.id ? doc : x) : [doc, ...s.quotes],
      enquiries: doc.enquiryId ? s.enquiries.map(e => e.id === doc.enquiryId ? { ...e, quote: quoteTotal(doc), status: doc.status === "draft" ? e.status : e.status === "closed" ? e.status : "quoted" } : e) : s.enquiries,
    })), message);
    setDraft(null); setPrices({});
    if (isNew) { setSavedId(doc.id); router.replace(`/admin/quotes/edit?id=${encodeURIComponent(doc.id)}`); }
    return true;
  }

  const emailHref = () => {
    const first = q.customer.split(" ")[0] || q.customer;
    const body = [`Hi ${first},`, "", `Thank you for your enquiry. Please find your quotation ${q.id}${q.title ? ` for ${q.title}` : ""} here:`, link, "",
      `Total: ${money(total)} (AUD)${q.validUntil ? ` — valid until ${new Date(`${q.validUntil}T00:00:00`).toLocaleDateString("en-AU")}` : ""}.`, "",
      "You can accept it online from that page, or simply reply to this email. Once accepted we’ll send your payment details.", "", "Kind regards,", settings.businessName || "Peter Brophy Saddles"].join("\n");
    return `mailto:${encodeURIComponent(q.email)}?subject=${encodeURIComponent(`Quotation ${q.id} — ${settings.businessName || "Peter Brophy Saddles"}`)}&body=${encodeURIComponent(body)}`;
  };

  function convertToOrder() {
    const order: OrderWithNote = {
      id: newId("PB"), customer: q.customer, email: q.email, location: q.address.split(/\r?\n/).filter(Boolean).join(", "), date: today(),
      items: q.items.map(i => ({ name: i.description, quantity: i.quantity, price: i.price })), status: "pending", paid: false, note: `From quotation ${q.id}.`,
    };
    run(() => updateAdmin(s => ({
      ...s, orders: [order, ...s.orders],
      quotes: s.quotes.map(x => x.id === q.id ? { ...x, orderId: order.id, status: "accepted", acceptedAt: x.acceptedAt ?? new Date().toISOString() } : x),
      enquiries: q.enquiryId ? s.enquiries.map(e => e.id === q.enquiryId ? { ...e, orderId: order.id } : e) : s.enquiries,
      customers: !q.email || s.customers.some(c => c.email.toLowerCase() === q.email.toLowerCase()) ? s.customers : [...s.customers, { id: newId("CU"), name: q.customer, email: q.email, phone: q.phone, location: order.location, notes: `From quotation ${q.id}`, createdAt: today() }],
    })), `Order ${order.id} created.`);
    router.push(`/admin/orders?open=${encodeURIComponent(order.id)}`);
  }

  return <>
    <PageHeader eyebrow={<Link href="/admin/quotes" className="admin-back"><ArrowLeftIcon aria-hidden="true" /> Quotations</Link>} title={isNew ? "New quotation" : `Quotation ${q.id}`}
      description={enquiry ? `For enquiry ${enquiry.id} from ${enquiry.name}.` : "Line items, terms and validity — the customer sees exactly this on their private link."}
      actions={<>
        {!isNew && <Badge tone={quoteTone[q.status]}>{quoteStatusLabel[q.status]}</Badge>}
        {dirty && <button type="button" className="admin-button" onClick={() => isNew ? router.push("/admin/quotes") : setDraft(null)}>Discard</button>}
        {(dirty || isNew) && <button type="button" className="admin-button is-primary" onClick={() => save(q, isNew ? "Quotation saved as draft." : "Quotation saved.")}>Save</button>}
      </>} />
    {locked && <p className="admin-notice">This quotation has been accepted{q.orderId ? ` and turned into order ${q.orderId}` : ""}, so it can’t be edited. Create a new quotation for changes.</p>}

    <div className="admin-grid-2">
      <div className="admin-stack">
        <fieldset className="admin-fieldset admin-stack" disabled={locked}>
          <Card title="Customer">
            <div className="admin-form">
              <div className="admin-form-row"><Field label="Name"><input className="admin-input" value={q.customer} onChange={e => set({ customer: e.target.value })} /></Field><Field label="Email"><input className="admin-input" type="email" value={q.email} onChange={e => set({ email: e.target.value })} /></Field></div>
              <div className="admin-form-row"><Field label="Phone"><input className="admin-input" value={q.phone} onChange={e => set({ phone: e.target.value })} /></Field><Field label="Address (optional)"><textarea className="admin-input" rows={2} value={q.address} onChange={e => set({ address: e.target.value })} /></Field></div>
            </div>
          </Card>

          <Card title="Quotation">
            <div className="admin-form">
              <div className="admin-form-row"><Field label="Title" hint="e.g. Custom Wade Saddle"><input className="admin-input" value={q.title} onChange={e => set({ title: e.target.value })} /></Field>
                <div className="admin-form-row"><Field label="Date"><input className="admin-input" type="date" value={q.date} onChange={e => set({ date: e.target.value })} /></Field><Field label="Valid until"><input className="admin-input" type="date" value={q.validUntil} onChange={e => set({ validUntil: e.target.value })} /></Field></div></div>
            </div>
            <div className="admin-quote-items">
              {q.items.map((item, i) => <div key={i} className="admin-quote-item">
                <div className="admin-card-head is-tight"><p className="admin-home-card-num">Line {i + 1}</p>
                  <div className="admin-row-actions">
                    <button type="button" className="admin-icon-button" aria-label="Move up" disabled={i === 0} onClick={() => set({ items: move(q.items, i, i - 1) })}><ArrowUpIcon /></button>
                    <button type="button" className="admin-icon-button" aria-label="Move down" disabled={i === q.items.length - 1} onClick={() => set({ items: move(q.items, i, i + 1) })}><ArrowDownIcon /></button>
                    <button type="button" className="admin-icon-button is-danger" aria-label="Remove line" disabled={q.items.length <= 1} onClick={() => set({ items: q.items.filter((_, j) => j !== i) })}><TrashIcon /></button>
                  </div>
                </div>
                <Field label="Item"><input className="admin-input" value={item.description} placeholder="e.g. Custom Wade saddle — 16″ seat" onChange={e => setItem(i, { description: e.target.value })} /></Field>
                <Field label="Details (optional)" hint="One per line — tree, leather, tooling, hardware…"><textarea className="admin-input" rows={3} value={item.details} onChange={e => setItem(i, { details: e.target.value })} /></Field>
                <div className="admin-form-row">
                  <Field label="Qty"><input className="admin-input" type="number" min={1} max={99} value={item.quantity} onChange={e => setItem(i, { quantity: Math.max(1, Math.round(Number(e.target.value) || 1)) })} /></Field>
                  <Field label="Unit price (AUD)"><input className="admin-input" inputMode="decimal" placeholder="0.00" value={prices[i] ?? (item.price ? (item.price / 100).toFixed(2) : "")}
                    onChange={e => { const v = e.target.value; setPrices(p => ({ ...p, [i]: v })); const c = dollarsToCents(v); setItem(i, { price: Number.isNaN(c) ? -1 : c }); }} /></Field>
                </div>
                <p className="admin-line"><span className="admin-muted">Line total</span><strong>{item.price >= 0 ? money(item.price * item.quantity) : "—"}</strong></p>
              </div>)}
            </div>
            <div className="admin-actions-row is-spread admin-mt">
              <button type="button" className="admin-button" disabled={q.items.length >= 30} onClick={() => set({ items: [...q.items, blankItem()] })}><PlusIcon aria-hidden="true" />Add line</button>
              <p className="admin-quote-total">Total <strong>{money(Math.max(0, total))}</strong> AUD</p>
            </div>
          </Card>

          <Card title="Notes & terms">
            <div className="admin-form">
              <Field label="Notes for the customer (optional)"><textarea className="admin-input" rows={3} value={q.notes} onChange={e => set({ notes: e.target.value })} placeholder="e.g. Includes tree fitting at your property." /></Field>
              <Field label="Terms" hint="One per line. Bank details from Payments are added automatically."><textarea className="admin-input" rows={6} value={q.terms} onChange={e => set({ terms: e.target.value })} /></Field>
            </div>
          </Card>
        </fieldset>
      </div>

      <div className="admin-stack">
        <Card title="Send & track">
          {isNew || dirty ? <p className="admin-muted">Save the quotation first — then you can preview it and send it to the customer.</p> : <div className="admin-form">
            <ol className="admin-quote-steps">
              <li className={q.status !== "draft" ? "is-done" : undefined}><strong>Send to customer</strong>
                <span>Opens your email app with the private link. The quotation is marked <em>Sent</em>.</span>
                <div className="admin-actions-row is-wrap">
                  <a className="admin-button is-primary" href={emailHref()} onClick={() => { if (q.status === "draft") save({ ...q, status: "sent", sentAt: new Date().toISOString() }, "Marked as sent."); }}><EnvelopeClosedIcon aria-hidden="true" />Email customer</a>
                  <button type="button" className="admin-button" onClick={() => { navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); if (q.status === "draft") save({ ...q, status: "sent", sentAt: new Date().toISOString() }, "Link copied — marked as sent."); }); }}>{copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}{copied ? "Copied" : "Copy link"}</button>
                  <a className="admin-button" href={`/quote/${q.token}`} target="_blank" rel="noreferrer" onClick={e => { if (q.status === "draft") { e.preventDefault(); notify("Drafts aren’t visible to customers yet — send it first, or use Copy link."); } }}><ExternalLinkIcon aria-hidden="true" />Preview</a>
                </div>
                {!q.email && <span className="admin-hint is-warn">No customer email — use Copy link and send it another way.</span>}
              </li>
              <li className={q.status === "accepted" ? "is-done" : undefined}><strong>Customer accepts</strong>
                <span>{q.status === "accepted" ? `Accepted${q.acceptedAt ? ` on ${new Date(q.acceptedAt).toLocaleDateString("en-AU")}` : ""}.` : "They can press Accept on their link. If they confirm by phone or email instead, mark it here."}</span>
                {q.status === "sent" && <div className="admin-actions-row is-wrap">
                  <button type="button" className="admin-button" onClick={() => save({ ...q, status: "accepted", acceptedAt: new Date().toISOString() }, "Marked as accepted.")}>Mark accepted</button>
                  <button type="button" className="admin-button is-danger" onClick={() => save({ ...q, status: "declined" }, "Marked as declined.")}>Declined</button>
                </div>}
                {q.status === "declined" && <button type="button" className="admin-button" onClick={() => save({ ...q, status: "sent", reopened: true }, "Quotation reopened.")}>Reopen</button>}
              </li>
              <li className={q.orderId ? "is-done" : undefined}><strong>Order & payment</strong>
                <span>{q.orderId ? `Order ${q.orderId} — send the Stripe payment link or bank details from the order.` : "Creates the order with these line items, ready for a payment link."}</span>
                {q.orderId ? <Link className="admin-button is-primary" href={`/admin/orders?open=${encodeURIComponent(q.orderId)}`}>Open order & payment <ArrowRightIcon aria-hidden="true" /></Link>
                  : q.status === "accepted" && <button type="button" className="admin-button is-primary" onClick={convertToOrder}>Convert to order <ArrowRightIcon aria-hidden="true" /></button>}
              </li>
            </ol>
          </div>}
        </Card>
        {enquiry && <Card title="Enquiry"><p><strong>{enquiry.name}</strong> · {enquiry.topic}</p><p className="admin-muted admin-clamp">{enquiry.message}</p><Link className="admin-button admin-mt" href="/admin/enquiries">View enquiries</Link></Card>}
        {!isNew && !q.orderId && <div className="admin-actions-row"><ConfirmDelete what={`quotation ${q.id}`} onConfirm={() => { run(() => updateAdmin(s => ({ ...s, quotes: s.quotes.filter(x => x.id !== q.id) })), "Quotation deleted."); router.push("/admin/quotes"); }} /></div>}
      </div>
    </div>
    {toast}
  </>;
}
