import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import Manifesto from "./pages/Manifesto";
import LifecycleScorePage from "./pages/LifecycleScorePage";
import ROICalculator from "./pages/ROICalculator";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
