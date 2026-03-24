import React from "react";

interface Benefit {
  title: string;
  description: string;
  visual: React.ReactNode;
  /** If true, visual appears on the left on md+ screens */
  visualLeft: boolean;
}

const benefits: Benefit[] = [
  {
    title: "Turn signups into paying customers",
    description:
      "DigiStorms detects your product's activation milestones and sends the right onboarding emails at the right moment to move users toward upgrade.",
    visual: <img src="/benefits/benefit-1.png" alt="Journey from signup to upgrade" className="w-full h-auto object-contain" />,
    visualLeft: false,
  },
  {
    title: "Launch onboarding in minutes",
    description:
      "Just enter your website. DigiStorms analyzes your product, generates your onboarding sequence, and lets you edit everything before going live.",
    visual: <img src="/benefits/benefit-2.png" alt="Analyzing website to detect upgrade path" className="w-full h-auto object-contain" />,
    visualLeft: true,
  },
  {
    title: "Runs automatically based on user behavior",
    description:
      "Emails trigger when users sign up, reach milestones, or stall in onboarding, so every user gets the right message at the right time.",
    visual: <img src="/benefits/benefit-3.png" alt="Event triggers firing in real time" className="w-full h-auto object-contain" />,
    visualLeft: false,
  },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            From signup to upgrade on autopilot
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
            DigiStorms detects activation milestones and sends the right onboarding emails at exactly the right moment.
          </p>
        </div>

        <div className="space-y-16">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 items-center"
            >
              {/* Text block — always first on mobile; order controlled on md */}
              <div
                className={
                  benefit.visualLeft
                    ? "order-1 md:order-2"
                    : "order-1 md:order-1"
                }
              >
                <h3 className="text-[24px] font-semibold text-gray-900 mb-3 leading-snug">
                  {benefit.title}
                </h3>
                <p className="text-[20px] text-gray-500 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Visual block */}
              <div
                className={`rounded-xl bg-gray-50/40 p-4 sm:p-6 md:p-8 md:h-[420px] flex items-center justify-center ${
                  benefit.visualLeft
                    ? "order-2 md:order-1"
                    : "order-2 md:order-2"
                }`}
              >
                {benefit.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
