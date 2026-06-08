/**
 * Title composition helpers for library pages.
 *
 * Strategy: the page title uses the email's tag (or use case) name verbatim —
 * we deliberately do NOT consolidate distinct tags onto a single search
 * keyword. Tags like "Welcome - Paid Users" and "Welcome - Free Users" need
 * to remain distinct in the index so each hub ranks for its own long-tail
 * intent rather than diluting each other on "welcome email."
 *
 * Title and H1 stay aligned because both pull from the same `tag.name` /
 * `usecase.name` source of truth.
 */

/** "Welcome - Paid Users" → "Welcome - Paid Users" (sentence-case first char). */
export function sentenceCase(phrase: string): string {
  if (!phrase) return "";
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

/**
 * Best-effort title case that preserves all-caps tokens (NPS, IRL, CTA) and
 * leaves separators like " - " alone. Used for hub-page titles.
 */
export function titleCase(phrase: string): string {
  if (!phrase) return "";
  return phrase
    .split(" ")
    .map((word) => {
      if (word === word.toUpperCase() && /[A-Z]/.test(word) && word.length > 1) return word;
      if (word === "-") return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Compose an SEO title for an individual email page.
 *
 * Pattern: `{Tag name} email example — {Brand}: "{subject}"`
 *
 * Leads with the tag name so the page is indexed against the tag's own
 * long-tail keyword. Brand is the secondary anchor; subject is the per-page
 * uniqueness signal (199 brand+tag combos in the library have duplicates,
 * so the subject is what disambiguates them).
 *
 * Hard-capped at 60 chars. Subject truncates at a word boundary — never the
 * tag name or brand. If the prefix alone exceeds 60 chars (very long
 * tag+brand combos), the subject is dropped entirely; the trailing ": "
 * separator also goes away so the title doesn't end with a dangling colon.
 * Was previously a soft cap with a 20-char subject minimum, which let 34
 * pages overflow per the Ahrefs audit (Warning-indexable-Title_too_long).
 */
export function composeEmailPageTitle(
  brand: string,
  tagName: string,
  subject: string,
): string {
  const TARGET = 60;
  const prefix = `${tagName} email example — ${brand}: `;
  const wrapped = `"${subject}"`;
  if (prefix.length + wrapped.length <= TARGET) {
    return `${prefix}${wrapped}`;
  }
  // Budget for the quoted-and-truncated subject is whatever's left after the
  // prefix. -3 accounts for the trailing …" suffix on truncation.
  const maxSubLen = TARGET - prefix.length - 3;
  if (maxSubLen >= 1) {
    const truncated = subject.slice(0, maxSubLen).replace(/\s+\S*$/, "") + "…";
    return `${prefix}"${truncated}"`;
  }
  // Prefix alone is at or over budget — drop the subject and the trailing
  // ": " so the title reads cleanly as just "{Tag} email example — {Brand}".
  const prefixNoColon = `${tagName} email example — ${brand}`;
  return prefixNoColon.length <= TARGET
    ? prefixNoColon
    : prefixNoColon.slice(0, TARGET - 1).replace(/\s+\S*$/, "") + "…";
}

/**
 * Strip a trailing " Email" or " Emails" suffix from a tag/use-case name so
 * the page-title builders can safely append " Emails" without duplicates.
 * Names like "Transactional Emails" become "Transactional"; everything else
 * passes through untouched.
 */
export function trimEmailSuffix(name: string): string {
  return name.replace(/\s+emails?\s*$/i, "");
}

/**
 * Compose an SEO title for a tag or use-case hub page.
 *
 * Pattern: `{Tag name} Emails — {N} from Real SaaS Brands | DigiStorms`
 * Falls back to a compact `{Tag name} Emails ({N}) | DigiStorms` when the
 * natural title exceeds ~70 chars (Google's pixel-width budget for desktop
 * SERP titles).
 *
 * The H1 on these pages is `{tag.name} emails` (lowercase "emails"), so the
 * title and H1 stay aligned modulo casing. If the tag/use-case name already
 * ends with "Emails" (e.g., "Transactional Emails"), we strip the duplicate
 * suffix so we don't get "Transactional Emails Emails".
 */
export function composeHubPageTitle(tagName: string, count: number): string {
  const trimmed = trimEmailSuffix(tagName);
  const fullSuffix = ` Emails — ${count} from Real SaaS Brands | DigiStorms`;
  const compactSuffix = ` Emails (${count}) | DigiStorms`;
  const full = `${trimmed}${fullSuffix}`;
  if (full.length <= 70) return full;
  return `${trimmed}${compactSuffix}`;
}
