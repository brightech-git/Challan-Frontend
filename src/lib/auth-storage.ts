import { AuthUser } from "@/types";

/**
 * Thin localStorage wrapper for the logged-in user, exposed as a
 * useSyncExternalStore-compatible store.
 *
 * The backend has no token/session concept (see UserIdInterceptor.java) —
 * "session persistence" here just means remembering who logged in and
 * replaying their userId on every request. useSyncExternalStore is the
 * correct primitive for this: it reads external (non-React) state and
 * gives React a server snapshot (always "logged out") distinct from the
 * client snapshot, so hydration never mismatches — no effect-based
 * "mounted" workaround needed.
 */
const STORAGE_KEY = "challan.auth.user";

const listeners = new Set<() => void>();

function readUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// Cache the last snapshot so getSnapshot returns a stable reference when
// nothing has changed (required by useSyncExternalStore to avoid loops).
let cachedRaw: string | null = null;
let cachedUser: AuthUser | null = null;

function getSnapshot(): AuthUser | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = raw ? readUser() : null;
  }
  return cachedUser;
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

export const authStore = { subscribe, getSnapshot, getServerSnapshot };

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  return readUser();
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  cachedRaw = null; // force getSnapshot to re-read on next call
  notify();
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  notify();
}
