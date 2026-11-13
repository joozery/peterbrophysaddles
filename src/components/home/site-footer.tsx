import Link from "next/link";
import { Suspense } from "react";
import { Brand, navigation } from "./site-navigation";
import { SocialLinks } from "./social-links";
import { DEFAULT_BUSINESS_NAME } from "@/lib/admin-types";
import { getSiteSettings } from "@/lib/server/site-settings";

async function FooterBrand() { return <Brand name={(await getSiteSettings()).brand} />; }
async function FooterSocial() { return <SocialLinks links={(await getSiteSettings()).social} />; }
async function FooterName() { return <>{(await getSiteSettings()).brand}</>; }

export function SiteFooter() {
  return <footer className="site-footer"><div className="section-shell grid gap-9 py-10 sm:grid-cols-[1fr_1.4fr_1fr]"><Suspense fallback={<Brand name={DEFAULT_BUSINESS_NAME} />}><FooterBrand /></Suspense><nav aria-label="Footer navigation" className="grid grid-flow-col grid-rows-4 gap-x-8 gap-y-3 text-xs text-cream/75">{navigation.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><div><p className="max-w-xs text-xs leading-6 text-cream/75">Australian-made saddles and leatherwork for riders who expect more.</p><Suspense fallback={null}><FooterSocial /></Suspense></div></div><div className="section-shell footer-legal"><span>© <Suspense fallback={DEFAULT_BUSINESS_NAME}><FooterName /></Suspense></span><Link href="/privacy">Privacy Policy</Link></div></footer>;
}
