import React from "react";
import { X, Check } from "lucide-react";

const withoutItems = [
  "Manually write every onboarding email",
  "Same message for every user",
  "Weeks to launch a sequence",
  "No visibility into where users stall",
  "Users churn silently \u2014 no follow-up",
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
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
            The difference
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 tracking-[-0.01em]">
            What changes with DigiStorms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-[14px] p-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Without DigiStorms</p>
            <ul className="space-y-4">
              {withoutItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[hsl(var(--primary-light))] rounded-[14px] p-8 border-2 border-primary">
            <p className="text-xs font-semibold uppercase tracking-widest mb-6 text-primary">With DigiStorms</p>
            <ul className="space-y-4">
              {withItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
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
