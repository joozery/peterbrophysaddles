"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircledIcon, DownloadIcon } from "@radix-ui/react-icons";
import { type Quote, type Settings, quoteTotal } from "@/lib/admin-types";
import { money } from "@/lib/catalog";
import "./quote-document.css";

const longDate = (iso: string) => iso ? new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T00:00:00`)) : "";
const lines = (text: string) => text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

/** The quotation as the customer sees and prints it. `preview` hides the accept button (used inside the admin). */
export function QuoteDocument({ quote, business, preview = false }: { quote: Quote; business: Settings; preview?: boolean }) {
  const [status, setStatus] = useState(quote.status);
  const [acceptedAt, setAcceptedAt] = useState(quote.acceptedAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(new Date());
  const expired = status === "sent" && !!quote.validUntil && quote.validUntil < today;
  const total = quoteTotal(quote);

  async function accept() {
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/public/quote/${encodeURIComponent(quote.token)}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not accept the quotation.");
      setStatus("accepted"); setAcceptedAt(data.acceptedAt);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not accept the quotation."); }
    finally { setBusy(false); }
  }

  return <div className="qd-page">
    {!preview && <div className="qd-toolbar no-print">
      <span>Quotation {quote.id}</span>
      <button type="button" onClick={() => window.print()}><DownloadIcon aria-hidden="true" /> Print / save as PDF</button>
    </div>}

    <article className="qd-sheet">
      <header className="qd-head">
        <Image src="/logo/logo.svg" alt={business.businessName} width={2067} height={761} className="qd-logo" unoptimized priority />
        <div className="qd-head-meta">
          <h1>Quotation</h1>
          <dl><div><dt>Number</dt><dd>{quote.id}</dd></div><div><dt>Date</dt><dd>{longDate(quote.date)}</dd></div>{quote.validUntil && <div><dt>Valid until</dt><dd>{longDate(quote.validUntil)}</dd></div>}</dl>
        </div>
      </header>

      <section className="qd-parties">
        <div><p className="qd-label">From</p><p><strong>{business.businessName}</strong></p>{lines(business.address).map(l => <p key={l}>{l}</p>)}{business.phone && <p>{business.phone}</p>}{business.email && <p>{business.email}</p>}</div>
        <div><p className="qd-label">Prepared for</p><p><strong>{quote.customer}</strong></p>{lines(quote.address).map(l => <p key={l}>{l}</p>)}{quote.phone && <p>{quote.phone}</p>}{quote.email && <p>{quote.email}</p>}</div>
      </section>

      {quote.title && <h2 className="qd-title">{quote.title}</h2>}

      <table className="qd-items">
        <thead><tr><th>#</th><th>Description</th><th className="num">Qty</th><th className="num">Unit price</th><th className="num">Amount</th></tr></thead>
        <tbody>{quote.items.map((item, i) => <tr key={i}>
          <td className="qd-n">{i + 1}</td>
          <td><strong>{item.description}</strong>{lines(item.details).map(l => <span key={l} className="qd-detail">{l}</span>)}</td>
          <td className="num">{item.quantity}</td><td className="num">{money(item.price)}</td><td className="num">{money(item.price * item.quantity)}</td>
        </tr>)}</tbody>
        <tfoot><tr><td colSpan={4}>Total (AUD)</td><td className="num">{money(total)}</td></tr></tfoot>
      </table>

      {quote.notes && <section className="qd-block"><p className="qd-label">Notes</p>{lines(quote.notes).map(l => <p key={l}>{l}</p>)}</section>}
      {quote.terms && <section className="qd-block"><p className="qd-label">Terms</p><ul>{lines(quote.terms).map(l => <li key={l}>{l}</li>)}</ul></section>}
      {business.bankDetails && <section className="qd-block"><p className="qd-label">Payment</p><p>Pay by card through the secure Stripe link we send you, or by direct bank transfer:</p>{lines(business.bankDetails).map(l => <p key={l}>{l}</p>)}<p>Reference: {quote.id}</p></section>}

      <footer className="qd-foot">{business.businessName} · Handcrafted Australian saddles</footer>
    </article>

    {!preview && <div className="qd-accept no-print">
      {status === "accepted" ? <p className="qd-accepted" role="status"><CheckCircledIcon aria-hidden="true" /> Accepted{acceptedAt ? ` on ${new Date(acceptedAt).toLocaleDateString("en-AU")}` : ""}. Thank you — we’ll be in touch with payment details.</p>
        : status === "declined" ? <p>This quotation is closed. Please contact us if you’d like an updated quote.</p>
        : expired ? <p>This quotation expired on {longDate(quote.validUntil)}. Please contact us for an updated quote.</p>
        : <>
          <p>Happy with this quotation? Accept it and we’ll send your payment details.</p>
          <button type="button" className="qd-accept-btn" disabled={busy} onClick={accept}>{busy ? "Accepting…" : `Accept quotation · ${money(total)}`}</button>
          {error && <p role="alert" className="qd-error">{error}</p>}
          <p className="qd-small">Questions or changes? Just reply to our email{business.phone ? ` or call ${business.phone}` : ""}.</p>
        </>}
    </div>}
  </div>;
}
