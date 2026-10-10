"use client";

import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { ChevronRightIcon, Cross2Icon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import "./promotion-modal.css";

export function PromotionModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { if (sessionStorage.getItem("pb-promotion-dismissed")) return; } catch {}
    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);
  function close() {
    setOpen(false);
    try { sessionStorage.setItem("pb-promotion-dismissed", "true"); } catch {}
  }
  return <Dialog.Root open={open} onOpenChange={value => { if (!value) close(); else setOpen(true); }}><Dialog.Portal><Dialog.Overlay className="promotion-overlay" /><Dialog.Content className="promotion-modal" onCloseAutoFocus={event => event.preventDefault()}>
    <div className="promotion-photo"><Image src="/images/saddles/wade-v2.png" alt="Close view of leather and stitching on a handcrafted saddle" fill sizes="(max-width: 600px) 100vw, 323px" className="object-cover" unoptimized /></div>
    <div className="promotion-copy"><p className="promotion-eyebrow">Special offer</p><span className="promotion-rule" aria-hidden="true" /><Dialog.Title className="promotion-title"><span>10% off</span>Custom saddles</Dialog.Title><Dialog.Description className="promotion-description">Built for your horse. Designed for the way you ride. Start the conversation about your custom saddle.</Dialog.Description><Link href="/contact" onClick={close} className="button-link button-gold promotion-action">Discuss this offer <ChevronRightIcon aria-hidden="true" /></Link><p className="promotion-terms">Preview promotion · Offer subject to confirmation.<br />No discount is applied at checkout.</p></div>
    <Dialog.Close className="promotion-close" aria-label="Close promotion"><Cross2Icon aria-hidden="true" /></Dialog.Close>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
