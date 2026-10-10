"use client";

import { ChatBubbleIcon, CopyIcon, Cross2Icon } from "@radix-ui/react-icons";


import { Dialog } from "radix-ui";
import { useState } from "react";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  return <section id="contact" className="contact-section"><div className="section-shell flex flex-wrap items-center justify-between gap-7 py-10 sm:py-12"><div><p className="eyebrow text-cream">Ready to discuss your saddle?</p><h2 className="mt-3">Let’s create something special</h2><div className="mt-3 h-px w-24 bg-gold" /></div>
    <Dialog.Root onOpenChange={() => { setCopied(false); setError(""); }}><Dialog.Trigger className="button-link button-gold">Get in touch <ChatBubbleIcon aria-hidden="true" className="action-icon button-icon" /></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-black/75" /><Dialog.Content className="enquiry-dialog">
      <Dialog.Title className="font-serif text-3xl uppercase">Your custom saddle</Dialog.Title><Dialog.Description className="mt-3 text-sm leading-6 text-stone-600">Prepare your enquiry with a few details about you and your horse. Copy it to share with Peter Brophy Saddles.</Dialog.Description><Dialog.Close aria-label="Close enquiry" className="absolute right-4 top-3 p-2"><Cross2Icon aria-hidden="true" width={20} height={20} /></Dialog.Close>
      <form className="mt-6 grid gap-4" onSubmit={async event => { event.preventDefault(); const data = new FormData(event.currentTarget); try { await navigator.clipboard.writeText(`Saddle enquiry\nName: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`); setCopied(true); setError(""); } catch { setError("Could not copy. Please select and copy your details manually."); } }}>
        <label className="form-label">Your name<input name="name" autoComplete="name" required className="form-input" /></label><label className="form-label">Email address<input name="email" type="email" autoComplete="email" required className="form-input" /></label><label className="form-label">Tell us about your horse and saddle<textarea name="message" rows={4} required className="form-input" /></label><button className="button-link button-gold justify-center" type="submit">Copy enquiry <CopyIcon aria-hidden="true" className="action-icon" /></button><p role="status" className="text-sm text-stone-600">{error || (copied ? "Enquiry copied. You can paste it into your email or message." : "This prepares your message; it does not send an enquiry.")}</p>
      </form>
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </div></section>;
}
