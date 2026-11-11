"use client";

import { ChatBubbleIcon, CheckCircledIcon, Cross2Icon, PaperPlaneIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { type HomeContent, defaultHome } from "@/lib/admin-types";
import { HONEYPOT_STYLE, sendEnquiry } from "@/lib/send-enquiry";

export function Contact({ content = defaultHome.contact }: { content?: HomeContent["contact"] }) {
  const [startedAt, setStartedAt] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return <section id="contact" className="contact-section"><div className="section-shell flex flex-wrap items-center justify-between gap-7 py-10 sm:py-12"><div><p className="eyebrow text-cream">{content.eyebrow}</p><h2 className="mt-3">{content.title}</h2><div className="mt-3 h-px w-24 bg-gold" /></div>
    <Dialog.Root onOpenChange={open => { if (open) { setStartedAt(Date.now()); setSent(false); } setError(""); }}><Dialog.Trigger className="button-link button-gold">{content.buttonLabel} <ChatBubbleIcon aria-hidden="true" className="action-icon button-icon" /></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-black/75" /><Dialog.Content className="enquiry-dialog">
      <Dialog.Close aria-label="Close enquiry" className="absolute right-4 top-3 p-2"><Cross2Icon aria-hidden="true" width={20} height={20} /></Dialog.Close>
      {sent ? <div className="grid justify-items-start gap-4" role="status">
        <CheckCircledIcon aria-hidden="true" width={32} height={32} className="text-gold" />
        <Dialog.Title className="font-serif text-3xl uppercase">Thank you</Dialog.Title>
        <Dialog.Description className="text-sm leading-6 text-stone-600">Your enquiry has been sent to Peter Brophy Saddles. We’ll be in touch by email soon.</Dialog.Description>
        <Dialog.Close className="button-link button-gold">Close</Dialog.Close>
      </div> : <>
        <Dialog.Title className="font-serif text-3xl uppercase">Your custom saddle</Dialog.Title><Dialog.Description className="mt-3 text-sm leading-6 text-stone-600">Tell us a little about you and your horse, and we’ll get back to you by email.</Dialog.Description>
        <form className="mt-6 grid gap-4" onChange={() => setError("")} onSubmit={async event => {
          event.preventDefault();
          if (sending) return;
          setSending(true); setError("");
          const problem = await sendEnquiry(event.currentTarget, { startedAt, source: "popup", topic: "Custom saddle" });
          setSending(false);
          if (problem) setError(problem); else setSent(true);
        }}>
          <div style={HONEYPOT_STYLE} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="form-label">Your name<input name="name" autoComplete="name" required maxLength={100} className="form-input" /></label>
          <label className="form-label">Email address<input name="email" type="email" autoComplete="email" required maxLength={200} className="form-input" /></label>
          <label className="form-label">Tell us about your horse and saddle<textarea name="message" rows={4} required maxLength={5000} className="form-input" /></label>
          <button className="button-link button-gold justify-center" type="submit" disabled={sending}>{sending ? "Sending…" : "Send enquiry"} <PaperPlaneIcon aria-hidden="true" className="action-icon" /></button>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <p className="form-privacy-note">We use your details only to reply to your enquiry. See our <Link href="/privacy">Privacy Policy</Link>.</p>
        </form>
      </>}
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </div></section>;
}
