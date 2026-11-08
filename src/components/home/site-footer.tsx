import Link from "next/link";
import { Brand, navigation } from "./site-navigation";

export function SiteFooter() {
  return <footer className="site-footer"><div className="section-shell grid gap-9 py-10 sm:grid-cols-[1fr_1.4fr_1fr]"><Brand /><nav aria-label="Footer navigation" className="grid grid-flow-col grid-rows-4 gap-x-8 gap-y-3 text-xs text-cream/75">{navigation.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><p className="max-w-xs text-xs leading-6 text-cream/75">Australian-made saddles and leatherwork for riders who expect more.</p></div><div className="section-shell footer-legal"><span>© Peter Brophy Saddles</span><Link href="/privacy">Privacy Policy</Link></div></footer>;
}
