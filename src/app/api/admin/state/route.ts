import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { loadState } from "@/lib/server/admin-data";

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (user instanceof Response) return user;
  try { return NextResponse.json({ state: await loadState(), user }); }
  catch (err) { console.error("load state", err); return NextResponse.json({ error: "Could not load data from the database." }, { status: 503 }); }
}
