"use client";

import { useSyncExternalStore } from "react";
import { products } from "./catalog";
export type CartLine = { id: string; quantity: number };
export type Order = { id: string; date: string; items: { id: string; name: string; price: number; quantity: number }[]; total: number };
type State = { ready: boolean; stock: Record<string, number>; cart: CartLine[]; orders: Order[] };
const key = "peter-brophy-demo-shop-v1";
const initial: State = { ready: false, stock: Object.fromEntries(products.map(p => [p.id, p.stock])), cart: [], orders: [] };
let snapshot = initial;
const listeners = new Set<() => void>();
function read(): State {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "null");
    if (!data) return { ...initial, ready: true };
    const stock = { ...initial.stock };
    products.forEach(p => { const value = data.stock?.[p.id]; if (Number.isSafeInteger(value) && value >= 0 && value <= 9999) stock[p.id] = value; });
    const cart: CartLine[] = Array.isArray(data.cart) ? data.cart.filter((line: CartLine) => products.some(p => p.id === line.id && !p.custom) && Number.isSafeInteger(line.quantity) && line.quantity > 0 && line.quantity <= 9999) : [];
    const orders: Order[] = Array.isArray(data.orders) ? data.orders.filter((o: Order) => typeof o.id === "string" && Array.isArray(o.items) && Number.isFinite(o.total)) : [];
    return { ready: true, stock, cart, orders };
  } catch { return { ...initial, ready: true }; }
}
function emit() { listeners.forEach(listener => listener()); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = () => { snapshot = read(); emit(); };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
function getSnapshot() { if (!snapshot.ready) snapshot = read(); return snapshot; }
export function useCommerce() { return useSyncExternalStore(subscribe, getSnapshot, () => initial); }
function write(next: State) {
  // Save before changing memory so a storage failure never reports success.
  localStorage.setItem(key, JSON.stringify(next)); snapshot = next; emit();
}
export function setQuantity(id: string, quantity: number) {
  const state = read();
  const product = products.find(p => p.id === id && !p.custom);
  if (!product || !Number.isSafeInteger(quantity) || quantity < 0) throw new Error("Invalid quantity.");
  if (quantity > state.stock[id]) throw new Error("Not enough stock. Please reduce the quantity.");
  const cart = state.cart.filter(line => line.id !== id);
  if (quantity) cart.push({ id, quantity });
  write({ ...state, cart });
}
export function addToCart(id: string, quantity: number) {
  const current = read().cart.find(line => line.id === id)?.quantity || 0;
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error("Choose a valid quantity.");
  setQuantity(id, current + quantity);
}
export function updateStock(id: string, quantity: number) {
  if (!products.some(p => p.id === id && !p.custom) || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 9999) throw new Error("Stock must be a whole number between 0 and 9999.");
  const state = read(); write({ ...state, stock: { ...state.stock, [id]: quantity } });
}
export function placeDemoOrder(): string {
  const state = read();
  if (!state.cart.length) throw new Error("Your cart is empty.");
  const stock = { ...state.stock };
  const items = state.cart.map(line => {
    const p = products.find(product => product.id === line.id && !product.custom);
    if (!p || line.quantity > stock[line.id]) throw new Error("Stock changed. Return to your cart and reduce the quantity.");
    stock[line.id] -= line.quantity;
    return { id: p.id, name: p.name, price: p.price, quantity: line.quantity };
  });
  const id = `DEMO-${crypto.randomUUID()}`;
  const order: Order = { id, date: new Date().toISOString(), items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) };
  write({ ...state, stock, cart: [], orders: [...state.orders, order] });
  return id;
}
