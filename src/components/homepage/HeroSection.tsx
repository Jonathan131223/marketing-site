import React from "react";

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
    <section className="pt-20 pb-16 md:pb-40 bg-[#FFFFFF] min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-slate-900 mb-6 leading-tight">
            Turn more free users into paying customers{" "}
            <span className="italic" style={{ color: "#1D4ED8" }}>automatically</span>
          </h1>

          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            DigiStorms is an AI onboarding agent. It tracks user behavior, sends the right emails at the right time, and automatically moves users from signup to paid.
          </p>

          <div className="max-w-md mx-auto space-y-3">
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => onWebsiteUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="website.com"
              aria-label="Your website URL"
              className="w-full px-5 py-4 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-lg shadow-sm bg-white"
            />
            <button
              onClick={onSubmit}
              disabled={!websiteUrl.trim()}
              data-flat-purple
              style={{
                backgroundColor: "#1D4ED8",
                boxShadow: "none",
                outline: "none",
                border: "none",
              }}
              className="w-full text-white px-8 py-4 rounded-xl font-semibold text-lg disabled:cursor-not-allowed"
            >
              Generate my onboarding emails
            </button>
            <p className="text-sm text-slate-500 text-center">100 onboarded users free. No card required.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
