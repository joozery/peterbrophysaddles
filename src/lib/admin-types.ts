// Shared admin data shapes + initial content. Used by both the browser store and the server.
import { categoryOf, products as catalog, type ProductCategory, type ProductSpec } from "./catalog";
import type { AdminOrder, Enquiry } from "@/components/admin/sample-data";

export type Customer = { id: string; name: string; email: string; phone: string; location: string; notes: string; createdAt: string };
export type AdminProduct = { id: string; name: string; image: string; price: number; custom: boolean; active: boolean; description: string; specs?: ProductSpec[]; /** Extra photos after the main image. */ gallery?: string[]; stock: number; category?: ProductCategory; /** Position within its category; lower shows first. */ sort?: number };
export type DiscountCode = { id: string; code: string; type: "percent" | "fixed"; value: number; active: boolean; expires: string; uses: number };
export type Promotion = { enabled: boolean; eyebrow: string; highlight: string; title: string; description: string; ctaLabel: string; ctaHref: string; image: string; terms: string; delaySeconds: number };
export type ContentPage = { slug: string; title: string; description: string; image: string; published: boolean; updatedAt: string; content?: Record<string, string> };
export type Settings = { businessName: string; email: string; phone: string; address: string; /** Shown in payment emails, e.g. account name, BSB, account number. */ bankDetails: string; notifyOrders: boolean; notifyEnquiries: boolean; showPrices: boolean };
export type AdminRole = "owner" | "admin" | "staff";
export type AdminUser = { id: string; name: string; email: string; role: AdminRole; active: boolean; invitedAt: string; lastActive: string };
export type OrderWithNote = AdminOrder & { note?: string };
export type EnquiryWithReplies = Enquiry & { replies?: { date: string; text: string }[]; quote?: number };

/** Editable home page content. Titles may contain line breaks ("\n"). Images are /public paths or uploaded URLs. */
export type LinkItem = { label: string; href: string };
export type HomeContent = {
  hero: { eyebrow: string; title: string; description: string; image: string; /** Extra background images — 2+ in total makes a slideshow. */ slides: string[]; slideSeconds: number; primary: LinkItem; secondary: LinkItem };
  heritage: { eyebrow: string; title: string; body: string; image: string; backgroundImage: string; link: LinkItem };
  collection: { eyebrow: string; title: string; body: string; link: LinkItem; items: { name: string; image: string; href: string }[] };
  custom: { eyebrow: string; title: string; body: string; image: string; cta: LinkItem };
  services: { items: { title: string; body: string; image: string; link: LinkItem }[] };
  testimonial: { eyebrow: string; quote: string; author: string; image: string };
  contact: { eyebrow: string; title: string; buttonLabel: string };
};

/** Editable About page. `accent` is an optional italic line shown under a title. Body text: blank line = new paragraph. */
export type AboutContent = {
  intro: { eyebrow: string; title: string; accent: string; text: string; linkLabel: string };
  story: { eyebrow: string; title: string; lead: string; body: string; link: LinkItem; image: string; imageAlt: string; caption: string; statNumber: string; statLabel: string };
  principles: { eyebrow: string; title: string; text: string; items: { title: string; body: string }[] };
  materials: { eyebrow: string; title: string; accent: string; body: string; link: LinkItem; image: string; imageAlt: string; caption: string };
  disciplines: { eyebrow: string; title: string; accent: string; body: string; cta: LinkItem; items: string[] };
  legacy: { eyebrow: string; title: string; accent: string; body: string };
  consultation: { eyebrow: string; title: string; body: string; cta: LinkItem };
};

/** Editable Saddle Pricing page. */
export type PricingContent = {
  intro: { eyebrow: string; title: string; accent: string };
  main: { body: string; image: string; imageAlt: string; caption: string; cta: LinkItem };
  facebook: { title: string; text: string; buttonLabel: string; url: string };
};

/** Editable Testimonials page. Review body: blank line = new paragraph. */
export type ReviewLayout = "featured" | "wide" | "standard";
export type Review = { name: string; tag: string; headline: string; body: string; badge: string; layout: ReviewLayout; visible: boolean };
export type TestimonialsContent = {
  intro: { eyebrow: string; title: string; accent: string; text: string };
  reviews: { items: Review[] };
};

