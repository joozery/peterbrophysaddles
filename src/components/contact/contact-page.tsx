"use client";

import Image from "next/image";
import Link from "next/link";
import { Accordion } from "radix-ui";
import { CheckCircledIcon, ChevronRightIcon, PaperPlaneIcon, PlusIcon } from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";
import { products } from "@/lib/catalog";
import { HONEYPOT_STYLE, sendEnquiry } from "@/lib/send-enquiry";
import { useState } from "react";
import "./contact-page.css";

const questions = [
  ["What should I include in my enquiry?", "Tell us your riding discipline, the saddle you have in mind and any fit concerns. Your horse’s build, your preferred seat size and material preferences are useful starting points."],
  ["Can I discuss a custom saddle?", "Yes. Use the custom saddle enquiry option and describe your preferences for fit, style, leather and finishing details."],
  ["Where can I explore the saddle range?", "Browse Saddle Range in the main menu to explore the different riding disciplines before preparing your enquiry."],
];

const productTopic = (id: string | null) => {
  const product = products.find(p => p.id === id);
  return product ? { product, topic: product.custom ? "Custom saddle" : "Saddle range & fit", message: `Hi, I’m interested in the ${product.name}.\n\n` } : null;
};

export function ContactPageContent() {
  const prefill = productTopic(useSearchParams().get("product"));
  const [startedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  return <div className="contact-page">
    <section className="contact-page-intro section-shell">
      <nav className="contact-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">Contact Us</span></nav>
      <div className="contact-intro-row"><div><p className="eyebrow">Contact Peter Brophy Saddles</p><h1>Good saddles start<br />with a conversation.</h1></div><p>From your first saddle to a custom build, tell us what you have in mind. Let’s find the right fit for you and your horse.</p></div>
    </section>

    <section className="contact-main section-shell" aria-label="Send an enquiry">
      <aside className="contact-story">
        <Image src="/asset/Qualitymaterials.png" alt="Leatherwork and saddle craftsmanship" fill sizes="(max-width: 800px) 100vw, 40vw" className="contact-story-image" />
        <div className="contact-story-shade" />
        <div className="contact-story-copy"><p className="eyebrow">Made with care. Built for you.</p><h2>Your horse.<br />Your ride.<br />Your saddle.</h2><p>The details make the difference. Share yours with us.</p><Link href="/saddle-range">Explore our saddles <ChevronRightIcon aria-hidden="true" /></Link></div>
      </aside>
      <div className="contact-form-panel">
        {sentTo ? <div className="contact-sent" role="status">
          <CheckCircledIcon aria-hidden="true" width={34} height={34} />
          <p className="eyebrow">Enquiry sent</p>
          <h2>Thank you — we’ve got your message.</h2>
          <p className="contact-form-intro">We’ll reply to <strong>{sentTo}</strong>, usually within a few working days. If your saddle is made to order, we’ll follow up with a quotation.</p>
          <div className="contact-sent-actions"><Link href="/saddle-range" className="button-link button-gold">Explore our saddles</Link><button type="button" className="contact-sent-again" onClick={() => setSentTo("")}>Send another message</button></div>
        </div> : <>
        <p className="eyebrow">Let’s talk saddles</p><h2>Tell us a little about you</h2><p className="contact-form-intro">A few details will help start the conversation.</p>
        <form onChange={() => setError("")} onSubmit={async event => {
          event.preventDefault();
          if (sending) return;
          const form = event.currentTarget;
          setSending(true); setError("");
          const problem = await sendEnquiry(form, { startedAt, source: "contact", product: prefill?.product.id });
          setSending(false);
          if (problem) return setError(problem);
          setSentTo(String(new FormData(form).get("email")));
          form.reset();
          // The panel gets shorter — bring the thank-you message into view so it doesn't look like nothing happened.
          requestAnimationFrame(() => document.querySelector(".contact-form-panel")?.scrollIntoView({ behavior: "smooth", block: "center" }));
        }}>
          <div style={HONEYPOT_STYLE} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className="contact-field-row"><label>Your name <span>*</span><input name="name" required maxLength={100} autoComplete="name" placeholder="Full name" /></label><label>Email address <span>*</span><input name="email" required type="email" maxLength={200} autoComplete="email" placeholder="you@example.com" /></label></div>
          <div className="contact-field-row"><label>Phone <small>(optional)</small><input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="04xx xxx xxx" /></label><label>Riding discipline <small>(optional)</small><input name="discipline" maxLength={80} placeholder="e.g. Campdraft, reining" /></label></div>
          <label>I’m interested in<select name="topic" defaultValue={prefill?.topic ?? "Custom saddle"}><option>Custom saddle</option><option>Saddle range & fit</option><option>Tack & leatherwork</option><option>General enquiry</option></select></label>
          {prefill && <p className="contact-prefill">Saddle: <strong>{prefill.product.name}</strong></p>}
          <label>Your message <span>*</span><textarea name="message" required maxLength={5000} rows={5} defaultValue={prefill?.message} placeholder="Tell us about your horse, your riding and the saddle you have in mind…" /></label>
          <div className="contact-form-bottom"><button type="submit" className="button-link button-gold" disabled={sending}>{sending ? "Sending…" : "Send enquiry"}<PaperPlaneIcon aria-hidden="true" /></button><p>We reply personally to every enquiry.</p></div>
          <p className="contact-form-status" role="alert">{error}</p>
          <p className="form-privacy-note">We use your details only to reply to your enquiry. See our <Link href="/privacy">Privacy Policy</Link>.</p>
        </form></>}
      </div>
    </section>

    <section className="contact-faq section-shell"><div><p className="eyebrow">Before we begin</p><h2>A little guidance</h2><p>Not sure where to start?<br />Here are a few helpful pointers.</p></div><Accordion.Root type="single" collapsible className="contact-questions">{questions.map(([question, answer], index) => <Accordion.Item key={question} value={`question-${index}`} className="contact-question"><Accordion.Header><Accordion.Trigger>{question}<PlusIcon aria-hidden="true" /></Accordion.Trigger></Accordion.Header><Accordion.Content><p>{answer}</p></Accordion.Content></Accordion.Item>)}</Accordion.Root></section>
  </div>;
}
