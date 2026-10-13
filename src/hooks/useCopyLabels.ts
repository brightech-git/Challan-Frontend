"use client";

import { useMemo, useSyncExternalStore } from "react";

export interface CopyLabel { id: string; name: string }
const key = "challan:copy-labels";
const eventName = "challan-copy-labels-changed";
const defaults = JSON.stringify([
  { id: "original", name: "ORIGINAL COPY FOR DISTIBUTOR" },
  { id: "duplicate", name: "DUPLICATE COPY" },
]);

function snapshot() {
  try { return window.localStorage.getItem(key) ?? defaults; }
  catch { return defaults; }
}
function subscribe(notify: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === key || event.key === null) notify(); };
  window.addEventListener("storage", storage);
  window.addEventListener(eventName, notify);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(eventName, notify);
  };
}

export function useCopyLabels() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => defaults);
  const labels = useMemo<CopyLabel[]>(() => {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((item) => item && typeof item.id === "string" && typeof item.name === "string")) return parsed;
    } catch { /* Use defaults when saved data is invalid. */ }
    return JSON.parse(defaults);
  }, [raw]);
  const saveLabels = (next: CopyLabel[]) => {
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(eventName));
  };
  return { labels, saveLabels };
}
