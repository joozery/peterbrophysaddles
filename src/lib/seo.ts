import { type Product, categoryOf, productPhotos } from "@/lib/catalog";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";

/** Product + breadcrumb structured data. Items priced by quotation (price 0) carry no price, so nothing misleading is published. */
export function productJsonLd(product: Product, brand: string) {
  const url = `${SITE_URL}/saddle-range/${product.id}`;
  const isTree = categoryOf(product) === "saddle-trees";
  const photos = productPhotos(product).map(absoluteUrl);
  const description = product.description || `${product.name} from ${brand}. Fit, details and price are confirmed in a quotation before you order.`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        description,
        url,
        category: isTree ? "Saddle trees" : "Saddles",
        brand: { "@type": "Brand", name: brand },
        manufacturer: { "@id": `${SITE_URL}/#organization` },
        ...(photos.length ? { image: photos } : {}),
        ...(product.specs?.length ? { additionalProperty: product.specs.map(s => ({ "@type": "PropertyValue", name: s.label, value: s.value })) } : {}),
        ...(product.price > 0 ? { offers: { "@type": "Offer", url, priceCurrency: "AUD", price: (product.price / 100).toFixed(2), availability: product.stock > 0 || product.custom ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", seller: { "@id": `${SITE_URL}/#organization` } } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: isTree ? "Saddle Trees" : "Saddle Range", item: `${SITE_URL}/${isTree ? "saddle-trees" : "saddle-range"}` },
          { "@type": "ListItem", position: 3, name: product.name, item: url },
        ],
      },
    ],
  };
}
