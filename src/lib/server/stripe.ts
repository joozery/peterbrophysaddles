import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { db } from "./db";

/**
 * Stripe connection settings. Stored in MongoDB (config/_id "payments"), NOT in the shared admin state,
 * so the secret key and webhook secret never reach the browser. Only the owner can change them.
 * Used for Stripe Payment Links that staff create per invoice — there is no online checkout on the site.
 */
export type PaymentSettings = { secretKey: string; webhookSecret: string; updatedAt: string; updatedBy: string };
const empty: PaymentSettings = { secretKey: "", webhookSecret: "", updatedAt: "", updatedBy: "" };

export const SECRET_KEY = /^(sk|rk)_(test|live)_[A-Za-z0-9]{10,}$/;
export const WEBHOOK_SECRET = /^whsec_[A-Za-z0-9+/=]{10,}$/;
export const keyMode = (key: string) => key.includes("_live_") ? "live" : key.includes("_test_") ? "test" : null;
const mask = (key: string) => key ? `${key.slice(0, 8)}…${key.slice(-4)}` : "";

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const doc = await (await db()).collection<{ _id: string; value: Partial<PaymentSettings> }>("config").findOne({ _id: "payments" });
  const { secretKey = "", webhookSecret = "", updatedAt = "", updatedBy = "" } = doc?.value ?? {};
  return { ...empty, secretKey, webhookSecret, updatedAt, updatedBy };
}

export async function savePaymentSettings(value: PaymentSettings) {
  await (await db()).collection("config").updateOne({ _id: "payments" as never }, { $set: { value } }, { upsert: true });
}

/** What the admin UI may see: never the secrets themselves. */
export function publicPaymentSettings(s: PaymentSettings) {
  return {
    mode: keyMode(s.secretKey), secretKey: mask(s.secretKey), webhookSecret: s.webhookSecret ? "whsec_…" + s.webhookSecret.slice(-4) : "",
    hasSecretKey: !!s.secretKey, hasWebhookSecret: !!s.webhookSecret, updatedAt: s.updatedAt, updatedBy: s.updatedBy,
  };
}

/** Encodes nested params the way Stripe's API expects (a[b][0][c]=…). */
function form(params: Record<string, unknown>, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") form(v as Record<string, unknown>, key, out);
    else out.append(key, String(v));
  }
  return out;
}

export class StripeError extends Error { constructor(message: string, public status: number) { super(message); } }

export async function stripe<T = Record<string, unknown>>(key: string, method: "GET" | "POST", path: string, params?: Record<string, unknown>, idempotencyKey?: string): Promise<T> {
  const body = params && method === "POST" ? form(params) : undefined;
  const url = `https://api.stripe.com/v1/${path}${params && method === "GET" ? `?${form(params)}` : ""}`;
  const res = await fetch(url, {
    method, body, cache: "no-store",
    headers: { authorization: `Bearer ${key}`, ...(body ? { "content-type": "application/x-www-form-urlencoded" } : {}), ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}) },
  });
  const json = await res.json().catch(() => ({})) as { error?: { message?: string } };
  if (!res.ok) throw new StripeError(json.error?.message || `Stripe request failed (${res.status}).`, res.status);
  return json as T;
}

/** Verifies the Stripe-Signature header (HMAC-SHA256 of "timestamp.payload"), allowing 5 minutes of clock skew. */
export function verifyWebhook(payload: string, header: string | null, secret: string, toleranceSec = 300): boolean {
  if (!header) return false;
  const parts = header.split(",").map(p => p.split("=") as [string, string]);
  const t = Number(parts.find(([k]) => k === "t")?.[1]);
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!Number.isFinite(t) || !signatures.length || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex"));
  return signatures.some(sig => { const b = Buffer.from(sig); return b.length === expected.length && timingSafeEqual(b, expected); });
}

/* ---------------- Payment Links ---------------- */

export type PaymentLink = { id: string; url: string; amount: number; description: string; status: "open" | "paid" | "cancelled"; createdAt: string; createdBy: string; paidAt?: string; sessionId?: string };
type OrderDoc = { id: string; customer: string; email: string; items: { price: number; quantity: number }[]; paid: boolean; paymentLinks?: PaymentLink[] };
type Session = { id: string; payment_status: string; status: string; payment_link?: string | null; amount_total?: number };

export const orderTotal = (o: Pick<OrderDoc, "items">) => o.items.reduce((s, i) => s + i.price * i.quantity, 0);
export const paidViaLinks = (o: Pick<OrderDoc, "paymentLinks">) => (o.paymentLinks ?? []).filter(l => l.status === "paid").reduce((s, l) => s + l.amount, 0);

/** Creates a single-use Stripe Payment Link (AUD) for part or all of an order's invoice. */
export async function createPaymentLink(key: string, order: OrderDoc, amount: number, description: string, by: string): Promise<PaymentLink> {
  const ref = randomUUID();
  const price = await stripe<{ id: string }>(key, "POST", "prices", {
    currency: "aud", unit_amount: amount, product_data: { name: description, metadata: { orderId: order.id } },
  }, `price-${ref}`);
  const link = await stripe<{ id: string; url: string }>(key, "POST", "payment_links", {
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { orderId: order.id },
    payment_intent_data: { metadata: { orderId: order.id }, description: `${description} — ${order.customer}` },
    restrictions: { completed_sessions: { limit: 1 } }, // one payment per link, so it can't be paid twice
    after_completion: { type: "hosted_confirmation", hosted_confirmation: { custom_message: `Thank you — your payment for ${description} has been received. Peter Brophy Saddles will be in touch.` } },
  }, `link-${ref}`);
  return { id: link.id, url: link.url, amount, description, status: "open", createdAt: new Date().toISOString(), createdBy: by };
}

/**
 * Records a completed Stripe payment against the order that owns the payment link, then closes the link.
 * Safe to call repeatedly (webhook retries + the admin "Check payment" button).
 */
export async function settleLinkSession(key: string | null, session: Session) {
  if (!session.payment_link || session.payment_status !== "paid") return false;
  const orders = (await db()).collection<OrderDoc>("orders");
  const now = new Date().toISOString();
  const order = await orders.findOneAndUpdate(
    { paymentLinks: { $elemMatch: { id: session.payment_link, status: { $ne: "paid" } } } },
    { $set: { "paymentLinks.$.status": "paid", "paymentLinks.$.paidAt": now, "paymentLinks.$.sessionId": session.id } },
    { returnDocument: "after" },
  );
  if (!order) return false;
  if (paidViaLinks(order) >= orderTotal(order)) await orders.updateOne({ id: order.id }, { $set: { paid: true } });
  if (key) await stripe(key, "POST", `payment_links/${session.payment_link}`, { active: false }).catch(err => console.error("deactivate link", err));
  return true;
}

/** Asks Stripe whether a link has been paid (for when no webhook is set up, e.g. on localhost). */
export async function checkPaymentLink(key: string, linkId: string) {
  const { data } = await stripe<{ data: Session[] }>(key, "GET", "checkout/sessions", { payment_link: linkId, status: "complete", limit: 3 });
  const paid = data.find(s => s.payment_status === "paid");
  if (paid) await settleLinkSession(key, { ...paid, payment_link: linkId });
  return !!paid;
}

export const deactivatePaymentLink = (key: string, linkId: string) => stripe(key, "POST", `payment_links/${linkId}`, { active: false });
