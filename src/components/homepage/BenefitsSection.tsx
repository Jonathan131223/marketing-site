import React from "react";

/* ── Illustration 1: User stalled → DigiStorms reacts ── */
const ILLUST_HEIGHT = "h-[160px]";

const BehaviorIllustration: React.FC = () => (
  <div className={`rounded-[10px] border border-slate-100 bg-slate-50/50 p-3 ${ILLUST_HEIGHT} flex flex-col justify-center`}>
    {/* User status */}
    <div className="bg-white rounded-md border border-slate-100 px-2.5 py-2 mb-2">
      <div className="flex items-center gap-2 mb-1.5">
        <img src="/images/avatar-hero.png" alt="Mike Taylor" className="w-5 h-5 rounded-full object-cover" decoding="async" />
        <span className="text-[9px] font-medium text-slate-800">Mike Taylor</span>
        <span className="text-[8px] text-slate-400 ml-auto">Day 4</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[7px]">&#10003;</div>
        <span className="text-[8px] text-slate-500">Dashboard created</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-600 text-[7px] font-bold">!</div>
        <span className="text-[8px] text-amber-600 font-medium">Invite teammate — stalled 2 days</span>
      </div>
    </div>
    {/* DigiStorms reaction */}
    <div className="bg-blue-50 rounded-md border border-blue-100 px-2.5 py-2">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[8px] font-semibold text-primary">DigiStorms</span>
      </div>
      <p className="text-[8px] text-slate-600">Sending nudge: "Quick tip: invite your team"</p>
    </div>
  </div>
);

/* ── Illustration 2: Funnel / drop-off visualization ── */
const FunnelIllustration: React.FC = () => (
  <div className={`rounded-[10px] border border-slate-100 bg-slate-50/50 p-3 ${ILLUST_HEIGHT} flex flex-col justify-center`}>
    <div className="space-y-2">
      {[
        { label: "Signed up", pct: 100, color: "bg-primary" },
        { label: "Milestone 1", pct: 64, color: "bg-primary" },
        { label: "Milestone 2", pct: 31, color: "bg-amber-400" },
        { label: "Upgraded", pct: 12, color: "bg-emerald-500" },
      ].map((step, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-slate-500">{step.label}</span>
            <span className="text-[9px] font-semibold text-slate-700">{step.pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${step.color} rounded-full`} style={{ width: `${step.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ── Illustration 3: Email editor preview ── */
const EditorIllustration: React.FC = () => (
  <div className={`rounded-[10px] border border-slate-100 bg-slate-50/50 p-3 ${ILLUST_HEIGHT} flex flex-col justify-center`}>
    <div className="bg-white rounded-md border border-slate-100 p-2.5">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
        <span className="text-[8px] text-slate-400">Subject:</span>
        <span className="text-[9px] font-medium text-slate-800">Welcome to Acme Analytics</span>
        <span className="ml-auto text-[8px] text-primary cursor-pointer">Edit</span>
      </div>
      <div className="space-y-1.5 text-[9px] text-slate-500 leading-relaxed">
        <p>Hey Mike,</p>
        <p>Thanks for signing up! Here's how to get started with your first dashboard...</p>
        <div className="flex items-center gap-1 mt-1">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[8px] text-primary bg-blue-50 px-1.5 py-0.5 rounded">Edit body</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between mt-2 text-[8px] text-slate-400">
      <span>Trigger: Signup</span>
      <span>Delay: Instant</span>
    </div>
  </div>
);

/* ── SVG Icons ── */
const BoltIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 1L3 12h5l-1 7 8-11h-5l1-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChartIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17V10M8 17V7M13 17V11M18 17V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const PenIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const benefits = [
  {
    icon: <BoltIcon />,
    title: "Reacts to users in real time",
    description: "Emails are triggered by what users actually do in your product, like signing up, hitting a milestone, or stalling.",
    illustration: <BehaviorIllustration />,
  },
  {
    icon: <ChartIcon />,
    title: "See where users drop off",
    description: "Track which users are stuck, which reached value, and which upgraded. Real visibility into your funnel.",
    illustration: <FunnelIllustration />,
  },
  {
    icon: <PenIcon />,
    title: "Every email, fully editable",
    description: "AI generates the first draft based on your product. You review the copy, make it yours, and go live when you're ready.",
    illustration: <EditorIllustration />,
  },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="py-12 bg-background-warm">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
            Key benefits
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 tracking-[-0.01em]">
            Built for how onboarding actually works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white rounded-[14px] border border-slate-200 shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:translate-y-[-4px] hover:border-blue-200 p-7 cursor-default"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[hsl(var(--primary-light))] text-primary flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-4">
                {benefit.description}
              </p>
              {benefit.illustration}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
