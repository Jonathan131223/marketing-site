import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Index from "./pages/Index";

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
const NotFound = lazy(() => import("./pages/NotFound"));

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
);

export default App;
