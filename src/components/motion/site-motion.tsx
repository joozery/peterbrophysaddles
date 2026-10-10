"use client";

import { useEffect } from "react";

/** Progressive enhancement: content remains visible when animation is unavailable. */
export function SiteMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop: (() => void) | undefined;

    function start() {
      stop?.();
      if (preference.matches || !("IntersectionObserver" in window)) return;
      const seen = new WeakSet<Element>();
      const animations = new Set<Animation>();
      const delays = new WeakMap<Element, number>();
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const animation = entry.target.animate(
            [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 650, delay: delays.get(entry.target) ?? 0, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      }, { threshold: 0.08 });

      function register() {
        document.querySelectorAll("main h1, main h2, main .eyebrow, main .body-copy, .hero-description, main .button-link, main blockquote, .saddle-card, .services-grid article").forEach((element, index) => {
          if (seen.has(element)) return;
          seen.add(element);
          if (element.matches(".saddle-card, .services-grid article, .hero .button-link")) {
            delays.set(element, (index % 3) * 70);
          }
          observer.observe(element);
        });
      }
      register();
      // Also register sections added by streamed pages and client navigation.
      const mutations = new MutationObserver(register);
      mutations.observe(document.body, { childList: true, subtree: true });
      stop = () => {
        observer.disconnect();
        mutations.disconnect();
        animations.forEach(animation => animation.cancel());
        animations.clear();
      };
    }
    start();
    preference.addEventListener("change", start);
    return () => { stop?.(); preference.removeEventListener("change", start); };
  }, []);
  return null;
}
