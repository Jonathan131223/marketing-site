/**
 * Regression test for ISSUE-001 (QA 2026-04-10).
 *
 * Bug: EmailGeneratorApp mounted without a HelmetProvider, but
 * UseCasePickerPage rendered <Helmet> from react-helmet-async, which called
 * .add() on an undefined context and crashed the entire island. The
 * /email-generator page shipped blank to production for an unknown window.
 *
 * The fix for ISSUE-005 ultimately removed <Helmet> entirely and uses
 * Astro's BaseLayout as the single source of truth for meta tags. Either
 * approach must keep the picker rendering — this test guards both.
 *
 * If you ever re-add a React component to the email generator that touches
 * document.head (react-helmet-async, react-helmet, @vueuse/head-like lib),
 * this test must still pass. Options:
 *   (a) re-add HelmetProvider to EmailGeneratorApp, or
 *   (b) stop touching document.head from React and keep Astro as SoT.
 *
 * Report: .gstack/qa-reports/qa-report-digistorms-ai-2026-04-10.md
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import EmailGeneratorApp from "@/components/react/EmailGeneratorApp";

// jsdom has no matchMedia — several UI primitives (Radix, toasts) call it
// during mount. Stub it so the island can hydrate in tests.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Route pushed before mount — react-router's BrowserRouter reads location.
function setPath(pathname: string) {
  window.history.replaceState({}, "", pathname);
}

describe("EmailGeneratorApp — ISSUE-001 regression", () => {
  it("renders the use case picker at /email-generator without throwing", async () => {
    setPath("/email-generator");

    expect(() => {
      render(<EmailGeneratorApp initialPath="/email-generator" />);
    }).not.toThrow();

    // The picker is lazy-loaded; wait for its H1 to appear.
    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", {
            level: 1,
            name: /lifecycle email generator/i,
          }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // All 6 category tabs are in the DOM at once (tab bar, not accordion).
    // If the React tree crashed on mount (ISSUE-001), none would exist.
    expect(
      screen.getByRole("tab", { name: /activation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /engagement/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /expansion/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /churn prevention/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /community/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /content & pr/i }),
    ).toBeInTheDocument();

    // Activation must be selected by default so the user sees 8 use cases
    // above the fold without having to click anything (the reason for the
    // redesign from the old accordion that hid everything).
    const activationTab = screen.getByRole("tab", { name: /activation/i });
    expect(activationTab).toHaveAttribute("aria-selected", "true");

    // All 8 Activation use cases are visible in the active tab panel.
    const panel = screen.getByRole("tabpanel");
    expect(panel).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /welcome new free users/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /activate free trialists/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /nurture lost trialists/i }),
    ).toBeInTheDocument();
  });

  it("switches the active panel when a different category tab is clicked", async () => {
    setPath("/email-generator");

    const user = userEvent.setup();
    render(<EmailGeneratorApp initialPath="/email-generator" />);

    // Wait for hydration + first panel
    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: /welcome new free users/i }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Activation content is visible first
    expect(
      screen.getByRole("button", { name: /welcome new free users/i }),
    ).toBeInTheDocument();
    // Engagement content is not yet visible
    expect(
      screen.queryByRole("button", { name: /onboard new paid users/i }),
    ).not.toBeInTheDocument();

    // Click the Engagement tab
    await user.click(screen.getByRole("tab", { name: /engagement/i }));

    // Engagement selected, panel content swapped
    expect(
      screen.getByRole("tab", { name: /engagement/i }),
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("tab", { name: /activation/i }),
    ).toHaveAttribute("aria-selected", "false");
    expect(
      screen.getByRole("button", { name: /onboard new paid users/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /welcome new free users/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the brief empty state at /email-generator/brief when no use case is selected", async () => {
    setPath("/email-generator/brief");

    expect(() => {
      render(<EmailGeneratorApp initialPath="/email-generator/brief" />);
    }).not.toThrow();

    // Empty state heading renders. ISSUE-004 (2026-04-10) — this used to
    // silently navigate to the picker. Now it shows an explicit empty state
    // with a step-specific prompt.
    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", {
            level: 1,
            name: /pick a use case first/i,
          }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Step-specific prompt
    expect(
      screen.getByText(/to fill out the brief/i),
    ).toBeInTheDocument();

    // CTA button that links back to the picker
    const cta = screen.getByRole("link", { name: /go to use case picker/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/email-generator");
  });

  it("renders the customize empty state with its own step-specific prompt", async () => {
    setPath("/email-generator/customize");

    render(<EmailGeneratorApp initialPath="/email-generator/customize" />);

    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", {
            level: 1,
            name: /pick a use case first/i,
          }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Each step has unique copy — this is what makes the 4 sub-routes
    // non-duplicate for SEO.
    expect(
      screen.getByText(/to customize your email/i),
    ).toBeInTheDocument();
  });
});
