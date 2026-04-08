import { Fragment, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { BrandInspirationSection } from "@/components/homepage/BrandInspirationSection";
import { BenefitsSection } from "@/components/homepage/BenefitsSection";
import { ROISectionHomepage } from "@/components/homepage/ROISectionHomepage";
import { FAQSection } from "@/components/homepage/FAQSection";
import { FounderStorySection } from "@/components/homepage/FounderStorySection";
import { OnboardingPainSection } from "@/components/homepage/OnboardingPainSection";
import { ComparisonSection } from "@/components/homepage/ComparisonSection";
import { Footer } from "@/components/Footer";
import { RebuildNoticeModal } from "@/components/RebuildNoticeModal";
import { TestimonialSection } from "@/components/homepage/TestimonialSection";
import { WebsiteStep } from "@/components/lifecycle/BriefWizard/WebsiteStep";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";

const Index = () => {
  const [heroWebsiteUrl, setHeroWebsiteUrl] = useState("");
  const [sequenceWebsiteUrl, setSequenceWebsiteUrl] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [rebuildModalOpen, setRebuildModalOpen] = useState(false);
  const pendingHrefRef = useRef<string | null>(null);

  const queueAppRedirect = (href: string) => {
    pendingHrefRef.current = href;
    setRebuildModalOpen(true);
  };

  const closeRebuildModal = () => {
    setRebuildModalOpen(false);
    pendingHrefRef.current = null;
  };

  const continueToApp = () => {
    const h = pendingHrefRef.current;
    if (h) window.location.href = h;
  };

  const redirectToAnalyze = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      const normalized = normalizeWebsiteUrl(trimmed);
      queueAppRedirect(
        appUrl(`/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`)
      );
    } catch {
      queueAppRedirect(appUrl("/email-sequence-generator"));
    }
  };

  const handleHeroSubmit = () => redirectToAnalyze(heroWebsiteUrl);

  const handleSequenceWebsiteAnalyze = () => {
    const trimmed = sequenceWebsiteUrl.trim();
    if (!trimmed) return;
    setAnalysisError(null);
    try {
      const normalized = normalizeWebsiteUrl(trimmed);
      queueAppRedirect(
        appUrl(`/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`)
      );
    } catch {
      setAnalysisError("Failed to open. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>DigiStorms.ai - AI Agent for Onboarding Emails</title>
        <meta name="description" content="DigiStorms is your AI agent for onboarding emails. It analyzes your product, maps the user journey, and builds a full lifecycle email system — automatically." />
        <link rel="canonical" href="https://www.digistorms.ai/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="DigiStorms.ai - AI Agent for Onboarding Emails" />
        <meta property="og:description" content="DigiStorms is your AI agent for onboarding emails. It analyzes your product, maps the user journey, and builds a full lifecycle email system — automatically." />
        <meta property="og:url" content="https://www.digistorms.ai/" />
        <meta property="og:image" content="https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DigiStorms.ai - AI Agent for Onboarding Emails" />
        <meta name="twitter:description" content="DigiStorms is your AI agent for onboarding emails. Analyzes your product and builds a full lifecycle email system automatically." />
        <meta name="twitter:image" content="https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
        <meta property="og:site_name" content="DigiStorms" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:site" content="@digistorms_ai" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DigiStorms",
          "url": "https://www.digistorms.ai",
          "description": "AI agent for onboarding emails",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.digistorms.ai/library?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "DigiStorms",
          "url": "https://www.digistorms.ai",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png",
            "width": 1200,
            "height": 630
          },
          "description": "AI agent that builds lifecycle email systems for SaaS companies",
          "founder": {
            "@type": "Person",
            "name": "Jonathan Bernard",
            "url": "https://www.linkedin.com/in/jonathan-digistorms/"
          },
          "sameAs": [
            "https://www.linkedin.com/company/digi-storms/",
            "https://x.com/digistorms_ai"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "url": "https://www.digistorms.ai/contact"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "DigiStorms",
          "url": "https://www.digistorms.ai",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "AI lifecycle email generator for SaaS companies. Analyzes your product and creates behavior-based onboarding and retention email sequences automatically.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })}</script>
      </Helmet>
      <Navbar />
      <main>
        <HeroSection
          websiteUrl={heroWebsiteUrl}
          onWebsiteUrlChange={setHeroWebsiteUrl}
          onSubmit={handleHeroSubmit}
        />
        <OnboardingPainSection />
        <ComparisonSection />
        <BenefitsSection />
        <TestimonialSection />
        <BrandInspirationSection />
        <ROISectionHomepage onBeforeNavigateToApp={queueAppRedirect} />
        <FounderStorySection />
        <FAQSection />

        <section id="email-sequence-generator-section" className="py-16 md:py-20 lg:py-24 container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
                Turn free users into paying customers automatically
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
                Enter your website and our agent will generate your onboarding sequence in minutes.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 mb-12">
              <div className="flex items-center justify-center gap-2">
                {[
                  { label: "Website" },
                  { label: "Logo" },
                  { label: "Brief" },
                  { label: "Generate" },
                ].map((step, index) => (
                  <Fragment key={index}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                          index === 0
                            ? "bg-primary border-primary text-white ring-4 ring-primary/20"
                            : "bg-white border-primary/40 text-primary/60"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`mt-2 text-sm ${
                          index === 0 ? "text-slate-900 font-medium" : "text-slate-600"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < 3 && (
                      <div className="w-8 sm:w-16 h-0.5 mt-[-20px] bg-primary/20" />
                    )}
                  </Fragment>
                ))}
              </div>
              <p className="text-sm text-slate-600">Step 1 starts here — the rest continues in the app</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <WebsiteStep
                websiteUrl={sequenceWebsiteUrl}
                onWebsiteUrlChange={setSequenceWebsiteUrl}
                onAnalyze={handleSequenceWebsiteAnalyze}
                isAnalyzing={false}
                error={analysisError}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <RebuildNoticeModal
        open={rebuildModalOpen}
        onClose={closeRebuildModal}
        onContinue={continueToApp}
      />
    </div>
  );
};

export default Index;
