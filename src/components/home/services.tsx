import Image from "next/image";
import { TextLink } from "@/components/ui/button-link";

const services = [
  { id: "trees", image: "/asset/Saddletrees.png", title: "Saddle trees", description: "From foundation of a great saddle. Learn about our saddle trees, fit options and how we select the right tree for your horse.", link: "Learn more" },
  { id: "tack", image: "/asset/Tackleatherwork.png", title: "Tack & leatherwork", description: "From headstalls to breastplates, we create premium tack and leatherwork to complement your saddle.", link: "Explore tack" },
  { id: "materials", image: "/asset/Qualitymaterials.png", title: "Quality materials", description: "We use carefully selected leathers and hardware to ensure strength, beauty and long-lasting performance.", link: "Our approach" },
];

export function Services() {
  return <section aria-label="Our craftsmanship and services" className="section-shell services-grid">{services.map(service => <article key={service.id} id={service.id}><div className="relative aspect-[1.9] overflow-hidden"><Image src={service.image} alt={service.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div><h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.15em]">{service.title}</h3><p className="body-copy mt-2">{service.description}</p><div className="mt-4"><TextLink href={service.id === "trees" ? "/saddle-trees" : service.id === "tack" ? "/tack" : "/quality-materials"}>{service.link}</TextLink></div></article>)}</section>;
}
