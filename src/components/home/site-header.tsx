"use client";

import { ChevronDownIcon, Cross2Icon, ChevronRightIcon, ChatBubbleIcon } from "@radix-ui/react-icons";


import Link from "next/link";

import { Collapsible, Dialog, DropdownMenu } from "radix-ui";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CartLink } from "@/components/shop/cart-link";
import "./navbar-dropdown.css";
import "./mobile-navigation.css";
import { mainNavigation } from "./site-navigation";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const active = usePathname();

  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="header-brand" aria-label="Peter Brophy Saddles home"><Image src="/logo/logo-white.svg" alt="Peter Brophy Saddles" width={2067} height={761} className="header-logo" unoptimized /></Link>
    <nav aria-label="Main navigation" className="desktop-nav">
      {mainNavigation.map(item => <div className="nav-group" key={item.label}>
        <Link href={item.href} aria-current={(active === item.href || (item.href !== "/" && active.startsWith(item.href + "/"))) ? "location" : undefined}>{item.label}</Link>
        {item.children && <DropdownMenu.Root><DropdownMenu.Trigger className="nav-dropdown-trigger nav-submenu-toggle" aria-label={`Open ${item.label} submenu`}><ChevronDownIcon aria-hidden="true" /></DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content className="saddles-menu navbar-dropdown" sideOffset={10} align="start" alignOffset={-12} collisionPadding={16}>
            <DropdownMenu.Label className="navbar-submenu-heading">{item.label}</DropdownMenu.Label>
            {item.children.map(child => <DropdownMenu.Item asChild key={child.label}><Link href={child.href} aria-current={active === child.href ? "page" : undefined} className="saddles-menu-item navbar-submenu-item"><strong>{child.label}</strong></Link></DropdownMenu.Item>)}
          </DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root>}
      </div>)}
    </nav>
    <CartLink />
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="mobile-menu" aria-label="Open navigation"><span /><span /><span /></Dialog.Trigger>
      <Dialog.Portal><Dialog.Overlay className="mobile-navigation-overlay" /><Dialog.Content className="mobile-panel mobile-navigation-panel">
        <div className="mobile-navigation-heading"><Link href="/" onClick={() => setOpen(false)} aria-label="Peter Brophy Saddles home"><Image src="/logo/logo-white.svg" alt="Peter Brophy Saddles" width={2067} height={761} className="mobile-navigation-logo" unoptimized /></Link><Dialog.Title className="sr-only">Navigation</Dialog.Title><Dialog.Close aria-label="Close navigation" className="mobile-navigation-close"><Cross2Icon aria-hidden="true" width={18} height={18} /></Dialog.Close></div>
        <Dialog.Description className="mobile-navigation-caption">Australian craftsmanship</Dialog.Description>
        <nav aria-label="Mobile navigation" className="mobile-links">{mainNavigation.map(item => <Collapsible.Root key={item.label}>
          <div className="mobile-nav-row"><Link aria-current={(active === item.href || (item.href !== "/" && active.startsWith(item.href + "/"))) ? "location" : undefined} href={item.href} onClick={() => setOpen(false)}>{item.label}{!item.children && <ChevronRightIcon aria-hidden="true" />}</Link>
            {item.children && <Collapsible.Trigger className="mobile-submenu-toggle" aria-label={`Toggle ${item.label} submenu`}><ChevronDownIcon aria-hidden="true" /></Collapsible.Trigger>}
          </div>
          {item.children && <Collapsible.Content className="mobile-submenu navbar-mobile-submenu">{item.children.map(child => <Link key={child.label} href={child.href} aria-current={active === child.href ? "page" : undefined} onClick={() => setOpen(false)}>{child.label}</Link>)}</Collapsible.Content>}
        </Collapsible.Root>)}</nav>
        <div className="mobile-navigation-footer"><p>A saddle made for your story.</p><Link href="/contact" onClick={() => setOpen(false)}><ChatBubbleIcon aria-hidden="true" /> Get in touch <ChevronRightIcon aria-hidden="true" /></Link><span>Peter Brophy Saddles · Handcrafted with care</span></div>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </div></header>;
}
