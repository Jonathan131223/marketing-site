import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/hooks/useAppStore";
import { useStateRestoration } from "@/hooks/useStateRestoration";
import AILoadingScreen from "@/components/email-generator/AILoadingScreen";
import { EmptyStateRedirect } from "@/components/email-generator/EmptyStateRedirect";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { BriefData } from "@/types/emailGenerator";

const GeneratePage = () => {
  const navigate = useNavigate();
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

  const handleLoadingComplete = (briefDataWithAPI: BriefData) => {
    workflow.setBriefData(briefDataWithAPI);
    // Navigate to templates step
    navigate("/email-generator/templates");
  };

  const handleStartOver = () => {
    if (workflow.selectedUseCase) {
      navigate(`/email-generator/brief?useCase=${workflow.selectedUseCase}`);
    } else {
      navigate("/email-generator/brief");
    }
  };

  // Show loading state while restoring
  if (isRestoring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // No brief data → show empty state with CTA instead of silent redirect
  if (!workflow.briefData) {
    return <EmptyStateRedirect step="generate" />;
  }

  const content = (
    <AILoadingScreen
      briefData={workflow.briefData}
      onComplete={handleLoadingComplete}
      onStartOver={handleStartOver}
      showProgressBar={true}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      {content}
      <Footer />
    </div>
  );
};

export default GeneratePage;
