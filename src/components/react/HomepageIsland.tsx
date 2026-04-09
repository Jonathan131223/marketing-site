/**
 * HomepageIsland — separate React islands for the interactive homepage sections.
 *
 * The HeroSection island owns the RebuildNoticeModal.
 * Other islands (ROI, BottomCTA) communicate via CustomEvent to open the modal.
 *
 * Sections:
 * - "hero"       -> HeroSection + RebuildNoticeModal  (client:load)
 * - "roi"        -> ROISectionHomepage                (client:visible)
 * - "bottom-cta" -> WebsiteStep bottom CTA            (client:visible)
 * - "faq"        -> FAQSection                        (client:visible)
 */
import { Fragment, useEffect, useRef, useState } from "react";
import { HeroSection } from "@/components/homepage/HeroSection";
import { ROISectionHomepage } from "@/components/homepage/ROISectionHomepage";
import { FAQSection } from "@/components/homepage/FAQSection";
import { WebsiteStep } from "@/components/lifecycle/BriefWizard/WebsiteStep";
import { RebuildNoticeModal } from "@/components/RebuildNoticeModal";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";

interface HomepageIslandProps {
  section: "hero" | "roi" | "bottom-cta" | "faq";
}

/** Fire a custom event so the hero island can open the modal. */
function requestAppRedirect(href: string) {
  window.dispatchEvent(
    new CustomEvent("digistorms:open-modal", { detail: { href } })
  );
}

function redirectToAnalyze(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return;
  try {
    const normalized = normalizeWebsiteUrl(trimmed);
    requestAppRedirect(
      appUrl(
        `/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`
      )
    );
  } catch {
    requestAppRedirect(appUrl("/email-sequence-generator"));
  }
}

/* ---------- Hero + Modal island ---------- */
function HeroIsland() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const pendingHref = useRef<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { href } = (e as CustomEvent<{ href: string }>).detail;
      pendingHref.current = href;
      setModalOpen(true);
    };
    window.addEventListener("digistorms:open-modal", handler);
    return () => window.removeEventListener("digistorms:open-modal", handler);
  }, []);

  const handleSubmit = () => redirectToAnalyze(websiteUrl);

  return (
    <>
      <HeroSection
        websiteUrl={websiteUrl}
        onWebsiteUrlChange={setWebsiteUrl}
        onSubmit={handleSubmit}
      />
      <RebuildNoticeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          pendingHref.current = null;
        }}
        onContinue={() => {
          if (pendingHref.current) window.location.href = pendingHref.current;
        }}
      />
    </>
  );
}

/* ---------- ROI island ---------- */
function ROIIsland() {
  return (
    <ROISectionHomepage
      onBeforeNavigateToApp={(href) => requestAppRedirect(href)}
    />
  );
}

/* ---------- Bottom CTA island ---------- */
function BottomCTAIsland() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    try {
      const normalized = normalizeWebsiteUrl(trimmed);
      requestAppRedirect(
        appUrl(
          `/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`
        )
      );
    } catch {
      setError("Failed to open. Please try again.");
    }
  };

  return (
    <section
      id="email-sequence-generator-section"
      className="py-16 md:py-20 lg:py-24 container mx-auto px-6"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
            Turn free users into paying customers automatically
          </h2>
          <p
            className="text-slate-500 max-w-2xl mx-auto leading-relaxed"
            style={{ fontSize: "22px" }}
          >
            Enter your website and our agent will generate your onboarding
            sequence in minutes.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="flex items-center justify-center gap-2">
            {[
              { label: "Website" },
              { label: "Logo" },
              { label: "Brief" },
              { label: "Generate" },
            ].map((step, index) => (
              <Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                      index === 0
                        ? "bg-primary border-primary text-white ring-4 ring-primary/20"
                        : "bg-white border-primary/40 text-primary/60"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      index === 0
                        ? "text-slate-900 font-medium"
                        : "text-slate-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className="w-8 sm:w-16 h-0.5 mt-[-20px] bg-primary/20" />
                )}
              </Fragment>
            ))}
          </div>
          <p className="text-sm text-slate-600">
            Step 1 starts here — the rest continues in the app
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <WebsiteStep
            websiteUrl={url}
            onWebsiteUrlChange={setUrl}
            onAnalyze={handleAnalyze}
            isAnalyzing={false}
            error={error}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ island ---------- */
function FAQIsland() {
  return <FAQSection />;
}

/* ---------- Main export ---------- */
export default function HomepageIsland({ section }: HomepageIslandProps) {
  switch (section) {
    case "hero":
      return <HeroIsland />;
    case "roi":
      return <ROIIsland />;
    case "bottom-cta":
      return <BottomCTAIsland />;
    case "faq":
      return <FAQIsland />;
    default:
      return null;
  }
}
