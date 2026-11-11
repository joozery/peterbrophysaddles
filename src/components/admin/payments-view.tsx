"use client";

import { useEffect, useState } from "react";
import { CheckCircledIcon, CopyIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { api, updateAdmin, useAdmin, useAdminStatus } from "@/lib/admin-store";
import { Badge, Card, Field, PageHeader, useToast } from "./admin-ui";

type Payments = { mode: "test" | "live" | null; secretKey: string; webhookSecret: string; hasSecretKey: boolean; hasWebhookSecret: boolean; updatedAt: string; updatedBy: string };
type TestResult = { ok: boolean; mode: string; accountId: string; name: string; chargesEnabled: boolean | null; currency: string; country: string };

const WEBHOOK_EVENTS = ["checkout.session.completed", "checkout.session.async_payment_succeeded"];

/** Bank account shown in payment emails (saved in Settings, visible to staff). */
function BankDetailsCard() {
  const { settings } = useAdmin();
  const [draft, setDraft] = useState<string | null>(null);
  const { toast, run } = useToast();
  const value = draft ?? settings.bankDetails;
  return <Card title="Direct bank transfer">
    <div className="admin-form">
      <Field label="Bank details for customers" hint="Added to payment emails so customers can choose card (Stripe) or bank transfer.">
        <textarea className="admin-input" rows={4} placeholder={"Account name: Peter Brophy Saddles\nBSB: 000-000\nAccount: 00000000\nReference: your invoice number"} value={value} onChange={e => setDraft(e.target.value)} />
      </Field>
      <div className="admin-actions-row"><button type="button" className="admin-button is-primary" disabled={draft === null} onClick={() => run(() => { updateAdmin(s => ({ ...s, settings: { ...s.settings, bankDetails: value.trim() } })); setDraft(null); }, "Bank details saved.")}>Save bank details</button></div>
    </div>
    {toast}
  </Card>;
}

export function PaymentsView() {
  const { user } = useAdminStatus();
  const isOwner = user?.role === "owner";
  const [p, setP] = useState<Payments | null>(null);
  const [loadError, setLoadError] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState<TestResult | { ok: false; error: string } | null>(null);
  const { toast, notify } = useToast();

  useEffect(() => {
    if (!isOwner) return;
    api<{ payments: Payments }>("/api/admin/payments").then(d => setP(d.payments)).catch(err => setLoadError(err instanceof Error ? err.message : "Could not load payment settings."));
  }, [isOwner]);

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const webhookUrl = `${origin}/api/stripe/webhook`;
  const isLocal = /localhost|127\.0\.0\.1/.test(origin);

  async function save(patch: Record<string, unknown>, done: string) {
    setBusy(true);
    try {
      const d = await api<{ payments: Payments }>("/api/admin/payments", { method: "POST", body: JSON.stringify(patch) });
      setP(d.payments); setSecretKey(""); setWebhookSecret(""); setTest(null); notify(done);
    } catch (err) { notify(err instanceof Error ? err.message : "Could not save."); }
    finally { setBusy(false); }
  }

  async function runTest() {
    setBusy(true); setTest(null);
    try { setTest(await api<TestResult>("/api/admin/payments/test", { method: "POST" })); }
    catch (err) { setTest({ ok: false, error: err instanceof Error ? err.message : "Connection failed." }); }
    finally { setBusy(false); }
  }

  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => notify("Copied."), () => notify("Copy failed — select the text and copy it manually."));

  const header = <PageHeader eyebrow="Account" title="Payments" description="Connect Stripe to send customers a payment link for each invoice (card, Apple Pay, Google Pay). Card details are handled entirely by Stripe — they never touch this website."
    actions={<a className="admin-button" href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer"><ExternalLinkIcon aria-hidden="true" />Stripe dashboard</a>} />;

  if (!isOwner) return <>{header}<p className="admin-notice">Only owners can view or change payment settings.</p></>;
  if (loadError) return <>{header}<p className="admin-notice">{loadError}</p></>;
  if (!p) return <>{header}<p role="status" className="admin-muted">Loading payment settings…</p></>;

  const live = p.mode === "live";
  return <>
    {header}
    <div className="admin-grid-2 is-even">
      <div className="admin-stack">
        <Card title="Status">
          <p className="admin-muted" style={{ marginTop: 0 }}>{p.hasSecretKey
            ? <>Stripe connected <Badge tone={live ? "paid" : "pending"}>{live ? "Live — real payments" : "Test mode"}</Badge></>
            : <Badge tone="unpaid">Not connected</Badge>}</p>
          <p className="admin-hint">Customers pay through a <strong>Stripe Payment Link</strong> that you create per invoice in <strong>Orders → open an order → Payment</strong>, and send by email. There is no online checkout on the website. Direct bank transfer still works as before.</p>
          {p.hasSecretKey && !live && <p className="admin-hint">Test mode: pay a link with card <strong>4242 4242 4242 4242</strong>, any future date and any CVC. No real money moves.</p>}
          {p.hasSecretKey && !p.hasWebhookSecret && <p className="admin-hint is-warn">No webhook yet: orders won’t switch to Paid by themselves. Use <strong>Check payment</strong> on the order, or add the webhook (step 2).</p>}
          {p.updatedAt && <p className="admin-hint">Last changed {new Date(p.updatedAt).toLocaleString("en-AU")} by {p.updatedBy}.</p>}
        </Card>

        <BankDetailsCard />

        <Card title="1 · API secret key">
          <form className="admin-form" onSubmit={e => { e.preventDefault(); if (secretKey.trim()) save({ secretKey }, "Secret key saved."); }}>
            {p.hasSecretKey && <p className="admin-hint">Saved key: <code>{p.secretKey}</code> ({p.mode === "live" ? "live" : "test"})</p>}
            <Field label={p.hasSecretKey ? "Replace secret key" : "Secret key"} hint="Stripe → Developers → API keys → Secret key. Starts with sk_test_ (testing) or sk_live_ (real payments). It is stored on the server and never shown again in full.">
              <input className="admin-input" type="password" autoComplete="off" spellCheck={false} placeholder="sk_test_…" value={secretKey} onChange={e => setSecretKey(e.target.value)} />
            </Field>
            <div className="admin-actions-row">
              <button type="submit" className="admin-button is-primary" disabled={busy || !secretKey.trim()}>Save key</button>
              <button type="button" className="admin-button" disabled={busy || !p.hasSecretKey} onClick={runTest}>Test connection</button>
            </div>
            {test && (test.ok
              ? <p role="status" className="admin-hint is-good"><CheckCircledIcon aria-hidden="true" /> Connected to <strong>{(test as TestResult).name}</strong> ({(test as TestResult).accountId}, {(test as TestResult).mode} mode{(test as TestResult).country ? `, ${(test as TestResult).country}` : ""}).{(test as TestResult).chargesEnabled === false && " Stripe hasn’t enabled charges on this account yet — finish your account setup in Stripe."}</p>
              : <p role="alert" className="admin-form-error is-inline">{(test as { error: string }).error}</p>)}
          </form>
        </Card>
      </div>

      <div className="admin-stack">
        <Card title="2 · Webhook (marks orders as paid)">
          <div className="admin-form">
            <ol className="admin-steps" style={{ paddingLeft: 18, display: "grid", gap: 6, fontSize: 13 }}>
              <li>In Stripe go to <strong>Developers → Webhooks → Add endpoint</strong>.</li>
              <li>Endpoint URL:
                <div className="admin-actions-row" style={{ marginTop: 6 }}><code style={{ wordBreak: "break-all" }}>{webhookUrl}</code><button type="button" className="admin-icon-button" aria-label="Copy webhook URL" onClick={() => copy(webhookUrl)}><CopyIcon /></button></div>
              </li>
              <li>Select events: {WEBHOOK_EVENTS.map((e, i) => <span key={e}><code>{e}</code>{i < WEBHOOK_EVENTS.length - 1 ? ", " : ""}</span>)}</li>
              <li>Copy the <strong>Signing secret</strong> (whsec_…) and paste it below.</li>
            </ol>
            {isLocal && <p className="admin-hint is-warn">You’re on localhost, which Stripe can’t reach. Set the webhook up on the live website address, or use the Stripe CLI: <code>stripe listen --forward-to localhost:3000/api/stripe/webhook</code></p>}
          </div>
          <form className="admin-form admin-mt" onSubmit={e => { e.preventDefault(); if (webhookSecret.trim()) save({ webhookSecret }, "Webhook secret saved."); }}>
            {p.hasWebhookSecret && <p className="admin-hint">Saved: <code>{p.webhookSecret}</code></p>}
            <Field label={p.hasWebhookSecret ? "Replace signing secret" : "Signing secret"}>
              <input className="admin-input" type="password" autoComplete="off" spellCheck={false} placeholder="whsec_…" value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} />
            </Field>
            <div className="admin-actions-row"><button type="submit" className="admin-button is-primary" disabled={busy || !webhookSecret.trim()}>Save signing secret</button></div>
          </form>
        </Card>

        <Card title="How it works">
          <ol style={{ paddingLeft: 18, display: "grid", gap: 6, fontSize: 13, listStyle: "decimal" }}>
            <li>Customer confirms the quotation.</li>
            <li>In <strong>Orders</strong>, open (or create) the order and press <strong>Create payment link</strong> — full amount or a deposit.</li>
            <li>Press <strong>Email customer</strong>: your email app opens with the link and your bank details filled in.</li>
            <li>The customer pays by card on Stripe, or by bank transfer.</li>
            <li>Stripe payments mark the order <em>Paid</em> automatically (via the webhook, or the <strong>Check payment</strong> button). For bank transfers, tick <em>Payment received</em> yourself.</li>
          </ol>
          <p className="admin-hint">Each link can be paid once only. Refunds are made in the Stripe dashboard.</p>
          {p.hasSecretKey && <div className="admin-actions-row admin-mt"><button type="button" className="admin-button is-danger" disabled={busy} onClick={() => save({ clear: true }, "Stripe disconnected. Existing links stop being checked.")}>Disconnect Stripe</button></div>}
        </Card>
      </div>
    </div>
    {toast}
  </>;
}
