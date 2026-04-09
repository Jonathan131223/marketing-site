import React from "react";

interface FinalCTASectionProps {
  websiteUrl: string;
  onWebsiteUrlChange: (url: string) => void;
  onSubmit: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({
  websiteUrl,
  onWebsiteUrlChange,
  onSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 mb-6 leading-[1.15] tracking-[-0.01em]">
          Your users are signing up right now.<br />Are you onboarding them?
        </h2>
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
      </div>
    </section>
  );
};
