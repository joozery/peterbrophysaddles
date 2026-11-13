import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getQuoteByToken } from "@/lib/server/admin-data";
import { QuoteDocument } from "@/components/quote/quote-document";
import { getBrandName } from "@/lib/server/site-settings";

// Private customer link — keep it out of search engines.
export async function generateMetadata(): Promise<Metadata> { return { title: `Quotation | ${await getBrandName()}`, robots: { index: false, follow: false } }; }

type Props = { params: Promise<{ token: string }> };
export default function QuotePage({ params }: Props) {
  return <Suspense fallback={<p style={{ padding: 40 }}>Loading quotation…</p>}><QuoteContent params={params} /></Suspense>;
}
async function QuoteContent({ params }: Props) {
  const { token } = await params;
  const data = await getQuoteByToken(token).catch(err => { console.error("quote page", err); return null; });
  if (!data) notFound();
  return <QuoteDocument quote={data.quote} business={data.business} />;
}
