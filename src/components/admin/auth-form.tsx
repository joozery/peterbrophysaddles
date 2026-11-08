"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, EyeOpenIcon, EyeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api, resetAdminSession } from "@/lib/admin-store";

/** Admin sign-in. Accounts are created by an owner in Admin users, or with `npm run admin:create` on the server. */
export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const next = params.get("next")?.startsWith("/admin") ? params.get("next")! : "/admin";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await api("/api/admin/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
      resetAdminSession();
      router.replace(next);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); setBusy(false); }
  }

  return <main className="admin-auth admin-auth-split">
    <section className="admin-auth-visual" aria-label="Peter Brophy Saddles workshop">
      <Image src="/images/admin/login-workshop-v1.webp" alt="Handcrafted leather saddle in a warmly lit saddlery workshop" fill sizes="(max-width: 760px) 100vw, 50vw" preload className="admin-auth-photo" />
      <div className="admin-auth-shade" />
      <Link href="/" className="admin-auth-brand"><Image src="/logo/logo-white.svg" alt="Peter Brophy Saddles" width={2067} height={761} unoptimized /></Link>
      <div className="admin-auth-story"><p className="admin-auth-kicker">THE ART OF THE RIDE</p><h2>Crafted with care.<br /><em>Managed with ease.</em></h2><p>A place for your collection, your customers,<br />and every conversation in between.</p><div className="admin-auth-story-rule" /><span>AUSTRALIAN CRAFTSMANSHIP · TIMELESS QUALITY</span></div>
    </section>
    <section className="admin-auth-panel" aria-labelledby="admin-signin-title">
      <header className="admin-auth-panel-top"><Link href="/"><ArrowLeftIcon aria-hidden="true" /> Back to website</Link><span>ADMIN WORKSPACE</span></header>
      <div className="admin-auth-card">
        <span className="admin-auth-lock"><LockClosedIcon aria-hidden="true" /></span>
        <p className="admin-auth-kicker">PETER BROPHY SADDLES</p>
        <h1 id="admin-signin-title">Welcome back.</h1>
        <p className="admin-auth-sub">Your workshop, all in one place.<br />Sign in to pick up where you left off.</p>
        <form onSubmit={submit} className="admin-form" aria-busy={busy}>
          <label className="admin-label" htmlFor="admin-email">Email address</label>
          <input id="admin-email" name="email" type="email" className="admin-input" placeholder="you@example.com" required autoComplete="email" autoCapitalize="none" spellCheck={false} disabled={busy} />
          <label className="admin-label" htmlFor="admin-password">Password</label>
          <div className="admin-auth-password"><input id="admin-password" name="password" type={showPassword ? "text" : "password"} className="admin-input" placeholder="Enter your password" required autoComplete="current-password" disabled={busy} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} disabled={busy}>{showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}</button></div>
          {error && <p role="alert" className="admin-form-error is-inline">{error}</p>}
          <button type="submit" className="admin-button is-primary is-block" disabled={busy}>{busy ? <><span className="admin-spinner" aria-hidden="true" /> Signing in…</> : <>Sign in to workspace <ArrowRightIcon aria-hidden="true" /></>}</button>
        </form>
        <div className="admin-auth-help"><strong>Need a hand signing in?</strong><p>Ask your account owner to reset your password.</p></div>
      </div>
      <footer className="admin-auth-panel-foot"><span>Peter Brophy Saddles</span><span><LockClosedIcon aria-hidden="true" /> Authorised access only</span></footer>
    </section>
  </main>;
}
