/**
 * Normalizes a website URL to ensure it has a protocol
 */
export function normalizeWebsiteUrl(url: string): string {
  let normalized = url.trim();
  normalized = normalized.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }
  return normalized;
}

/**
 * Validates a website URL format
 */
export function isValidWebsiteUrl(url: string): boolean {
  try {
    const normalized = normalizeWebsiteUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}
