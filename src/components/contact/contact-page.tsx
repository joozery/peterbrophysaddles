"use client";

import Image from "next/image";
import Link from "next/link";
import { Accordion } from "radix-ui";
import { ChevronRightIcon, CopyIcon, CheckIcon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import "./contact-page.css";

const questions = [
  ["What should I include in my enquiry?", "Tell us your riding discipline, the saddle you have in mind and any fit concerns. Your horse’s build, your preferred seat size and material preferences are useful starting points."],
  ["Can I discuss a custom saddle?", "Yes. Use the custom saddle enquiry option and describe your preferences for fit, style, leather and finishing details."],
  ["Where can I explore the saddle range?", "Browse Saddle Range in the main menu to explore the different riding disciplines before preparing your enquiry."],
];

export function ContactPageContent() {
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState("");
  const [copied, setCopied] = useState(false);

  return <div className="contact-page">
    <section className="contact-page-intro section-shell">
      <nav className="contact-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">Contact Us</span></nav>
      <div className="contact-intro-row"><div><p className="eyebrow">Contact Peter Brophy Saddles</p><h1>Good saddles start<br />with a conversation.</h1></div><p>From your first saddle to a custom build, tell us what you have in mind. Let’s find the right fit for you and your horse.</p></div>
    </section>

    <section className="contact-main section-shell" aria-label="Prepare your enquiry">
      <aside className="contact-story">
        <Image src="/asset/Qualitymaterials.png" alt="Leatherwork and saddle craftsmanship" fill sizes="(max-width: 800px) 100vw, 40vw" className="contact-story-image" />
        <div className="contact-story-shade" />
        <div className="contact-story-copy"><p className="eyebrow">Made with care. Built for you.</p><h2>Your horse.<br />Your ride.<br />Your saddle.</h2><p>The details make the difference. Share yours with us.</p><Link href="/saddle-range">Explore our saddles <ChevronRightIcon aria-hidden="true" /></Link></div>
      </aside>
      <div className="contact-form-panel"><p className="eyebrow">Let’s talk saddles</p><h2>Tell us a little about you</h2><p className="contact-form-intro">A few details will help start the conversation.</p>
        <form onChange={() => { setCopied(false); setStatus(""); setPreview(""); }} onSubmit={async event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const message = `Peter Brophy Saddles — ${data.get("topic")}\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nRiding discipline: ${data.get("discipline") || "Not specified"}\n\n${data.get("message")}`;
          try { await navigator.clipboard.writeText(message); setCopied(true); setStatus("Enquiry copied. Paste it into your email or message to share it."); }
          catch { setPreview(message); setStatus("Select and copy the enquiry below to share it."); }
        }}>
          <div className="contact-field-row"><label>Your name <span>*</span><input name="name" required autoComplete="name" placeholder="Full name" /></label><label>Email address <span>*</span><input name="email" required type="email" autoComplete="email" placeholder="you@example.com" /></label></div>
          <div className="contact-field-row"><label>I’m interested in<select name="topic" defaultValue="Custom saddle"><option>Custom saddle</option><option>Saddle range & fit</option><option>Tack & leatherwork</option><option>General enquiry</option></select></label><label>Riding discipline <small>(optional)</small><input name="discipline" placeholder="e.g. Campdraft, reining" /></label></div>
          <label>Your message <span>*</span><textarea name="message" required rows={5} placeholder="Tell us about your horse, your riding and the saddle you have in mind…" /></label>
          <div className="contact-form-bottom"><button type="submit" className="button-link button-gold">{copied ? "Enquiry copied" : "Copy enquiry"}{copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}</button><p>Prepare and copy your message.<br />This form does not send an enquiry.</p></div>
          <p className="contact-form-status" role="status">{status}</p>
          {preview && <label>Your prepared enquiry<textarea readOnly value={preview} rows={7} onFocus={event => event.target.select()} /></label>}
        </form>
      </div>
    </section>

    <section className="contact-faq section-shell"><div><p className="eyebrow">Before we begin</p><h2>A little guidance</h2><p>Not sure where to start?<br />Here are a few helpful pointers.</p></div><Accordion.Root type="single" collapsible className="contact-questions">{questions.map(([question, answer], index) => <Accordion.Item key={question} value={`question-${index}`} className="contact-question"><Accordion.Header><Accordion.Trigger>{question}<PlusIcon aria-hidden="true" /></Accordion.Trigger></Accordion.Header><Accordion.Content><p>{answer}</p></Accordion.Content></Accordion.Item>)}</Accordion.Root></section>
  </div>;
}
