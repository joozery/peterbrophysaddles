"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DropdownMenu } from "radix-ui";
import { ArchiveIcon, ChatBubbleIcon, Cross2Icon, DashboardIcon, ExitIcon, FileTextIcon, GearIcon, HamburgerMenuIcon, HomeIcon, IdCardIcon, LockClosedIcon, PersonIcon, ReaderIcon, StarIcon, TokensIcon } from "@radix-ui/react-icons";
import { type AdminRole, loadAdmin, onSyncError, signOut, useAdminStatus } from "@/lib/admin-store";

const links: { href: string; label: string; icon: typeof DashboardIcon; roles?: AdminRole[] }[] = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/orders", label: "Orders", icon: ReaderIcon },
  { href: "/admin/products", label: "Products & stock", icon: ArchiveIcon },
  { href: "/admin/enquiries", label: "Enquiries", icon: ChatBubbleIcon },
  { href: "/admin/customers", label: "Customers", icon: PersonIcon },
  { href: "/admin/promotions", label: "Promotions", icon: StarIcon, roles: ["owner", "admin"] },
  { href: "/admin/home", label: "Home page", icon: HomeIcon, roles: ["owner", "admin"] },
  { href: "/admin/about", label: "About page", icon: IdCardIcon, roles: ["owner", "admin"] },
  { href: "/admin/pricing", label: "Pricing page", icon: TokensIcon, roles: ["owner", "admin"] },
  { href: "/admin/pages", label: "Pages & content", icon: FileTextIcon, roles: ["owner", "admin"] },
  { href: "/admin/admins", label: "Admin users", icon: LockClosedIcon },
  { href: "/admin/settings", label: "Settings", icon: GearIcon },
];
const roleLabel: Record<AdminRole, string> = { owner: "Owner", admin: "Admin", staff: "Staff" };

function SidebarContent({ onNavigate, role }: { onNavigate?: () => void; role?: AdminRole }) {
  const path = usePathname();
  return <>
    <Link href="/admin" className="admin-brand" onClick={onNavigate}><Image src="/logo/logo-white.svg" alt="Peter Brophy Saddles" width={2067} height={761} unoptimized /><span>Admin</span></Link>
    <p className="admin-nav-caption">WORKSPACE</p>
    <nav aria-label="Admin navigation" className="admin-nav">
      {links.filter(l => !l.roles || (role && l.roles.includes(role))).map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}><Icon aria-hidden="true" />{label}</Link>;
      })}
    </nav>
    <div className="admin-sidebar-foot">
      <div className="admin-sidebar-note"><span>THE ART OF THE RIDE</span><p>Crafted with purpose.<br />Built to last.</p></div>
      <Link href="/" onClick={onNavigate}><ExitIcon aria-hidden="true" />Back to website</Link>
    </div>
  </>;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [syncError, setSyncError] = useState("");
  const status = useAdminStatus();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => { if (status.phase === "idle") loadAdmin(); }, [status.phase]);
  useEffect(() => { if (status.phase === "signed-out") router.replace(`/admin/login?next=${encodeURIComponent(path)}`); }, [status.phase, router, path]);
  useEffect(() => onSyncError(setSyncError), []);
  useEffect(() => { if (!syncError) return; const t = setTimeout(() => setSyncError(""), 6000); return () => clearTimeout(t); }, [syncError]);

  const user = status.user;
  const initials = user?.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "";

  return <div className="admin-app">
    <aside className="admin-sidebar"><SidebarContent role={user?.role} /></aside>
    <div className="admin-main">
      <header className="admin-topbar">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="admin-icon-button admin-menu-button" aria-label="Open admin menu"><HamburgerMenuIcon /></Dialog.Trigger>
          <Dialog.Portal><Dialog.Overlay className="admin-overlay" /><Dialog.Content className="admin-sidebar admin-sidebar-mobile">
            <Dialog.Title className="sr-only">Admin menu</Dialog.Title>
            <Dialog.Close className="admin-icon-button admin-sidebar-close" aria-label="Close admin menu"><Cross2Icon /></Dialog.Close>
            <SidebarContent role={user?.role} onNavigate={() => setOpen(false)} />
          </Dialog.Content></Dialog.Portal>
        </Dialog.Root>
        <div className="admin-topbar-location"><span>Workspace</span><span>/</span><strong>{links.find(link => link.href === path)?.label ?? "Admin"}</strong></div>
        <p className={`admin-save-state${status.saving ? " is-saving" : ""}`} aria-live="polite">{status.phase === "ready" ? (status.saving ? "Saving…" : "All changes saved") : ""}</p>
        {user && <DropdownMenu.Root>
          <DropdownMenu.Trigger className="admin-user"><span className="admin-avatar" aria-hidden="true">{initials}</span><span><strong>{user.name}</strong><small>{roleLabel[user.role]}</small></span></DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content className="admin-menu" align="end" sideOffset={8}>
            <DropdownMenu.Label className="admin-menu-label">{user.email}</DropdownMenu.Label>
            <DropdownMenu.Item className="admin-menu-item" onSelect={() => router.push("/admin/settings")}><GearIcon />Account & password</DropdownMenu.Item>
            <DropdownMenu.Separator className="admin-menu-sep" />
            <DropdownMenu.Item className="admin-menu-item" onSelect={async () => { await signOut(); }}><ExitIcon />Sign out</DropdownMenu.Item>
          </DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root>}
      </header>
      <main className="admin-content">
        {status.phase === "ready" ? children
          : status.phase === "error" ? <div className="admin-state-box" role="alert"><h2>Couldn’t load the admin</h2><p className="admin-muted">{status.error}</p><button type="button" className="admin-button is-primary" onClick={() => loadAdmin()}>Try again</button></div>
          : <div className="admin-state-box" role="status"><span className="admin-spinner" aria-hidden="true" /><p className="admin-muted">Loading…</p></div>}
      </main>
    </div>
    {syncError && <p role="alert" className="admin-toast is-visible is-error">{syncError}</p>}
  </div>;
}
