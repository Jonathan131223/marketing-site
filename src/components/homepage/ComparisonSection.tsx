import React from "react";
import { X, Check } from "lucide-react";

const withoutItems = [
  "Manually write every onboarding email",
  "Same message for every user",
  "Weeks to launch a sequence",
  "No visibility into where users stall",
  "Users churn silently — no follow-up",
];

const withItems = [
  "AI generates your full email sequence",
  "Behavior-triggered, personalized emails",
  "Go live in 5 minutes",
  "See exactly where users drop off",
  "Auto-nudge at the right moment",
];

export const ComparisonSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
            What changes with DigiStorms
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Stop building onboarding from scratch. Let AI do the heavy lifting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Without */}
          <div className="bg-slate-50 rounded-2xl p-8">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Without DigiStorms</p>
            <ul className="space-y-4">
              {withoutItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With */}
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <p className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: "#1D4ED8" }}>With DigiStorms</p>
            <ul className="space-y-4">
              {withItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#1D4ED8" }} />
                  <span className="text-slate-800 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
