import type { Metadata } from "next";
import "@/components/admin/admin.css";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin | Peter Brophy Saddles" }, robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
