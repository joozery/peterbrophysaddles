import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: { N: number; r: number; p: number }) => Promise<Buffer>;
const SCRYPT = { N: 16384, r: 8, p: 1 };
export const SESSION_COOKIE = "pb_admin";
const SESSION_DAYS = 14;

export type Role = "owner" | "admin" | "staff";
export type AdminDoc = { id: string; name: string; email: string; role: Role; active: boolean; passwordHash: string; invitedAt: string; lastActive: string };
export type SessionUser = Omit<AdminDoc, "passwordHash">;

/** The admin record without its password hash (safe to send to the browser). */
export const publicAdmin = (a: AdminDoc): SessionUser => ({ id: a.id, name: a.name, email: a.email, role: a.role, active: a.active, invitedAt: a.invitedAt, lastActive: a.lastActive });

export function validatePassword(pw: unknown): string | null {
  if (typeof pw !== "string" || pw.length < 10) return "Password must be at least 10 characters.";
  if (pw.length > 200) return "Password is too long.";
  return null;
}

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64, SCRYPT);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [alg, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(pw, Buffer.from(salt, "base64"), expected.length, SCRYPT);
  return timingSafeEqual(actual, expected);
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Creates a DB session and sets the httpOnly cookie. Only the token's hash is stored. */
export async function startSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await (await db()).collection("sessions").insertOne({ tokenHash: sha256(token), adminId, expiresAt, createdAt: new Date() });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await (await db()).collection("sessions").deleteOne({ tokenHash: sha256(token) });
  jar.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const d = await db();
  // Session + admin in one round-trip (the database is remote, so each trip costs ~40 ms).
  const [row] = await d.collection("sessions").aggregate<{ admin: AdminDoc[] }>([
    { $match: { tokenHash: sha256(token), expiresAt: { $gt: new Date() } } },
    { $limit: 1 },
    { $lookup: { from: "admins", localField: "adminId", foreignField: "id", as: "admin", pipeline: [{ $match: { active: true } }] } },
  ]).toArray();
  const admin = row?.admin[0];
  if (!admin) return null;
  const today = new Date().toISOString().slice(0, 10);
  // Don't make the request wait for this bookkeeping write.
  if (admin.lastActive !== today) d.collection("admins").updateOne({ id: admin.id }, { $set: { lastActive: today } }).catch(err => console.error("lastActive", err));
  return publicAdmin(admin);
}

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/** Rejects cross-site requests to state-changing endpoints (defence in depth on top of SameSite cookies). */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

/** Use in route handlers: returns the user, or a Response to return immediately. */
export async function requireUser(request: Request, roles?: Role[]): Promise<SessionUser | Response> {
  if (request.method !== "GET" && !sameOrigin(request)) return fail(403, "Forbidden");
  let user: SessionUser | null;
  try { user = await currentUser(); } catch (err) { console.error("auth/db error", err); return fail(503, "Database unavailable. Try again shortly."); }
  if (!user) return fail(401, "Please sign in.");
  if (roles && !roles.includes(user.role)) return fail(403, "Your role doesn’t allow this.");
  return user;
}

/** Simple brute-force guard: max 8 failed logins per email+IP per 15 minutes. */
export async function loginBlocked(key: string) {
  return (await (await db()).collection("login_attempts").countDocuments({ key })) >= 8;
}
export async function recordFailedLogin(key: string) {
  await (await db()).collection("login_attempts").insertOne({ key, at: new Date() });
}
export async function clearFailedLogins(key: string) {
  await (await db()).collection("login_attempts").deleteMany({ key });
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try { const v = await request.json(); return v && typeof v === "object" ? v as T : null; } catch { return null; }
}
