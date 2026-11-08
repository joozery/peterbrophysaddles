"use client";

import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { ChevronRightIcon, Cross2Icon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import type { Promotion } from "@/lib/admin-types";
import "./promotion-modal.css";

// Content and on/off come from Admin → Promotions (MongoDB), via a public read-only endpoint.
export function PromotionModal() {
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem("pb-promotion-dismissed")) return; } catch {}
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    fetch("/api/public/promotion").then(r => r.ok ? r.json() : null).then(data => {
      const p: Promotion | null = data?.promotion ?? null;
      if (cancelled || !p?.enabled) return;
      setPromo(p);
      timer = setTimeout(() => setOpen(true), Math.max(0, p.delaySeconds) * 1000);
    }).catch(() => {});
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  function close() {
    setOpen(false);
    try { sessionStorage.setItem("pb-promotion-dismissed", "true"); } catch {}
  }
  if (!promo) return null;
  const image = promo.image.startsWith("/") || promo.image.startsWith("https://") ? promo.image : "/images/saddles/wade-v2.png";
  return <Dialog.Root open={open} onOpenChange={value => { if (!value) close(); else setOpen(true); }}><Dialog.Portal><Dialog.Overlay className="promotion-overlay" /><Dialog.Content className="promotion-modal" onCloseAutoFocus={event => event.preventDefault()}>
    <div className="promotion-photo"><Image src={image} alt="" fill sizes="(max-width: 600px) 100vw, 323px" className="object-cover" unoptimized /></div>
    <div className="promotion-copy"><p className="promotion-eyebrow">{promo.eyebrow}</p><span className="promotion-rule" aria-hidden="true" /><Dialog.Title className="promotion-title">{promo.highlight && <span>{promo.highlight}</span>}{promo.title}</Dialog.Title><Dialog.Description className="promotion-description">{promo.description}</Dialog.Description><Link href={promo.ctaHref.startsWith("/") ? promo.ctaHref : "/contact"} onClick={close} className="button-link button-gold promotion-action">{promo.ctaLabel} <ChevronRightIcon aria-hidden="true" /></Link>{promo.terms && <p className="promotion-terms">{promo.terms}</p>}</div>
    <Dialog.Close className="promotion-close" aria-label="Close promotion"><Cross2Icon aria-hidden="true" /></Dialog.Close>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
