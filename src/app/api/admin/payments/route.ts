import { NextResponse } from "next/server";
import { fail, readJson, requireUser } from "@/lib/server/auth";
import { SECRET_KEY, WEBHOOK_SECRET, getPaymentSettings, publicPaymentSettings, savePaymentSettings } from "@/lib/server/stripe";

// Stripe connection settings. Owners only. Secrets are write-only: GET returns masked values.
export async function GET(request: Request) {
  const user = await requireUser(request, ["owner"]);
  if (user instanceof Response) return user;
  try { return NextResponse.json({ payments: publicPaymentSettings(await getPaymentSettings()) }); }
  catch (err) { console.error("payments", err); return fail(503, "Database unavailable."); }
}

export async function POST(request: Request) {
  const user = await requireUser(request, ["owner"]);
  if (user instanceof Response) return user;
  const body = await readJson<{ secretKey?: unknown; webhookSecret?: unknown; clear?: unknown }>(request);
  if (!body) return fail(400, "Invalid request.");
  try {
    const current = await getPaymentSettings();
    const next = { ...current };
    if (body.clear === true) { next.secretKey = ""; next.webhookSecret = ""; }
    if (typeof body.secretKey === "string" && body.secretKey.trim()) {
      const key = body.secretKey.trim();
      if (key.startsWith("pk_")) return fail(400, "That is the publishable key (pk_…). Paste the secret key — it starts with sk_test_ or sk_live_.");
      if (!SECRET_KEY.test(key)) return fail(400, "The secret key should start with sk_test_ or sk_live_ (or rk_ for a restricted key).");
      next.secretKey = key;
    }
    if (typeof body.webhookSecret === "string" && body.webhookSecret.trim()) {
      const secret = body.webhookSecret.trim();
      if (!WEBHOOK_SECRET.test(secret)) return fail(400, "The webhook signing secret should start with whsec_.");
      next.webhookSecret = secret;
    }
    next.updatedAt = new Date().toISOString();
    next.updatedBy = user.name;
    await savePaymentSettings(next);
    return NextResponse.json({ payments: publicPaymentSettings(next) });
  } catch (err) { console.error("payments", err); return fail(503, "Could not save to the database."); }
}
