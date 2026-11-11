import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { readJson, sameOrigin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { products } from "@/lib/catalog";

const TOPICS = ["Custom saddle", "Saddle range & fit", "Tack & leatherwork", "General enquiry"];
const MAX_PER_HOUR = 5;
const text = (v: unknown, max: number) => typeof v === "string" ? v.replace(/\s+$/g, "").trim().slice(0, max) : "";
const json = (status: number, body: object) => NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

/**
 * Public: the Contact page and the home page "custom saddle" popup post here.
 * Saved to Admin → Enquiries. Spam guards: same-origin, hidden honeypot field, minimum fill time, and a per-IP hourly limit.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json(403, { error: "Forbidden" });
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return json(400, { error: "Invalid request." });

  // Bots fill every field (including the hidden "website" one) and submit instantly. Pretend success so they don't retry.
  const startedAt = Number(body.startedAt);
  if (text(body.website, 200) || (Number.isFinite(startedAt) && Date.now() - startedAt < 2500)) return json(200, { ok: true });

  const name = text(body.name, 100), email = text(body.email, 200).toLowerCase(), message = text(body.message, 5000);
  if (!name || !message) return json(400, { error: "Please add your name and a message." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(400, { error: "Please enter a valid email address." });
  const topic = TOPICS.includes(text(body.topic, 60)) ? text(body.topic, 60) : "General enquiry";
  const product = products.find(p => p.id === text(body.product, 80));

  try {
    const d = await db();
    const ip = (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "local").trim().slice(0, 64);
    const attempts = d.collection("enquiry_attempts");
    if (await attempts.countDocuments({ ip }) >= MAX_PER_HOUR) return json(429, { error: "Thanks — we’ve already received several messages from you. Please try again later, or email us directly." });
    await attempts.insertOne({ ip, at: new Date() });

    const now = new Date();
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(now); // YYYY-MM-DD, workshop time
    await d.collection("enquiries").insertOne({
      id: `EQ-${randomUUID().slice(0, 8).toUpperCase()}`, name, email, phone: text(body.phone, 40), topic,
      discipline: text(body.discipline, 80), message, date, status: "new", source: text(body.source, 20) === "popup" ? "Website popup" : "Website contact form",
      ...(product ? { productId: product.id, productName: product.name } : {}), receivedAt: now.toISOString(),
    });
    return json(200, { ok: true });
  } catch (err) {
    console.error("public enquiry", err);
    return json(503, { error: "Sorry, we couldn’t send your message right now. Please try again shortly or email us directly." });
  }
}
