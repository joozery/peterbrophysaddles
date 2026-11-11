"use client";

import { ChevronDownIcon, Cross2Icon, ChevronRightIcon, ChatBubbleIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Collapsible, Dialog, NavigationMenu } from "radix-ui";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./navbar-dropdown.css";
import "./mobile-navigation.css";
import "./site-header.css";
import { mainNavigation, type NavigationItem } from "./site-navigation";

const isActive = (path: string, href: string) => path === href || (href !== "/" && path.startsWith(href + "/"));
const sectionActive = (path: string, item: NavigationItem) => isActive(path, item.href) || !!item.children?.some(child => isActive(path, child.href));

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <header className="site-header" data-scrolled={scrolled || undefined}><div className="header-inner">
    <Link href="/" className="header-brand" aria-label="Peter Brophy Saddles home"><Image src="/logo/logo-white.svg" alt="Peter Brophy Saddles" width={2067} height={761} className="header-logo" unoptimized /></Link>

    <NavigationMenu.Root aria-label="Main navigation" className="primary-nav" delayDuration={80}>
      <NavigationMenu.List className="primary-nav-list">
        {mainNavigation.map(item => {
          const current = sectionActive(active, item);
          if (!item.children) return <NavigationMenu.Item key={item.label}>
            <NavigationMenu.Link asChild active={current}><Link href={item.href} className="primary-nav-link" aria-current={current ? "page" : undefined}>{item.label}</Link></NavigationMenu.Link>
          </NavigationMenu.Item>;
          const withImages = item.children.some(child => child.image);
          return <NavigationMenu.Item key={item.label} className="primary-nav-item">
            <NavigationMenu.Trigger className="primary-nav-link primary-nav-trigger" data-current={current || undefined}>{item.label}<ChevronDownIcon aria-hidden="true" /></NavigationMenu.Trigger>
            <NavigationMenu.Content className={`primary-nav-panel${withImages ? " primary-nav-panel-wide" : ""}`}>
              <NavigationMenu.Link asChild active={active === item.href}><Link href={item.href} className="primary-nav-overview"><span><small>Explore</small>{item.label}</span><ArrowRightIcon aria-hidden="true" /></Link></NavigationMenu.Link>
              <ul className={withImages ? "primary-nav-grid" : "primary-nav-children"}>
                {item.children.map(child => <li key={child.label}><NavigationMenu.Link asChild active={isActive(active, child.href)}><Link href={child.href} className="primary-nav-child" aria-current={isActive(active, child.href) ? "page" : undefined}>
                  {child.image && <span className="primary-nav-thumb"><Image src={child.image} alt="" fill sizes="160px" /></span>}
                  <span className="primary-nav-child-label">{child.label}</span>
                </Link></NavigationMenu.Link></li>)}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>;
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>

    <div className="header-actions">
      <Link href="/contact" className="header-enquire">Enquire Now</Link>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="mobile-menu" aria-label="Open navigation"><span /><span /><span /></Dialog.Trigger>
        <Dialog.Portal><Dialog.Overlay className="mobile-navigation-overlay" /><Dialog.Content className="mobile-panel mobile-navigation-panel">
          <div className="mobile-navigation-heading"><Link href="/" onClick={() => setOpen(false)} aria-label="Peter Brophy Saddles home"><Image src="/logo/logo-white.svg" alt="Peter Brophy Saddles" width={2067} height={761} className="mobile-navigation-logo" unoptimized /></Link><Dialog.Title className="sr-only">Navigation</Dialog.Title><Dialog.Close aria-label="Close navigation" className="mobile-navigation-close"><Cross2Icon aria-hidden="true" width={18} height={18} /></Dialog.Close></div>
          <Dialog.Description className="mobile-navigation-caption">Australian craftsmanship</Dialog.Description>
          <nav aria-label="Mobile navigation" className="mobile-links">{mainNavigation.map(item => <Collapsible.Root key={item.label}>
            <div className="mobile-nav-row"><Link aria-current={isActive(active, item.href) ? "location" : undefined} href={item.href} onClick={() => setOpen(false)}>{item.label}{!item.children && <ChevronRightIcon aria-hidden="true" />}</Link>
              {item.children && <Collapsible.Trigger className="mobile-submenu-toggle" aria-label={`Toggle ${item.label} submenu`}><ChevronDownIcon aria-hidden="true" /></Collapsible.Trigger>}
            </div>
            {item.children && <Collapsible.Content className="mobile-submenu navbar-mobile-submenu">{item.children.map(child => <Link key={child.label} href={child.href} aria-current={active === child.href ? "page" : undefined} onClick={() => setOpen(false)}>{child.label}</Link>)}</Collapsible.Content>}
          </Collapsible.Root>)}</nav>
          <div className="mobile-navigation-footer"><p>A saddle made for your story.</p><Link href="/contact" onClick={() => setOpen(false)}><ChatBubbleIcon aria-hidden="true" /> Get in touch <ChevronRightIcon aria-hidden="true" /></Link><span>Peter Brophy Saddles · Handcrafted with care</span></div>
        </Dialog.Content></Dialog.Portal>
      </Dialog.Root>
    </div>
  </div></header>;
}