/** A quotation sent to a customer. `token` makes the customer's view link unguessable (/quote/<token>). Prices in AUD cents. */
export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";
export type QuoteItem = { description: string; details: string; quantity: number; price: number };
export type Quote = {
  id: string; token: string; enquiryId?: string; orderId?: string;
  customer: string; email: string; phone: string; address: string;
  title: string; date: string; validUntil: string; items: QuoteItem[]; notes: string; terms: string;
  status: QuoteStatus; sentAt?: string; acceptedAt?: string; createdBy: string;
  /** Set only when an admin deliberately reopens a declined/accepted quote; the server strips it after use. */
  reopened?: boolean;
};
export const quoteTotal = (q: Pick<Quote, "items">) => q.items.reduce((s, i) => s + i.price * i.quantity, 0);
export const DEFAULT_QUOTE_TERMS = [
  "All prices are in Australian dollars (AUD).",
  "A 50% deposit is required to begin work; the balance is due before dispatch.",
  "Pay by card through the secure Stripe link we send, or by direct bank transfer.",
  "Build time is confirmed when the deposit is received. Tree fitting and measurements must be completed before work starts.",
  "This quotation is valid until the date shown.",
].join("\n");

export type AdminState = {
  orders: OrderWithNote[]; enquiries: EnquiryWithReplies[]; customers: Customer[]; products: AdminProduct[];
  discountCodes: DiscountCode[]; promotion: Promotion; pages: ContentPage[]; settings: Settings; home: HomeContent; about: AboutContent; pricing: PricingContent; testimonials: TestimonialsContent; quotes: Quote[];
};

/** List collections and the field that identifies each document. */
export const LIST_KEYS = { orders: "id", enquiries: "id", customers: "id", products: "id", discountCodes: "id", pages: "slug", quotes: "id" } as const;
export type ListName = keyof typeof LIST_KEYS;
export const SINGLETONS = ["promotion", "settings", "home", "about", "pricing", "testimonials"] as const;
export type SingletonName = (typeof SINGLETONS)[number];

export const defaultPromotion: Promotion = {
  enabled: true, eyebrow: "Special offer", highlight: "10% off", title: "Custom saddles",
  description: "Built for your horse. Designed for the way you ride. Start the conversation about your custom saddle.",
  ctaLabel: "Discuss this offer", ctaHref: "/contact", image: "/images/saddles/wade-v2.png",
  terms: "Preview promotion · Offer subject to confirmation. No discount is applied at checkout.", delaySeconds: 1.5,
};

export const defaultSettings: Settings = { businessName: "Peter Brophy Saddles", email: "", phone: "", address: "", bankDetails: "", notifyOrders: true, notifyEnquiries: true, showPrices: true };

export const seedProducts = (): AdminProduct[] => catalog.map((p, i) => ({ category: categoryOf(p), sort: (i + 1) * 10, id: p.id, name: p.name, image: p.photo ?? (p.image ? `/images/${p.image}.webp` : ""), gallery: p.gallery ?? [], price: p.price, custom: !!p.custom, active: true, description: p.description ?? "", specs: p.specs ?? [], stock: p.stock }));

/** Products by category (in productCategories order), then display order. */
export const sortProducts = <T extends { category?: string; sort?: number }>(list: T[]) => [...list].sort((a, b) =>
  (categoryOf(a) === categoryOf(b) ? 0 : categoryOf(a) === "saddles" ? -1 : 1) || (a.sort ?? 9999) - (b.sort ?? 9999));

