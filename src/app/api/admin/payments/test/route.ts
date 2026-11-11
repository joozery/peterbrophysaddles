import { NextResponse } from "next/server";
import { fail, requireUser } from "@/lib/server/auth";
import { StripeError, getPaymentSettings, keyMode, stripe } from "@/lib/server/stripe";

// Checks the saved secret key against Stripe and reports which account it belongs to.
export async function POST(request: Request) {
  const user = await requireUser(request, ["owner"]);
  if (user instanceof Response) return user;
  const { secretKey } = await getPaymentSettings();
  if (!secretKey) return fail(400, "Save a secret key first.");
  try {
    const account = await stripe<{ id: string; business_profile?: { name?: string }; settings?: { dashboard?: { display_name?: string } }; email?: string; charges_enabled?: boolean; default_currency?: string; country?: string }>(secretKey, "GET", "account");
    return NextResponse.json({
      ok: true, mode: keyMode(secretKey), accountId: account.id,
      name: account.settings?.dashboard?.display_name || account.business_profile?.name || account.email || account.id,
      chargesEnabled: account.charges_enabled ?? null, currency: account.default_currency ?? "", country: account.country ?? "",
    });
  } catch (err) {
    if (err instanceof StripeError) return fail(err.status === 401 ? 400 : 502, err.status === 401 ? "Stripe rejected this key. Check you copied the whole secret key." : err.message);
    console.error("stripe test", err); return fail(502, "Could not reach Stripe.");
  }
}
