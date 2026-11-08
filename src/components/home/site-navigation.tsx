import Link from "next/link";
export type NavigationItem = { label: string; href: string; children?: { label: string; href: string; image?: string }[] };

export const mainNavigation: NavigationItem[] = [
  { label: "Home", href: "/", children: [{ label: "Contact Us", href: "/contact" }, { label: "Custom Saddles", href: "/custom-saddles" }] },
  { label: "About", href: "/about", children: [{ label: "Saddle Pricing", href: "/saddle-pricing" }] },
  { label: "Saddle Range", href: "/saddle-range", children: [
    { label: "Wade Saddles", href: "/saddle-range/wade-saddles", image: "/images/wade.webp" },
    { label: "Campdraft Saddles", href: "/saddle-range/campdraft-saddles", image: "/images/campdraft.webp" },
    { label: "Stock Saddles", href: "/saddle-range/stock-saddles", image: "/images/stock.webp" },
    { label: "Reining Saddles", href: "/saddle-range/reining-saddles", image: "/images/reining.webp" },
    { label: "Cutting Saddles", href: "/saddle-range/cutting-saddles", image: "/images/cutting.webp" },
    { label: "Custom Western Saddles", href: "/saddle-range/custom-western-saddles", image: "/images/western.webp" },
    { label: "Old Timer/Vaquero Saddles", href: "/saddle-range/old-timer-vaquero-saddles", image: "/images/vaquero.webp" },
  ] },
  { label: "Tack", href: "/tack", children: [{ label: "Leather work", href: "/leather-work" }] },
  { label: "Saddle Trees", href: "/saddle-trees" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Shop", href: "/shop" },
];

export const navigation = mainNavigation.map(({ label, href }) => [label, href]);

export function Brand() {
  return <Link href="/" aria-label="Peter Brophy Saddles home" className="brand"><span>PETER BROPHY</span><small>SADDLES</small></Link>;
}
