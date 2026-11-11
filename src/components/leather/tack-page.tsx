import { pageContentDefaults } from "@/lib/page-content-defaults";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { ButtonLink, TextLink } from "@/components/ui/button-link";
import "./leather-page.css";
import "./tack-page.css";

export function TackPageContent({ title, description, image, content = {} }: { title: string; description: string; image?: string; content?: Record<string, string> }) {
  const copy = { ...pageContentDefaults["tack"], ...content };
  const pieces = [
    { title: copy.text_headstalls, image: copy.image_images_bridle_line_album_category_bridle_261111_1_jpg, body: copy.text_discuss_a_headstall_to_suit_your_horse_with_leather_fit_and_ },
    { title: copy.text_breastplates, image: copy.image_images_tack_leatherwork_webp, body: copy.text_talk_through_the_measurements_attachment_points_and_finish_f },
    { title: copy.text_leatherwork_details, image: copy.image_images_quality_materials_webp, body: copy.text_have_a_particular_piece_in_mind_share_a_reference_and_explor },
  ];

  return <div className="leather-page tack-page">
    <section className="section-shell leather-intro">
      <nav className="leather-breadcrumb" aria-label="Breadcrumb"><Link href={copy.href}>{copy.text_home}</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">{title}</span></nav>
      <div className="leather-heading"><div><p className="eyebrow">{copy.text_peter_brophy_saddles_tack}</p><h1>{title}<span>{copy.text_the_details_complete_the_ride}</span></h1></div><div className="leather-intro-copy"><p>{description}</p><a href={copy.href_explore_tack}>{copy.text_explore_tack}<ArrowRightIcon aria-hidden="true" /></a></div></div>
      <figure className="leather-hero">{image && <Image src={image} alt={copy.alt_tack_and_leatherwork_from_peter_brophy_saddles} fill sizes="(max-width: 640px) 100vw, 90vw" className="object-cover" preload unoptimized={image.startsWith("https://")} />}<figcaption><span>{copy.text_for_horse_rider}</span><span>{copy.text_considered_from_start_to_finish}</span></figcaption></figure>
    </section>

    <section id="explore-tack" className="section-shell leather-details" aria-labelledby="tack-range-title"><div className="leather-section-heading"><div><p className="eyebrow">{copy.text_explore_the_possibilities}</p><h2 id="tack-range-title">{copy.text_alongside_your_saddle}<br /><em>{copy.text_part_of_every_ride}</em></h2></div><p>{copy.text_find_a_starting_point_for_your_next_enquiry_materials_specif}</p></div><div className="tack-pieces">{pieces.map(piece => <article key={piece.title}><div className="tack-piece-photo"><Image src={piece.image} alt={piece.title} fill sizes="(max-width: 760px) 100vw, 33vw" className="object-cover" unoptimized /></div><h3>{piece.title}</h3><p>{piece.body}</p><TextLink href={copy.href_contact}>{copy.text_enquire_about}{" "}{piece.title.toLowerCase()}</TextLink></article>)}</div></section>

    <section className="leather-materials"><div className="section-shell leather-material-grid"><div className="leather-material-photo"><Image src={copy.src_images_bridle_line_album_category_bridle_261111_2_jpg} alt={copy.alt_a_closer_view_of_leather_bridle_craftsmanship} fill sizes="(max-width: 760px) 100vw, 45vw" className="object-cover" unoptimized /></div><div className="leather-material-copy"><p className="eyebrow">{copy.text_bring_it_together}</p><h2>{copy.text_a_considered_match}<br /><em>{copy.text_down_to_the_finish}</em></h2><p>{copy.text_your_saddle_is_a_useful_starting_point_when_choosing_tack_sh}</p><ul><li>{copy.text_fit_and_relevant_measurements}</li><li>{copy.text_leather_colour_and_finish_preferences}</li><li>{copy.text_hardware_attachments_and_practical_details}</li></ul><TextLink href={copy.href_leather_work}>{copy.text_discover_our_leatherwork}</TextLink></div></div></section>

    <section className="section-shell leather-process" aria-labelledby="tack-enquiry-title"><div><p className="eyebrow">{copy.text_choosing_your_tack}</p><h2 id="tack-enquiry-title">{copy.text_start_with_your_horse}<br />{copy.text_make_it_your_own}</h2><p>{copy.text_a_few_details_help_us_understand_what_you_need_and_guide_the}</p><ButtonLink href={copy.href_contact}>{copy.text_discuss_your_tack}</ButtonLink></div><ol>{[[copy.text_your_horse_riding, copy.text_tell_us_about_your_horse_riding_discipline_and_the_tack_you_], [copy.text_your_preferred_details, copy.text_include_measurements_photos_and_any_preferences_for_leather_], [copy.text_your_quotation, copy.text_review_the_agreed_specifications_price_and_estimated_timing_]].map(([heading, body], i) => <li key={heading}><span className="leather-number">0{i + 1}</span><div><h3>{heading}</h3><p>{body}</p></div></li>)}</ol></section>

    <section className="section-shell leather-faq" aria-labelledby="tack-faq-title"><div><p className="eyebrow">{copy.text_good_to_know}</p><h2 id="tack-faq-title">{copy.text_before_your_next_ride}</h2></div><div>{[[copy.text_how_do_i_order_tack, copy.text_start_with_an_enquiry_describing_the_piece_you_need_we_can_d], [copy.text_can_i_match_my_existing_saddle, copy.text_send_clear_photographs_of_your_saddle_including_the_leather_], [copy.text_what_measurements_do_you_need, copy.text_measurements_depend_on_the_piece_share_any_measurements_you_], [copy.text_where_can_i_find_prices_and_lead_times, copy.text_ask_about_the_piece_you_have_in_mind_pricing_and_estimated_t]].map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="leather-cta"><div className="section-shell"><div><p className="eyebrow">{copy.text_complete_your_setup}</p><h2>{copy.text_let_s_talk_about_your_tack}</h2><p>{copy.text_thoughtful_details_starting_with_a_conversation}</p></div><ButtonLink href={copy.href_contact}>{copy.text_make_an_enquiry}</ButtonLink></div></section>
  </div>;
}
