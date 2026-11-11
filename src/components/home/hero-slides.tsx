"use client";

import { useEffect, useState } from "react";
import { cssUrl } from "./lines";

/** Hero background. One image = static; two or more = auto-playing crossfade slideshow. */
export function HeroSlides({ images, seconds = 6 }: { images: string[]; seconds?: number }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ms = Math.min(20, Math.max(3, seconds || 6)) * 1000;
    const timer = window.setInterval(() => { if (!document.hidden) setActive(i => (i + 1) % count); }, ms);
    return () => window.clearInterval(timer);
  }, [count, seconds, paused]);

  if (count < 2) return <div className="hero-image" style={count ? { backgroundImage: cssUrl(images[0]) } : undefined} />;
  const current = active % count;

  return <>
    <div className="hero-slides" aria-hidden="true">
      {images.map((src, i) => <div key={`${i}-${src}`} className={`hero-image hero-slide${i === current ? " is-active" : ""}`} style={{ backgroundImage: cssUrl(src) }} />)}
    </div>
    <div className="hero-dots" role="group" aria-label="Background images">
      {images.map((_, i) => <button key={i} type="button" aria-label={`Show background image ${i + 1} of ${count}`} aria-pressed={i === current} className={i === current ? "is-active" : undefined} onClick={() => setActive(i)} />)}
      <button type="button" className="hero-dots-toggle" aria-label={paused ? "Play slideshow" : "Pause slideshow"} onClick={() => setPaused(p => !p)}>{paused ? "▶" : "❚❚"}</button>
    </div>
  </>;
}
