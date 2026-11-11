"use client";

import { useState } from "react";
import { CheckCircledIcon, CopyIcon, EnvelopeClosedIcon, ExternalLinkIcon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import { money } from "@/lib/catalog";
import { type OrderWithNote, api, applyServerOrder, useAdmin } from "@/lib/admin-store";
import { Badge, Field, dollarsToCents } from "./admin-ui";
import { type PaymentLink, orderTotal } from "./sample-data";

const tone: Record<PaymentLink["status"], [string, string]> = { open: ["pending", "Awaiting payment"], paid: ["paid", "Paid"], cancelled: ["cancelled", "Cancelled"] };
const dollars = (cents: number) => (cents / 100).toFixed(2);

/** Builds a mailto: link so the email opens in the user's own mail app, ready to send. */
function emailHref(order: OrderWithNote, link: PaymentLink, business: string, bank: string) {
  const first = order.customer.split(" ")[0] || order.customer;
  const lines = [
    `Hi ${first},`, "",
    `Thank you for your order with ${business}.`, "",
    `${link.description}: ${money(link.amount)} (AUD)`, "",
    "Pay securely by card, Apple Pay or Google Pay:", link.url, "",
    ...(bank ? ["Or pay by direct bank transfer:", bank, `Reference: ${order.id}`, ""] : []),
    "Please let us know if you have any questions.", "", "Kind regards,", business,
  ];
  return `mailto:${encodeURIComponent(order.email)}?subject=${encodeURIComponent(`${business} — ${link.description}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

/** "Payment" section in the order drawer: Stripe Payment Links per invoice amount. Inputs here are not part of the order form. */
export function PaymentLinks({ order }: { order: OrderWithNote }) {
  const { settings } = useAdmin();
  const links = order.paymentLinks ?? [];
  const total = orderTotal(order);
  const paid = links.filter(l => l.status === "paid").reduce((s, l) => s + l.amount, 0);
  const outstanding = Math.max(0, total - paid);
  // Money already requested through links that are still open — don't invite a duplicate link for it.
  const requested = links.filter(l => l.status === "open").reduce((s, l) => s + l.amount, 0);
  const unrequested = Math.max(0, outstanding - requested);
  const [showNew, setShowNew] = useState(false);
  const [amount, setAmount] = useState(dollars(unrequested || outstanding));
  const [description, setDescription] = useState(`Invoice ${order.id}`);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState("");

  async function call(method: "POST" | "PATCH", body: object, label: string, success: string) {
    setBusy(label); setMessage(null);
    try {
      const { order: next } = await api<{ order: OrderWithNote }>(`/api/admin/orders/${encodeURIComponent(order.id)}/payment-link`, { method, body: JSON.stringify(body) });
      applyServerOrder(next);
      setMessage({ ok: true, text: success });
      return next;
    } catch (err) { setMessage({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." }); }
    finally { setBusy(""); }
  }

  const create = async () => {
    const cents = dollarsToCents(amount);
    if (Number.isNaN(cents) || cents < 50) return setMessage({ ok: false, text: "Enter an amount of at least $0.50." });
    const next = await call("POST", { amount: cents, description }, "create", "Payment link created. Copy it or email it to the customer.");
    if (next) {
      const sum = (st: string) => (next.paymentLinks ?? []).filter(l => l.status === st).reduce((s, l) => s + l.amount, 0);
      setAmount(dollars(Math.max(0, orderTotal(next) - sum("paid") - sum("open")))); setShowNew(false);
    }
  };
  const copy = (url: string) => navigator.clipboard?.writeText(url).then(() => { setCopied(url); setTimeout(() => setCopied(""), 2000); }, () => setMessage({ ok: false, text: "Copy failed — select the link and copy it manually." }));

  return <div className="admin-field-group">
    <h3>Payment</h3>
    <div className="admin-line"><span>Invoice total</span><span>{money(total)}</span></div>
    {paid > 0 && <div className="admin-line"><span>Paid by card (Stripe)</span><span>{money(paid)}</span></div>}
    {paid > 0 && <div className="admin-line is-total"><span>Outstanding</span><span>{money(outstanding)}</span></div>}

    {links.length > 0 && <ul className="admin-paylinks">{links.slice().reverse().map(l => <li key={l.id}>
      <div className="admin-line"><strong>{l.description}</strong><span>{money(l.amount)}</span></div>
      <div className="admin-line"><Badge tone={tone[l.status][0]}>{tone[l.status][1]}</Badge><small className="admin-muted">{l.status === "paid" && l.paidAt ? `Paid ${new Date(l.paidAt).toLocaleDateString("en-AU")}` : `Created ${new Date(l.createdAt).toLocaleDateString("en-AU")} by ${l.createdBy}`}</small></div>
      {l.status === "open" && <>
        <div className="admin-paylink-url"><code>{l.url}</code></div>
        <div className="admin-actions-row is-wrap">
          <button type="button" className="admin-button" onClick={() => copy(l.url)}>{copied === l.url ? <CheckCircledIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}{copied === l.url ? "Copied" : "Copy link"}</button>
          <a className="admin-button is-primary" href={emailHref(order, l, settings.businessName || "Peter Brophy Saddles", settings.bankDetails)}><EnvelopeClosedIcon aria-hidden="true" />Email customer</a>
          <a className="admin-button" href={l.url} target="_blank" rel="noreferrer"><ExternalLinkIcon aria-hidden="true" />Open</a>
          <button type="button" className="admin-button" disabled={!!busy} onClick={() => call("PATCH", { linkId: l.id, action: "check" }, "check", "Checked with Stripe.")}><ReloadIcon aria-hidden="true" />{busy === "check" ? "Checking…" : "Check payment"}</button>
          <button type="button" className="admin-button is-danger" disabled={!!busy} onClick={() => call("PATCH", { linkId: l.id, action: "cancel" }, "cancel", "Link cancelled — it can no longer be paid.")}>Cancel link</button>
        </div>
      </>}
    </li>)}</ul>}

    {outstanding > 0 && order.status !== "cancelled" && unrequested === 0 && !showNew && <button type="button" className="admin-button" onClick={() => { setShowNew(true); setAmount(dollars(outstanding)); }}><PlusIcon aria-hidden="true" />Create another link</button>}
    {outstanding > 0 && order.status !== "cancelled" && (unrequested > 0 || showNew) && <div className="admin-paylink-new" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); create(); } }}>
      <p className="admin-muted">{requested > 0 ? `${money(requested)} is already requested in an open link. Create a link for the rest, or cancel the open one first.` : "Create a Stripe payment link for the full amount or a deposit."}</p>
      <div className="admin-form-row">
        <Field label="Amount (AUD)"><input className="admin-input" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
        <Field label="Description (customer sees this)"><input className="admin-input" maxLength={120} value={description} onChange={e => setDescription(e.target.value)} /></Field>
      </div>
      <div className="admin-actions-row is-wrap">
        <button type="button" className="admin-button" onClick={() => { setAmount(dollars(Math.round(outstanding / 2))); setDescription(`Invoice ${order.id} — 50% deposit`); }}>50% deposit</button>
        <button type="button" className="admin-button" onClick={() => { setAmount(dollars(unrequested || outstanding)); setDescription(`Invoice ${order.id}`); }}>{requested > 0 ? "Remaining" : "Full amount"}</button>
        <button type="button" className="admin-button is-primary" disabled={!!busy} onClick={create}>{busy === "create" ? "Creating…" : "Create payment link"}</button>
      </div>
    </div>}
    {!order.email && <p className="admin-hint is-warn">This order has no customer email, so “Email customer” won’t have an address.</p>}
    {message && <p role={message.ok ? "status" : "alert"} className={message.ok ? "admin-hint is-good" : "admin-form-error is-inline"}>{message.text}</p>}
    <p className="admin-hint">Paid by bank transfer instead? Tick <strong>Payment received</strong> below.</p>
  </div>;
}
