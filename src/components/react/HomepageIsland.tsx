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

interface HomepageIslandProps {
  section: "hero" | "how-it-works" | "comparison" | "benefits" | "testimonial" | "faq" | "final-cta";
}

function directRedirect(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return;
  try {
    const normalized = normalizeWebsiteUrl(trimmed);
    window.location.href = appUrl(
      `/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`
    );
  } catch {
    window.location.href = appUrl("/email-sequence-generator");
  }
}

function HeroIsland() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  return (
    <HeroSection
      websiteUrl={websiteUrl}
      onWebsiteUrlChange={setWebsiteUrl}
      onSubmit={() => directRedirect(websiteUrl)}
    />
  );
}

function FinalCTAIsland() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  return (
    <FinalCTASection
      websiteUrl={websiteUrl}
      onWebsiteUrlChange={setWebsiteUrl}
      onSubmit={() => directRedirect(websiteUrl)}
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
