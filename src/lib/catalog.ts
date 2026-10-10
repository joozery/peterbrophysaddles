export type Product = { id: string; name: string; image: string; price: number; stock: number; custom?: boolean };
export const products: Product[] = [
  { id: "wade-saddles", name: "Wade Saddle", image: "wade", price: 320000, stock: 3 },
  { id: "campdraft-saddles", name: "Campdraft Saddle", image: "campdraft", price: 350000, stock: 2 },
  { id: "stock-saddles", name: "Stock Saddle", image: "stock", price: 280000, stock: 4 },
  { id: "reining-saddles", name: "Reining Saddle", image: "reining", price: 330000, stock: 2 },
  { id: "cutting-saddles", name: "Cutting Saddle", image: "cutting", price: 340000, stock: 1 },
  { id: "custom-western-saddles", name: "Custom Western Saddle", image: "western", price: 0, stock: 0, custom: true },
  { id: "old-timer-vaquero-saddles", name: "Old Timer / Vaquero Saddle", image: "vaquero", price: 380000, stock: 2 },
];
// Demonstration prices in AUD cents; replace with the real catalog before launch.
export const money = (cents: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(cents / 100);
