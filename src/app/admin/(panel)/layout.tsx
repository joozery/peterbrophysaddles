import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

// Signed-in admin area. Every API call is also checked on the server; the shell redirects to /admin/login when signed out.
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}><AdminShell>{children}</AdminShell></Suspense>;
}
