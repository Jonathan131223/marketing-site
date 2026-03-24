import React from "react";

const VisualArea: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full overflow-hidden rounded-t-xl">
    {children}
  </div>
);

const columns = [
  {
    image: "/onboarding-pain/card-1-left.png",
    imageAlt: "Five users receiving the same welcome message",
    title: "Generic emails don't convert",
    description:
      "One-size-fits-all onboarding rarely helps users reach the milestones that drive activation.",
  },
  {
    image: "/onboarding-pain/card-3-right.png",
    imageAlt: "User journey funnel showing Signup, Setup, First value, Upgrade with most users abandoning between Setup and First value",
    title: "Users never reach value",
    description:
      "New signups lose momentum fast when there's no clear path to their first successful outcome.",
  },
  {
    image: "/onboarding-pain/card-2-middle.png",
    imageAlt: "User completed setup but no email was sent - missed opportunity",
    title: "Missed moments kill revenue",
    description:
      "When nobody follows up at the right time, users stall, disengage, and never make it to paid.",
  },
];

export const OnboardingPainSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[#F8FAFC]">
      {/* ── Title block ── */}
      <div className="container mx-auto px-4 max-w-3xl text-center mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4 leading-tight">
          50% of users who sign up never come back
        </h2>
        <p className="text-gray-500 leading-relaxed" style={{ fontSize: "22px" }}>
          Most SaaS products lose users before they ever reach value. Weak
          onboarding doesn't just hurt activation, it leaves revenue on the
          table.
        </p>
      </div>

      {/* ── 3-column grid (visual + text in each card) ── */}
      <div className="container mx-auto px-4 max-w-[1110px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {columns.map((col) => (
            <div
              key={col.title}
              className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100/80"
            >
              {/* Visual area — fixed height and padding */}
              <VisualArea>
                <img
                  src={col.image}
                  alt={col.imageAlt}
                  className="w-full h-auto max-h-[302px] object-contain block mx-auto"
                />
              </VisualArea>

              {/* Text area — title, description */}
              <div className="p-5 flex flex-col">
                <h3 className="font-semibold text-gray-900 leading-snug mb-2" style={{ fontSize: "22px" }}>
                  {col.title}
                </h3>
                <p className="text-gray-500 leading-relaxed" style={{ fontSize: "18px" }}>
                  {col.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
