"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@radix-ui/react-icons";
import { money } from "@/lib/catalog";
import { type QuoteStatus, quoteTotal, useAdmin } from "@/lib/admin-store";
import { Badge, Card, PageHeader, SearchBox } from "./admin-ui";
import { formatDate, quoteStatusLabel, quoteTone } from "./sample-data";

const filters: ("all" | QuoteStatus)[] = ["all", "draft", "sent", "accepted", "declined"];

export function QuotesView() {
  const { quotes } = useAdmin();
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes.filter(x => (filter === "all" || x.status === filter) && (!q || `${x.id} ${x.customer} ${x.email} ${x.title}`.toLowerCase().includes(q)));
  }, [quotes, filter, query]);
  const today = new Date().toISOString().slice(0, 10);

  return <>
    <PageHeader eyebrow="Sales" title="Quotations" description="Prepare a quotation, send the customer a private link, and turn it into an order once they accept."
      actions={<Link className="admin-button is-primary" href="/admin/quotes/edit"><PlusIcon aria-hidden="true" />New quotation</Link>} />
    <Card flush>
      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label="Filter by status">{filters.map(f => <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All" : quoteStatusLabel[f]}<span>{f === "all" ? quotes.length : quotes.filter(x => x.status === f).length}</span></button>)}</div>
        <SearchBox value={query} onChange={setQuery} label="Search quotations" />
      </div>
      <div className="admin-table-wrap"><table className="admin-table is-clickable">
        <thead><tr><th>Quotation</th><th>Customer</th><th>For</th><th>Status</th><th>Valid until</th><th className="num">Total</th></tr></thead>
        <tbody>
          {rows.map(x => <tr key={x.id} tabIndex={0} onClick={() => router.push(`/admin/quotes/edit?id=${encodeURIComponent(x.id)}`)} onKeyDown={e => { if (e.key === "Enter") router.push(`/admin/quotes/edit?id=${encodeURIComponent(x.id)}`); }}>
            <td><strong>{x.id}</strong><small>{formatDate(x.date)}</small></td>
            <td>{x.customer}<small>{x.email}</small></td>
            <td>{x.title || x.items[0]?.description || "—"}{x.orderId && <small>Order {x.orderId}</small>}</td>
            <td><Badge tone={quoteTone[x.status]}>{quoteStatusLabel[x.status]}</Badge></td>
            <td>{x.validUntil ? <>{formatDate(x.validUntil)}{x.status === "sent" && x.validUntil < today && <small>Expired</small>}</> : "—"}</td>
            <td className="num">{money(quoteTotal(x))}</td>
          </tr>)}
          {!rows.length && <tr><td colSpan={6} className="admin-empty">{quotes.length ? "No quotations match this filter." : "No quotations yet. Create one from an enquiry, or press New quotation."}</td></tr>}
        </tbody>
      </table></div>
    </Card>
  </>;
}
