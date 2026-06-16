import React from "react";
import { Check } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/jonathan-digistorms/30-min-call";

const platformFeatures = [
  "Turn new users into paying customers automatically",
  "Emails triggered by real user behavior",
  "See exactly where users drop off",
  "Improve activation without manual work",
];

const conciergeFeatures = [
  "Custom-crafted emails by lifecycle experts",
  "Complete lifecycle journey covered",
  "Unlimited revisions until you're happy",
  "Monthly strategy & consulting call",
  "Implementation into your email platform",
  "30-day money-back guarantee",
];

export default function PricingSelfServe() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Custom plans */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-2">Platform</p>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 tracking-[-0.01em] mb-5">Custom plans, from $299/mo</h2>
          <p className="text-slate-500 text-sm">Scoped to your signup volume and onboarding needs. Get an exact quote on a short demo call.</p>
        </div>

        {/* Features */}
        <div className="px-8 py-6 flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">What's included:</p>
          <ul className="space-y-3">
            {platformFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="px-8 pb-8">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 px-6 rounded-xl font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Book a demo
          </a>
        </div>
      </div>

      {/* Right: Done for you */}
      <div
        className="rounded-2xl shadow-sm flex flex-col overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1D4ED8 0%, #1E3A8A 100%)" }}
      >
        <div className="px-8 pt-8 pb-6 border-b border-white/10">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-white/70 mb-2">Done for you</p>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-[-0.01em] mb-1">Concierge</h2>
          <p className="text-white/60 text-sm">We create and run your emails for you</p>
        </div>

        {/* Features */}
        <div className="px-8 py-6 flex-1">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">What's included:</p>
          <ul className="space-y-3">
            {conciergeFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-white/60 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white/90">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="px-8 pb-8">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 px-6 rounded-xl font-semibold bg-white text-[#1D4ED8] hover:bg-white/90 transition-colors"
          >
            Book a demo
          </a>
        </div>
      </div>
    </div>
  );
}