export const seedPages = (): ContentPage[] => [
  ["about", "About Peter Brophy", "Traditional craftsmanship. Modern performance. Australian-made saddles and leatherwork, crafted with experience, precision and a deep understanding of horse and rider.", ""],
  ["saddle-range", "Saddle Range", "Saddles for every discipline. Explore our range and discuss the right saddle for you and your horse.", ""],
  ["custom-saddles", "Custom Saddles", "Built around you and your horse. Discuss fit, style, materials and the finer details of your custom saddle.", ""],
  ["saddle-pricing", "Saddle Pricing", "Enquire about pricing for your chosen saddle, materials and custom details.", ""],
  ["saddle-trees", "Saddle Trees", "The foundation of a great saddle. Discuss tree selection and fit options for your horse.", "/asset/Saddletrees.png"],
  ["tack", "Tack", "Premium tack and leatherwork to complement your saddle, from headstalls to breastplates.", "/asset/Tackleatherwork.png"],
  ["leather-work", "Leather work", "Carefully crafted leatherwork with attention to materials, strength and the finer details.", "/asset/Tackleatherwork.png"],
  ["quality-materials", "Quality Materials", "Carefully selected leathers and hardware for strength, beauty and long-lasting performance.", "/asset/Qualitymaterials.png"],
  ["testimonials", "Testimonials", "Experience Peter Brophy Saddles through the words of our riders.", ""],
  ["contact", "Contact Us", "Let’s create something special. Prepare an enquiry about your horse, riding discipline and saddle requirements.", ""],
].map(([slug, title, description, image]) => ({ slug, title, description, image, published: true, updatedAt: "2026-11-01" }));

/** Seed: the home page content as originally built. */
export const defaultHome: HomeContent = {
  hero: {
    eyebrow: "Peter Brophy Saddles",
    title: "Custom saddles\nfor a higher\nstandard",
    description: "Australian-made saddles and leatherwork, crafted with experience, precision and a deep understanding of horse and rider.",
    image: "/cover/hero.png",
    slides: [],
    slideSeconds: 6,
    primary: { label: "Explore saddle collection", href: "/saddle-range" },
    secondary: { label: "About our work", href: "/about" },
  },
  heritage: {
    eyebrow: "Our heritage",
    title: "Traditional\ncraftsmanship.\nModern performance.",
    body: "With over 20 years of experience, Peter Brophy Saddles creates custom saddles and premium leatherwork designed for comfort, balance and long-term performance.",
    image: "/cover/right.png",
    backgroundImage: "/cover/left.png",
    link: { label: "Our story", href: "/about" },
  },
  collection: {
    eyebrow: "Saddle collection",
    title: "Saddles for every discipline",
    body: "Each saddle is designed with purpose, combining traditional craftsmanship with practical performance for modern riders.",
    link: { label: "View all saddles", href: "/saddle-range" },
    items: [
      ["Wade saddles", "wade", "wade-saddles"], ["Campdraft saddles", "campdraft", "campdraft-saddles"], ["Stock saddles", "stock", "stock-saddles"],
      ["Reining saddles", "reining", "reining-saddles"], ["Cutting saddles", "cutting", "cutting-saddles"],
      ["Custom western saddles", "western", "custom-western-saddles"], ["Old timer / Vaquero saddles", "vaquero", "old-timer-vaquero-saddles"],
    ].map(([name, image, slug]) => ({ name, image: `/images/saddles/${image}-v2.png`, href: `/saddle-range/${slug}` })),
  },
  custom: {
    eyebrow: "Custom saddles",
    title: "Built around\nyou and your horse",
    body: "Every horse and rider are different. Our custom saddles are made to fit, perform and last — with careful attention to saddle fit, style, materials and the finer details.",
    image: "/cover/bane.png",
    cta: { label: "Enquire about a custom saddle", href: "/contact" },
  },
  services: {
    items: [
      { title: "Saddle trees", body: "From foundation of a great saddle. Learn about our saddle trees, fit options and how we select the right tree for your horse.", image: "/asset/Saddletrees.png", link: { label: "Learn more", href: "/saddle-trees" } },
      { title: "Tack & leatherwork", body: "From headstalls to breastplates, we create premium tack and leatherwork to complement your saddle.", image: "/asset/Tackleatherwork.png", link: { label: "Explore tack", href: "/tack" } },
      { title: "Quality materials", body: "We use carefully selected leathers and hardware to ensure strength, beauty and long-lasting performance.", image: "/asset/Qualitymaterials.png", link: { label: "Our approach", href: "/quality-materials" } },
    ],
  },
  testimonial: {
    eyebrow: "Testimonials",
    quote: "An exceptional saddle with outstanding craftsmanship. It fits both my horse and my style of riding perfectly.",
    author: "Client, Australia",
    image: "/cover/ff01.png",
  },
  contact: { eyebrow: "Ready to discuss your saddle?", title: "Let’s create something special", buttonLabel: "Get in touch" },
};

