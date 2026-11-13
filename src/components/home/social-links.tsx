import type { SiteSettings } from "@/lib/server/site-settings";

const paths: Record<string, string> = {
  facebookUrl: "M14 8.5V6.6c0-.8.2-1.3 1.4-1.3H17V2.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.6v3.4h2.7V22H14v-10.1h2.7l.4-3.4H14z",
  instagramUrl: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 4.6a5.2 5.2 0 100 10.4 5.2 5.2 0 000-10.4zm0 8.6a3.4 3.4 0 110-6.8 3.4 3.4 0 010 6.8zm5.4-9.9a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z",
  youtubeUrl: "M23 7.2a3 3 0 00-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 001 7.2 31 31 0 00.5 12 31 31 0 001 16.8a3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1 31 31 0 00.5-4.8 31 31 0 00-.5-4.8zM9.7 15V9l5.8 3-5.8 3z",
  tiktokUrl: "M19.6 6.7a4.8 4.8 0 01-3.8-4.2V2h-3.4v13.6a2.9 2.9 0 11-2-2.7V9.4a6.3 6.3 0 105.4 6.2V8.7a8.2 8.2 0 004.8 1.5V6.8l-1-.1z",
};

/** Social icons from Admin → Settings → Social media. Renders nothing when no links are set. */
export function SocialLinks({ links, className = "social-links" }: { links: SiteSettings["social"]; className?: string }) {
  if (!links.length) return null;
  return <ul className={className} aria-label="Social media">{links.map(l => <li key={l.key}><a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d={paths[l.key]} /></svg></a></li>)}</ul>;
}
