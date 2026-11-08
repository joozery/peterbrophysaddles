import { NextResponse } from "next/server";
import { type AdminDoc, clearFailedLogins, fail, loginBlocked, publicAdmin, readJson, recordFailedLogin, sameOrigin, startSession, verifyPassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail(403, "Forbidden");
  const body = await readJson<{ email?: unknown; password?: unknown }>(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return fail(400, "Enter your email and password.");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = `${email}|${ip}`;
  try {
    if (await loginBlocked(key)) return fail(429, "Too many attempts. Wait 15 minutes and try again.");
    const admin = await (await db()).collection<AdminDoc>("admins").findOne({ email });
    // Same message for unknown email and wrong password, so accounts can't be discovered.
    if (!admin || !(await verifyPassword(password, admin.passwordHash))) { await recordFailedLogin(key); return fail(401, "Email or password is incorrect."); }
    if (!admin.active) return fail(403, "This account has been deactivated. Ask an owner to reactivate it.");
    await clearFailedLogins(key);
    await startSession(admin.id);
    return NextResponse.json({ user: publicAdmin(admin) });
  } catch (err) { console.error("login failed", err); return fail(503, "Can’t reach the database right now. Try again shortly."); }
}
