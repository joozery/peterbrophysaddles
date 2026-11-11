import Link from "next/link";
import { categoryOf, productPhoto, saddleTypes, type Product } from "@/lib/catalog";
export type NavigationItem = { label: string; href: string; children?: { label: string; href: string; image?: string }[] };

export const mainNavigation: NavigationItem[] = [
  { label: "Home", href: "/", children: [{ label: "Contact Us", href: "/contact" }, { label: "Custom Saddles", href: "/custom-saddles" }] },
  { label: "About", href: "/about", children: [{ label: "Saddle Pricing", href: "/saddle-pricing" }] },
  { label: "Saddle Range", href: "/saddle-range", children: [
    { label: "Campdraft Saddles", href: "/saddle-range/campdraft-saddles", image: "/images/campdraft.webp" },
    { label: "Stock Saddles", href: "/saddle-range/stock-saddles", image: "/images/stock.webp" },
    { label: "Wade Saddles", href: "/saddle-range/wade-saddles", image: "/images/wade.webp" },
    { label: "Cowboy Dressage Saddles", href: "/saddle-range/cowboy-dressage-saddles", image: "/images/western.webp" },
    { label: "Old Timer Saddles", href: "/saddle-range/old-timer-vaquero-saddles", image: "/images/vaquero.webp" },
    { label: "Reining Saddles", href: "/saddle-range/reining-saddles", image: "/images/reining.webp" },
    { label: "Cutting Saddles", href: "/saddle-range/cutting-saddles", image: "/images/cutting.webp" },
    { label: "Custom Western Saddles", href: "/saddle-range/custom-western-saddles", image: "/images/western.webp" },
  ] },
  { label: "Tack", href: "/tack", children: [{ label: "Leather work", href: "/leather-work" }] },
  { label: "Saddle Trees", href: "/saddle-trees", children: [
    { label: "Stock Standard Tree (3 ½” Cantle)", href: "/saddle-range/stock-standard-saddle-tree-3-5-cantle", image: "/asset/Saddletrees.png" },
    { label: "Stock Tree (3 ¼” Cantle)", href: "/saddle-range/stock-saddle-tree-3-25-cantle", image: "/asset/Saddletrees.png" },
  ] },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Shop", href: "/shop" },
];

/** Main menu with Saddle Range and Saddle Trees filled from the products (in admin order). Falls back to the built-in items if there are none. */
export function buildNavigation(products: Product[]): NavigationItem[] {
  const saddles = saddleTypes(products);
  const trees = products.filter(p => categoryOf(p) === "saddle-trees");
  const link = (p: Product, label: string) => ({ label, href: `/saddle-range/${p.id}`, image: productPhoto(p) });
  return mainNavigation.map(item =>
    item.href === "/saddle-range" && saddles.length ? { ...item, children: saddles.map(t => link(t.product, t.plural)) }
    : item.href === "/saddle-trees" && trees.length ? { ...item, children: trees.map(p => link(p, p.name)) }
    : item);
}

export const navigation = mainNavigation.map(({ label, href }) => [label, href]);

export function Brand() {
  return <Link href="/" aria-label="Peter Brophy Saddles home" className="brand"><span>PETER BROPHY</span><small>SADDLES</small></Link>;
}
