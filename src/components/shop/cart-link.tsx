"use client";
import Link from "next/link";
import { BackpackIcon } from "@radix-ui/react-icons";
import { useCommerce } from "@/lib/demo-commerce";
export function CartLink() {
  const { cart } = useCommerce();
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  return <Link href="/cart" className="cart-nav" aria-label={`Shopping cart, ${count} items`}><BackpackIcon width={20} height={20} aria-hidden="true" /><span className="cart-count">{count}</span></Link>;
}
