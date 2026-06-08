/**
 * Regression tests for library page title composition.
 *
 * Context: Ahrefs site audit (2026-06-08) flagged 34 library email pages
 * with titles >60 chars. Root cause was a soft 20-char minimum on the
 * truncated subject in `composeEmailPageTitle`, which let the prefix +
 * minimum subject overshoot when the brand+tag combo was long. The fix
 * hard-caps every output at 60 chars and drops the subject (and the
 * trailing colon) when the prefix alone is over budget.
 *
 * These tests pin that behavior so a future "subject minimum" tweak can't
 * silently regress the SEO budget across 1,058 email pages.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  composeEmailPageTitle,
  composeHubPageTitle,
  trimEmailSuffix,
} from "@/utils/libraryKeywords";

const TITLE_BUDGET = 60;

describe("composeEmailPageTitle", () => {
  it("returns the natural title when within budget", () => {
    const t = composeEmailPageTitle("Loops", "Welcome", "Welcome to Loops");
    expect(t.length).toBeLessThanOrEqual(TITLE_BUDGET);
    expect(t).toContain("Welcome email example — Loops");
    expect(t).toContain('"Welcome to Loops"');
  });

  it("truncates a long subject at a word boundary with an ellipsis", () => {
    const t = composeEmailPageTitle(
      "Calendly",
      "Re-Engage",
      "We noticed you have not booked a meeting in a while — here is what is new",
    );
    expect(t.length).toBeLessThanOrEqual(TITLE_BUDGET);
    expect(t.endsWith('…"')).toBe(true);
  });

  it("drops the subject entirely when the prefix alone is over budget", () => {
    // Long tag + long brand → prefix overshoots; subject must be dropped
    // and the trailing ": " must go too so we don't end with a dangling colon.
    const t = composeEmailPageTitle(
      "Phantom Busters",
      "Email Verification",
      "Activate your account in three steps",
    );
    expect(t.length).toBeLessThanOrEqual(TITLE_BUDGET);
    expect(t).not.toMatch(/: ?$/); // no trailing colon
  });

  it("never exceeds the hard cap across the entire email library", () => {
    const root = path.resolve(__dirname, "../..");
    const emails = JSON.parse(
      readFileSync(`${root}/public/data/library/emails.json`, "utf8"),
    );
    const brands = JSON.parse(
      readFileSync(`${root}/public/data/library/brands.json`, "utf8"),
    );
    const tags = JSON.parse(
      readFileSync(`${root}/public/data/library/tags.json`, "utf8"),
    );
    const usecases = JSON.parse(
      readFileSync(`${root}/public/data/library/usecases.json`, "utf8"),
    );

    const offenders: Array<{ slug: string; title: string; length: number }> = [];
    for (const e of emails) {
      const brand = brands.find((b: any) => b.slug === e.brand);
      const brandName = brand?.name ?? e.brand;
      const useCase = usecases.find((u: any) => u.slug === e.useCase);
      const primaryTagSlug = e.tags?.[0];
      const primaryTag = primaryTagSlug
        ? tags.find((t: any) => t.slug === primaryTagSlug)
        : null;
      const primaryTagName = trimEmailSuffix(
        primaryTag?.name ?? useCase?.name ?? "Lifecycle",
      );
      const subjectClean = String(e.subject || "").replace(/"/g, "").trim();
      const title = composeEmailPageTitle(brandName, primaryTagName, subjectClean);
      if (title.length > TITLE_BUDGET) {
        offenders.push({ slug: e.slug, title, length: title.length });
      }
    }

    // Surface the first few offenders if this ever regresses.
    expect(offenders.slice(0, 5)).toEqual([]);
  });
});

describe("composeHubPageTitle", () => {
  it("falls back to the compact form when over 70 chars", () => {
    const t = composeHubPageTitle(
      "Lengthy Tag Name That Pushes The Title Over",
      42,
    );
    expect(t.length).toBeLessThanOrEqual(80); // soft target
    expect(t).toContain("DigiStorms");
  });
});
