"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function RouteScroll() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const restoringHistory = useRef(false);
  useLayoutEffect(() => {
    const onPopState = () => { restoringHistory.current = true; };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useLayoutEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (restoringHistory.current) { restoringHistory.current = false; return; }
    if (window.location.hash) return;
    // Run after the router's own focus/scroll pass; smooth scrolling must not
    // carry the previous page's offset into the newly mounted page.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, [pathname]);
  return null;
}
