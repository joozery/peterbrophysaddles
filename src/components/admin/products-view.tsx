"use client";

import Image from "next/image";
import { useState } from "react";
import { Cross2Icon, MinusIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import { categoryOf, defaultSpecLabels, money, productCategories, type ProductCategory, type ProductSpec } from "@/lib/catalog";
import { sortProducts } from "@/lib/admin-types";
import { type AdminProduct, newId, updateAdmin, useAdmin } from "@/lib/admin-store";
import { Badge, Card, ConfirmDelete, Field, FormDrawer, PageHeader, SearchBox, dollarsToCents, str, useToast } from "./admin-ui";
import { ImageUpload, isImageSrc } from "./image-upload";

/** Editable label/value rows, submitted as repeated spec-label / spec-value fields. */
function SpecsEditor({ initial }: { initial: ProductSpec[] }) {
  // Products with no specs yet (including new ones) start with the standard saddle rows to fill in.
  const start = initial.length ? initial : defaultSpecLabels.map(label => ({ label, value: "" }));
  const [rows, setRows] = useState(() => start.map((s, i) => ({ key: i, ...s })));
  const [next, setNext] = useState(start.length);
  const add = () => { setRows(r => [...r, { key: next, label: "", value: "" }]); setNext(n => n + 1); };
  return <fieldset className="admin-specs"><legend className="admin-label">Specifications</legend>
    {rows.map((row, i) => <div key={row.key} className="admin-spec-row">
      <input name="spec-label" className="admin-input" aria-label={`Specification ${i + 1} name`} defaultValue={row.label} placeholder="e.g. Tree" maxLength={60} />
      <input name="spec-value" className="admin-input" aria-label={`Specification ${i + 1} value`} defaultValue={row.value} placeholder="e.g. Rigid PU & Carbon Fibre" maxLength={300} />
      <button type="button" className="admin-icon-button" aria-label={`Remove specification ${i + 1}`} onClick={() => setRows(r => r.filter(x => x.key !== row.key))}><Cross2Icon /></button>
    </div>)}
    <button type="button" className="admin-button" onClick={add}><PlusIcon aria-hidden="true" />Add specification</button>
    <small className="admin-hint">Rows left blank aren’t shown on the website. Separate options with commas to show them as chips, e.g. seat sizes: 13”, 13.5”, 14”</small>
  </fieldset>;
}

/** Extra product photos, each submitted as a repeated "gallery" field. */
function GalleryEditor({ initial, onBusyChange }: { initial: string[]; onBusyChange: (busy: boolean) => void }) {
  const [rows, setRows] = useState(() => initial.map((src, key) => ({ key, src })));
  const [next, setNext] = useState(initial.length);
  return <fieldset className="admin-specs"><legend className="admin-label">More photos</legend>
    {rows.map((row, i) => <div key={row.key} className="admin-gallery-row">
      <ImageUpload label={`Photo ${i + 2}`} name="gallery" folder="products" defaultValue={row.src} onBusyChange={onBusyChange} />
      <button type="button" className="admin-icon-button" aria-label={`Remove photo ${i + 2}`} onClick={() => setRows(r => r.filter(x => x.key !== row.key))}><Cross2Icon /></button>
    </div>)}
    <button type="button" className="admin-button" disabled={rows.length >= 11} onClick={() => { setRows(r => [...r, { key: next, src: "" }]); setNext(n => n + 1); }}><PlusIcon aria-hidden="true" />Add photo</button>
    <small className="admin-hint">Shown as thumbnails under the main image on the product page.</small>
  </fieldset>;
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ProductsView() {
  const { products } = useAdmin();
  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast, run, notify } = useToast();

  const stockOf = (p: AdminProduct) => p.stock;
  const setStock = (p: AdminProduct, next: number) => run(() => updateAdmin(s => ({ ...s, products: s.products.map(x => x.id === p.id ? { ...x, stock: next } : x) })), `${p.name}: stock set to ${next}.`);

  const current = editing && editing !== "new" ? editing : null;
  const rows = sortProducts(products).filter(p => !query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase()));

  return <>
    <PageHeader eyebrow="Catalogue" title="Products & stock" description="Manage saddles, prices and stock." actions={<button type="button" className="admin-button is-primary" onClick={() => setEditing("new")}><PlusIcon aria-hidden="true" />Add product</button>} />
    <Card flush>
      <div className="admin-toolbar"><p className="admin-muted">{products.length} products · {products.filter(p => p.active).length} visible</p><SearchBox value={query} onChange={setQuery} label="Search products" /></div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Product</th><th>Price</th><th>Status</th><th className="num">Stock</th><th className="num"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{rows.map(p => {
          const qty = stockOf(p);
          const status = !p.active ? ["closed", "Hidden"] : p.custom ? ["custom", "Made to order"] : qty === 0 ? ["cancelled", "Out of stock"] : qty <= 1 ? ["pending", "Low stock"] : ["shipped", "In stock"];
          return <tr key={p.id}>
            <td><div className="admin-product"><span className="admin-thumb">{isImageSrc(p.image) && <Image src={p.image} alt="" fill sizes="56px" unoptimized={p.image.startsWith("https://")} />}</span><span><strong>{p.name}</strong><small>{productCategories.find(c => c.id === categoryOf(p))?.label} · /{p.id}</small></span></div></td>
            <td>{p.custom ? "Quote" : money(p.price)}</td>
            <td><Badge tone={status[0]}>{status[1]}</Badge></td>
            <td className="num">{p.custom ? <span className="admin-muted">—</span> : <div className="admin-stepper">
              <button type="button" aria-label={`Decrease ${p.name} stock`} disabled={qty === 0} onClick={() => setStock(p, qty - 1)}><MinusIcon /></button>
              <output>{qty}</output>
              <button type="button" aria-label={`Increase ${p.name} stock`} disabled={qty >= 9999} onClick={() => setStock(p, qty + 1)}><PlusIcon /></button>
            </div>}</td>
            <td className="num"><button type="button" className="admin-icon-button" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}><Pencil1Icon /></button></td>
          </tr>;
        })}
        {!rows.length && <tr><td colSpan={5} className="admin-empty">No products found.</td></tr>}</tbody>
      </table></div>
    </Card>

    <FormDrawer key={current?.id ?? (editing ? "new" : "closed")} open={!!editing} onOpenChange={o => { if (!o) setEditing(null); }} eyebrow="Catalogue" title={current ? current.name : "Add product"} submitLabel={current ? "Save product" : "Add product"} submitDisabled={uploading}
      footerStart={current && (<ConfirmDelete what={current.name} onConfirm={() => { const p = current; run(() => updateAdmin(s => ({ ...s, products: s.products.filter(x => x.id !== p.id) })), `${p.name} deleted.`); setEditing(null); }} />)}
      onSubmit={data => {
        const name = str(data, "name"), custom = data.get("custom") === "on", price = custom ? 0 : dollarsToCents(str(data, "price"));
        const stock = Number(data.get("stock") ?? 0);
        if (!name) return "Product name is required.";
        if (!custom && (Number.isNaN(price) || price <= 0)) return "Enter a price greater than $0, or mark it as made to order.";
        if (str(data, "image") && !isImageSrc(str(data, "image"))) return "Image must be uploaded, or a path starting with / or https://.";
        const labels = data.getAll("spec-label").map(v => String(v).trim()), values = data.getAll("spec-value").map(v => String(v).trim());
        const rows = labels.map((label, i) => ({ label, value: values[i] ?? "" }));
        if (rows.some(s => !s.label && s.value)) return "Each specification with a value needs a name.";
        const specs = rows.filter(s => s.label && s.value);
        const category: ProductCategory = str(data, "category") === "saddle-trees" ? "saddle-trees" : "saddles";
        const sortText = str(data, "sort"), sort = sortText ? Number(sortText) : Math.max(0, ...products.filter(p => categoryOf(p) === category).map(p => p.sort ?? 0)) + 10;
        if (!Number.isInteger(sort) || sort < 0 || sort > 99999) return "Display order must be a whole number.";
        const gallery = data.getAll("gallery").map(v => String(v).trim()).filter(Boolean);
        if (gallery.some(src => !isImageSrc(src))) return "Each extra photo must be uploaded, or a path starting with / or https://.";
        const patch = { gallery, name, price, custom, active: data.get("active") === "on", image: str(data, "image"), description: str(data, "description"), specs, category, sort };
        if (current) {
          updateAdmin(s => ({ ...s, products: s.products.map(p => p.id === current.id ? { ...p, ...patch } : p) }));
          notify(`${name} saved.`);
        } else {
          if (!Number.isInteger(stock) || stock < 0 || stock > 9999) return "Stock must be a whole number between 0 and 9999.";
          let id = slugify(name) || newId("product").toLowerCase();
          if (products.some(p => p.id === id)) id = `${id}-${newId("x").slice(2).toLowerCase()}`;
          updateAdmin(s => ({ ...s, products: [...s.products, { id, stock, ...patch }] }));
          notify(`${name} added.`);
        }
      }}>
      <div className="admin-form">
        <Field label="Name"><input name="name" className="admin-input" required defaultValue={current?.name} /></Field>
        <div className="admin-form-row">
          <Field label="Category"><select name="category" className="admin-input" defaultValue={current ? categoryOf(current) : "saddles"}>{productCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></Field>
          <Field label="Display order" hint="Lower numbers show first in the category. Leave blank to add at the end."><input name="sort" type="number" min={0} max={99999} step={1} className="admin-input" defaultValue={current?.sort ?? ""} /></Field>
        </div>
        <div className="admin-form-row">
          <Field label="Price (AUD)"><input name="price" inputMode="decimal" className="admin-input" defaultValue={current && !current.custom ? (current.price / 100).toFixed(2) : ""} placeholder="3200.00" /></Field>
          {!current && <Field label="Starting stock"><input name="stock" type="number" min={0} max={9999} defaultValue={0} className="admin-input" /></Field>}
        </div>
        <label className="admin-check"><input type="checkbox" name="custom" defaultChecked={current?.custom} />Made to order (price on quote)</label>
        <ImageUpload label="Main photo" name="image" folder="products" defaultValue={current?.image ?? ""} onBusyChange={setUploading} />
        <GalleryEditor initial={current?.gallery ?? []} onBusyChange={setUploading} />
        <Field label="Description"><textarea name="description" className="admin-input" rows={5} defaultValue={current?.description} placeholder="Leather, tooling, how it rides…" /></Field>
        <SpecsEditor initial={current?.specs ?? []} />
        <label className="admin-check"><input type="checkbox" name="active" defaultChecked={current ? current.active : true} />Visible on the website</label>
      </div>
    </FormDrawer>
    {toast}
  </>;
}
