"use client";

import Image from "next/image";
import { useState } from "react";
import { MinusIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import { money } from "@/lib/catalog";
import { type AdminProduct, newId, updateAdmin, useAdmin } from "@/lib/admin-store";
import { Badge, Card, ConfirmDelete, Field, FormDrawer, PageHeader, SearchBox, dollarsToCents, str, useToast } from "./admin-ui";
import { ImageUpload, isImageSrc } from "./image-upload";

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
  const rows = products.filter(p => !query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase()));

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
            <td><div className="admin-product"><span className="admin-thumb">{isImageSrc(p.image) && <Image src={p.image} alt="" fill sizes="56px" unoptimized={p.image.startsWith("https://")} />}</span><span><strong>{p.name}</strong><small>/{p.id}</small></span></div></td>
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
        const patch = { name, price, custom, active: data.get("active") === "on", image: str(data, "image"), description: str(data, "description") };
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
          <Field label="Price (AUD)"><input name="price" inputMode="decimal" className="admin-input" defaultValue={current && !current.custom ? (current.price / 100).toFixed(2) : ""} placeholder="3200.00" /></Field>
          {!current && <Field label="Starting stock"><input name="stock" type="number" min={0} max={9999} defaultValue={0} className="admin-input" /></Field>}
        </div>
        <label className="admin-check"><input type="checkbox" name="custom" defaultChecked={current?.custom} />Made to order (price on quote)</label>
        <ImageUpload label="Product image" name="image" folder="products" defaultValue={current?.image ?? ""} onBusyChange={setUploading} />
        <Field label="Description"><textarea name="description" className="admin-input" rows={4} defaultValue={current?.description} placeholder="Seat size, tree, tooling, leather…" /></Field>
        <label className="admin-check"><input type="checkbox" name="active" defaultChecked={current ? current.active : true} />Visible on the website</label>
      </div>
    </FormDrawer>
    {toast}
  </>;
}