/** Fill any missing fields from the seed, so older saved content never breaks the page. */
export function mergeHome(saved: Partial<HomeContent> | undefined | null): HomeContent {
  const s = saved ?? {};
  return {
    hero: { ...defaultHome.hero, ...s.hero, slides: Array.isArray(s.hero?.slides) ? s.hero.slides.filter(x => typeof x === "string" && x) : [], primary: { ...defaultHome.hero.primary, ...s.hero?.primary }, secondary: { ...defaultHome.hero.secondary, ...s.hero?.secondary } },
    heritage: { ...defaultHome.heritage, ...s.heritage, link: { ...defaultHome.heritage.link, ...s.heritage?.link } },
    collection: { ...defaultHome.collection, ...s.collection, link: { ...defaultHome.collection.link, ...s.collection?.link }, items: s.collection?.items?.length ? s.collection.items : defaultHome.collection.items },
    custom: { ...defaultHome.custom, ...s.custom, cta: { ...defaultHome.custom.cta, ...s.custom?.cta } },
    services: { items: s.services?.items?.length ? s.services.items : defaultHome.services.items },
    testimonial: { ...defaultHome.testimonial, ...s.testimonial },
    contact: { ...defaultHome.contact, ...s.contact },
  };
}

/** Seed: the About page content as originally built. */
export const defaultAbout: AboutContent = {
  intro: {
    eyebrow: "Our story · Our craft",
    title: "The saddle specialist.",
    accent: "Through and through.",
    text: "More than twenty years of experience. A lifelong respect for the craft. Saddles made with horse and rider in mind.",
    linkLabel: "Discover our story",
  },
  story: {
    eyebrow: "Small beginnings. Lasting standards.",
    title: "A story shaped\nby the saddle.",
    lead: "Peter Brophy Custom Saddles & Trees began in a small town outside Brisbane, making quality saddles and tack with a simple commitment: take pride in the work, and keep making it better.",
    body: "Over more than twenty years, that work has grown to encompass saddle fitting, specialised saddle design and saddle-tree development. It is this depth of experience that makes Peter Brophy a specialist to turn to for your saddle needs.\n\nMuch has changed along the way. The pride, craftsmanship and care put into each saddle have stayed at the heart of the business.",
    link: { label: "Discover custom saddles", href: "/custom-saddles" },
    image: "/asset/photo-22-3-20-4-24-35-pm_orig.jpg",
    imageAlt: "Peter Brophy leather western saddle with tooling and silver-coloured stirrups",
    caption: "THE CRAFT. THE DETAIL. THE DIFFERENCE.",
    statNumber: "20+",
    statLabel: "years of experience\nin saddles & fitting",
  },
  principles: {
    eyebrow: "The Peter Brophy approach",
    title: "Good saddles begin\nwith good principles.",
    text: "There is no single detail that makes a great saddle.\nIt is the care that goes into all of them.",
    items: [
      { title: "Fit comes first", body: "Experience in saddle fitting and specialised saddle-tree design brings horse and rider to the heart of the conversation. The right starting point is understanding how you ride and what your horse needs." },
      { title: "Quality in every detail", body: "From carefully selected leathers to hardware, silver trim and finishes, each element has a part to play. Materials are chosen with the same attention given to the saddle itself." },
      { title: "Always moving forward", body: "Traditional skills remain the foundation, with a commitment to improving each design. Contemporary styling and thoughtful developments in saddle construction carry that heritage forward." },
    ],
  },
  materials: {
    eyebrow: "Built on the finer details",
    title: "Leather. Hardware.",
    accent: "And a craftsman’s eye.",
    body: "Peter Brophy saddles and tack are made from fine leathers selected for the work ahead. Quality hardware, silver trim and considered finishes complement the leatherwork, bringing the whole saddle together.\n\nEach saddle is built with the same care that has defined Peter Brophy products from the beginning. The result is a collection grounded in tradition, with an eye on evolving design and the needs of today’s riders.",
    link: { label: "Explore our materials", href: "/quality-materials" },
    image: "/images/quality-materials.webp",
    imageAlt: "Leather and materials used in saddlery",
    caption: "Chosen with purpose. Finished with care.",
  },
  disciplines: {
    eyebrow: "Different rides. The same care.",
    title: "For the way",
    accent: "you ride.",
    body: "From the show ring to a working day in the stock yards, different disciplines ask different things of a saddle. Peter Brophy makes a range of designs to give riders choices suited to their needs.",
    cta: { label: "Explore the saddle range", href: "/saddle-range" },
    items: ["Showing", "Reining", "Trail riding", "Team penning", "Cutting", "Roping", "Barrel racing", "Stock work"],
  },
  legacy: {
    eyebrow: "The tradition continues",
    title: "Rooted in heritage.",
    accent: "Made for the ride ahead.",
    body: "Today, Peter Brophy Saddles continues to produce quality saddles and tack with the heritage and tradition the business was founded on. Stylish designs and a commitment to improvement keep that story moving forward, one saddle at a time.",
  },
  consultation: {
    eyebrow: "Your next saddle starts here",
    title: "Let’s talk horse, rider\nand the right saddle.",
    body: "Book a consultation to discuss your riding discipline, saddle fit and the details you have in mind.",
    cta: { label: "Enquire about a consultation", href: "/contact" },
  },
};

