/**
 * Next.js Instrumentation
 *
 * Runs once on the server before any request is handled.
 *
 * Fixes a compatibility issue with Node.js 22+ (v25 in particular):
 * those versions define `localStorage` as a global via their experimental
 * web-storage feature, but the object's methods throw when no valid
 * `--localstorage-file` path is given. Next.js's own dev-overlay reads
 * `localStorage.getItem()` synchronously during SSR, which crashes the
 * server render with "localStorage.getItem is not a function".
 *
 * We detect the broken state and replace it with a safe in-memory no-op
 * so SSR completes cleanly. The real localStorage still works in the
 * browser (this file only runs server-side).
 */
export async function register() {
  if (typeof localStorage !== "undefined") {
    try {
      // Test if getItem is callable — broken in Node.js 25 when
      // --localstorage-file path is missing or invalid.
      if (typeof localStorage.getItem !== "function") {
        throw new Error("getItem is not a function");
      }
      // Extra check: actually invoke it to surface hidden errors.
      localStorage.getItem("__next_ssr_probe__");
    } catch {
      // Replace with a safe no-op Storage-like object.
      const store: Record<string, string> = {};
      Object.defineProperty(globalThis, "localStorage", {
        value: {
          getItem: (key: string) => store[key] ?? null,
          setItem: (key: string, value: string) => { store[key] = String(value); },
          removeItem: (key: string) => { delete store[key]; },
          clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
          key: (index: number) => Object.keys(store)[index] ?? null,
          get length() { return Object.keys(store).length; },
        },
        writable: true,
        configurable: true,
      });
    }
  }
}
