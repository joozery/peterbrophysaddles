"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import "./collection-slider.css";

export function CollectionSlider({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const update = () => setEdges({ start: node.scrollLeft <= 1, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 1 });
    update();
    node.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => { node.removeEventListener("scroll", update); observer.disconnect(); };
  }, [children]);

  function slide(direction: number) {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return <div className="collection-slider mt-7">
    <div className="collection-slider-controls" role="group" aria-label="Saddle collection navigation">
      <button type="button" aria-label="Previous saddles" aria-controls="saddle-grid" disabled={edges.start} onClick={() => slide(-1)}><ChevronLeftIcon /></button>
      <button type="button" aria-label="Next saddles" aria-controls="saddle-grid" disabled={edges.end} onClick={() => slide(1)}><ChevronRightIcon /></button>
    </div>
    <div ref={track} id="saddle-grid" className="saddle-grid collection-slider-track" tabIndex={0} role="region" aria-label="Saddle collection">{children}</div>
  </div>;
}
