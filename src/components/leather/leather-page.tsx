import { pageContentDefaults } from "@/lib/page-content-defaults";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { ButtonLink, TextLink } from "@/components/ui/button-link";
import "./leather-page.css";

export function LeatherPageContent({ title, description, image, content = {} }: { title: string; description: string; image?: string; content?: Record<string, string> }) {
  const copy = { ...pageContentDefaults["leather-work"], ...content };
  const details = [
    ["01", copy.text_leather_finish, copy.text_discuss_the_leather_colour_and_finish_you_have_in_mind_wheth],
    ["02", copy.text_fit_function, copy.text_share_measurements_photographs_and_how_you_plan_to_use_the_p],
    ["03", copy.text_the_finer_details, copy.text_talk_through_stitching_hardware_and_personal_touches_availab],
  ];
  const questions = [
    [copy.text_can_i_enquire_about_a_custom_piece, copy.text_yes_send_a_description_of_the_piece_you_have_in_mind_along_w],
    [copy.text_can_the_leatherwork_complement_my_saddle, copy.text_include_a_photograph_of_your_saddle_and_details_of_its_colou],
    [copy.text_how_do_i_find_out_the_price_and_lead_time, copy.text_pricing_and_timing_depend_on_the_piece_and_its_specification],
    [copy.text_what_should_i_include_in_my_enquiry, copy.text_tell_us_what_you_need_how_it_will_be_used_and_any_relevant_m],
  ];

  return <div className="leather-page">
    <section className="section-shell leather-intro">
      <nav className="leather-breadcrumb" aria-label="Breadcrumb"><Link href={copy.href}>{copy.text_home}</Link><ChevronRightIcon aria-hidden="true" /><Link href={copy.href_tack}>{copy.text_tack}</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">{title}</span></nav>
      <div className="leather-heading"><div><p className="eyebrow">{copy.text_peter_brophy_saddles_leatherwork}</p><h1>{title}<span>{copy.text_considered_in_every_detail}</span></h1></div><div className="leather-intro-copy"><p>{description}</p><a href={copy.href_leather_details}>{copy.text_explore_the_details}<ArrowRightIcon aria-hidden="true" /></a></div></div>
      <figure className="leather-hero">{image && <Image src={image} alt={copy.alt_leather_tack_and_leatherwork_from_peter_brophy_saddles} fill sizes="(max-width: 640px) 100vw, 90vw" className="object-cover" preload unoptimized={image.startsWith("https://")} />}<figcaption><span>{copy.text_tack_leatherwork}</span><span>{copy.text_materials_function_finish}</span></figcaption></figure>
    </section>

    <section id="leather-details" className="section-shell leather-details" aria-labelledby="leather-details-title"><div className="leather-section-heading"><div><p className="eyebrow">{copy.text_made_with_purpose}</p><h2 id="leather-details-title">{copy.text_practical_pieces}<br /><em>{copy.text_personal_details}</em></h2></div><p>{copy.text_from_headstalls_to_breastplates_start_with_the_way_you_ride_}</p></div><div className="leather-detail-grid">{details.map(([number, heading, body]) => <article key={number}><span className="leather-number">{number}</span><h3>{heading}</h3><p>{body}</p></article>)}</div></section>

    <section className="leather-materials"><div className="section-shell leather-material-grid"><div className="leather-material-photo"><Image src={copy.src_images_quality_materials_webp} alt={copy.alt_a_closer_look_at_saddle_leather_and_materials} fill sizes="(max-width: 760px) 100vw, 45vw" className="object-cover" unoptimized /></div><div className="leather-material-copy"><p className="eyebrow">{copy.text_a_closer_look}</p><h2>{copy.text_it_starts_with}<br /><em>{copy.text_the_materials}</em></h2><p>{copy.text_leather_stitching_and_hardware_all_play_a_part_in_the_finish}</p><ul><li>{copy.text_leather_colour_and_finish}</li><li>{copy.text_hardware_and_fastening_preferences}</li><li>{copy.text_stitching_and_finishing_details}</li></ul><TextLink href={copy.href_quality_materials}>{copy.text_explore_quality_materials}</TextLink></div></div></section>

    <section className="section-shell leather-process" aria-labelledby="leather-process-title"><div><p className="eyebrow">{copy.text_your_next_piece}</p><h2 id="leather-process-title">{copy.text_a_conversation}<br />{copy.text_comes_first}</h2><p>{copy.text_bring_your_ideas_we_ll_work_through_the_details_together}</p><ButtonLink href={copy.href_contact}>{copy.text_discuss_your_leatherwork}</ButtonLink></div><ol>{[[copy.text_tell_us_what_you_need, copy.text_share_the_type_of_piece_how_you_ride_and_any_photographs_or_], [copy.text_work_through_the_details, copy.text_discuss_materials_fit_and_your_preferred_finish_with_availab], [copy.text_review_your_quotation, copy.text_confirm_specifications_pricing_and_timing_before_placing_an_]].map(([heading, body], i) => <li key={heading}><span className="leather-number">0{i + 1}</span><div><h3>{heading}</h3><p>{body}</p></div></li>)}</ol></section>

    <section className="section-shell leather-faq" aria-labelledby="leather-faq-title"><div><p className="eyebrow">{copy.text_before_you_enquire}</p><h2 id="leather-faq-title">{copy.text_a_few_useful_details}</h2></div><div>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    <section className="leather-cta"><div className="section-shell"><div><p className="eyebrow">{copy.text_let_s_talk_leatherwork}</p><h2>{copy.text_the_details_make_it_yours}</h2><p>{copy.text_tell_us_what_you_have_in_mind_for_your_horse_and_your_riding}</p></div><ButtonLink href={copy.href_contact}>{copy.text_make_an_enquiry}</ButtonLink></div></section>
  </div>;
}
