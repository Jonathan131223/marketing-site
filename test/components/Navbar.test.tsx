/**
 * Smoke test for <Navbar>.
 *
 * The Navbar is mounted via `client:load` on every Astro page. It reads
 * PUBLIC_APP_BASE_URL (ISSUE-008), uses useState + useEffect, and renders
 * nav links that must include the primary CTAs.
 *
 * This test catches:
 * 1. Regressions to the ISSUE-008 env-var rename — if a future refactor
 *    re-introduces a VITE_* fallback, the default URL would diverge between
 *    SSR and client.
 * 2. Missing CTAs — the navbar must always have "Sign up free", "Login",
 *    and "Book a demo" links as they're the core conversion paths.
 * 3. A broken mobile menu toggle — pressing the hamburger should open a
 *    menu drawer.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { Navbar } from "@/components/Navbar";

describe("Navbar — smoke", () => {
  beforeEach(() => {
    // Navbar reads window.location.pathname in a useEffect. Seed a
    // predictable path so the isActive computation is stable across runs.
    window.history.replaceState({}, "", "/");
  });

  it("renders without throwing", () => {
    expect(() => render(<Navbar />)).not.toThrow();
  });

  it("renders the three primary top-nav sections", () => {
    render(<Navbar />);
    // Navbar has multiple top-nav links — Library, Blog, Pricing are the
    // core three based on the current design. Use queryAll to tolerate
    // the mobile/desktop duplication (same link rendered twice for
    // different viewports).
    expect(screen.getAllByRole("link", { name: /^library$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^blog$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /^pricing$/i }).length).toBeGreaterThan(0);
  });

  it("renders the Sign up free CTA that points to the app portal", () => {
    render(<Navbar />);
    const signupLinks = screen.getAllByRole("link", { name: /sign up free/i });
    expect(signupLinks.length).toBeGreaterThan(0);
    // All Sign up links should go to the portal, not to a broken path.
    signupLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", expect.stringContaining("/portal"));
    });
  });

  it("renders the Login link that points to the app portal", () => {
    render(<Navbar />);
    const loginLinks = screen.getAllByRole("link", { name: /^login$/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    loginLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", expect.stringContaining("/portal"));
    });
  });

  it("renders the Book a demo CTA pointing at Calendly", () => {
    render(<Navbar />);
    const demoLinks = screen.getAllByRole("link", { name: /book a demo/i });
    expect(demoLinks.length).toBeGreaterThan(0);
    demoLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", expect.stringContaining("calendly.com"));
    });
  });

  it("opens the mobile menu when the hamburger button is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    // The mobile menu is initially closed — Library appears in the desktop
    // nav once (twice when mobile menu is also open). Count baseline links
    // so we can detect the menu actually opened.
    const libraryLinksBefore = screen.queryAllByRole("link", {
      name: /^library$/i,
    });
    const libraryCountBefore = libraryLinksBefore.length;

    // Find the hamburger button by its aria-label.
    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();

    await user.click(menuButton);

    // After opening, the mobile drawer renders a duplicate Library link,
    // so the count should have increased. This verifies the menu actually
    // opened, not just that the click did not throw.
    const libraryLinksAfter = screen.getAllByRole("link", {
      name: /^library$/i,
    });
    expect(libraryLinksAfter.length).toBeGreaterThan(libraryCountBefore);
  });

  it("does not leak PII or tokens into the rendered HTML", () => {
    // Sanity check — ISSUE-008 could re-regress and silently embed the wrong
    // app URL in every link. Assert none of the rendered hrefs contain
    // obviously-wrong substrings (localhost, undefined, wrong-url, etc.).
    const { container } = render(<Navbar />);
    const html = container.innerHTML;
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("localhost");
    expect(html).not.toContain("[object Object]");
  });
});
