import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Index from "./pages/Index";
import { StoreProvider } from "@/store/context";

const Pricing = lazy(() => import("./pages/Pricing"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const Manifesto = lazy(() => import("./pages/Manifesto"));
const LifecycleScorePage = lazy(() => import("./pages/LifecycleScorePage"));
const ROICalculator = lazy(() => import("./pages/ROICalculator"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Library = lazy(() => import("./pages/Library"));
const LibraryEmail = lazy(() => import("./pages/LibraryEmail"));
const LibraryBrand = lazy(() => import("./pages/LibraryBrand"));
const LibraryTag = lazy(() => import("./pages/LibraryTag"));
const LibraryUseCase = lazy(() => import("./pages/LibraryUseCase"));
const LibraryBrands = lazy(() => import("./pages/LibraryBrands"));
const LibraryUseCases = lazy(() => import("./pages/LibraryUseCases"));
const LibraryTags = lazy(() => import("./pages/LibraryTags"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Email Generator pages
const EmailGeneratorPicker = lazy(() => import("./pages/email-generator/UseCasePickerPage"));
const EmailGeneratorBrief = lazy(() => import("./pages/email-generator/BriefPage"));
const EmailGeneratorGenerate = lazy(() => import("./pages/email-generator/GeneratePage"));
const EmailGeneratorTemplates = lazy(() => import("./pages/email-generator/TemplatesPage"));
const EmailGeneratorCustomize = lazy(() => import("./pages/email-generator/CustomizePage"));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <>
    <BrowserRouter>
      <ScrollToTop />
      <Toaster />
      <Suspense>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/manifesto" element={<Manifesto />} />
          <Route path="/lifecycle-score" element={<LifecycleScorePage />} />
          <Route path="/roi-calculator" element={<ROICalculator />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/email/:slug" element={<LibraryEmail />} />
          <Route path="/library/brand/:slug" element={<LibraryBrand />} />
          <Route path="/library/tag/:slug" element={<LibraryTag />} />
          <Route path="/library/usecase/:slug" element={<LibraryUseCase />} />
          <Route path="/library/brands" element={<LibraryBrands />} />
          <Route path="/library/usecases" element={<LibraryUseCases />} />
          <Route path="/library/tags" element={<LibraryTags />} />
          <Route path="/email-generator" element={<StoreProvider><EmailGeneratorPicker /></StoreProvider>} />
          <Route path="/email-generator/brief" element={<StoreProvider><EmailGeneratorBrief /></StoreProvider>} />
          <Route path="/email-generator/generate" element={<StoreProvider><EmailGeneratorGenerate /></StoreProvider>} />
          <Route path="/email-generator/templates" element={<StoreProvider><EmailGeneratorTemplates /></StoreProvider>} />
          <Route path="/email-generator/customize" element={<StoreProvider><EmailGeneratorCustomize /></StoreProvider>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
);

export default App;
