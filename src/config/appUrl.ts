/**
 * Base URL of the app (portal, generator, auth).
 * - Development: override via PUBLIC_APP_BASE_URL in .env.development
 * - Production: https://app.digistorms.ai
 *
 * IMPORTANT: Must use the PUBLIC_ prefix, not VITE_. Astro only inlines
 * PUBLIC_* env vars into client bundles — VITE_* is server-only, which
 * caused a hydration mismatch in <Navbar client:load> (server saw the
 * override, client fell back to the default). See ISSUE-008 in TODOS.
 */
export function getAppUrl(): string {
  if (typeof import.meta.env !== "undefined") {
    const url = import.meta.env.PUBLIC_APP_BASE_URL;
    if (url && typeof url === "string") return url.replace(/\/$/, "");
  }
  return "https://app.digistorms.ai";
}

export function appUrl(path: string): string {
  const base = getAppUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
