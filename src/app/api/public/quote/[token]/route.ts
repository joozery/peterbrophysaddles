import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

/** Public: the customer accepts a quotation from its page. Only a sent, unexpired, not-yet-answered quote can be accepted. */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{24,64}$/.test(token)) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  try {
    const d = await db();
    const quotes = d.collection<{ id: string; status: string; validUntil: string; enquiryId?: string; acceptedAt?: string }>("quotes");
    const quote = await quotes.findOne({ token });
    if (!quote || quote.status === "draft") return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
    if (quote.status === "accepted") return NextResponse.json({ ok: true, acceptedAt: quote.acceptedAt });
    if (quote.status !== "sent") return NextResponse.json({ error: "This quotation is no longer open. Please contact us." }, { status: 409 });
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(new Date());
    if (quote.validUntil && quote.validUntil < today) return NextResponse.json({ error: "This quotation has expired. Please contact us for an updated quote." }, { status: 409 });
    const acceptedAt = new Date().toISOString();
    await quotes.updateOne({ token, status: "sent" }, { $set: { status: "accepted", acceptedAt } });
    if (quote.enquiryId) await d.collection("enquiries").updateOne({ id: quote.enquiryId, status: { $ne: "closed" } }, { $set: { status: "quoted" } });
    return NextResponse.json({ ok: true, acceptedAt });
  } catch (err) {
    console.error("accept quote", err);
    return NextResponse.json({ error: "Sorry, something went wrong. Please try again or contact us." }, { status: 503 });
  }
}
