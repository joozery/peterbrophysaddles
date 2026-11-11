import { Suspense } from "react";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import type { ReactNode } from "react";

export function ShopShell({ title, children }: { title: string; children: ReactNode }) {
  return <><Suspense fallback={<div className="h-[77px] bg-ink" />}><SiteHeader /></Suspense><main className="section-shell py-10 sm:py-14"><p className="eyebrow">Peter Brophy Saddles</p><h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>{children}</main><SiteFooter /></>;
}
