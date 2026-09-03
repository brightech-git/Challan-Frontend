export type ColorMode = "light" | "dark";

/**
 * Shared localStorage-backed color-mode store, exposed as a
 * useSyncExternalStore-compatible store (same shape as lib/auth-storage.ts).
 *
 * This replaces next-themes: its internal <script> component renders on
 * every client commit (not just the initial SSR pass), which trips React
 * 19's "Encountered a script tag while rendering React component" warning
 * (scripts inserted by React are never executed). The anti-flash script is
 * now a plain inline <script> in app/layout.tsx's <head> instead (see
 * node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md),
 * which the browser executes while parsing the HTML, before React ever
 * touches the DOM.
 */
const STORAGE_KEY = "challan.theme";

const listeners = new Set<() => void>();

function systemColorMode(): ColorMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredMode(): ColorMode | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    return null;
  }
}

function getSnapshot(): ColorMode {
  return readStoredMode() ?? systemColorMode();
}

function getServerSnapshot(): ColorMode {
  return "light";
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onStoreChange();
  };
  // Only matters while the user hasn't made an explicit choice yet —
  // readStoredMode() is null, so the snapshot tracks the OS preference.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (!readStoredMode()) onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onSystemChange);
  };
}

export const colorModeStore = { subscribe, getSnapshot, getServerSnapshot };

/** Applies the resolved mode to <html> — mirrors the inline script in app/layout.tsx. */
export function applyColorMode(mode: ColorMode): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.style.colorScheme = mode;
}

export function setStoredColorMode(mode: ColorMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  listeners.forEach((l) => l());
}

/** Source for the inline anti-flash script rendered in app/layout.tsx's <head>. */
export const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem("${STORAGE_KEY}");var mode=m==="light"||m==="dark"?m:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var r=document.documentElement;r.classList.add(mode);r.style.colorScheme=mode;}catch(e){}})();`;
