import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (user instanceof Response) return user;
  return NextResponse.json({ user });
}
