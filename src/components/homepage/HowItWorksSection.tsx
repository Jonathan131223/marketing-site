import React from "react";

/* ── Step 1 illustration: URL input → analysis → milestones detected ── */
const Step1Illustration: React.FC = () => (
  <div
    className="bg-white rounded-2xl border border-slate-100 p-5 transition-all duration-300 ease-out hover:translate-y-[-4px] hover:border-blue-200 cursor-default"
    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)" }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(37,99,235,0.1), 0 4px 12px rgba(0,0,0,0.04)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)"; }}
  >
    {/* URL input */}
    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200 mb-4">
      <span className="text-[10px] text-slate-400">https://</span>
      <span className="text-[13px] text-slate-800 font-medium">acmeanalytics.com</span>
      <span className="ml-auto text-[10px] text-primary font-medium bg-blue-50 px-2 py-0.5 rounded">Analyze</span>
    </div>
    {/* Analysis progress */}
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[11px] text-emerald-600 font-medium">Analysis complete</span>
    </div>
    {/* Detected milestones */}
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Detected milestones</p>
    <div className="space-y-1.5">
      {["Signup free trial", "1st Milestone: Create first dashboard", "2nd Milestone: Invite a teammate", "Upgrade to paid"].map((m, i) => (
        <div key={i} className="flex items-center gap-2 bg-slate-50/80 rounded-md px-3 py-1.5">
          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</div>
          <span className="text-[12px] text-slate-700">{m}</span>
          <span className="ml-auto text-[9px] text-emerald-500">&#10003;</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Step 2 illustration: Email sequence with subject lines ── */
const Step2Illustration: React.FC = () => (
  <div
    className="bg-white rounded-2xl border border-slate-100 p-5 transition-all duration-300 ease-out hover:translate-y-[-4px] hover:border-blue-200 cursor-default"
    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)" }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(37,99,235,0.1), 0 4px 12px rgba(0,0,0,0.04)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)"; }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[13px] font-semibold text-slate-900">Onboarding Sequence</span>
      <span className="text-[10px] text-primary font-medium bg-blue-50 px-2 py-0.5 rounded-full">7 emails</span>
    </div>
    <div className="space-y-1.5">
      {[
        { subject: "Welcome to Acme Analytics", status: "ready", trigger: "Signup" },
        { subject: "Get started with your first dashboard", status: "ready", trigger: "Nudge" },
        { subject: "Congrats on creating your first dashboard!", status: "draft", trigger: "Milestone 1" },
        { subject: "Your trial ends tomorrow", status: "draft", trigger: "Trial -1d" },
        { subject: "Upgrade to keep your progress", status: "draft", trigger: "Trial ending" },
      ].map((email, i) => (
        <div key={i} className="flex items-center gap-2.5 bg-slate-50/80 rounded-md px-3 py-2 border border-slate-100/60">
          <div className="w-5 h-5 rounded bg-blue-50 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            {i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-800 truncate">{email.subject}</p>
          </div>
          <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">{email.trigger}</span>
        </div>
      ))}
    </div>
    <p className="text-[10px] text-slate-400 mt-3">Click any email to edit subject, body, and timing</p>
  </div>
);

/* ── Step 3 illustration: Behavior triggers → emails firing ── */
const Step3Illustration: React.FC = () => (
  <div
    className="bg-white rounded-2xl border border-slate-100 p-5 transition-all duration-300 ease-out hover:translate-y-[-4px] hover:border-blue-200 cursor-default"
    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)" }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(37,99,235,0.1), 0 4px 12px rgba(0,0,0,0.04)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)"; }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[13px] font-semibold text-slate-900">Behavior Triggers</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-500">Mode:</span>
        <span className="text-[10px] font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded">Autopilot</span>
      </div>
    </div>
    <div className="space-y-2">
      {[
        { event: "user.signed_up", email: "Welcome email", status: "active" },
        { event: "milestone.1_achieved", email: "Getting started guide", status: "active" },
        { event: "milestone.2_stalled", email: "Quick tip: invite team", status: "active" },
        { event: "trial.ending", email: "Upgrade prompt", status: "active" },
      ].map((trigger, i) => (
        <div key={i} className="flex items-center gap-2 rounded-md border border-slate-100 px-3 py-2">
          <span className="text-[9px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded flex-shrink-0">{trigger.event}</span>
          <span className="text-slate-300 text-[10px]">→</span>
          <span className="text-[11px] text-slate-700 truncate flex-1">{trigger.email}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
        </div>
      ))}
    </div>
    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400">
      <span>4 triggers active</span>
      <span className="w-1 h-1 rounded-full bg-slate-300" />
      <span>Sending via Resend</span>
    </div>
  </div>
);

const steps = [
  {
    number: 1,
    title: "Enter your website",
    description: "DigiStorms analyzes your product, detects features, and identifies milestones that lead to upgrade automatically.",
    illustration: <Step1Illustration />,
  },
  {
    number: 2,
    title: "Review your sequence",
    description: "Get a 7-email onboarding sequence with subject lines, body copy, and send triggers. Edit anything before going live.",
    illustration: <Step2Illustration />,
  },
  {
    number: 3,
    title: "Go live in minutes",
    description: "Add your domain and connect your events via API. Emails are triggered by real user behavior and sent at the right time.",
    illustration: <Step3Illustration />,
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-12 bg-background-warm">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 tracking-[-0.01em]">
            From URL to onboarding in 3 steps
          </h2>
        </div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${
                index % 2 === 1 ? "md:[direction:rtl]" : ""
              }`}
            >
              <div className={index % 2 === 1 ? "md:[direction:ltr]" : ""}>
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-sm mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.description}</p>
              </div>
              <div className={index % 2 === 1 ? "md:[direction:ltr]" : ""}>
                {step.illustration}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
