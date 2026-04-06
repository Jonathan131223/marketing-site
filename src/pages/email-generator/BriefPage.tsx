import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "@/hooks/useAppStore";
import { useStateRestoration } from "@/hooks/useStateRestoration";
import { BriefWizard } from "@/components/email-generator/BriefWizard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BriefData, UseCase } from "@/types/emailGenerator";

const BriefPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { workflow } = useAppStore();
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore state on mount
  useStateRestoration({
    onStateRestored: () => {
      setTimeout(() => {
        setIsRestoring(false);
      }, 100);
    },
    onNoStateFound: () => {
      setIsRestoring(false);
    },
  });

  // Handle use case from URL or state
  const selectedUseCase = workflow.selectedUseCase;
  const setUseCase = workflow.setUseCase;

  useEffect(() => {
    if (isRestoring) return;

    const useCaseParam = searchParams.get("useCase");

    if (useCaseParam) {
      if (useCaseParam !== selectedUseCase) {
        setUseCase(useCaseParam as UseCase);
      }
    } else if (!selectedUseCase) {
      navigate("/email-generator");
      return;
    }
  }, [searchParams, selectedUseCase, setUseCase, navigate, isRestoring]);

  const handleBriefComplete = (data: BriefData) => {
    // Clear any previous template tweaks so the new generation starts fresh
    workflow.setTemplateTweaks(null);
    workflow.setBriefData(data);

    // Navigate to generation/loading step
    navigate("/email-generator/generate");
  };

  const handleBack = () => {
    navigate("/email-generator");
  };

  // Show loading state while restoring
  if (isRestoring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!workflow.selectedUseCase) {
    return null; // Will redirect
  }

  const content = (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen relative overflow-hidden">
      {/* Premium background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-100/30 to-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-100/20 to-cyan-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="group inline-flex items-center text-slate-600 hover:text-blue-600 font-medium transition-all duration-200 hover:translate-x-1"
          >
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            Back to use cases
          </button>
        </div>

        <BriefWizard
          useCase={workflow.selectedUseCase}
          onComplete={handleBriefComplete}
        />
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      {content}
      <Footer />
    </div>
  );
};

export default BriefPage;
