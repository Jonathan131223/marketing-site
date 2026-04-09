import React from "react";
import { HeroIllustration } from "./illustrations/HeroIllustration";

interface HeroSectionProps {
  websiteUrl: string;
  onWebsiteUrlChange: (url: string) => void;
  onSubmit: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  websiteUrl,
  onWebsiteUrlChange,
  onSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <section className="pt-24 pb-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
            AI Onboarding Agent for SaaS
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-serif text-slate-900 mb-4 leading-[1.1] tracking-[-0.02em]">
            Turn free users into paying customers,<br />
            <span className="italic text-primary">on autopilot</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-[640px] mx-auto">
            DigiStorms is your AI onboarding agent. It tracks user behavior<br className="hidden sm:inline" /> and sends the right emails at the right time.
          </p>

          <div className="max-w-[560px] mx-auto">
            <div className="flex flex-col sm:flex-row">
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => onWebsiteUrlChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="yourproduct.com"
                aria-label="Your website URL"
                className="flex-1 px-5 py-4 border-2 border-slate-200 sm:border-r-0 rounded-[10px] sm:rounded-r-none text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-primary focus:outline-none text-base bg-white transition-colors"
              />
              <button
                onClick={onSubmit}
                disabled={!websiteUrl.trim()}
                className="px-7 py-4 bg-primary text-white rounded-[10px] sm:rounded-l-none font-semibold text-base hover:bg-[#1D4ED8] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate my onboarding emails
              </button>
            </div>
            <p className="text-sm text-slate-400 mt-3">
              Free for your first 100 users. No card required.
            </p>
          </div>

          {/* Product illustration */}
          <div className="mt-10">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
};
