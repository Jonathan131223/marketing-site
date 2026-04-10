/**
 * Privacy regression test for `useStateRestoration`.
 *
 * This is a security-relevant test. `useStateRestoration` used to fire 8
 * `console.log` statements on every email generator page mount, and some
 * of those logs dumped the full brief data (companyName, productName,
 * senderName) + email HTML from localStorage. Browser extensions that hook
 * console.log can scrape customer-provided PII out of a production browser.
 *
 * The fix wraps each log behind a `devLog` helper gated on
 * `import.meta.env.DEV`. This test asserts:
 *   1. In prod mode (DEV=false), `console.log` is called ZERO times
 *      during state restoration, regardless of what was in localStorage.
 *   2. In dev mode (DEV=true), `console.log` is still called so local
 *      developers retain the debugging affordance.
 *
 * If a future refactor re-inlines a bare `console.log`, this test fails
 * immediately in prod mode.
 */
import { render, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StoreProvider } from "@/store/context";
import { useStateRestoration } from "@/hooks/useStateRestoration";
import { StatePersistence } from "@/store/persistence";

// Minimal consumer component that invokes the hook so React has a host
// tree to render. The hook does its work in a useEffect on mount.
function Harness() {
  useStateRestoration({});
  return null;
}

function renderInProvider() {
  return render(
    <StoreProvider>
      <Harness />
    </StoreProvider>,
  );
}

// Seed localStorage with enough state to make the hook actually run its
// restoration codepath (not the "no persisted state" early return).
function seedPersistedState() {
  const workflowState = {
    currentStep: "brief",
    selectedCategory: "activation",
    selectedUseCase: "welcome",
    briefData: null,
    selectedEmail: null,
    templateTweaks: null,
  };
  localStorage.setItem(
    "digistorms-workflow-state",
    JSON.stringify(workflowState),
  );
}

describe("useStateRestoration — privacy gate", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
    errorSpy.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.clear();
  });

  it("calls console.log ZERO times in production mode even with persisted state present", async () => {
    vi.stubEnv("DEV", false);
    seedPersistedState();

    await act(async () => {
      renderInProvider();
      // Let effects flush.
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it("calls console.log ZERO times in production mode with NO persisted state", async () => {
    vi.stubEnv("DEV", false);
    // Confirm there's nothing in localStorage.
    expect(StatePersistence.hasPersistedState()).toBe(false);

    await act(async () => {
      renderInProvider();
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it("still calls console.log in dev mode so developers retain the affordance", async () => {
    vi.stubEnv("DEV", true);
    seedPersistedState();

    await act(async () => {
      renderInProvider();
      await new Promise((r) => setTimeout(r, 0));
    });

    // At least the "Checking for persisted state..." call should have fired.
    expect(logSpy).toHaveBeenCalled();
  });
});