/** Fill missing fields from the seed (sections one level deep, plus nested links). */
function mergeSections<T extends object>(defaults: T, saved: Partial<T> | undefined | null): T {
  const s = (saved ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, base] of Object.entries(defaults as Record<string, Record<string, unknown>>)) {
    const merged: Record<string, unknown> = { ...base, ...(s[key] as object | undefined) };
    for (const [k, v] of Object.entries(base)) if (v && typeof v === "object" && !Array.isArray(v)) merged[k] = { ...v, ...(merged[k] as object) };
    out[key] = merged;
  }
  return out as T;
}
export const mergeAbout = (saved: Partial<AboutContent> | undefined | null) => mergeSections(defaultAbout, saved);
export const mergePricing = (saved: Partial<PricingContent> | undefined | null) => mergeSections(defaultPricing, saved);

/** Seed: Saddle Pricing page (text supplied by Peter Brophy Saddles). Facebook URL is set in the admin. */
export const defaultPricing: PricingContent = {
  intro: { eyebrow: "About · Saddle pricing", title: "Saddle Pricing", accent: "A lifetime investment." },
  main: {
    body: "A Peter Brophy saddle is a lifetime investment. Hand crafted with the finest raw products, these saddles are made specifically to suit you as a rider. Many hours of blood, sweat and tears goes into creating each of these pieces and our prices reflect the level of commitment and work that goes into each one.",
    image: "/images/craftsmanship.webp",
    imageAlt: "Craftsman hand-tooling a floral pattern into saddle leather",
    caption: "Hand crafted. Made to suit you.",
    cta: { label: "Enquire about pricing", href: "/contact" },
  },
  facebook: {
    title: "Find us on Facebook",
    text: "Join us on Facebook for all our latest news and pictures!",
    buttonLabel: "Facebook",
    url: "",
  },
};

const review = (name: string, tag: string, headline: string, body: string, layout: ReviewLayout = "standard", badge = ""): Review => ({ name, tag, headline, body, badge, layout, visible: true });

