import { Fragment, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { BrandInspirationSection } from "@/components/homepage/BrandInspirationSection";
import { BenefitsSection } from "@/components/homepage/BenefitsSection";
import { ROISectionHomepage } from "@/components/homepage/ROISectionHomepage";
import { FAQSection } from "@/components/homepage/FAQSection";
import { FounderStorySection } from "@/components/homepage/FounderStorySection";
import { OnboardingPainSection } from "@/components/homepage/OnboardingPainSection";
import { Footer } from "@/components/Footer";
import { TestimonialSection } from "@/components/homepage/TestimonialSection";
import { WebsiteStep } from "@/components/lifecycle/BriefWizard/WebsiteStep";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";

const Index = () => {
  const [heroWebsiteUrl, setHeroWebsiteUrl] = useState("");
  const [sequenceWebsiteUrl, setSequenceWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const redirectToAnalyze = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      const normalized = normalizeWebsiteUrl(trimmed);
      window.location.href = appUrl(`/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`);
    } catch {
      window.location.href = appUrl("/email-sequence-generator");
    }
  };

  const handleHeroSubmit = () => redirectToAnalyze(heroWebsiteUrl);

  const handleSequenceWebsiteAnalyze = () => {
    const trimmed = sequenceWebsiteUrl.trim();
    if (!trimmed) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const normalized = normalizeWebsiteUrl(trimmed);
      window.location.href = appUrl(`/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`);
    } catch {
      setAnalysisError("Failed to open. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection
        websiteUrl={heroWebsiteUrl}
        onWebsiteUrlChange={setHeroWebsiteUrl}
        onSubmit={handleHeroSubmit}
      />
      <OnboardingPainSection />
      <BenefitsSection />
      <TestimonialSection />
      <BrandInspirationSection />
      <ROISectionHomepage />
      <FounderStorySection />
      <FAQSection />

      <section id="email-sequence-generator-section" className="py-16 md:py-20 lg:py-24 container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Turn more free users into paying customers automatically
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
              Enter your website and our agent will generate your onboarding sequence in minutes.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-12">
            {[
              { label: "Website" },
              { label: "Logo" },
              { label: "Brief" },
              { label: "Generate" },
            ].map((step, index) => (
              <Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      index === 0
                        ? "bg-primary text-white ring-4 ring-primary/20"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      index === 0 ? "text-slate-900 font-medium" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className="w-8 sm:w-16 h-0.5 mt-[-20px] bg-slate-200" />
                )}
              </Fragment>
            ))}
          </div>
          <div className="max-w-2xl mx-auto">
            <WebsiteStep
              websiteUrl={sequenceWebsiteUrl}
              onWebsiteUrlChange={setSequenceWebsiteUrl}
              onAnalyze={handleSequenceWebsiteAnalyze}
              isAnalyzing={isAnalyzing}
              error={analysisError}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
