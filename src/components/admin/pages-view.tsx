"use client";

import Image from "next/image";
import { useState } from "react";
import { ExternalLinkIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { type ContentPage, today, updateAdmin, useAdmin } from "@/lib/admin-store";
import { Badge, Card, Field, FormDrawer, PageHeader, SearchBox, str, useToast } from "./admin-ui";
import { formatDate } from "./sample-data";
import { ImageUpload, isImageSrc } from "./image-upload";
import { PageSectionFields } from "./page-section-fields";
import { pageContentDefaults } from "@/lib/page-content-defaults";
import { validatePageContent } from "@/lib/validate-page-content";

export function PagesView() {
  const { pages } = useAdmin();
  const [editing, setEditing] = useState<ContentPage | null>(null);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast, notify } = useToast();
  const q = query.trim().toLowerCase();
  const rows = pages.filter(p => !q || `${p.title} ${p.slug}`.toLowerCase().includes(q));

  return <>
    <PageHeader eyebrow="Website" title="Pages & content" description="Edit page titles, introductions, images and section content." />
    <p className="admin-notice">Changes go live as soon as you save. Switching a page to <strong>Draft</strong> hides it from the website (it shows “page not found”). Home page sections are edited under <strong>Home page</strong>.</p>
    <Card flush>
      <div className="admin-toolbar"><p className="admin-muted">{pages.length} pages</p><SearchBox value={query} onChange={setQuery} label="Search pages" /></div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Page</th><th>Introduction</th><th>Status</th><th>Updated</th><th className="num"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{rows.map(p => <tr key={p.slug}>
          <td><div className="admin-product"><span className="admin-thumb">{isImageSrc(p.image) && <Image src={p.image} alt="" fill sizes="56px" unoptimized={p.image.startsWith("https://")} />}</span><span><strong>{p.title}</strong><small>/{p.slug}</small></span></div></td>
          <td><span className="admin-clamp">{p.description}</span></td>
          <td><Badge tone={p.published ? "shipped" : "closed"}>{p.published ? "Published" : "Draft"}</Badge></td>
          <td>{formatDate(p.updatedAt)}</td>
          <td className="num"><div className="admin-row-actions"><a className="admin-icon-button" href={`/${p.slug}`} target="_blank" rel="noreferrer" aria-label={`View ${p.title} page`}><ExternalLinkIcon /></a><button type="button" className="admin-icon-button" aria-label={`Edit ${p.title}`} onClick={() => setEditing(p)}><Pencil1Icon /></button></div></td>
        </tr>)}
        {!rows.length && <tr><td colSpan={5} className="admin-empty">No pages found.</td></tr>}</tbody>
      </table></div>
    </Card>

    <FormDrawer key={editing?.slug ?? "closed"} open={!!editing} onOpenChange={o => { if (!o) setEditing(null); }} eyebrow={`/${editing?.slug ?? ""}`} title={editing?.title ?? ""} submitLabel="Save page" submitDisabled={uploading}
      onSubmit={data => {
        if (!editing) return;
        const title = str(data, "title"), description = str(data, "description"), image = str(data, "image");
        if (!title) return "Title is required.";
        if (description.length > 400) return "Keep the introduction under 400 characters.";
        if (image && !isImageSrc(image)) return "Image must be uploaded, or a path starting with / or https://.";
        const defaults = pageContentDefaults[editing.slug];
        const content = defaults ? Object.fromEntries(Object.keys(defaults).map(key => [key, String(data.get(`content.${key}`) ?? editing.content?.[key] ?? defaults[key])])) : editing.content;
        const problem = validatePageContent(editing.slug, content);
        if (problem) return problem;
        updateAdmin(s => ({ ...s, pages: s.pages.map(p => p.slug === editing.slug ? { ...p, title, description, image, content, published: data.get("published") === "on", updatedAt: today() } : p) }));
        notify(`${title} saved. Changes are live.`);
      }}>
      {editing && <div className="admin-form">
        <Field label="Page title"><input name="title" className="admin-input" required defaultValue={editing.title} /></Field>
        <Field label="Introduction" hint="Shown under the title and used as the Google description. Max 400 characters."><textarea name="description" className="admin-input" rows={5} maxLength={400} defaultValue={editing.description} /></Field>
        <ImageUpload label="Header image (optional)" name="image" folder="pages" defaultValue={editing.image} onBusyChange={setUploading} />
        <label className="admin-check"><input type="checkbox" name="published" defaultChecked={editing.published} />Published</label>
        <PageSectionFields slug={editing.slug} content={editing.content} onBusyChange={setUploading} />
      </div>}
    </FormDrawer>
    {toast}
  </>;
}
