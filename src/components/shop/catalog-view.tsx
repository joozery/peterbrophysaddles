"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRightIcon, PlusIcon, CheckIcon, BackpackIcon } from "@radix-ui/react-icons";
import "./shop-catalog.css";
import { products, money, type Product } from "@/lib/catalog";
import { addToCart, useCommerce } from "@/lib/demo-commerce";

export function PurchasePanel({ product }: { product: Product }) {
  const state = useCommerce();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const available = state.stock[product.id] - (state.cart.find(line => line.id === product.id)?.quantity || 0);
  if (product.custom) return <div className="grid gap-4"><p className="body-copy">Made to order. Fit, materials and pricing are agreed individually.</p><Link href="/contact" className="button-link button-gold justify-center">Request a quote</Link></div>;
  return <div className="grid gap-4"><p className="text-xl">{money(product.price)} <small className="text-xs text-stone-500">sample price</small></p><p className="text-sm text-stone-600">{state.ready ? available > 0 ? `${available} available to add` : "Out of stock / all available units in your cart" : "Loading availability…"}</p><div className="flex flex-wrap gap-3"><label className="form-label">Quantity<input aria-label={`Quantity for ${product.name}`} type="number" min={1} max={Math.max(1, available)} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="form-input w-20" /></label><button disabled={!state.ready || available < 1} className="button-link button-gold self-end" onClick={() => { try { addToCart(product.id, quantity); setMessage("Added to your cart."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save the cart."); } }}>Add to cart</button></div><p role="status" className="text-sm text-stone-600">{message}</p></div>;
}
export function CatalogView() {
  const state = useCommerce();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState("");
  const visible = products.filter(product => filter === "all" || (filter === "custom" ? product.custom : !product.custom));
  if (sort === "price-low") visible.sort((a, b) => (a.custom ? Infinity : a.price) - (b.custom ? Infinity : b.price));
  if (sort === "price-high") visible.sort((a, b) => (b.custom ? -1 : b.price) - (a.custom ? -1 : a.price));

  return <div className="shop-catalog section-shell">
    <nav className="shop-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRightIcon aria-hidden="true" /><span aria-current="page">Shop</span></nav>
    <header className="shop-intro"><div><p className="eyebrow">The Peter Brophy collection</p><h1>Crafted for your ride.</h1></div><p>Traditional craftsmanship, thoughtful details and a saddle for every discipline. Find your next riding companion.</p></header>
    <p className="shop-demo-note">Demo collection · Sample prices in AUD · Stock and cart are saved in this browser. No real payments or orders.</p>
    <div className="shop-toolbar"><div className="shop-filters" role="group" aria-label="Filter saddles">{[["all", "All saddles"], ["ready", "Standard saddles"], ["custom", "Made to order"]].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><div className="shop-sort"><span>{visible.length} saddles</span><label><span className="sr-only">Sort saddles</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div></div>
    <p className="shop-catalog-status" role="status">{message}</p>
    <div className="shop-grid shop-catalog-grid">{visible.map(product => {
      const available = state.stock[product.id] - (state.cart.find(line => line.id === product.id)?.quantity || 0);
      return <article key={product.id} className="shop-product-card"><Link href={`/products/${product.id}`} className="shop-product-photo"><Image src={`/images/saddles/${product.image}-v2.png`} alt={product.name} fill sizes="(max-width: 540px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" /><span className="shop-product-badge">{product.custom ? "Made to order" : "Handcrafted"}</span><span className="shop-photo-link" aria-hidden="true"><ChevronRightIcon /></span></Link><div className="shop-product-info"><p className="shop-product-category">{product.custom ? "Custom collection" : "Saddle collection"}</p><h2><Link href={`/products/${product.id}`}>{product.name}</Link></h2><div className="shop-product-price">{product.custom ? <span>Individually quoted</span> : <><span>{money(product.price)}</span><small>Sample price</small></>}</div><p className="shop-product-stock">{product.custom ? "Built around you and your horse" : !state.ready ? "Checking availability…" : available > 0 ? `${available} available to add` : "No remaining stock to add"}</p>{product.custom ? <Link href="/contact" className="shop-card-action">Discuss your saddle <ChevronRightIcon aria-hidden="true" /></Link> : <button className="shop-card-action" disabled={!state.ready || available < 1} aria-label={`Add ${product.name} to cart`} onClick={() => { try { addToCart(product.id, 1); setAdded(product.id); setMessage(`${product.name} added to your cart.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not add to cart."); } }}>{added === product.id ? "Add another" : "Add to cart"}{added === product.id ? <CheckIcon aria-hidden="true" /> : <PlusIcon aria-hidden="true" />}</button>}</div></article>;
    })}</div>
    <aside className="shop-guidance"><div><p className="eyebrow">Finding your fit</p><h2>Not sure which saddle is right?</h2><p>Tell us about your horse and your riding. We’ll help you explore the options.</p></div><Link href="/contact">Start a conversation <ChevronRightIcon aria-hidden="true" /></Link><Link href="/cart" className="shop-cart-link"><BackpackIcon aria-hidden="true" /> View your cart</Link></aside>
  </div>;
}
