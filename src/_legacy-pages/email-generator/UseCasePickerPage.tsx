import { useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/hooks/useAppStore";
import type { UseCase } from "@/types/emailGenerator";
import { useCasesByCategory } from "@/utils/useCaseMapping";
import { Zap, Lightbulb, TrendingUp, Shield, Users, Megaphone } from "lucide-react";

type CategoryKey =
  | "activation"
  | "engagement"
  | "expansion"
  | "churn"
  | "community"
  | "content";

const categoryMeta: Record<
  CategoryKey,
  { label: string; Icon: ComponentType<{ className?: string }>; description: string }
> = {
  activation: {
    label: "Activation",
    Icon: Zap,
    description: "Welcome, onboard, and activate new users fast.",
  },
  engagement: {
    label: "Engagement",
    Icon: Lightbulb,
    description: "Keep users engaged with tips, surveys, and feature drops.",
  },
  expansion: {
    label: "Expansion",
    Icon: TrendingUp,
    description: "Upsell, cross-sell, and grow revenue per user.",
  },
  churn: {
    label: "Churn Prevention",
    Icon: Shield,
    description: "Detect risk signals and retain at-risk customers.",
  },
  community: {
    label: "Community",
    Icon: Users,
    description: "Referrals, feedback, beta invites, and community growth.",
  },
  content: {
    label: "Content & PR",
    Icon: Megaphone,
    description: "Promote webinars, articles, case studies, and press mentions.",
  },
};

// Explicit display order. Not derived from `Object.keys(categoryMeta)`
// because we don't want the tab sequence to silently shift if someone
// reorders entries in the meta object. The `as const` + `satisfies` clauses
// together validate that every item is a valid CategoryKey AND preserve
// the tuple literal so the exhaustiveness check below can detect drift.
const categoryOrder = [
  "activation",
  "engagement",
  "expansion",
  "churn",
  "community",
  "content",
] as const satisfies ReadonlyArray<CategoryKey>;

// Compile-time exhaustiveness + length check. Two independent guarantees:
//
// 1. `_MissingKeys`: if a new value is added to the `CategoryKey` type
//    but not appended here, this type resolves to the new key (not never),
//    which breaks the assignment below.
//
// 2. `_LengthMatches`: counts the number of distinct union members in
//    `CategoryKey` and asserts categoryOrder has the same number of
//    entries. Catches duplicates (e.g. a typo that lists "activation"
//    twice while omitting "churn") which the first check alone would
//    miss — `Exclude<CategoryKey, "activation" | "activation">` is still
//    just the missing member, but the length check fails.
type _MissingKeys = Exclude<CategoryKey, (typeof categoryOrder)[number]>;
type _UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;
type _LastOfUnion<U> = _UnionToIntersection<
  U extends unknown ? () => U : never
> extends () => infer R
  ? R
  : never;
type _UnionLength<U, Acc extends unknown[] = []> = [U] extends [never]
  ? Acc["length"]
  : _UnionLength<Exclude<U, _LastOfUnion<U>>, [_LastOfUnion<U>, ...Acc]>;
type _CategoryKeyCount = _UnionLength<CategoryKey>;
type _LengthMatches = (typeof categoryOrder)["length"] extends _CategoryKeyCount
  ? _CategoryKeyCount extends (typeof categoryOrder)["length"]
    ? true
    : "ERROR: categoryOrder length does not match CategoryKey union size"
  : "ERROR: categoryOrder length does not match CategoryKey union size";

const _categoryOrderIsExhaustive: [_MissingKeys] extends [never]
  ? true
  : "ERROR: categoryOrder is missing keys from CategoryKey" = true;
const _categoryOrderHasNoDuplicates: _LengthMatches = true;
void _categoryOrderIsExhaustive;
void _categoryOrderHasNoDuplicates;

export default function UseCasePickerPage() {
  const navigate = useNavigate();
  const { workflow } = useAppStore();
  // Default to activation — user lands with the first category already open
  // so 8 use cases are visible above the fold instead of 6 closed cards.
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryKey>("activation");

  // Refs to each tab button so the WAI-ARIA keyboard handler can move
  // focus in response to arrow keys. Only the active tab sits in the tab
  // order (tabIndex 0); the others are tabIndex -1 and only reachable
  // via arrow keys, per the authoring practices guide.
  const tabRefs = useRef<Record<CategoryKey, HTMLButtonElement | null>>({
    activation: null,
    engagement: null,
    expansion: null,
    churn: null,
    community: null,
    content: null,
  });

  const handleUseCaseSelect = (useCase: UseCase) => {
    workflow.setUseCase(useCase);
    navigate(`/email-generator/brief?useCase=${useCase}`);
  };

  // Keyboard navigation for the tab list — WAI-ARIA tabs pattern.
  // Left/Right move between tabs (wrapping), Home/End jump to the
  // first/last tab. Moving focus also activates the tab so the panel
  // content updates in sync (automatic activation pattern).
  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentKey: CategoryKey
  ) => {
    const currentIndex = categoryOrder.indexOf(currentKey);
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % categoryOrder.length;
        break;
      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + categoryOrder.length) % categoryOrder.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = categoryOrder.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextKey = categoryOrder[nextIndex];
    setSelectedCategory(nextKey);
    tabRefs.current[nextKey]?.focus();
  };

  const activeMeta = categoryMeta[selectedCategory];
  const activeUseCases = useCasesByCategory[selectedCategory];

  return (
    <>
      {/*
        Meta tags (title, description, canonical, OG, Twitter) are set by
        src/pages/email-generator/index.astro via BaseLayout props.
        Astro is the single source of truth. See ISSUE-005 in QA report.
      */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-20 pb-12">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
              Lifecycle Email Generator
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Generate professional, conversion-ready lifecycle emails for free.
              Pick a use case, answer a few questions, and get production-ready
              HTML in minutes.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#1D4ED8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                38 use cases
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#1D4ED8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                100% free
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#1D4ED8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Production-ready HTML
              </span>
            </div>
          </div>
        </section>

        {/* Sample Email Preview */}
        <section className="pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <p className="text-sm font-medium text-slate-400 text-center mb-6 uppercase tracking-wider">
              See what you'll get
            </p>
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {[
                { src: "/email-screenshots/welcome-email.png", label: "Welcome" },
                { src: "/email-screenshots/trial-expiring.png", label: "Trial Expiring" },
                { src: "/email-screenshots/upgrade.png", label: "Upgrade" },
              ].map((email) => (
                <div key={email.label} className="group">
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow bg-white">
                    <img
                      src={email.src}
                      alt={`${email.label} email example`}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-center mt-2 font-medium">{email.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Tabs + Use Cases */}
        <section className="pb-24" aria-labelledby="use-case-picker-heading">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2
              id="use-case-picker-heading"
              className="text-2xl font-serif font-bold text-slate-900 text-center mb-8"
            >
              Choose your use case
            </h2>

            {/* Category tab bar — all 6 visible at once, one active */}
            <div
              role="tablist"
              aria-label="Use case categories"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-8"
            >
              {categoryOrder.map((categoryKey) => {
                const meta = categoryMeta[categoryKey];
                const isActive = selectedCategory === categoryKey;
                const useCaseCount = useCasesByCategory[categoryKey].length;
                const Icon = meta.Icon;

                return (
                  <button
                    key={categoryKey}
                    ref={(el) => {
                      tabRefs.current[categoryKey] = el;
                    }}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`use-cases-${categoryKey}`}
                    id={`tab-${categoryKey}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setSelectedCategory(categoryKey)}
                    onKeyDown={(e) => handleTabKeyDown(e, categoryKey)}
                    className={`group flex flex-col items-center text-center px-3 py-4 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-[#2563EB] bg-[#2563EB] shadow-md"
                        : "border-slate-200 bg-white hover:border-[#2563EB]/40 hover:-translate-y-0.5 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                        isActive ? "bg-white/15" : "bg-[#EFF6FF]"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? "text-white" : "text-[#2563EB]"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-semibold leading-tight transition-colors ${
                        isActive ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {meta.label}
                    </span>
                    <span
                      className={`text-[11px] font-medium mt-1 transition-colors ${
                        isActive ? "text-white/80" : "text-slate-400"
                      }`}
                    >
                      {useCaseCount} use case{useCaseCount !== 1 ? "s" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active category description */}
            <div
              id={`use-cases-${selectedCategory}`}
              role="tabpanel"
              aria-labelledby={`tab-${selectedCategory}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
            >
              <div className="mb-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <activeMeta.Icon className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {activeMeta.label}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {activeMeta.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeUseCases.map((uc) => (
                  <button
                    key={uc.id}
                    onClick={() => handleUseCaseSelect(uc.id as UseCase)}
                    className="group text-left p-4 rounded-xl border border-slate-200 hover:border-[#2563EB]/40 hover:bg-[#EFF6FF]/50 hover:shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0" aria-hidden="true">
                        {uc.icon}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors">
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
        </section>

        <Footer />
      </div>
    </>
  );
}
