import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import "./privacy.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Peter Brophy Saddles",
  description: "How Peter Brophy Saddles collects, uses and protects your personal information.",
};

// ── Owner: fill these in before launch ─────────────────────────────────────────
// Leave PRIVACY_EMAIL empty to point people to the Contact page instead.
const PRIVACY_EMAIL = "";
const LAST_UPDATED = "8 November 2026";
// ───────────────────────────────────────────────────────────────────────────────

const sections = [
  ["who-we-are", "Who we are"],
  ["what-we-collect", "Information we collect"],
  ["how-we-use", "How we use it"],
  ["cookies", "Cookies & browser storage"],
  ["sharing", "Who we share it with"],
  ["overseas", "Storage & overseas providers"],
  ["security", "Keeping it secure"],
  ["retention", "How long we keep it"],
  ["your-rights", "Access, correction & deletion"],
  ["complaints", "Questions & complaints"],
  ["changes", "Changes to this policy"],
] as const;

function ContactLine() {
  return PRIVACY_EMAIL
    ? <>email us at <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> or use our <Link href="/contact">contact page</Link></>
    : <>get in touch through our <Link href="/contact">contact page</Link></>;
}

export default function PrivacyPage() {
  return <>
    <Suspense fallback={<div className="h-[77px] bg-ink" />}><SiteHeader /></Suspense>
    <main className="privacy">
      <header className="privacy-hero"><div className="section-shell">
        <p className="eyebrow">Peter Brophy Saddles</p>
        <h1>Privacy Policy</h1>
        <p className="privacy-lede">We respect your privacy. This policy explains what personal information we collect when you visit our website or talk to us about a saddle, why we collect it, and how you can access or correct it.</p>
        <p className="privacy-updated">Last updated {LAST_UPDATED}</p>
      </div></header>

      <div className="section-shell privacy-layout">
        <nav className="privacy-toc" aria-label="On this page">
          <p>On this page</p>
          <ol>{sections.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol>
        </nav>

        <article className="privacy-body">
          <section id="who-we-are">
            <h2>Who we are</h2>
            <p>Peter Brophy Saddles (“we”, “us”, “our”) is an Australian maker of custom saddles and leatherwork. We handle personal information in line with the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles.</p>
          </section>

          <section id="what-we-collect">
            <h2>Information we collect</h2>
            <p>We only collect information we need to help you, and we collect it directly from you wherever possible.</p>
            <ul>
              <li><strong>Enquiries.</strong> When you contact us through the website, by email, phone or in person, we may collect your name, email address, phone number, riding discipline, details about your horse (such as size and wither shape) and anything you tell us in your message.</li>
              <li><strong>Orders and custom work.</strong> If you order a saddle or leatherwork, we may also collect your delivery address, measurements and preferences for your build, and records of what you ordered and paid.</li>
              <li><strong>Payments.</strong> When online payments are offered, card details are handled by our payment provider. We do not see or store your full card number.</li>
              <li><strong>Website use.</strong> Our web host may automatically record technical information such as your IP address, browser type and the pages you visit, to keep the site running and secure.</li>
            </ul>
            <p>You can browse our website without telling us who you are. If you choose not to give us certain information, we may not be able to answer your enquiry or complete an order.</p>
          </section>

          <section id="how-we-use">
            <h2>How we use your information</h2>
            <ul>
              <li>to reply to your enquiry and prepare quotes;</li>
              <li>to design, build, fit and deliver your saddle or leatherwork;</li>
              <li>to process payments and keep business and tax records;</li>
              <li>to provide after-sales care, such as refitting or repairs;</li>
              <li>to keep our website secure and working properly; and</li>
              <li>to meet our legal obligations.</li>
            </ul>
            <p>We will only send you news or promotions if you have asked to receive them, and every message will include a way to opt out. We do not sell your personal information.</p>
          </section>

          <section id="cookies">
            <h2>Cookies & browser storage</h2>
            <p>We keep this to a minimum. At the moment our website uses only what it needs to work:</p>
            <ul>
              <li><strong>Shopping cart.</strong> Items you add to your cart are saved in your own browser (local storage) so they are still there when you come back. This stays on your device.</li>
              <li><strong>Pop-up preference.</strong> If you close our promotional pop-up, your browser remembers this for the rest of your visit (session storage).</li>
              <li><strong>Staff sign-in.</strong> Our team’s admin area uses a secure cookie to keep staff signed in. It is not set for customers.</li>
            </ul>
            <p>We do not currently use advertising or analytics cookies, or tracking pixels. If we add them in future, we will update this policy and ask for your consent where required. You can clear cookies and site data at any time in your browser settings.</p>
          </section>

          <section id="sharing">
            <h2>Who we share it with</h2>
            <p>We only share your information when it is needed to provide our service, for example with:</p>
            <ul>
              <li>couriers and freight companies, to deliver your order;</li>
              <li>payment providers, to process payments;</li>
              <li>service providers that host our website, database, files and email; and</li>
              <li>our accountant or professional advisers, and government authorities where the law requires it.</li>
            </ul>
            <p>These providers may only use your information to carry out work for us.</p>
          </section>

          <section id="overseas">
            <h2>Storage & overseas providers</h2>
            <p>Your information is stored electronically by our technology providers. Some of them, such as cloud storage and content-delivery services, may store or process data on servers outside Australia. Where that happens, we take reasonable steps to make sure they protect your information in a way that is consistent with the Australian Privacy Principles.</p>
          </section>

          <section id="security">
            <h2>Keeping it secure</h2>
            <p>We take reasonable steps to protect your information from misuse, loss and unauthorised access. Access to our admin system is limited to authorised staff, each with their own password-protected account, and passwords are stored in encrypted (hashed) form. No method of storing or sending information online is completely secure, so we cannot guarantee absolute security.</p>
            <p>If a data breach is likely to cause you serious harm, we will notify you and the Office of the Australian Information Commissioner as required by law.</p>
          </section>

          <section id="retention">
            <h2>How long we keep it</h2>
            <p>We keep enquiry and order records for as long as we need them for the purposes above, including after-sales care, and to meet our legal and tax obligations (business records are generally kept for at least five years). When we no longer need information, we delete it or remove identifying details.</p>
          </section>

          <section id="your-rights">
            <h2>Access, correction & deletion</h2>
            <p>You can ask to see the personal information we hold about you, ask us to correct it, or ask us to delete it where we are not required to keep it. To make a request, <ContactLine />. We may need to confirm your identity first, and we will respond within a reasonable time, usually within 30 days.</p>
          </section>

          <section id="complaints">
            <h2>Questions & complaints</h2>
            <p>If you have a question about this policy or a concern about how we have handled your information, please <ContactLine />. We will look into it and get back to you.</p>
            <p>If you are not satisfied with our response, you can contact the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noreferrer">oaic.gov.au</a>.</p>
          </section>

          <section id="changes">
            <h2>Changes to this policy</h2>
            <p>We may update this policy from time to time, for example if we add new website features. The latest version will always be on this page, with the date it was last updated.</p>
          </section>

          <aside className="privacy-cta">
            <p className="eyebrow">Questions?</p>
            <p>We’re happy to talk through how we look after your details.</p>
            <Link href="/contact" className="button-link button-gold">Contact us</Link>
          </aside>
        </article>
      </div>
    </main>
    <SiteFooter />
  </>;
}
