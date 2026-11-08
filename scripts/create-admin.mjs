#!/usr/bin/env node
// Create an admin account, or reset the password of an existing one, directly in MongoDB.
// There is deliberately no web page for this: only someone with server access and .env.local can run it.
//
//   npm run admin:create
//
// Reads MONGODB_URI / MONGODB_DB from .env.local. Password input is hidden.
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";
import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

nextEnv.loadEnvConfig(process.cwd());
const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI is not set. Add it to .env.local first."); process.exit(1); }

// Same format as src/lib/server/auth.ts → hashPassword()
const hashPassword = pw => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("base64")}$${scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 }).toString("base64")}`;
};

// When piped (non-TTY), read answers line by line; when interactive, hide password typing.
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lines = [];
let waiting = null;
if (!process.stdin.isTTY) rl.on("line", l => { if (waiting) { const w = waiting; waiting = null; w(l); } else lines.push(l); });
const ask = (q, hidden = false) => new Promise(resolve => {
  if (!process.stdin.isTTY) { process.stdout.write(q); return lines.length ? resolve(lines.shift().trim()) : (waiting = v => resolve(v.trim())); }
  if (!hidden) return rl.question(q, a => resolve(a.trim()));
  const write = rl._writeToOutput;
  rl._writeToOutput = s => { if (s.includes(q)) write.call(rl, s); else write.call(rl, "*".repeat(s.length ? 1 : 0)); };
  rl.question(q, a => { rl._writeToOutput = write; process.stdout.write("\n"); resolve(a); });
});

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const admins = client.db(process.env.MONGODB_DB || "peterbrophy").collection("admins");
  console.log(`\nPeter Brophy Saddles — admin account (${await admins.countDocuments()} existing)\n`);

  const email = (await ask("Email: ")).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  const existing = await admins.findOne({ email });

  const password = await ask(existing ? "New password (min 10 chars): " : "Password (min 10 chars): ", true);
  if (password.length < 10 || password.length > 200) throw new Error("Password must be 10–200 characters.");
  if ((await ask("Confirm password: ", true)) !== password) throw new Error("Passwords don’t match.");

  if (existing) {
    await admins.updateOne({ email }, { $set: { passwordHash: hashPassword(password), active: true } });
    await client.db(process.env.MONGODB_DB || "peterbrophy").collection("sessions").deleteMany({ adminId: existing.id });
    console.log(`\n✓ Password reset for ${existing.name} (${existing.role}). Their other sessions were signed out.`);
  } else {
    const name = await ask("Name: ");
    if (!name) throw new Error("Name is required.");
    const roleAnswer = (await ask("Role [owner/admin/staff] (default owner): ")).toLowerCase() || "owner";
    if (!["owner", "admin", "staff"].includes(roleAnswer)) throw new Error("Role must be owner, admin or staff.");
    const today = new Date().toISOString().slice(0, 10);
    await admins.insertOne({ id: `AD-${randomUUID().slice(0, 8).toUpperCase()}`, name, email, role: roleAnswer, active: true, passwordHash: hashPassword(password), invitedAt: today, lastActive: "" });
    console.log(`\n✓ Created ${roleAnswer} account for ${name} <${email}>. Sign in at /admin/login`);
  }
} catch (err) {
  console.error(`\n✗ ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
} finally {
  rl.close();
  await client.close();
}
