"use client";

import { pageContentDefaults } from "@/lib/page-content-defaults";
import Image from "next/image";
import Link from "next/link";
import { Accordion } from "radix-ui";
import { CheckCircledIcon, ChevronRightIcon, PaperPlaneIcon, PlusIcon } from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";
import { products } from "@/lib/catalog";
import { HONEYPOT_STYLE, sendEnquiry } from "@/lib/send-enquiry";
import { useState } from "react";
import "./contact-page.css";

const productTopic = (id: string | null) => {
  const product = products.find(p => p.id === id);
  return product ? { product, topic: product.custom ? "Custom saddle" : "Saddle range & fit", message: `Hi, I’m interested in the ${product.name}.\n\n` } : null;
};

export function ContactPageContent({ title, description, image, content = {} }: { title: string; description: string; image?: string; content?: Record<string, string> }) {
  const copy = { ...pageContentDefaults["contact"], ...content };
  const questions = [
    [copy.text_what_should_i_include_in_my_enquiry, copy.text_tell_us_your_riding_discipline_the_saddle_you_have_in_mind_a],
    [copy.text_can_i_discuss_a_custom_saddle, copy.text_yes_use_the_custom_saddle_enquiry_option_and_describe_your_p],
    [copy.text_where_can_i_explore_the_saddle_range, copy.text_browse_saddle_range_in_the_main_menu_to_explore_the_differen],
  ];

  const prefill = productTopic(useSearchParams().get("product"));
  const [startedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  return <div className="contact-page">
    <section className="contact-page-intro section-shell">
      <nav className="contact-breadcrumb" aria-label="Breadcrumb"><Link href={copy.href}>{copy.text_home}</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">{title}</span></nav>
      <div className="contact-intro-row"><div><p className="eyebrow">{copy.text_contact_peter_brophy_saddles}</p><h1>{copy.text_good_saddles_start}<br />{copy.text_with_a_conversation}</h1></div><p>{description}</p></div>
    </section>

    <section className="contact-main section-shell" aria-label="Send an enquiry">
      <aside className="contact-story">
        <Image src={image || "/asset/Qualitymaterials.png"} alt={copy.alt_leatherwork_and_saddle_craftsmanship} fill sizes="(max-width: 800px) 100vw, 40vw" className="contact-story-image" unoptimized />
        <div className="contact-story-shade" />
        <div className="contact-story-copy"><p className="eyebrow">{copy.text_made_with_care_built_for_you}</p><h2>{copy.text_your_horse}<br />{copy.text_your_ride}<br />{copy.text_your_saddle}</h2><p>{copy.text_the_details_make_the_difference_share_yours_with_us}</p><Link href={copy.href_saddle_range}>{copy.text_explore_our_saddles}<ChevronRightIcon aria-hidden="true" /></Link></div>
      </aside>
      <div className="contact-form-panel">
        {sentTo ? <div className="contact-sent" role="status">
          <CheckCircledIcon aria-hidden="true" width={34} height={34} />
          <p className="eyebrow">{copy.text_enquiry_sent}</p>
          <h2>{copy.text_thank_you_we_ve_got_your_message}</h2>
          <p className="contact-form-intro">{copy.text_we_ll_reply_to}{" "}<strong>{sentTo}</strong>{copy.text_usually_within_a_few_working_days_if_your_saddle_is_made_to_}</p>
          <div className="contact-sent-actions"><Link href={copy.href_saddle_range} className="button-link button-gold">{copy.text_explore_our_saddles}</Link><button type="button" className="contact-sent-again" onClick={() => setSentTo("")}>{copy.text_send_another_message}</button></div>
        </div> : <>
        <p className="eyebrow">{copy.text_let_s_talk_saddles}</p><h2>{copy.text_tell_us_a_little_about_you}</h2><p className="contact-form-intro">{copy.text_a_few_details_will_help_start_the_conversation}</p>
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
          <div className="contact-field-row"><label>{copy.text_your_name}<span>*</span><input name="name" required maxLength={100} autoComplete="name" placeholder={copy.placeholder_full_name} /></label><label>{copy.text_email_address}<span>*</span><input name="email" required type="email" maxLength={200} autoComplete="email" placeholder={copy.placeholder_you_example_com} /></label></div>
          <div className="contact-field-row"><label>{copy.text_phone}<small>{copy.text_optional}</small><input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder={copy.placeholder_04xx_xxx_xxx} /></label><label>{copy.text_riding_discipline}<small>{copy.text_optional}</small><input name="discipline" maxLength={80} placeholder={copy.placeholder_e_g_campdraft_reining} /></label></div>
          <label>{copy.text_i_m_interested_in}<select name="topic" defaultValue={prefill?.topic ?? "Custom saddle"}><option value="Custom saddle">{copy.text_custom_saddle}</option><option value="Saddle range &amp; fit">{copy.text_saddle_range_fit}</option><option value="Tack &amp; leatherwork">{copy.text_tack_leatherwork}</option><option value="General enquiry">{copy.text_general_enquiry}</option></select></label>
          {prefill && <p className="contact-prefill">{copy.text_saddle}{" "}<strong>{prefill.product.name}</strong></p>}
          <label>{copy.text_your_message}<span>*</span><textarea name="message" required maxLength={5000} rows={5} defaultValue={prefill?.message} placeholder={copy.placeholder_tell_us_about_your_horse_your_riding_and_the_saddle_y} /></label>
          <div className="contact-form-bottom"><button type="submit" className="button-link button-gold" disabled={sending}>{sending ? copy.text_sending : copy.text_send_enquiry}<PaperPlaneIcon aria-hidden="true" /></button><p>{copy.text_we_reply_personally_to_every_enquiry}</p></div>
          <p className="contact-form-status" role="alert">{error}</p>
          <p className="form-privacy-note">{copy.text_we_use_your_details_only_to_reply_to_your_enquiry_see_our}{" "}<Link href={copy.href_privacy}>{copy.text_privacy_policy}</Link>.</p>
        </form></>}
      </div>
    </section>

    <section className="contact-faq section-shell"><div><p className="eyebrow">{copy.text_before_we_begin}</p><h2>{copy.text_a_little_guidance}</h2><p>{copy.text_not_sure_where_to_start}<br />{copy.text_here_are_a_few_helpful_pointers}</p></div><Accordion.Root type="single" collapsible className="contact-questions">{questions.map(([question, answer], index) => <Accordion.Item key={question} value={`question-${index}`} className="contact-question"><Accordion.Header><Accordion.Trigger>{question}<PlusIcon aria-hidden="true" /></Accordion.Trigger></Accordion.Header><Accordion.Content><p>{answer}</p></Accordion.Content></Accordion.Item>)}</Accordion.Root></section>
  </div>;
}
