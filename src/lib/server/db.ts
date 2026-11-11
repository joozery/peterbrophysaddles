import "server-only";
import { type Db, MongoClient } from "mongodb";

// One MongoClient per server process (reused across hot reloads in dev).
const g = globalThis as unknown as { __pbMongo?: Promise<MongoClient>; __pbIndexes?: Promise<void> };

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  g.__pbMongo ??= new MongoClient(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 10 }).connect().catch(err => { g.__pbMongo = undefined; throw err; });
  return g.__pbMongo;
}

async function ensureIndexes(d: Db) {
  await Promise.all([
    d.collection("admins").createIndex({ email: 1 }, { unique: true }),
    d.collection("admins").createIndex({ id: 1 }),
    d.collection("orders").createIndex({ stripeSessionId: 1 }, { sparse: true }),
    d.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    d.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    d.collection("login_attempts").createIndex({ at: 1 }, { expireAfterSeconds: 15 * 60 }),
    d.collection("login_attempts").createIndex({ key: 1 }),
    d.collection("enquiry_attempts").createIndex({ at: 1 }, { expireAfterSeconds: 60 * 60 }),
    d.collection("enquiry_attempts").createIndex({ ip: 1 }),
    d.collection("quotes").createIndex({ token: 1 }, { unique: true }),
    ...["orders", "enquiries", "customers", "products", "discountCodes", "quotes"].map(c => d.collection(c).createIndex({ id: 1 }, { unique: true })),
    d.collection("pages").createIndex({ slug: 1 }, { unique: true }),
  ]);
}

export async function db(): Promise<Db> {
  const d = (await client()).db(process.env.MONGODB_DB || "peterbrophy");
  g.__pbIndexes ??= ensureIndexes(d).catch(err => { g.__pbIndexes = undefined; throw err; });
  await g.__pbIndexes;
  return d;
}
