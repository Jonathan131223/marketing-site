/**
 * Smoke test for <Footer>.
 *
 * The Footer is used on every email generator page. It imports Link from
 * react-router-dom, so it MUST be inside a BrowserRouter/MemoryRouter to
 * render without throwing. This test catches two failure modes:
 *
 * 1. A future refactor that removes the BrowserRouter wrapper from
 *    EmailGeneratorApp would make Footer crash on mount.
 * 2. A dead/broken link in the footer would surface here rather than in prod.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { Footer } from "@/components/Footer";

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer — smoke", () => {
  it("renders without throwing when mounted inside a router", () => {
    expect(() => renderFooter()).not.toThrow();
  });

  it("renders the DigiStorms logo with correct alt text", () => {
    renderFooter();
    expect(screen.getByAltText("DigiStorms")).toBeInTheDocument();
  });

  it("renders the tagline that matches the homepage headline", () => {
    renderFooter();
    expect(
      screen.getByText(/turn free users into paying customers, on autopilot/i),
    ).toBeInTheDocument();
  });

  it("renders the 5 category headings expected from DESIGN.md", () => {
    renderFooter();
    // Footer has 5 sections: Library, Product, Resources, Compare, Company.
    expect(screen.getByRole("heading", { name: /library/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /product/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /resources/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /compare/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /company/i })).toBeInTheDocument();
  });

  it("renders external social links with correct accessibility labels", () => {
    renderFooter();
    const twitter = screen.getByRole("link", {
      name: /digistorms on x \(twitter\)/i,
    });
    const linkedin = screen.getByRole("link", {
      name: /digistorms on linkedin/i,
    });
    expect(twitter).toHaveAttribute("href", "https://x.com/digistorms_ai");
    expect(linkedin).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/digi-storms/",
    );
    // Both should open in a new tab with safe rel.
    expect(twitter).toHaveAttribute("target", "_blank");
    expect(twitter).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("links the tagline-level logo to the root domain", () => {
    renderFooter();
    // The logo img has alt="DigiStorms", wrapped in an <a href="https://digistorms.ai">.
    // Multiple links match /digistorms/i (social links, comparison pages,
    // footer tagline link) so query by the specific wrapped image instead.
    const logo = screen.getByAltText("DigiStorms");
    const logoLink = logo.closest("a");
    expect(logoLink).not.toBeNull();
    expect(logoLink).toHaveAttribute("href", "https://digistorms.ai");
  });
});
