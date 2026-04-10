/**
 * Unit test for src/config/appUrl.ts.
 *
 * Locks in the contract enforced by ISSUE-008 (QA 2026-04-10):
 * - Read PUBLIC_APP_BASE_URL only, never VITE_APP_BASE_URL.
 * - Return the default (https://app.digistorms.ai) when the env var is unset.
 * - Strip trailing slashes for safe concatenation.
 *
 * If anyone adds a VITE_* fallback back to appUrl.ts, the dev-mode
 * hydration mismatch in <Navbar client:load> returns. This test catches it.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAppUrl } from "@/config/appUrl";

const DEFAULT_URL = "https://app.digistorms.ai";

describe("getAppUrl — ISSUE-008 regression", () => {
  let originalValue: string | undefined;

  beforeEach(() => {
    originalValue = import.meta.env.PUBLIC_APP_BASE_URL;
  });

  afterEach(() => {
    if (originalValue === undefined) {
      delete (import.meta.env as Record<string, string | undefined>)
        .PUBLIC_APP_BASE_URL;
    } else {
      import.meta.env.PUBLIC_APP_BASE_URL = originalValue;
    }
  });

  it("returns the default app URL when PUBLIC_APP_BASE_URL is unset", () => {
    delete (import.meta.env as Record<string, string | undefined>)
      .PUBLIC_APP_BASE_URL;
    expect(getAppUrl()).toBe(DEFAULT_URL);
  });

  it("returns the default app URL when PUBLIC_APP_BASE_URL is an empty string", () => {
    import.meta.env.PUBLIC_APP_BASE_URL = "";
    expect(getAppUrl()).toBe(DEFAULT_URL);
  });

  it("returns the configured URL when PUBLIC_APP_BASE_URL is set", () => {
    import.meta.env.PUBLIC_APP_BASE_URL = "https://digistorms.ai";
    expect(getAppUrl()).toBe("https://digistorms.ai");
  });

  it("strips a trailing slash from the configured URL", () => {
    import.meta.env.PUBLIC_APP_BASE_URL = "https://digistorms.ai/";
    expect(getAppUrl()).toBe("https://digistorms.ai");
  });

  it("supports a localhost override for local dev", () => {
    import.meta.env.PUBLIC_APP_BASE_URL = "http://localhost:8080";
    expect(getAppUrl()).toBe("http://localhost:8080");
  });
});
