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
          <a
            href="https://calendly.com/jonathan-digistorms/30-min-call"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-[10px] font-semibold text-base hover:bg-[#1D4ED8] transition-colors"
          >
            Book a demo
          </a>
          <p className="text-sm text-slate-400 mt-3">
            A 20-minute walkthrough — we'll map onboarding to your funnel.
          </p>
        </div>
      </div>
    </section>
  );
};
