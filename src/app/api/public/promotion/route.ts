import { NextResponse, connection } from "next/server";
import { getPromotion } from "@/lib/server/admin-data";

// Public: the home page popup reads its content here.
export async function GET() {
  await connection();
  try {
    return NextResponse.json({ promotion: await getPromotion() }, { headers: { "cache-control": "public, max-age=30" } });
  } catch (err) {
    console.error("promotion", err);
    return NextResponse.json({ promotion: null }, { status: 503 });
  }
}
