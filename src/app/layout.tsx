import { Suspense } from "react";
import { RouteScroll } from "@/components/navigation/route-scroll";
import type { Metadata } from "next";
import "./globals.css";
import { SiteMotion } from "@/components/motion/site-motion";

export const metadata: Metadata = {
  title: "Peter Brophy Saddles",
  description: "Australian-made custom saddles and premium leatherwork. Traditional craftsmanship, modern performance — built around you and your horse.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col" style={{ position: "relative" }}>{children}<Suspense fallback={null}><RouteScroll /></Suspense><SiteMotion /></body>
    </html>
  );
}
