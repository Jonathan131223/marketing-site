import React from "react";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";
import mascotImage from "@/assets/mascots/home.png";

interface HeroSectionProps {
  websiteUrl: string;
  onWebsiteUrlChange: (url: string) => void;
  onSubmit: () => void;
  isAnalyzing?: boolean;
  error?: string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  websiteUrl,
  onWebsiteUrlChange,
  onSubmit,
  isAnalyzing = false,
  error = null,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isAnalyzing) onSubmit();
  };

  return (
    <section className="relative pt-20 pb-16 md:pb-40 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-32 right-20 w-4 h-4 bg-purple-300/40 rotate-45 animate-bounce delay-500" />
        <div className="absolute top-48 left-20 w-3 h-3 bg-blue-300/40 rotate-45 animate-bounce delay-700" />
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-cyan-300/40 rotate-45 animate-bounce delay-300" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-purple-200/30 via-transparent to-transparent transform -translate-x-1/2" />
      </div>

      <div className="relative container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" />
            AI-powered email generation
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
            Turn more free users into paying customers automatically
          </h1>

          <p className="text-base sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            DigiStorms is your AI onboarding agent. It analyzes your product, builds your activation emails, and runs them based on real user behavior.
          </p>

          <div className="max-w-md mx-auto space-y-3">
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => onWebsiteUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="website.com"
              className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-lg shadow-sm bg-white"
            />
            <button
              onClick={onSubmit}
              disabled={!websiteUrl.trim() || isAnalyzing}
              className="w-full bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-all shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Generate my onboarding emails"
              )}
            </button>
            {error && <p className="text-sm text-red-600 text-center mt-1">{error}</p>}
            <p className="text-sm text-gray-500 text-center">100 onboarded users free. No card required.</p>
          </div>

          <div className="mt-12 flex justify-center xl:hidden">
            <img src={mascotImage} alt="DigiStorms Mascot" className="w-48 h-auto opacity-90" />
          </div>
        </div>

        <div className="hidden xl:block absolute bottom-[-20px] right-[120px] z-20 pointer-events-none max-w-[192px]">
          <img src={mascotImage} alt="DigiStorms Mascot" className="w-48 h-auto opacity-90" />
        </div>
      </div>
    </section>
  );
};
