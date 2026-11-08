import "server-only";
import { type AdminState, LIST_KEYS, type ListName, SINGLETONS, type SingletonName, defaultAbout, defaultHome, defaultPricing, defaultPromotion, defaultSettings, mergeAbout, mergeHome, mergePricing, seedPages, seedProducts } from "@/lib/admin-types";
import type { Role } from "./auth";
import { db } from "./db";

// Who may write to each collection. Deleting needs the `remove` roles.
const PERMS: Record<ListName | SingletonName, { write: Role[]; remove: Role[] }> = {
  orders: { write: ["owner", "admin", "staff"], remove: ["owner", "admin"] },
  enquiries: { write: ["owner", "admin", "staff"], remove: ["owner", "admin"] },
  customers: { write: ["owner", "admin"], remove: ["owner", "admin"] },
  products: { write: ["owner", "admin"], remove: ["owner", "admin"] },
  discountCodes: { write: ["owner", "admin"], remove: ["owner", "admin"] },
  pages: { write: ["owner", "admin"], remove: ["owner"] },
  promotion: { write: ["owner", "admin"], remove: [] },
  settings: { write: ["owner"], remove: [] },
  home: { write: ["owner", "admin"], remove: [] },
  about: { write: ["owner", "admin"], remove: [] },
  pricing: { write: ["owner", "admin"], remove: [] },
};

export type SyncOp =
  | { kind: "upsert"; list: ListName; doc: Record<string, unknown> }
  | { kind: "delete"; list: ListName; key: string }
  | { kind: "set"; singleton: SingletonName; value: Record<string, unknown> };

const isList = (v: unknown): v is ListName => typeof v === "string" && v in LIST_KEYS;
const isSingleton = (v: unknown): v is SingletonName => typeof v === "string" && (SINGLETONS as readonly string[]).includes(v);
const isPlainObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const validKey = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length <= 80 && /^[\w./-]+$/.test(v);

/** Inserts the real catalogue, page content and defaults the first time the database is used. */
async function seedIfEmpty() {
  const d = await db();
  const meta = d.collection<{ _id: string; at: Date }>("meta");
  // Page content added after the first seed: insert only if missing (never overwrites edits).
  const seedConfig = () => Promise.all([
    d.collection("config").updateOne({ _id: "home" as never }, { $setOnInsert: { value: defaultHome } }, { upsert: true }),
    d.collection("config").updateOne({ _id: "about" as never }, { $setOnInsert: { value: defaultAbout } }, { upsert: true }),
    d.collection("config").updateOne({ _id: "pricing" as never }, { $setOnInsert: { value: defaultPricing } }, { upsert: true }),
  ]);
  if (await meta.findOne({ _id: "seeded" })) { await seedConfig(); return; }
  if (!(await d.collection("products").countDocuments())) await d.collection("products").insertMany(seedProducts());
  if (!(await d.collection("pages").countDocuments())) await d.collection("pages").insertMany(seedPages());
  await d.collection("config").updateOne({ _id: "promotion" as never }, { $setOnInsert: { value: defaultPromotion } }, { upsert: true });
  await d.collection("config").updateOne({ _id: "settings" as never }, { $setOnInsert: { value: defaultSettings } }, { upsert: true });
  await seedConfig();
  await meta.updateOne({ _id: "seeded" }, { $setOnInsert: { at: new Date() } }, { upsert: true });
}

export async function loadState(): Promise<AdminState> {
  await seedIfEmpty();
  const d = await db();
  const list = <T,>(name: ListName, sort: Record<string, 1 | -1>) => d.collection(name).find({}, { projection: { _id: 0 } }).sort(sort).toArray() as Promise<T[]>;
  const config = await d.collection<{ _id: string; value: unknown }>("config").find({ _id: { $in: [...SINGLETONS] } }).toArray();
  const single = <T,>(name: SingletonName, fallback: T) => ({ ...fallback, ...(config.find(c => c._id === name)?.value as T | undefined) });
  const [orders, enquiries, customers, products, discountCodes, pages] = await Promise.all([
    list<AdminState["orders"][number]>("orders", { date: -1, id: -1 }),
    list<AdminState["enquiries"][number]>("enquiries", { date: -1, id: -1 }),
    list<AdminState["customers"][number]>("customers", { name: 1 }),
    list<AdminState["products"][number]>("products", { _id: 1 }),
    list<AdminState["discountCodes"][number]>("discountCodes", { _id: 1 }),
    list<AdminState["pages"][number]>("pages", { _id: 1 }),
  ]);
  return { orders, enquiries, customers, products, discountCodes, pages, promotion: single("promotion", defaultPromotion), settings: single("settings", defaultSettings), home: mergeHome(config.find(c => c._id === "home")?.value as Partial<AdminState["home"]> | undefined), about: mergeAbout(config.find(c => c._id === "about")?.value as Partial<AdminState["about"]> | undefined), pricing: mergePricing(config.find(c => c._id === "pricing")?.value as Partial<AdminState["pricing"]> | undefined) };
}

