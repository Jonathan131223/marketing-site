/**
 * Base URL of the app (portal, generator, auth).
 * - Development: app runs on port 8080 (digi-monorepo)
 * - Production: https://app.digistorms.ai
 */
export function getAppUrl(): string {
  const url = import.meta.env.VITE_APP_BASE_URL;
  if (url && typeof url === "string") return url.replace(/\/$/, "");
  return "https://app.digistorms.ai";
}

export function appUrl(path: string): string {
  const base = getAppUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
