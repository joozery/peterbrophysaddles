import { NextResponse } from "next/server";
import { endSession, fail, sameOrigin } from "@/lib/server/auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail(403, "Forbidden");
  try { await endSession(); } catch (err) { console.error("logout", err); }
  return NextResponse.json({ ok: true });
}
