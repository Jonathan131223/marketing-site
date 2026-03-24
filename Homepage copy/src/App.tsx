import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StoreProvider } from "@/store/context";
import * as Sentry from "@sentry/react";
import { SentryErrorFallback } from "@/lib/sentry";
import { GoogleAuthQuestionnaireHandler } from "@/components/GoogleAuthQuestionnaireHandler";
import { LaunchBonusBanner } from "@/components/LaunchBonusBanner";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import LaunchBonusSuccess from "./pages/LaunchBonusSuccess";
import CreditPackSuccess from "./pages/CreditPackSuccess";
import ConciergeSuccess from "./pages/ConciergeSuccess";
import { UserPortal } from "./pages/UserPortal";

import GenerateEmails from "./pages/GenerateEmails";
import EmailEditorTest from "./pages/EmailEditorTest";
import PaymentSuccess from "./pages/PaymentSuccess";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TestRunner from "./pages/TestRunner";
import LifecycleBlueprints from "./pages/LifecycleBlueprints";
import AcceptInvite from "./pages/AcceptInvite";
import SignupWithInvite from "./pages/SignupWithInvite";
import Manifesto from "./pages/Manifesto";
import TheGrowthGap from "./pages/TheGrowthGap";
import ROICalculator from "./pages/ROICalculator";
import ROIHub from "./pages/ROIHub";
import LifecycleScorePage from "./pages/LifecycleScorePage";
// Generator pages
import { BriefPage } from "./pages/generator/BriefPage";
import { GeneratePage } from "./pages/generator/GeneratePage";
import { TemplatesPage } from "./pages/generator/TemplatesPage";
import { CustomizePage } from "./pages/generator/CustomizePage";
import EmailSequenceGeneratorPage from "./pages/EmailSequenceGeneratorPage";
import EmailSequenceLogoPage from "./pages/EmailSequenceLogoPage";
import EmailSequenceBriefPage from "./pages/EmailSequenceBriefPage";
import EmailSequenceCustomizePage from "./pages/EmailSequenceCustomizePage";
import EmailSequenceSendingSettingsPage from "./pages/EmailSequenceSendingSettingsPage";
import UseCases from "./pages/UseCases";
import DashboardPage from "./pages/dashboard/DashboardPage";
import Analyzing from "./pages/Analyzing";
// import TestimonialTest from "./pages/TestimonialTest";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <Sentry.ErrorBoundary fallback={SentryErrorFallback} showDialog>
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              {/* <LaunchBonusBanner /> */}
              <GoogleAuthQuestionnaireHandler />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/analyzing" element={<Analyzing />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/portal" element={<UserPortal />} />
                <Route path="/portal/settings" element={<UserPortal />} />
                {/* Generator routes - accessible without auth */}
                <Route path="/generator/brief" element={<BriefPage />} />
                <Route path="/generator/generate" element={<GeneratePage />} />
                <Route
                  path="/generator/templates"
                  element={<TemplatesPage />}
                />
                <Route
                  path="/generator/customize"
                  element={<CustomizePage />}
                />
                <Route path="/use-cases" element={<UseCases />} />
                <Route
                  path="/email-sequence-generator"
                  element={<EmailSequenceGeneratorPage />}
                />
                <Route
                  path="/email-sequence-generator/logo"
                  element={<EmailSequenceLogoPage />}
                />
                <Route
                  path="/email-sequence-generator/brief"
                  element={<EmailSequenceBriefPage />}
                />
                <Route
                  path="/email-sequence-generator/customize"
                  element={<EmailSequenceCustomizePage />}
                />
                <Route
                  path="/email-sequence-generator/sending-settings"
                  element={<EmailSequenceSendingSettingsPage />}
                />
                {/* Portal routes - same components, different layout */}
                <Route
                  path="/portal/brief"
                  element={
                    <ProtectedRoute>
                      <BriefPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/generate"
                  element={
                    <ProtectedRoute>
                      <GenerateEmails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/generate/loading"
                  element={
                    <ProtectedRoute>
                      <GeneratePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/templates"
                  element={
                    <ProtectedRoute>
                      <TemplatesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/customize"
                  element={
                    <ProtectedRoute>
                      <CustomizePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment-success"
                  element={
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/lifecycle-blueprints"
                  element={<LifecycleBlueprints />}
                />
                <Route path="/manifesto" element={<Manifesto />} />
                <Route path="/The-Growth-Gap" element={<TheGrowthGap />} />
                <Route path="/roi" element={<ROIHub />} />
                <Route path="/roi-calculator" element={<ROICalculator />} />
                <Route
                  path="/lifecycle-score"
                  element={<LifecycleScorePage />}
                />
                <Route path="/invite" element={<AcceptInvite />} />
                <Route
                  path="/signup-with-invite"
                  element={<SignupWithInvite />}
                />
                <Route path="/editor-test" element={<EmailEditorTest />} />
                <Route path="/test-runner" element={<TestRunner />} />
                <Route
                  path="/launch-bonus-success"
                  element={<LaunchBonusSuccess />}
                />
                <Route
                  path="/credit-pack-success"
                  element={<CreditPackSuccess />}
                />
                <Route
                  path="/concierge-success"
                  element={<ConciergeSuccess />}
                />
                {/* <Route path="/testimonial-test" element={<TestimonialTest />} /> */}
                <Route path="/app/dashboard" element={<DashboardPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </StoreProvider>
    </QueryClientProvider>
  </Sentry.ErrorBoundary>
);

export default App;
