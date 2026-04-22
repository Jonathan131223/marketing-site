/**
 * HomepageIsland — React islands for interactive homepage sections.
 * Direct redirect (no modal). Each section is a separate island for Astro hydration.
 *
 * Sections:
 * - "hero"        -> HeroSection + HeroIllustration    (client:load)
 * - "how-it-works" -> HowItWorksSection                (client:visible)
 * - "comparison"  -> ComparisonSection                  (client:visible)
 * - "benefits"    -> BenefitsSection                    (client:visible)
 * - "testimonial" -> TestimonialSection                 (client:visible)
 * - "faq"         -> FAQSection                         (client:visible)
 * - "final-cta"   -> FinalCTASection                    (client:visible)
 */
import { useState } from "react";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { ComparisonSection } from "@/components/homepage/ComparisonSection";
import { BenefitsSection } from "@/components/homepage/BenefitsSection";
import { TestimonialSection } from "@/components/homepage/TestimonialSection";
import { FAQSection } from "@/components/homepage/FAQSection";
import { FinalCTASection } from "@/components/homepage/FinalCTASection";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";
import { track } from "@/lib/analytics";
import { appendUtmsToUrl } from "@/lib/posthog";

interface HomepageIslandProps {
  section: "hero" | "how-it-works" | "comparison" | "benefits" | "testimonial" | "faq" | "final-cta";
}

function directRedirect(rawUrl: string, pageSection: "hero" | "final-cta") {
  const trimmed = rawUrl.trim();
  if (!trimmed) return;

  let normalized: string | null = null;
  try {
    normalized = normalizeWebsiteUrl(trimmed);
  } catch {
    normalized = null;
  }

  track.urlSubmitted({
    page_section: pageSection,
    raw_url: trimmed,
    normalized_url: normalized,
    is_valid: normalized !== null,
  });

  const target = normalized
    ? appUrl(`/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`)
    : appUrl("/email-sequence-generator");

  window.location.href = appendUtmsToUrl(target);
}

function HeroIsland() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  return (
    <HeroSection
      websiteUrl={websiteUrl}
      onWebsiteUrlChange={setWebsiteUrl}
      onSubmit={() => directRedirect(websiteUrl, "hero")}
    />
  );
}

function FinalCTAIsland() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  return (
    <FinalCTASection
      websiteUrl={websiteUrl}
      onWebsiteUrlChange={setWebsiteUrl}
      onSubmit={() => directRedirect(websiteUrl, "final-cta")}
    />
  );
}

export default function HomepageIsland({ section }: HomepageIslandProps) {
  switch (section) {
    case "hero":
      return <HeroIsland />;
    case "how-it-works":
      return <HowItWorksSection />;
    case "comparison":
      return <ComparisonSection />;
    case "benefits":
      return <BenefitsSection />;
    case "testimonial":
      return <TestimonialSection />;
    case "faq":
      return <FAQSection />;
    case "final-cta":
      return <FinalCTAIsland />;
    default:
      return null;
  }
}
