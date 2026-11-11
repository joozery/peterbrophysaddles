import { NextResponse } from "next/server";
import { fail, readJson, requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { type PaymentLink, StripeError, checkPaymentLink, createPaymentLink, deactivatePaymentLink, getPaymentSettings } from "@/lib/server/stripe";

type Ctx = { params: Promise<{ id: string }> };
type OrderDoc = { id: string; customer: string; email: string; items: { price: number; quantity: number }[]; paid: boolean; paymentLinks?: PaymentLink[] };
const ROLES = ["owner", "admin", "staff"] as ("owner" | "admin" | "staff")[];

async function context(request: Request, ctx: Ctx) {
  const user = await requireUser(request, ROLES);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  const { secretKey } = await getPaymentSettings();
  if (!secretKey) return fail(409, "Stripe isn’t connected yet. The owner can add the key in Admin → Payments.");
  const orders = (await db()).collection<OrderDoc>("orders");
  const order = await orders.findOne({ id }, { projection: { _id: 0 } });
  if (!order) return fail(404, "Order not found.");
  return { user, key: secretKey, orders, order };
}
const stripeFail = (err: unknown) => {
  if (err instanceof StripeError) return fail(502, `Stripe: ${err.message}`);
  console.error("payment link", err); return fail(503, "Could not reach Stripe or the database.");
};
type Context = Exclude<Awaited<ReturnType<typeof context>>, Response>;
const reply = async (c: Context) => NextResponse.json({ order: await c.orders.findOne({ id: c.order.id }, { projection: { _id: 0 } }) });

/** Create a Stripe Payment Link for an amount (AUD cents) on this order. */
export async function POST(request: Request, ctx: Ctx) {
  const c = await context(request, ctx);
  if (c instanceof Response) return c;
  const body = await readJson<{ amount?: unknown; description?: unknown }>(request);
  const amount = Number(body?.amount);
  const description = typeof body?.description === "string" ? body.description.trim().slice(0, 120) : "";
  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 99_999_999) return fail(400, "Enter an amount between $0.50 and $999,999.99.");
  if (!description) return fail(400, "Add a description, e.g. “Invoice PB-1234 — deposit”.");
  if ((c.order.paymentLinks ?? []).filter(l => l.status === "open").length >= 5) return fail(400, "This order already has 5 open links. Cancel one first.");
  try {
    const link = await createPaymentLink(c.key, c.order, amount, description, c.user.name);
    await c.orders.updateOne({ id: c.order.id }, { $push: { paymentLinks: link } });
    return reply(c);
  } catch (err) { return stripeFail(err); }
}

/** { linkId, action: "check" | "cancel" } — check with Stripe whether it's paid, or switch the link off. */
export async function PATCH(request: Request, ctx: Ctx) {
  const c = await context(request, ctx);
  if (c instanceof Response) return c;
  const body = await readJson<{ linkId?: unknown; action?: unknown }>(request);
  const link = (c.order.paymentLinks ?? []).find(l => l.id === body?.linkId);
  if (!link) return fail(404, "Payment link not found.");
  try {
    if (body?.action === "check") {
      if (link.status === "open") await checkPaymentLink(c.key, link.id);
    } else if (body?.action === "cancel") {
      if (link.status !== "open") return fail(400, "Only open links can be cancelled.");
      if (await checkPaymentLink(c.key, link.id)) return fail(409, "This link has already been paid, so it wasn’t cancelled. The order has been updated.");
      await deactivatePaymentLink(c.key, link.id);
      await c.orders.updateOne({ id: c.order.id, "paymentLinks.id": link.id }, { $set: { "paymentLinks.$.status": "cancelled" } });
    } else return fail(400, "Unknown action.");
    return reply(c);
  } catch (err) { return stripeFail(err); }
}
