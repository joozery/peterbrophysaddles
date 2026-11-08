"use client";

// Admin data in the browser, backed by MongoDB through /api/admin/*.
// Views call `updateAdmin(state => nextState)`; the store applies it instantly (optimistic), works out
// what changed, and saves those records to the server. If saving fails, it reloads the server's copy
// and reports the error through `onSyncError` listeners.
import { useSyncExternalStore } from "react";
import { type AdminState, type AdminUser, LIST_KEYS, type ListName, SINGLETONS, defaultAbout, defaultHome, defaultPricing, defaultPromotion, defaultSettings } from "./admin-types";

export * from "./admin-types";

type Status = { phase: "idle" | "loading" | "ready" | "signed-out" | "error"; error?: string; user?: AdminUser; saving: number };

const empty: AdminState = { orders: [], enquiries: [], customers: [], products: [], discountCodes: [], pages: [], promotion: defaultPromotion, settings: defaultSettings, home: defaultHome, about: defaultAbout, pricing: defaultPricing };
let state: AdminState = empty;
let status: Status = { phase: "idle", saving: 0 };
const listeners = new Set<() => void>();
const errorListeners = new Set<(message: string) => void>();
const emit = () => listeners.forEach(l => l());
const setStatus = (patch: Partial<Status>) => { status = { ...status, ...patch }; emit(); };

// Local calendar date (YYYY-MM-DD); toISOString would give the UTC date and can be a day off.
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "content-type": "application/json", ...init?.headers }, credentials: "same-origin" });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.includes("/auth/")) setStatus({ phase: "signed-out" });
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data as T;
}

/** Loads everything from the server. `quiet` keeps the current screen (used to resync after a failed save). */
export async function loadAdmin(quiet = false) {
  if (!quiet) setStatus({ phase: "loading", error: undefined });
  try {
    const data = await api<{ state: AdminState; user: AdminUser }>("/api/admin/state");
    state = data.state;
    setStatus({ phase: "ready", user: data.user });
  } catch (err) {
    if (status.phase !== "signed-out") setStatus({ phase: "error", error: err instanceof Error ? err.message : "Could not load data." });
  }
}

export function setCurrentUser(user: AdminUser) { setStatus({ user }); }
/** Call after signing in so the admin shell loads fresh data for the new session. */
export function resetAdminSession() { state = empty; status = { phase: "idle", saving: 0 }; emit(); }

function diff(prev: AdminState, next: AdminState) {
  const ops: unknown[] = [];
  for (const list of Object.keys(LIST_KEYS) as ListName[]) {
    if (prev[list] === next[list]) continue;
    const key = LIST_KEYS[list];
    const before = new Map((prev[list] as Record<string, unknown>[]).map(d => [d[key] as string, d]));
    const after = new Map((next[list] as Record<string, unknown>[]).map(d => [d[key] as string, d]));
    for (const [k, doc] of after) if (before.get(k) !== doc && JSON.stringify(before.get(k)) !== JSON.stringify(doc)) ops.push({ kind: "upsert", list, doc });
    for (const k of before.keys()) if (!after.has(k)) ops.push({ kind: "delete", list, key: k });
  }
  for (const s of SINGLETONS) if (prev[s] !== next[s] && JSON.stringify(prev[s]) !== JSON.stringify(next[s])) ops.push({ kind: "set", singleton: s, value: next[s] });
  return ops;
}

/** Apply a change now and save it to the server in the background. */
export function updateAdmin(change: (s: AdminState) => AdminState) {
  if (status.phase !== "ready") throw new Error("Data is still loading. Try again in a moment.");
  const prev = state;
  const next = change(prev);
  const ops = diff(prev, next);
  if (!ops.length) return;
  state = next;
  setStatus({ saving: status.saving + 1 });
  api("/api/admin/sync", { method: "POST", body: JSON.stringify({ ops }) })
    .catch(async err => {
      errorListeners.forEach(l => l(`Not saved: ${err instanceof Error ? err.message : "server error"}`));
      await loadAdmin(true); // fall back to what the server actually has
    })
    .finally(() => setStatus({ saving: Math.max(0, status.saving - 1) }));
}

export function onSyncError(listener: (message: string) => void) { errorListeners.add(listener); return () => { errorListeners.delete(listener); }; }

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useAdmin = () => useSyncExternalStore(subscribe, () => state, () => empty);
export const useAdminStatus = () => useSyncExternalStore(subscribe, () => status, () => status);

export async function signOut() {
  await api("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
  state = empty;
  setStatus({ phase: "signed-out", user: undefined });
}
