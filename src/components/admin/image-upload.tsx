"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Cross2Icon, ImageIcon, UploadIcon } from "@radix-ui/react-icons";

export type UploadFolder = "products" | "promotions" | "pages" | "misc";
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const MAX_BYTES = 8 * 1024 * 1024;

/** Valid image sources: a file in /public or an uploaded https URL (e.g. R2). */
export const isImageSrc = (v: string) => v.startsWith("/") || v.startsWith("https://");

async function uploadToR2(file: File, folder: UploadFolder, onProgress: (pct: number) => void): Promise<string> {
  const res = await fetch("/api/admin/uploads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ folder, contentType: file.type, size: file.size }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not start the upload.");
  // XHR instead of fetch so we can show upload progress.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", data.uploadUrl);
    xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}). Check the R2 bucket CORS settings.`));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and the R2 bucket CORS settings."));
    xhr.send(file);
  });
  return data.publicUrl as string;
}

/**
 * Image field with upload to R2. Works uncontrolled inside a form (pass `name` + `defaultValue`; the URL is
 * submitted in a hidden input) or controlled (pass `value` + `onChange`).
 */
export function ImageUpload({ label, name, defaultValue = "", value, onChange, folder, onBusyChange }: {
  label: string; name?: string; defaultValue?: string; value?: string; onChange?: (url: string) => void; folder: UploadFolder; onBusyChange?: (busy: boolean) => void;
}) {
  const [inner, setInner] = useState(defaultValue);
  const src = value ?? inner;
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showPath, setShowPath] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const set = (url: string) => { setInner(url); onChange?.(url); };
  const busy = (b: boolean) => { setProgress(b ? 0 : null); onBusyChange?.(b); };

  const pick = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!ACCEPT.split(",").includes(file.type)) return setError("Choose a JPG, PNG, WebP, AVIF or GIF image.");
    if (file.size > MAX_BYTES) return setError("Images must be smaller than 8 MB.");
    busy(true);
    try { set(await uploadToR2(file, folder, setProgress)); }
    catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
    finally { busy(false); if (input.current) input.current.value = ""; }
  };

  return <div className="admin-label">
    <span>{label}</span>
    {name && <input type="hidden" name={name} value={src} />}
    <div className={`admin-upload${progress !== null ? " is-busy" : ""}`}
      onDragOver={e => { e.preventDefault(); }}
      onDrop={e => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}>
      <div className="admin-upload-preview">
        {src && isImageSrc(src) ? <Image src={src} alt="" fill sizes="160px" unoptimized={src.startsWith("https://")} /> : <ImageIcon aria-hidden="true" />}
        {progress !== null && <div className="admin-upload-progress"><span style={{ width: `${progress}%` }} /><em>{progress}%</em></div>}
      </div>
      <div className="admin-upload-body">
        <p>{src ? <span className="admin-upload-path" title={src}>{src.replace(/^https:\/\/[^/]+\//, "…/")}</span> : <span className="admin-muted">No image</span>}</p>
        <div className="admin-upload-actions">
          <button type="button" className="admin-button" disabled={progress !== null} onClick={() => input.current?.click()}><UploadIcon aria-hidden="true" />{src ? "Replace" : "Upload"}</button>
          {src && <button type="button" className="admin-icon-button" aria-label="Remove image" disabled={progress !== null} onClick={() => set("")}><Cross2Icon /></button>}
          <button type="button" className="admin-text-button" onClick={() => setShowPath(v => !v)}>{showPath ? "Hide path" : "Use path"}</button>
        </div>
        <small className="admin-hint">Drag an image here or upload · JPG, PNG, WebP · max 8 MB</small>
      </div>
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={e => pick(e.target.files?.[0])} />
    </div>
    {showPath && <input className="admin-input" aria-label={`${label} path or URL`} value={src} onChange={e => set(e.target.value.trim())} placeholder="/images/wade.webp or https://…" />}
    {error && <small role="alert" className="admin-upload-error">{error}</small>}
  </div>;
}
