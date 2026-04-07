/**
 * Base URL of the app (portal, generator, auth).
 * - Development: override via PUBLIC_APP_BASE_URL or VITE_APP_BASE_URL
 * - Production: https://app.digistorms.ai
 */
export function getAppUrl(): string {
  if (typeof import.meta.env !== "undefined") {
    const url =
      import.meta.env.PUBLIC_APP_BASE_URL ??
      import.meta.env.VITE_APP_BASE_URL;
    if (url && typeof url === "string") return url.replace(/\/$/, "");
  }
  return "https://app.digistorms.ai";
}

export function appUrl(path: string): string {
  const base = getAppUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
