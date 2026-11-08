import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, UPLOAD_FOLDERS, presignImageUpload, r2Configured } from "@/lib/r2";

// Issues a signed R2 upload URL for an admin image.
// Only signed-in owners/admins may upload (staff can't edit images).
export async function POST(request: Request) {
  const user = await requireUser(request, ["owner", "admin"]);
  if (user instanceof Response) return user;
  if (!r2Configured()) return NextResponse.json({ error: "Image uploads are not set up yet. Add the R2 settings to .env.local and restart the server." }, { status: 503 });

  let body: { folder?: unknown; contentType?: unknown; size?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const { folder, contentType, size } = body;
  if (typeof folder !== "string" || !(UPLOAD_FOLDERS as readonly string[]).includes(folder)) return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
  if (typeof contentType !== "string" || !IMAGE_TYPES[contentType]) return NextResponse.json({ error: "Only JPG, PNG, WebP, AVIF or GIF images can be uploaded." }, { status: 400 });
  if (typeof size !== "number" || !Number.isInteger(size) || size <= 0 || size > MAX_IMAGE_BYTES) return NextResponse.json({ error: `Images must be smaller than ${MAX_IMAGE_BYTES / 1024 / 1024} MB.` }, { status: 400 });

  try {
    return NextResponse.json(await presignImageUpload({ folder, contentType, size }));
  } catch (error) {
    console.error("R2 presign failed", error);
    return NextResponse.json({ error: "Could not prepare the upload. Check the R2 settings." }, { status: 500 });
  }
}
