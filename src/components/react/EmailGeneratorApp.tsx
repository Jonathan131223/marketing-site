import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/store/context";
import { Toaster } from "@/components/ui/sonner";
import { EmailGeneratorErrorBoundary } from "@/components/react/EmailGeneratorErrorBoundary";

const UseCasePickerPage = lazy(() => import("@/_legacy-pages/email-generator/UseCasePickerPage"));
const BriefPage = lazy(() => import("@/_legacy-pages/email-generator/BriefPage"));
const GeneratePage = lazy(() => import("@/_legacy-pages/email-generator/GeneratePage"));
const TemplatesPage = lazy(() => import("@/_legacy-pages/email-generator/TemplatesPage"));
const CustomizePage = lazy(() => import("@/_legacy-pages/email-generator/CustomizePage"));

/**
 * Visible loading fallback shown while the lazy-loaded page chunk is
 * fetching. Previously this was `<div className="min-h-screen bg-white" />`
 * which is literally an invisible blank screen — on slow networks or when
 * the cached bundle hash no longer exists on the server, users saw a
 * completely blank white page with no indication anything was happening.
 * Now they see a branded spinner and "Loading lifecycle email generator..."
 * copy so the page never looks broken.
 */
function EmailGeneratorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-6">
      <div className="text-center" role="status" aria-live="polite">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">
          Loading lifecycle email generator…
        </p>
      </div>
    </div>
  );
}

/**
 * Self-contained React island that wraps the entire email generator workflow.
 * Includes its own ErrorBoundary, BrowserRouter, and StoreProvider so it
 * works independently inside Astro pages. Meta tags (title, OG, Twitter,
 * canonical) are set by each Astro page via BaseLayout props — React does
 * not touch document head.
 *
 * Because the island is mounted via `client:only="react"`, there is NO
 * server-rendered HTML fallback. The EmailGeneratorErrorBoundary catches
 * any render/hydration throw (corrupted localStorage, stale bundle hash,
 * third-party script injection) and renders a recoverable error state
 * with a "clear cache and reload" button instead of a blank white page.
 *
 * The Suspense fallback is a visible branded spinner (not an empty div)
 * so even on slow networks or during lazy-chunk loading the user sees
 * feedback that something is happening.
 */
const EmailGeneratorApp: React.FC = () => {
  return (
    <EmailGeneratorErrorBoundary>
      <StoreProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Toaster />
          <Suspense fallback={<EmailGeneratorLoading />}>
            <Routes>
              <Route path="/email-generator" element={<UseCasePickerPage />} />
              <Route path="/email-generator/brief" element={<BriefPage />} />
              <Route path="/email-generator/generate" element={<GeneratePage />} />
              <Route path="/email-generator/templates" element={<TemplatesPage />} />
              <Route path="/email-generator/customize" element={<CustomizePage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </StoreProvider>
    </EmailGeneratorErrorBoundary>
  );
};

export default EmailGeneratorApp;
