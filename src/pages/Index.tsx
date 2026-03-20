import { useState, Fragment } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { BrandInspirationSection } from "@/components/homepage/BrandInspirationSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { ROISectionHomepage } from "@/components/homepage/ROISectionHomepage";
import { FAQSection } from "@/components/homepage/FAQSection";
import { FounderStorySection } from "@/components/homepage/FounderStorySection";
import { Footer } from "@/components/Footer";
import { TestimonialSection } from "@/components/homepage/TestimonialSection";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";
import { Sparkles, Check, Globe } from "lucide-react";

const BOTTOM_STEPS = [
  { label: "Website", completed: false },
  { label: "Logo", completed: false },
  { label: "Brief", completed: false },
  { label: "Generate", completed: false },
  { label: "Dashboard", completed: false },
];

const Index = () => {
  const [sequenceWebsiteUrl, setSequenceWebsiteUrl] = useState("");
  const [heroAnalyzing, setHeroAnalyzing] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [bottomWebsiteUrl, setBottomWebsiteUrl] = useState("");
  const [bottomAnalyzing, setBottomAnalyzing] = useState(false);
  const [bottomError, setBottomError] = useState<string | null>(null);

  // Navigate to app to run analysis there: app.digistorms.ai/email-sequence-generator?analyze=1&url=...
  const redirectToAnalyze = (url: string, setAnalyzing: (v: boolean) => void, setError: (v: string | null) => void) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setAnalyzing(true);
    setError(null);
    try {
      const normalized = normalizeWebsiteUrl(trimmed);
      const target = `${appUrl("/email-sequence-generator")}?analyze=1&url=${encodeURIComponent(normalized)}`;
      window.location.href = target;
    } catch {
      setError("Failed to open. Please try again.");
      setAnalyzing(false);
    }
  };

  const handleHeroSubmit = () => redirectToAnalyze(sequenceWebsiteUrl, setHeroAnalyzing, setHeroError);
  const handleBottomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    redirectToAnalyze(bottomWebsiteUrl, setBottomAnalyzing, setBottomError);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      <HeroSection
        websiteUrl={sequenceWebsiteUrl}
        onWebsiteUrlChange={setSequenceWebsiteUrl}
        onSubmit={handleHeroSubmit}
        isAnalyzing={heroAnalyzing}
        error={heroError}
      />
      <HowItWorksSection />
      <TestimonialSection />
      <BrandInspirationSection />
      <ROISectionHomepage />
      <FounderStorySection />
      <FAQSection />

      {/* Bottom CTA: Enter Your Website — drives traffic to generator */}
      <section id="email-sequence-generator-section" className="py-16 md:py-24 container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-6 text-center">
            Turn more free users into paying customers automatically
          </h3>
          <div className="flex items-center justify-center gap-2 mb-8">
            {BOTTOM_STEPS.map((step, index) => (
              <Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      index === 0 ? "bg-purple-600 text-white ring-4 ring-purple-100" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`mt-2 text-sm ${index === 0 ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                    {step.label}
                  </span>
                </div>
                {index < 4 && <div className="w-8 sm:w-16 h-0.5 mt-[-20px] bg-slate-200" />}
              </Fragment>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Enter Your Website</h4>
            <p className="text-sm text-gray-500 mb-6">We'll analyze your site to suggest personalized email content.</p>
            <form onSubmit={handleBottomSubmit} className="space-y-5">
              <div>
                <label htmlFor="bottom-website" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="bottom-website"
                    type="url"
                    value={bottomWebsiteUrl}
                    onChange={(e) => setBottomWebsiteUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="bg-purple-50/80 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">What we'll do:</p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    Extract your value proposition
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    Identify key features
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    Suggest onboarding actions
                  </li>
                </ul>
              </div>
              <button
                type="submit"
                disabled={!bottomWebsiteUrl.trim() || bottomAnalyzing}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bottomAnalyzing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Analyze Website →
                  </>
                )}
              </button>
            </form>
            {bottomError && <p className="mt-2 text-sm text-red-600 text-center">{bottomError}</p>}
            <p className="mt-3 text-xs text-gray-500 text-center">100 onboarded users free. No card required.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
