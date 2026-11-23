import { JsonLd } from "./json-ld";
import { getSiteSettings } from "@/lib/server/site-settings";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";

/** Organization + WebSite structured data, so search and answer engines know who the business is. */
export async function SiteJsonLd() {
  const { brand, social } = await getSiteSettings();
  const org = {
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: brand,
    url: SITE_URL,
    logo: absoluteUrl("/logo/favicon-pb.png"),
    image: absoluteUrl("/cover/hero.png"),
    description: "Australian saddle maker established in 1991 near Brisbane. Custom handmade western saddles, stock, campdraft, wade and cowboy dressage saddles, and precision saddle trees for saddlers across Australia and beyond.",
    foundingDate: "1991",
    founder: { "@type": "Person", name: "Peter Brophy" },
    areaServed: { "@type": "Country", name: "Australia" },
    address: { "@type": "PostalAddress", addressRegion: "QLD", addressCountry: "AU" },
    knowsAbout: ["Custom saddles", "Saddle trees", "Western saddles", "Stock saddles", "Campdraft saddles", "Saddle fitting", "Bridles and leatherwork"],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Custom saddles" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Saddle trees" } },
    ],
    ...(social.length ? { sameAs: social.map(s => s.url) } : {}),
  };
  const site = { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: brand, inLanguage: "en-AU", publisher: { "@id": `${SITE_URL}/#organization` } };
  return <JsonLd data={{ "@context": "https://schema.org", "@graph": [org, site] }} />;
}
