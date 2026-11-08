import "server-only";
import { AwsClient } from "aws4fetch";

// Cloudflare R2 (S3-compatible). Credentials stay on the server; the browser only receives a short-lived signed URL.
export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const UPLOAD_FOLDERS = ["products", "promotions", "pages", "misc"] as const;
const URL_TTL_SECONDS = 300;

function config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) return null;
  return { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET, publicUrl: R2_PUBLIC_URL.replace(/\/+$/, "") };
}

export const r2Configured = () => config() !== null;

/** Presign a PUT for one image. Content type and exact byte size are signed, so R2 rejects any other file. */
export async function presignImageUpload({ folder, contentType, size }: { folder: string; contentType: string; size: number }) {
  const cfg = config();
  if (!cfg) throw new Error("R2 is not configured");
  const now = new Date();
  const key = `${folder}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${IMAGE_TYPES[contentType]}`;
  const client = new AwsClient({ accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey, service: "s3", region: "auto" });
  const target = new URL(`https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${key}`);
  target.searchParams.set("X-Amz-Expires", String(URL_TTL_SECONDS));
  const signed = await client.sign(new Request(target, { method: "PUT", headers: { "content-type": contentType, "content-length": String(size) } }), { aws: { signQuery: true, allHeaders: true } });
  return { uploadUrl: signed.url, publicUrl: `${cfg.publicUrl}/${key}`, key };
}
