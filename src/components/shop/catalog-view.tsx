"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import "./shop-catalog.css";
import { products, money, type Product } from "@/lib/catalog";

export function PurchasePanel({ product }: { product: Product }) {
  return <div className="grid gap-4">{product.custom ? <p className="body-copy">Made to order. Fit, materials and pricing are agreed individually.</p> : <p className="text-xl">{money(product.price)} <small className="text-xs text-stone-500">sample price</small></p>}<Link href={`/contact?product=${encodeURIComponent(product.id)}`} className="button-link button-gold justify-center">Enquire Now</Link></div>;
}
export function CatalogView() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const visible = products.filter(product => filter === "all" || (filter === "custom" ? product.custom : !product.custom));
  if (sort === "price-low") visible.sort((a, b) => (a.custom ? Infinity : a.price) - (b.custom ? Infinity : b.price));
  if (sort === "price-high") visible.sort((a, b) => (b.custom ? -1 : b.price) - (a.custom ? -1 : a.price));

  return <div className="shop-catalog section-shell">
    <nav className="shop-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">Shop</span></nav>
    <header className="shop-intro"><div><p className="eyebrow">The Peter Brophy collection</p><h1>Crafted for your ride.</h1></div><p>Traditional craftsmanship, thoughtful details and a saddle for every discipline. Find your next riding companion.</p></header>
    <p className="shop-demo-note">Every saddle is confirmed with you first — enquire and we’ll prepare a quotation.</p>
    <div className="shop-toolbar"><div className="shop-filters" role="group" aria-label="Filter saddles">{[["all", "All saddles"], ["ready", "Standard saddles"], ["custom", "Made to order"]].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><div className="shop-sort"><span>{visible.length} saddles</span><label><span className="sr-only">Sort saddles</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div></div>
    <div className="shop-grid shop-catalog-grid">{visible.map(product => {
      return <article key={product.id} className="shop-product-card"><Link href={`/products/${product.id}`} className="shop-product-photo"><Image src={`/images/saddles/${product.image}-v2.png`} alt={product.name} fill sizes="(max-width: 540px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" /><span className="shop-product-badge">{product.custom ? "Made to order" : "Handcrafted"}</span><span className="shop-photo-link" aria-hidden="true"><ChevronRightIcon /></span></Link><div className="shop-product-info"><p className="shop-product-category">{product.custom ? "Custom collection" : "Saddle collection"}</p><h2><Link href={`/products/${product.id}`}>{product.name}</Link></h2><div className="shop-product-price">{product.custom ? <span>Individually quoted</span> : <><span>{money(product.price)}</span><small>Sample price</small></>}</div><p className="shop-product-stock">{product.custom ? "Built around you and your horse" : "Enquire for availability"}</p><Link href={`/contact?product=${encodeURIComponent(product.id)}`} className="shop-card-action" aria-label={`Enquire about ${product.name}`}>Enquire Now <ChevronRightIcon aria-hidden="true" /></Link></div></article>;
    })}</div>
    <aside className="shop-guidance"><div><p className="eyebrow">Finding your fit</p><h2>Not sure which saddle is right?</h2><p>Tell us about your horse and your riding. We’ll help you explore the options.</p></div><Link href="/contact">Start a conversation <ChevronRightIcon aria-hidden="true" /></Link></aside>
  </div>;
}
