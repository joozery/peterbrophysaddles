import { NextResponse } from "next/server";
import { type AdminDoc, fail, hashPassword, readJson, requireUser, validatePassword, verifyPassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

// Change your own password (requires the current one).
export async function POST(request: Request) {
  const user = await requireUser(request);
  if (user instanceof Response) return user;
  const body = await readJson<{ current?: unknown; next?: unknown }>(request);
  const pwError = validatePassword(body?.next);
  if (pwError) return fail(400, pwError);
  const admins = (await db()).collection<AdminDoc>("admins");
  const admin = await admins.findOne({ id: user.id });
  if (!admin || typeof body?.current !== "string" || !(await verifyPassword(body.current, admin.passwordHash))) return fail(400, "Current password is incorrect.");
  await admins.updateOne({ id: user.id }, { $set: { passwordHash: await hashPassword(body.next as string) } });
  return NextResponse.json({ ok: true });
}
