import { Fragment } from "react";

/** Renders text, turning line breaks typed in the admin into <br />. */
export function Lines({ text }: { text: string }) {
  const parts = text.split(/\r?\n/);
  return <>{parts.map((part, i) => <Fragment key={i}>{part}{i < parts.length - 1 && <br />}</Fragment>)}</>;
}

/** CSS url() value for an admin-provided image path, safely quoted. */
export const cssUrl = (src: string) => `url("${src.replace(/["\\\n\r]/g, "")}")`;

/** Splits text into paragraphs on blank lines; single line breaks become <br />. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return <>{text.split(/\r?\n\s*\r?\n/).map(p => p.trim()).filter(Boolean).map((p, i) => <p key={i} className={i === 0 ? className : undefined}><Lines text={p} /></p>)}</>;
}

/** A title with an optional italic accent line underneath, as used across the site. */
export function Title({ text, accent }: { text: string; accent?: string }) {
  return <><Lines text={text} />{accent && <><br /><em>{accent}</em></>}</>;
}
