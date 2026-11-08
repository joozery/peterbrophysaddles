import { NextResponse } from "next/server";
import { type AdminDoc, type Role, fail, hashPassword, publicAdmin, readJson, requireUser, validatePassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

const ROLES: Role[] = ["owner", "admin", "staff"];

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (user instanceof Response) return user;
  const admins = await (await db()).collection<AdminDoc>("admins").find().sort({ name: 1 }).toArray();
  return NextResponse.json({ users: admins.map(publicAdmin) });
}

// Owners create accounts with a temporary password to share with the new user.
export async function POST(request: Request) {
  const user = await requireUser(request, ["owner"]);
  if (user instanceof Response) return user;
  const body = await readJson<{ name?: unknown; email?: unknown; role?: unknown; password?: unknown; active?: unknown }>(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!name) return fail(400, "Name is required.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, "Enter a valid email address.");
  if (!ROLES.includes(body?.role as Role)) return fail(400, "Choose a role.");
  const pwError = validatePassword(body?.password);
  if (pwError) return fail(400, pwError);
  const admins = (await db()).collection<AdminDoc>("admins");
  if (await admins.findOne({ email })) return fail(409, "An admin with this email already exists.");
  const today = new Date().toISOString().slice(0, 10);
  const admin: AdminDoc = { id: `AD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name, email, role: body!.role as Role, active: body?.active !== false, passwordHash: await hashPassword(body!.password as string), invitedAt: today, lastActive: "" };
  await admins.insertOne(admin);
  return NextResponse.json({ user: publicAdmin(admin) });
}
