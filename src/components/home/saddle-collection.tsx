import { ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Image from "next/image";
import { TextLink } from "@/components/ui/button-link";

const saddlePaths: Record<string, string> = {"wade": "wade-saddles", "campdraft": "campdraft-saddles", "stock": "stock-saddles", "reining": "reining-saddles", "cutting": "cutting-saddles", "western": "custom-western-saddles", "vaquero": "old-timer-vaquero-saddles"};

const saddles = [
  ["Wade saddles", "wade"], ["Campdraft saddles", "campdraft"], ["Stock saddles", "stock"],
  ["Reining saddles", "reining"], ["Cutting saddles", "cutting"],
  ["Custom western saddles", "western"], ["Old timer / Vaquero saddles", "vaquero"],
];

export function SaddleCollection() {
  return <section id="collection" className="section-shell collection-section"><div className="flex flex-wrap items-center justify-between gap-5"><div><p className="eyebrow">Saddle collection</p><h2 className="mt-3">Saddles for every discipline</h2></div><TextLink href="/saddle-range">View all saddles</TextLink></div>
    <p className="body-copy mt-3 max-w-2xl">Each saddle is designed with purpose, combining traditional craftsmanship with practical performance for modern riders.</p>
    <div id="saddle-grid" className="saddle-grid mt-7">{saddles.map(([name, image]) => <Link id={`saddle-${image}`} key={image} href={`/saddle-range/${saddlePaths[image]}`} className="saddle-card group">
      <Image src={`/images/saddles/${image}-v2.png`} alt={name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw" className="object-cover transition duration-500 group-hover:scale-105" />
      <div className="saddle-card-shade" /><div className="relative z-10 mt-auto p-3"><h3>{name}</h3><p className="mt-3 inline-flex items-center gap-1 text-xs text-cream/80">View collection <ChevronRightIcon aria-hidden="true" className="action-icon" /></p></div>
    </Link>)}</div>
  </section>;
}
