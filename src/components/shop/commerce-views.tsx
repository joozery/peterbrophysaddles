"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { products, money } from "@/lib/catalog";
import { useCommerce, setQuantity, updateStock, placeDemoOrder } from "@/lib/demo-commerce";

function EmptyCart() { return <div className="shop-empty"><h2 className="text-3xl">Your cart is empty</h2><p className="body-copy my-5">Explore our saddles and find your next ride.</p><Link href="/shop" className="button-link button-gold">Browse products</Link></div>; }
export function CartView() {
  const state = useCommerce();
  const [message, setMessage] = useState("");
  if (!state.ready) return <p role="status">Loading cart…</p>;
  if (!state.cart.length) return <EmptyCart />;
  const total = state.cart.reduce((sum, line) => sum + (products.find(p => p.id === line.id)?.price || 0) * line.quantity, 0);
  const invalid = state.cart.some(line => line.quantity > state.stock[line.id]);
  function change(id: string, quantity: number) { try { setQuantity(id, quantity); setMessage(""); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save cart."); } }
  return <div className="grid gap-8 lg:grid-cols-[1fr_320px]"><div>{state.cart.map(line => {
    const p = products.find(product => product.id === line.id)!;
    return <article key={line.id} className="cart-row"><Image src={`/images/saddles/${p.image}-v2.png`} alt={p.name} width={80} height={110} className="object-cover" /><div className="flex-1"><Link href={`/products/${p.id}`} className="font-serif text-xl">{p.name}</Link><p className="mt-2 text-sm">{money(p.price)} each</p><p className="mt-2 text-xs text-stone-500">{state.stock[p.id]} in demo stock</p>{line.quantity > state.stock[p.id] && <p className="mt-2 text-sm text-red-700">Stock changed. Reduce quantity or remove this item.</p>}</div><div className="grid gap-3"><label className="form-label">Quantity<input aria-label={`Quantity for ${p.name}`} type="number" min={1} max={Math.max(1, state.stock[p.id])} value={line.quantity} onChange={e => change(line.id, Number(e.target.value))} className="form-input w-20" /></label><button className="flex items-center gap-1 text-xs text-stone-600" onClick={() => change(line.id, 0)} aria-label={`Remove ${p.name}`}><TrashIcon /> Remove</button><strong className="text-sm">{money(p.price * line.quantity)}</strong></div></article>;
  })}<p role="status" className="mt-4 text-sm text-red-700">{message}</p><Link href="/shop" className="text-link mt-5">Continue shopping</Link></div><aside className="shop-summary"><h2 className="text-2xl">Order summary</h2><div className="summary-line"><span>Subtotal</span><span>{money(total)}</span></div><div className="summary-line"><span>Demo delivery</span><span>Free</span></div><div className="summary-line font-semibold"><span>Total (AUD)</span><span>{money(total)}</span></div>{invalid ? <p className="text-sm text-red-700">Resolve the stock changes before checkout.</p> : <Link href="/checkout" className="button-link button-gold mt-5 w-full justify-center">Checkout</Link>}<p className="mt-4 text-xs leading-5 text-stone-500">Sample prices. No real payment is collected.</p></aside></div>;
}
export function CheckoutView() {
  const state = useCommerce();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  if (!state.ready) return <p>Loading checkout…</p>;
  if (!state.cart.length) return <EmptyCart />;
  const total = state.cart.reduce((sum, line) => sum + products.find(p => p.id === line.id)!.price * line.quantity, 0);
  return <div className="grid gap-8 lg:grid-cols-[1fr_320px]"><form className="shop-summary grid gap-5" onSubmit={e => {
    e.preventDefault(); if (busy) return; setBusy(true);
    try { const id = placeDemoOrder(); router.push(`/orders/${id}`); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save order."); setBusy(false); }
  }}><h2 className="text-2xl">Delivery details</h2><p className="text-xs text-stone-500">Use example details for this demo. Delivery details are not stored or sent.</p><label className="form-label">Full name<input name="name" required autoComplete="name" className="form-input" /></label><label className="form-label">Email<input name="email" required type="email" autoComplete="email" className="form-input" /></label><label className="form-label">Street address<input name="street" required autoComplete="street-address" className="form-input" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="form-label">City<input required autoComplete="address-level2" className="form-input" /></label><label className="form-label">Postcode<input required autoComplete="postal-code" className="form-input" /></label></div><label className="form-label">Country<input required autoComplete="country-name" defaultValue="Australia" className="form-input" /></label><fieldset className="border border-stone-300 p-4"><legend className="px-2 text-sm">Payment</legend><label className="flex gap-3 text-sm"><input type="radio" name="payment" defaultChecked /> Demo payment — no charge</label><p className="mt-3 text-xs text-stone-500">A real payment provider has not been connected.</p></fieldset><p role="alert" className="text-sm text-red-700">{message}</p><button disabled={busy} className="button-link button-gold justify-center">{busy ? "Creating demo order…" : "Place demo order"}</button><Link href="/cart" className="text-link">Back to cart</Link></form><aside className="shop-summary"><h2 className="text-2xl">Your order</h2>{state.cart.map(line => <div key={line.id} className="summary-line"><span>{products.find(p => p.id === line.id)!.name} × {line.quantity}</span><span>{money(products.find(p => p.id === line.id)!.price * line.quantity)}</span></div>)}<div className="summary-line font-semibold"><span>Total (AUD)</span><span>{money(total)}</span></div><p className="mt-4 text-xs text-stone-500">Demo delivery is free. Stock is checked again when placing the order.</p></aside></div>;
}
export function InventoryView() {
  const state = useCommerce();
  const [message, setMessage] = useState("");
  if (!state.ready) return <p>Loading demo inventory…</p>;
  return <><p className="body-copy mb-6">Demo inventory editor. Changes affect this browser only. Owner sign-in and shared inventory are not connected yet.</p><div className="grid gap-4">{products.filter(p => !p.custom).map(p => <form key={p.id} className="inventory-row" onSubmit={e => { e.preventDefault(); const value = Number(new FormData(e.currentTarget).get("stock")); try { updateStock(p.id, value); setMessage(`${p.name} stock saved.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save inventory."); } }}><Image src={`/images/saddles/${p.image}-v2.png`} alt={p.name} width={50} height={65} /><div className="flex-1"><h3 className="font-serif text-xl">{p.name}</h3><p className="mt-1 text-xs text-stone-500">Current demo stock: {state.stock[p.id]}</p></div><label className="form-label">Stock<input key={state.stock[p.id]} name="stock" aria-label={`Stock for ${p.name}`} type="number" required min={0} max={9999} step={1} defaultValue={state.stock[p.id]} className="form-input w-24" /></label><button className="button-link button-gold self-end">Save</button></form>)}</div><p role="status" className="my-5 text-sm">{message}</p><h2 className="mt-10 text-2xl">Demo orders</h2>{state.orders.length ? state.orders.slice().reverse().map(o => <Link key={o.id} href={`/orders/${o.id}`} className="summary-line"><span>{o.id.slice(0, 18)}…</span><span>{money(o.total)}</span></Link>) : <p className="body-copy mt-4">No demo orders yet.</p>}</>;
}
export function OrderView({ id }: { id: string }) {
  const state = useCommerce();
  if (!state.ready) return <p>Loading order…</p>;
  const order = state.orders.find(o => o.id === id);
  if (!order) return <div className="shop-empty"><h2 className="text-2xl">Order not found</h2><p className="body-copy my-5">Demo orders are available only in the browser where they were created.</p><Link href="/shop" className="button-link button-gold">Back to shop</Link></div>;
  return <div className="shop-summary max-w-2xl"><CheckCircledIcon width={36} height={36} className="text-gold" /><h2 className="mt-5 text-3xl">Demo order created</h2><p className="mt-3 break-all text-xs text-stone-500">{order.id}</p><p className="body-copy my-5">Demo stock has been reduced and your cart cleared. No payment was taken and nothing will be shipped.</p>{order.items.map(item => <div key={item.id} className="summary-line"><span>{item.name} × {item.quantity}</span><span>{money(item.price * item.quantity)}</span></div>)}<div className="summary-line font-semibold"><span>Total</span><span>{money(order.total)}</span></div><Link href="/shop" className="button-link button-gold mt-6">Continue shopping</Link></div>;
}
