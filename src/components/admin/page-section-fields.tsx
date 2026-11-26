"use client";

import { pageContentDefaults } from "@/lib/page-content-defaults";
import { pageSections } from "@/lib/page-sections";
import { Field } from "./admin-ui";
import { ImageUpload } from "./image-upload";

/** Existing sections remain fixed; fields are grouped by where they appear on the live page, and each shows its original copy as a reference. */
export function PageSectionFields({ slug, content, onBusyChange }: { slug: string; content?: Record<string, string>; onBusyChange: (busy: boolean) => void }) {
  const defaults = pageContentDefaults[slug];
  if (!defaults) return null;
  const mapped = pageSections[slug] ?? [];
  const placed = new Set(mapped.flatMap(s => s.keys));
  const other = Object.keys(defaults).filter(k => !placed.has(k));
  const groups = [...mapped, ...(other.length ? [{ title: mapped.length ? "Other" : "All fields", hint: "", keys: other }] : [])]
    .map(g => ({ ...g, keys: g.keys.filter(k => k in defaults) }))
    .filter(g => g.keys.length);

  const renderField = (key: string) => {
    const original = defaults[key];
    const value = content?.[key] ?? original;
    const label = key.startsWith("alt_") ? `Image description: ${original}` : /^(image|src)_/.test(key) ? `Image${original ? `: ${original.split("/").pop()}` : " (none uploaded yet)"}` : key.startsWith("href") ? `Link: ${original}` : original;
    if (/^(image|src)_/.test(key)) return <ImageUpload key={key} label={label} name={`content.${key}`} folder="pages" defaultValue={value} onBusyChange={onBusyChange} />;
    return <Field key={key} label={label} hint={key.startsWith("href") ? "Use /page, #section, https://, mailto: or tel:." : undefined}>{key.startsWith("href") || key.startsWith("placeholder_") ? <input className="admin-input" name={`content.${key}`} defaultValue={value} maxLength={2000} /> : <textarea className="admin-input" name={`content.${key}`} defaultValue={value} rows={original.length > 100 ? 4 : 2} maxLength={5000} />}</Field>;
  };

  return <div className="admin-page-sections"><p className="admin-notice">Sections below follow the order of the live page, top to bottom. Open a section to edit its text, images and links. Each field shows its original text as a reference. Changes appear on the website after saving.</p>{groups.map(group => <details key={group.title} className="admin-page-field-group"><summary>{group.title}{group.hint && <small> — {group.hint}</small>}</summary><div className="admin-form">{group.keys.map(renderField)}</div></details>)}</div>;
}
