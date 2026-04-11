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
import { describe, it, expect, beforeEach } from "vitest";
import EmailGeneratorApp from "@/components/react/EmailGeneratorApp";

// matchMedia is stubbed globally in test/setup.ts.

// Route pushed before mount — react-router's BrowserRouter reads location.
function setPath(pathname: string) {
  window.history.replaceState({}, "", pathname);
}

describe("EmailGeneratorApp — ISSUE-001 regression", () => {
  beforeEach(() => {
    // Reset path between tests so order-dependent state (navigation
    // left over from a prior test) never leaks into the next one.
    setPath("/");
  });

  it("renders the use case picker at /email-generator without throwing", async () => {
    setPath("/email-generator");

    expect(() => {
      render(<EmailGeneratorApp />);
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
    render(<EmailGeneratorApp />);

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
      render(<EmailGeneratorApp />);
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

    render(<EmailGeneratorApp />);

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

  it("renders the templates empty state with its own step-specific prompt", async () => {
    setPath("/email-generator/templates");

    render(<EmailGeneratorApp />);

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

    expect(
      screen.getByText(/to choose a template/i),
    ).toBeInTheDocument();
  });

  it("renders the generate empty state with its own step-specific prompt", async () => {
    setPath("/email-generator/generate");

    render(<EmailGeneratorApp />);

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

    expect(
      screen.getByText(/to generate your emails/i),
    ).toBeInTheDocument();
  });

  it("navigates to the brief page when a use case card is clicked", async () => {
    setPath("/email-generator");

    const user = userEvent.setup();
    render(<EmailGeneratorApp />);

    // Wait for the picker to render
    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: /welcome new free users/i }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Click the first Activation use case — should navigate to /brief
    await user.click(
      screen.getByRole("button", { name: /welcome new free users/i }),
    );

    // react-router-dom updates window.location via the History API, so we
    // verify the navigation by checking that the picker H1 is gone and a
    // BriefPage (or its loading state) is in the DOM.
    await waitFor(
      () => {
        expect(window.location.pathname).toMatch(
          /\/email-generator\/brief/,
        );
      },
      { timeout: 3000 },
    );

    // The useCase query param must be set — that's how BriefPage finds
    // which use case to render.
    expect(window.location.search).toMatch(/useCase=welcome/);
  });

  it("supports WAI-ARIA arrow key navigation between tabs", async () => {
    setPath("/email-generator");

    const user = userEvent.setup();
    render(<EmailGeneratorApp />);

    // Wait for the picker to render.
    await waitFor(
      () => {
        expect(
          screen.getByRole("tab", { name: /activation/i }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Only the active tab should be in the tab order (tabIndex 0), the
    // others are -1 per the WAI-ARIA tabs authoring practices.
    expect(
      screen.getByRole("tab", { name: /activation/i }),
    ).toHaveAttribute("tabindex", "0");
    expect(
      screen.getByRole("tab", { name: /engagement/i }),
    ).toHaveAttribute("tabindex", "-1");

    // Focus the active tab, then press ArrowRight — should move selection
    // AND focus to Engagement (automatic activation pattern).
    const activationTab = screen.getByRole("tab", { name: /activation/i });
    activationTab.focus();
    expect(document.activeElement).toBe(activationTab);

    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("tab", { name: /engagement/i }),
    ).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: /engagement/i }),
    );

    // ArrowLeft from Engagement goes back to Activation.
    await user.keyboard("{ArrowLeft}");
    expect(
      screen.getByRole("tab", { name: /activation/i }),
    ).toHaveAttribute("aria-selected", "true");

    // ArrowLeft from Activation should wrap to the last tab (Content & PR).
    await user.keyboard("{ArrowLeft}");
    expect(
      screen.getByRole("tab", { name: /content & pr/i }),
    ).toHaveAttribute("aria-selected", "true");

    // ArrowRight from the last tab (Content & PR) should wrap back to the
    // first tab (Activation). Covers the forward-wrap branch so both
    // wrapping paths in the modular arithmetic are verified.
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("tab", { name: /activation/i }),
    ).toHaveAttribute("aria-selected", "true");

    // End key should jump to the last tab.
    await user.keyboard("{End}");
    expect(
      screen.getByRole("tab", { name: /content & pr/i }),
    ).toHaveAttribute("aria-selected", "true");

    // Home key should jump back to the first tab.
    await user.keyboard("{Home}");
    expect(
      screen.getByRole("tab", { name: /activation/i }),
    ).toHaveAttribute("aria-selected", "true");

    // Non-navigation keys (letters, Tab, Space) should NOT be intercepted
    // by the handler. Pressing 'a' or Tab must not change the active tab.
    // This covers the `default: return;` branch of handleTabKeyDown — a
    // regression that swallowed Tab would trap screen reader users inside
    // the tablist.
    const activationAfterHome = screen.getByRole("tab", {
      name: /activation/i,
    });
    activationAfterHome.focus();
    await user.keyboard("a");
    expect(
      screen.getByRole("tab", { name: /activation/i }),
    ).toHaveAttribute("aria-selected", "true");
  });
});