export async function getPromotion() {
  await seedIfEmpty();
  const doc = await (await db()).collection<{ _id: string; value: unknown }>("config").findOne({ _id: "promotion" });
  return { ...defaultPromotion, ...(doc?.value as object | undefined) };
}

/** Content pages (title, intro, header image) for the public site, keyed by slug. */
export async function getPages(): Promise<Record<string, AdminState["pages"][number]>> {
  await seedIfEmpty();
  const docs = await (await db()).collection("pages").find({}, { projection: { _id: 0 } }).toArray() as unknown as AdminState["pages"];
  return Object.fromEntries(docs.map(p => [p.slug, p]));
}

/** Saddle Pricing page content for the public site. */
export async function getPricing() {
  await seedIfEmpty();
  const doc = await (await db()).collection<{ _id: string; value: unknown }>("config").findOne({ _id: "pricing" });
  return mergePricing(doc?.value as Partial<AdminState["pricing"]> | undefined);
}

/** About page content for the public site. */
export async function getAbout() {
  await seedIfEmpty();
  const doc = await (await db()).collection<{ _id: string; value: unknown }>("config").findOne({ _id: "about" });
  return mergeAbout(doc?.value as Partial<AdminState["about"]> | undefined);
}

/** Home page content for the public site. */
export async function getHome() {
  await seedIfEmpty();
  const doc = await (await db()).collection<{ _id: string; value: unknown }>("config").findOne({ _id: "home" });
  return mergeHome(doc?.value as Partial<AdminState["home"]> | undefined);
}

/** Validates and applies a batch of changes from the admin UI. Returns an error message or null. */
export async function applyOps(raw: unknown, role: Role): Promise<string | null> {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 200) return "Invalid change set.";
  const ops: SyncOp[] = [];
  for (const op of raw as Record<string, unknown>[]) {
    if (!isPlainObject(op)) return "Invalid change.";
    if (op.kind === "set") {
      if (!isSingleton(op.singleton) || !isPlainObject(op.value)) return "Invalid setting change.";
      if (!PERMS[op.singleton].write.includes(role)) return `Your role can’t change ${op.singleton}.`;
      ops.push({ kind: "set", singleton: op.singleton, value: op.value });
    } else if (op.kind === "upsert" || op.kind === "delete") {
      if (!isList(op.list)) return "Unknown collection.";
      const perm = PERMS[op.list];
      if (op.kind === "delete") {
        if (!validKey(op.key)) return "Invalid id.";
        if (!perm.remove.includes(role)) return `Your role can’t delete ${op.list}.`;
        ops.push({ kind: "delete", list: op.list, key: op.key });
      } else {
        if (!isPlainObject(op.doc) || !validKey(op.doc[LIST_KEYS[op.list]])) return "Invalid record.";
        if (!perm.write.includes(role)) return `Your role can’t edit ${op.list}.`;
        ops.push({ kind: "upsert", list: op.list, doc: op.doc });
      }
    } else return "Invalid change.";
    if (JSON.stringify(op).length > 50_000) return "A record is too large.";
  }
  const d = await db();
  for (const op of ops) {
    if (op.kind === "set") await d.collection("config").updateOne({ _id: op.singleton as never }, { $set: { value: op.value } }, { upsert: true });
    else if (op.kind === "delete") await d.collection(op.list).deleteOne({ [LIST_KEYS[op.list]]: op.key });
    else {
      const key = LIST_KEYS[op.list];
      const { _id, ...doc } = op.doc; void _id;
      await d.collection(op.list).replaceOne({ [key]: doc[key] }, doc, { upsert: true });
    }
  }
  return null;
}
