import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/store/context";
import { Toaster } from "@/components/ui/sonner";

const UseCasePickerPage = lazy(() => import("@/_legacy-pages/email-generator/UseCasePickerPage"));
const BriefPage = lazy(() => import("@/_legacy-pages/email-generator/BriefPage"));
const GeneratePage = lazy(() => import("@/_legacy-pages/email-generator/GeneratePage"));
const TemplatesPage = lazy(() => import("@/_legacy-pages/email-generator/TemplatesPage"));
const CustomizePage = lazy(() => import("@/_legacy-pages/email-generator/CustomizePage"));

/**
 * Self-contained React island that wraps the entire email generator workflow.
 * Includes its own BrowserRouter and StoreProvider so it works independently
 * inside Astro pages. Meta tags (title, OG, Twitter, canonical) are set by
 * each Astro page via BaseLayout props — React does not touch document head.
 *
 * BrowserRouter reads the initial route from window.location directly, so
 * no initialPath prop is needed. Prior versions accepted an `initialPath`
 * prop that was passed by all 5 Astro callers but never referenced inside
 * the component — deleted to prevent silent drift where Astro pages pass a
 * value the island ignores.
 */
const EmailGeneratorApp: React.FC = () => {
  return (
    <StoreProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster />
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
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
  );
};

export default EmailGeneratorApp;
