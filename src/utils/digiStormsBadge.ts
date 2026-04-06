/**
 * Legacy DigiStorms "Powered by" badge helpers.
 *
 * The product no longer injects or displays the footer badge — we only strip it
 * from HTML when present (older templates, imports, or saved sequences).
 */

const BADGE_ATTR = "data-digistorms-badge";
const BADGE_ATTR_VALUE = "1";
const DISABLED_META_NAME = "digistorms-badge";
const DISABLED_META_CONTENT = "off";

function removeBadgeRowsAndMeta(doc: Document): void {
  doc
    .querySelectorAll(`tr[${BADGE_ATTR}="${BADGE_ATTR_VALUE}"]`)
    .forEach((el) => el.remove());
  doc
    .querySelectorAll(
      `meta[name="${DISABLED_META_NAME}"][content="${DISABLED_META_CONTENT}"]`,
    )
    .forEach((el) => el.remove());
}

/**
 * Removes all DigiStorms badge rows and the optional "badge off" meta tag.
 * Does not insert anything.
 */
export function stripDigiStormsBadge(html: string): string {
  if (!html || typeof html !== "string") return html;

  const doctypeMatch = html.match(/<!doctype[^>]*>/i);
  const doctype = doctypeMatch ? doctypeMatch[0] : "";

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    removeBadgeRowsAndMeta(doc);
    const rebuilt = doc.documentElement.outerHTML;
    return doctype ? `${doctype}\n${rebuilt}` : rebuilt;
  } catch {
    let out = html.replace(
      new RegExp(
        `<tr[^>]*${BADGE_ATTR}="${BADGE_ATTR_VALUE}"[\\s\\S]*?<\\/tr>`,
        "gi",
      ),
      "",
    );
    out = out.replace(
      new RegExp(
        `<meta[^>]*name=["']${DISABLED_META_NAME}["'][^>]*content=["']${DISABLED_META_CONTENT}["'][^>]*>`,
        "gi",
      ),
      "",
    );
    return out;
  }
}

export function hasDigiStormsBadge(html: string): boolean {
  if (!html || typeof html !== "string") return false;
  return html.includes(`${BADGE_ATTR}="${BADGE_ATTR_VALUE}"`);
}

/**
 * Checks if the badge exists but is hidden (display: none)
 */
export function isDigiStormsBadgeHidden(html: string): boolean {
  if (!html || typeof html !== "string") return false;
  if (!hasDigiStormsBadge(html)) return false;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const badge = doc.querySelector(
      `tr[${BADGE_ATTR}="${BADGE_ATTR_VALUE}"]`,
    ) as HTMLElement | null;
    if (!badge) return false;

    return badge.style.display === "none";
  } catch {
    const badgeMatch = html.match(
      new RegExp(`<tr[^>]*${BADGE_ATTR}="${BADGE_ATTR_VALUE}"[^>]*>`, "i"),
    );
    if (badgeMatch) {
      return (
        badgeMatch[0].includes("display: none") ||
        badgeMatch[0].includes("display:none")
      );
    }
    return false;
  }
}

export function isDigiStormsBadgeDisabled(html: string): boolean {
  if (!html || typeof html !== "string") return false;
  if (
    html
      .toLowerCase()
      .includes(
        `<meta name="${DISABLED_META_NAME}" content="${DISABLED_META_CONTENT}">`,
      )
  ) {
    return true;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const meta = doc.querySelector(
      `meta[name="${DISABLED_META_NAME}"][content="${DISABLED_META_CONTENT}"]`,
    );
    return !!meta;
  } catch {
    return false;
  }
}

/**
 * @deprecated Badge is never shown. Both values strip any existing badge.
 */
export function setDigiStormsBadge(html: string, _enabled: boolean): string {
  return stripDigiStormsBadge(html);
}

/**
 * Strips any DigiStorms badge from HTML. Does not insert a badge.
 */
export function ensureDigiStormsBadgeInitialized(html: string): string {
  return stripDigiStormsBadge(html);
}
