"use client";

import { pageContentDefaults } from "@/lib/page-content-defaults";
import { Field } from "./admin-ui";
import { ImageUpload } from "./image-upload";

/** Existing sections remain fixed; every field has the live page's original copy as a reference. */
export function PageSectionFields({ slug, content, onBusyChange }: { slug: string; content?: Record<string, string>; onBusyChange: (busy: boolean) => void }) {
  const defaults = pageContentDefaults[slug];
  if (!defaults) return null;
  const groups = [
    { title: "Section text & FAQs", match: (key: string) => key.startsWith("text") },
    { title: "Images & descriptions", match: (key: string) => /^(image|src|alt)_/.test(key) },
    { title: "Links & form placeholders", match: (key: string) => key.startsWith("href") || key.startsWith("placeholder_") },
  ];
  return <div className="admin-page-sections"><p className="admin-notice">Edit the existing sections below. Each field shows its original text as a reference. Changes appear on the website after saving.</p>{groups.map(group => <details key={group.title} className="admin-page-field-group"><summary>{group.title}</summary><div className="admin-form">{Object.entries(defaults).filter(([key]) => group.match(key)).map(([key, original]) => {
    const value = content?.[key] ?? original;
    const label = key.startsWith("alt_") ? `Image description: ${original}` : /^(image|src)_/.test(key) ? `Image: ${original.split("/").pop()}` : key.startsWith("href") ? `Link: ${original}` : original;
    if (/^(image|src)_/.test(key)) return <ImageUpload key={key} label={label} name={`content.${key}`} folder="pages" defaultValue={value} onBusyChange={onBusyChange} />;
    return <Field key={key} label={label} hint={key.startsWith("href") ? "Use /page, #section, https://, mailto: or tel:." : undefined}>{key.startsWith("href") || key.startsWith("placeholder_") ? <input className="admin-input" name={`content.${key}`} defaultValue={value} maxLength={2000} /> : <textarea className="admin-input" name={`content.${key}`} defaultValue={value} rows={original.length > 100 ? 4 : 2} maxLength={5000} />}</Field>;
  })}</div></details>)}</div>;
}
