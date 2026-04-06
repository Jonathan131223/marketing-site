import React, { useState } from "react";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";

const steps = [
  { number: 1, title: "Add your website", description: "Drop your URL and logo. We analyze your product, identify key activation milestones, and generate a complete onboarding sequence designed to convert new users into paying customers." },
  { number: 2, title: "Refine your emails", description: "Edit subject lines, messaging, and CTAs in a clean editor. Align everything with your product while keeping the structure optimized for activation and upgrade." },
  { number: 3, title: "Launch and monitor", description: "Connect your domain and send user events. DigiStorms runs your onboarding automatically and shows you how users move from signup to paid." },
];

export const HowItWorksSection: React.FC = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setIsLoading(true);
    try {
      const normalized = normalizeWebsiteUrl(trimmed);
      const target = `${appUrl("/email-sequence-generator")}?analyze=1&url=${encodeURIComponent(normalized)}`;
      window.location.href = target;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-32 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-10 md:mb-20">
          <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-4">How it works</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
            Drive more paid users in 3 steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-12 mb-10 md:mb-20">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 p-6 md:p-8 group"
            >
              <div className="relative mb-6 inline-flex">
                <div className="w-11 h-11 bg-[#1D4ED8] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/25">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto text-center">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="website.com"
              className="w-full px-5 py-4 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-lg shadow-sm bg-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Generate my onboarding emails"
              )}
            </button>
          </form>
          <p className="mt-3 text-sm text-slate-400">100 onboarded users free. No card required.</p>
        </div>
      </div>
    </section>
  );
};
