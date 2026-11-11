"use client";

/** Sends a website enquiry to Admin → Enquiries. Returns an error message, or null on success. */
export async function sendEnquiry(form: HTMLFormElement, extra: Record<string, unknown>): Promise<string | null> {
  const data = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch("/api/public/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, ...extra }) });
    if (res.ok) return null;
    const body = await res.json().catch(() => ({}));
    return body.error || "Sorry, your message couldn’t be sent. Please try again.";
  } catch { return "You appear to be offline. Please check your connection and try again."; }
}

/** Hidden field that only bots fill in. Keep it out of the tab order and away from screen readers. */
export const HONEYPOT_STYLE = { position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" } as const;
