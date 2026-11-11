import { NextResponse } from "next/server";
import { getPaymentSettings, settleLinkSession, verifyWebhook } from "@/lib/server/stripe";

// Stripe → our server. Add this URL in Stripe Dashboard → Developers → Webhooks with the events
// checkout.session.completed and checkout.session.async_payment_succeeded. Marks Payment Link invoices as paid.
export async function POST(request: Request) {
  const payload = await request.text();
  const { secretKey, webhookSecret } = await getPaymentSettings();
  if (!webhookSecret) return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  if (!verifyWebhook(payload, request.headers.get("stripe-signature"), webhookSecret)) return NextResponse.json({ error: "Invalid signature." }, { status: 400 });

  const event = JSON.parse(payload) as { type: string; data: { object: Parameters<typeof settleLinkSession>[1] } };
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") await settleLinkSession(secretKey || null, event.data.object);
  } catch (err) {
    console.error("stripe webhook", err);
    return NextResponse.json({ error: "Could not process event." }, { status: 500 }); // Stripe will retry
  }
  return NextResponse.json({ received: true });
}
