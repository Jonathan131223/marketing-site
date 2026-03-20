/** Minimal URL normalizer for redirecting to app with ?url= param. */
export function normalizeWebsiteUrl(input: string): string {
  let s = input.trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    new URL(s);
    return s;
  } catch {
    return input.trim();
  }
}
