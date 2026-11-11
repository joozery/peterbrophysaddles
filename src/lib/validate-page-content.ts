import { pageContentDefaults } from "./page-content-defaults";

export function validatePageContent(slug: string, content: unknown): string | null {
  if (content === undefined) return null;
  if (!content || typeof content !== "object" || Array.isArray(content)) return "Invalid page content.";
  const defaults = pageContentDefaults[slug];
  for (const [key, value] of Object.entries(content)) {
    if (!defaults || !(key in defaults) || typeof value !== "string" || value.length > 5000) return "Invalid page field.";
    if (/^(image|src)_/.test(key) && !/^(\/(?!\/)|https:\/\/)/.test(value)) return "Section images need an uploaded image, /path or https:// URL.";
    if (key.startsWith("href") && (!/^(\/(?!\/)|#[\w-]+$|https:\/\/|mailto:|tel:)/.test(value) || /[\u0000-\u0020\\]/.test(value))) return "Links must use /page, #section, https://, mailto: or tel:.";
  }
  return null;
}
