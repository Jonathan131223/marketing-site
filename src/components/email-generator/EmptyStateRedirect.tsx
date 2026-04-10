import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useCasesByCategory } from "@/utils/useCaseMapping";

// Derived from the single source of truth so this stays in sync if a new
// use case or category is added later.
const TOTAL_USE_CASES = Object.values(useCasesByCategory).flat().length;

interface EmptyStateRedirectProps {
  /**
   * The step the user was trying to reach. Shown in the heading so the
   * message is specific instead of generic. e.g. "brief", "templates".
   */
  step: "brief" | "templates" | "generate" | "customize";
}

/**
 * Shown when a user lands on an email generator sub-route (brief, templates,
 * generate, customize) without first picking a use case on /email-generator.
 * Replaces the silent auto-redirect behavior with a clear explanation and
 * a CTA back to the picker. Each sub-route now has unique indexable content
 * instead of 4 duplicate blank redirects, which also unblocks SEO.
 */
export function EmptyStateRedirect({ step }: EmptyStateRedirectProps) {
  const stepLabels: Record<EmptyStateRedirectProps["step"], string> = {
    brief: "fill out the brief",
    templates: "choose a template",
    generate: "generate your emails",
    customize: "customize your email",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-[#2563EB]" aria-hidden="true" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
            Pick a use case first
          </h1>

          <p className="text-base text-slate-600 mb-8">
            To {stepLabels[step]}, you need to start by choosing what kind of
            lifecycle email you want to generate. It takes 10 seconds.
          </p>

          <a
            href="/email-generator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2563EB] text-white font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Go to use case picker
          </a>

          <p className="text-xs text-slate-400 mt-6">
            {TOTAL_USE_CASES} use cases across activation, engagement,
            expansion, churn, community, and content.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
