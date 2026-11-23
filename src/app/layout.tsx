import { Suspense } from "react";
import { RouteScroll } from "@/components/navigation/route-scroll";
import type { Metadata } from "next";
import "./globals.css";
import { getBrandName } from "@/lib/server/site-settings";
import { SITE_URL } from "@/lib/site-url";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { SiteMotion } from "@/components/motion/site-motion";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandName();
  const title = `${brand} | Custom Western Saddles & Saddle Trees, Australia`;
  const description = "Australian-made custom western saddles and precision saddle trees, handcrafted since 1991 near Brisbane. Wade, stock, campdraft and cowboy dressage saddles, bridles and leatherwork, built around you and your horse.";
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: brand,
    keywords: ["custom saddles Australia", "western saddles", "saddle trees", "stock saddle", "campdraft saddle", "wade saddle", "cowboy dressage saddle", "handmade saddles Brisbane", "bridles and leatherwork", brand],
    alternates: { canonical: "/" },
    openGraph: { type: "website", locale: "en_AU", url: "/", siteName: brand, title, description, images: [{ url: "/cover/hero.png", alt: `${brand} custom saddle` }] },
    twitter: { card: "summary_large_image", title, description, images: ["/cover/hero.png"] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col" style={{ position: "relative" }}>{children}<Suspense fallback={null}><SiteJsonLd /></Suspense><Suspense fallback={null}><RouteScroll /></Suspense><SiteMotion /></body>
    </html>
  );
}
