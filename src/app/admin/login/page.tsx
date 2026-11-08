import { Suspense } from "react";
import { AuthForm } from "@/components/admin/auth-form";
// Client-rendered sign-in form (reads ?next=) — opt out of instant-navigation validation.
export const instant = false;
export const metadata = { title: "Sign in" };
export default function Page() { return <Suspense fallback={null}><AuthForm /></Suspense>; }
