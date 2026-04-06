import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/hooks/useAppStore";
import { UseCase } from "@/types/emailGenerator";
import { useCasesByCategory } from "@/utils/useCaseMapping";

const categoryMeta: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  activation: {
    label: "Activation",
    icon: "🚀",
    description: "Welcome, onboard, and activate new users fast.",
  },
  engagement: {
    label: "Engagement",
    icon: "💡",
    description: "Keep users engaged with tips, surveys, and feature drops.",
  },
  expansion: {
    label: "Expansion",
    icon: "📈",
    description: "Upsell, cross-sell, and grow revenue per user.",
  },
  churn: {
    label: "Churn Prevention",
    icon: "🔒",
    description: "Detect risk signals and retain at-risk customers.",
  },
  community: {
    label: "Community",
    icon: "👥",
    description: "Referrals, feedback, beta invites, and community growth.",
  },
  content: {
    label: "Content & PR",
    icon: "📣",
    description: "Promote webinars, articles, case studies, and press mentions.",
  },
};

const categoryOrder = [
  "activation",
  "engagement",
  "expansion",
  "churn",
  "community",
  "content",
] as const;

export default function UseCasePickerPage() {
  const navigate = useNavigate();
  const { workflow } = useAppStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleUseCaseSelect = (useCase: UseCase) => {
    workflow.setUseCase(useCase);
    navigate(`/email-generator/brief?useCase=${useCase}`);
  };

  const handleCategoryClick = (category: string) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <>
      <Helmet>
        <title>Free Lifecycle Email Generator | DigiStorms</title>
        <meta
          name="description"
          content="Generate professional lifecycle emails for free. Choose from 36+ use cases across activation, engagement, expansion, churn prevention, community, and content."
        />
        <link rel="canonical" href="https://digistorms.app/email-generator" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-20 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/3 w-80 h-80 bg-gradient-to-r from-purple-100/30 to-blue-100/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-100/20 to-cyan-100/30 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Lifecycle Email Generator
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Generate professional, conversion-ready lifecycle emails for free.
              Pick a use case, answer a few questions, and get production-ready
              HTML in minutes.
            </p>
          </div>
        </section>

        {/* Category Cards Grid */}
        <section className="pb-24 relative z-10">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryOrder.map((categoryKey) => {
                const meta = categoryMeta[categoryKey];
                const useCases = useCasesByCategory[categoryKey];
                const isExpanded = expandedCategory === categoryKey;

                return (
                  <div
                    key={categoryKey}
                    className={`rounded-2xl border transition-all duration-300 ${
                      isExpanded
                        ? "border-[#754BDD]/40 bg-white shadow-lg col-span-1 md:col-span-2 lg:col-span-3"
                        : "border-slate-200 bg-white/80 hover:border-[#754BDD]/30 hover:shadow-md cursor-pointer"
                    }`}
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => handleCategoryClick(categoryKey)}
                      className="w-full text-left p-6 flex items-start gap-4"
                    >
                      <span className="text-3xl">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {meta.label}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {meta.description}
                        </p>
                        <p className="text-xs text-[#754BDD] font-medium mt-2">
                          {useCases.length} use case
                          {useCases.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={`text-slate-400 transition-transform duration-200 mt-1 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M5 7.5L10 12.5L15 7.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>

                    {/* Expanded Use Cases */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-0">
                        <div className="border-t border-slate-100 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {useCases.map((uc) => (
                              <button
                                key={uc.id}
                                onClick={() =>
                                  handleUseCaseSelect(uc.id as UseCase)
                                }
                                className="group text-left p-4 rounded-xl border border-slate-100 hover:border-[#754BDD]/30 hover:bg-purple-50/50 transition-all duration-200"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-xl flex-shrink-0">
                                    {uc.icon}
                                  </span>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-[#754BDD] transition-colors">
                                      {uc.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                      {uc.summary}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
