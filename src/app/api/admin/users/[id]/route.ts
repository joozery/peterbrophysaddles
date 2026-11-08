import { NextResponse } from "next/server";
import { type AdminDoc, type Role, fail, hashPassword, publicAdmin, readJson, requireUser, validatePassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

type Ctx = { params: Promise<{ id: string }> };
const ROLES: Role[] = ["owner", "admin", "staff"];

/** True if removing owner rights from `id` would leave no active owner. */
async function isLastOwner(id: string) {
  const owners = await (await db()).collection<AdminDoc>("admins").find({ role: "owner", active: true }, { projection: { id: 1 } }).toArray();
  return owners.length <= 1 && owners.some(o => o.id === id);
}

async function endSessionsFor(id: string) { await (await db()).collection("sessions").deleteMany({ adminId: id }); }

export async function PATCH(request: Request, { params }: Ctx) {
  const user = await requireUser(request, ["owner"]);
  if (user instanceof Response) return user;
  const { id } = await params;
  const body = await readJson<{ name?: unknown; email?: unknown; role?: unknown; active?: unknown; password?: unknown }>(request);
  const admins = (await db()).collection<AdminDoc>("admins");
  const target = await admins.findOne({ id });
  if (!target) return fail(404, "User not found.");
  const name = typeof body?.name === "string" ? body.name.trim() : target.name;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : target.email;
  const role = body?.role === undefined ? target.role : body.role as Role;
  const active = typeof body?.active === "boolean" ? body.active : target.active;
  if (!name) return fail(400, "Name is required.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, "Enter a valid email address.");
  if (!ROLES.includes(role)) return fail(400, "Choose a role.");
  if ((role !== "owner" || !active) && await isLastOwner(id)) return fail(400, "There must be at least one active owner. Make someone else an owner first.");
  if (email !== target.email && await admins.findOne({ email })) return fail(409, "An admin with this email already exists.");
  const set: Partial<AdminDoc> = { name, email, role, active };
  if (body?.password !== undefined && body.password !== "") {
    const pwError = validatePassword(body.password);
    if (pwError) return fail(400, pwError);
    set.passwordHash = await hashPassword(body.password as string);
  }
  await admins.updateOne({ id }, { $set: set });
  // Deactivation or a password reset signs the person out everywhere.
  if (!active || set.passwordHash) await endSessionsFor(id);
  return NextResponse.json({ user: publicAdmin({ ...target, ...set }) });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const user = await requireUser(request, ["owner"]);
  if (user instanceof Response) return user;
  const { id } = await params;
  if (id === user.id) return fail(400, "You can’t delete your own account.");
  if (await isLastOwner(id)) return fail(400, "The only owner can’t be removed.");
  const res = await (await db()).collection("admins").deleteOne({ id });
  if (!res.deletedCount) return fail(404, "User not found.");
  await endSessionsFor(id);
  return NextResponse.json({ ok: true });
}
