import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { StoreProvider } from "@/store/context";
import { Toaster } from "@/components/ui/sonner";

const UseCasePickerPage = lazy(() => import("@/_legacy-pages/email-generator/UseCasePickerPage"));
const BriefPage = lazy(() => import("@/_legacy-pages/email-generator/BriefPage"));
const GeneratePage = lazy(() => import("@/_legacy-pages/email-generator/GeneratePage"));
const TemplatesPage = lazy(() => import("@/_legacy-pages/email-generator/TemplatesPage"));
const CustomizePage = lazy(() => import("@/_legacy-pages/email-generator/CustomizePage"));

interface EmailGeneratorAppProps {
  initialPath?: string;
}

/**
 * Self-contained React island that wraps the entire email generator workflow.
 * Includes its own HelmetProvider, BrowserRouter, and StoreProvider so it
 * works independently inside Astro pages. HelmetProvider is required because
 * UseCasePickerPage uses <Helmet> for per-route meta tag updates during
 * client-side navigation within the island.
 */
const EmailGeneratorApp: React.FC<EmailGeneratorAppProps> = ({ initialPath }) => {
  return (
    <HelmetProvider>
      <StoreProvider>
        <BrowserRouter>
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
    </HelmetProvider>
  );
};

export default EmailGeneratorApp;
