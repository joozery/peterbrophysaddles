"use client";
import Image from "next/image";
import { useState } from "react";

/** Main product photo with thumbnails to switch between photos. */
export function SaddleGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const src = photos[active] ?? photos[0];
  return <div className="saddle-gallery">
    <div className="saddle-photo"><Image key={src} src={src} alt={photos.length > 1 ? `${name} — photo ${active + 1} of ${photos.length}` : name} fill priority={active === 0} sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" unoptimized={src.startsWith("https://")} /><span className="saddle-photo-caption">Crafted for horse & rider</span></div>
    {photos.length > 1 && <div className="saddle-thumbs" role="group" aria-label="Product photos">{photos.map((p, i) => <button key={p} type="button" className="saddle-thumb" aria-label={`Show photo ${i + 1}`} aria-pressed={i === active} onClick={() => setActive(i)}><Image src={p} alt="" fill sizes="96px" className="object-cover" unoptimized={p.startsWith("https://")} /></button>)}</div>}
  </div>;
}