/** Seed: Testimonials page (reviews supplied by Peter Brophy Saddles). */
export const defaultTestimonials: TestimonialsContent = {
  intro: {
    eyebrow: "In their words",
    title: "Riders, horses and saddle makers",
    accent: "who trust the Brophy name",
    text: "From Queensland cattle country to the hills of Scotland — honest stories from the people who ride in, and build on, Peter's work.",
  },
  reviews: { items: [
    review("Peta", "Custom Old Timer saddle · Darling Downs, QLD", "No stone was left unturned!",
      "On a visit to one of the 2011 ANH courses in Esk, Peter & Thip Brophy and I sat down in Ken & Kathy's green shed (dining hall) for what seemed like a couple of hours going over every intricate detail of what I wanted in my new custom saddle. Peter was so helpful in explaining how everything fitted together. Using great photographs and drawings, he showed me the many options I could have regarding the overall design to suit my body shape, as well as all of the amazing leather stamping patterns. No stone was left unturned!\n\nPeter & Thip even drove for several hours to my farm on the Darling Downs to fit the tree to my horses before the saddle was built to ensure it was the perfect fit! You can see Peter's masterpiece in the Old Timer Saddles section (fourth photo). The attention to detail is outstanding. I doubt there would be many other saddler makers in Australia who have this level of craftsmanship.\n\nI love this saddle. My horses feel so comfortable when we ride together. They are more uphill and their paces feel relaxed. Peter & Thip also made me a matching bridle, breastplate, and saddle bags. You can view the bridle in the Tack section (second photo). I feel very privileged to ride in such a gorgeous saddle. Thank you to Peter & Thip for all of their amazing work. They are true professionals!",
      "featured"),
    review("Michelle", "Cutting saddle", "The craftsmanship is outstanding.",
      "Thank you so much for the beautiful saddle you made for me! The craftsmanship is outstanding I recommend your saddles to everyone. My saddle is on here have a look in the cutting saddles section it is the chocolate one with the inset on the seat....love it!!"),
    review("Jane", "Scotland", "I wouldn't swap my Brophy saddle for anything.",
      "I bought my wonderful saddle from Peter two years ago. Poor thing gets used almost everyday, in all weathers (thats saying something here in Scotland) and I love it more every time I use it. I couldn't possibly buy any other kind of saddle now. I am totally spoilt! I trained in classical riding before I moved over into horsemanship so I am pretty picky as to how a saddle positions its rider.\n\nI can honestly say that wether I am using my saddle for the first time on a baby horse, schooling my older horse or flying across the hills I wouldn't swap my Brophy saddle for anything else I have ever ridden in. Even ordering and buying over long distance was easy!"),
    review("Heidi", "Custom wade saddle", "We rope and ride and Pete's gear is the best!",
      "I have an awesome wade saddle made by Pete Brophy. It was custom made to fit me and my horse and everyone who has ever ridden in it has said what a great saddle it is. Not only does it look AMAZING but it is a great fit on all different shapes and sizes of horse. We rope and ride and Pete's gear is the best!"),
    review("Dan", "Dan Baker Custom Saddles", "I have used many tree makers over the years and have found Pete's to be the best.",
      "I'm Dan from Dan Baker Custom Saddles. I have been making saddles now for 23 years with around 600 saddles made. I have used many tree makers over the years and have found Pete's to be the best. He has a great range and the fit is second to none. I recommend them to any saddle maker. I think with Pete also being a saddle maker he knows what we need and makes his trees very easy to build on.",
      "wide", "From a fellow saddle maker · 23 years, ~600 saddles"),
    review("Shay", "Peter Brophy saddle owner", "Love my Peter Brophy Saddle. Best saddle I have owned or ridden in. Thanks Peter.", ""),
    review("Damian", "Stock & wade saddles", "If you want a custom saddle — talk to Pete!",
      "I've got 2 (a swinging fender stocky and the wade) excellent saddles. The stock is on the Symetry tree and the wade on the \"new mould\" which is carbon fibre re-inforced. Both sit me just where I want to be, great seats and good pockets to hang my legs spot on, as well the bars are open enough to allow the horses shoulders to move freely without creating hot spots.... Very nicely finished off as well... If you want a custom saddle - talk to Pete!"),
    review("Belinda", "Peter Brophy saddle owner", "The difference the saddle has made to my horses is beyond words.",
      "A brilliant saddle! Peter's work is of the highest quality and eye to detail is amazing. The difference the saddle has made to my horses is beyond words. The saddle fits them perfectly, they're able to move freely and are happy horses in Peter's saddle! Thank you again Peter!"),
    review("Kayleen", "Peter Brophy saddle owner", "What an awesome saddle. I'm so lucky to own it :)", ""),
  ] },
};
export const mergeTestimonials = (saved: Partial<TestimonialsContent> | undefined | null) => {
  const merged = mergeSections(defaultTestimonials, saved);
  const blank = review("", "", "", "");
  return { ...merged, reviews: { items: (Array.isArray(merged.reviews.items) ? merged.reviews.items : []).map(r => ({ ...blank, ...r })) } };
};
