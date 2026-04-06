import React, { useState } from "react";
import { UseCase, BriefData } from "@/types/emailGenerator";
import { WebsiteStep } from "./WebsiteStep";
import { LogoStep } from "./LogoStep";
import { BriefStep } from "./BriefStep";
import { WizardState, WebsiteAnalysisResponse, BriefWizardProps } from "./types";
import { useCaseConfig } from "../briefFormConfig";

const API_BASE_URL = "https://api-test.digistorms.net";

async function analyzeWebsite(
  websiteUrl: string,
  useCase: UseCase
): Promise<WebsiteAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/website/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website_url: websiteUrl, use_case: useCase }),
      mode: "cors",
      credentials: "omit",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return (await response.json()) as WebsiteAnalysisResponse;
  } catch (error) {
    console.error("Website analysis failed:", error);
    return {
      success: false,
      company: { name: "", value_proposition: "", industry: "", category: "", detected_tone: "friendly" },
      logo: { url: null, extracted: false },
      suggestions: {},
      error: error instanceof Error ? error.message : "Failed to analyze website",
      fallback: true,
    };
  }
}

function normalizeWebsiteUrl(url: string): string {
  let normalized = url.trim().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }
  return normalized;
}

// Step indicator component
const StepIndicator: React.FC<{
  currentStep: number;
  steps: { label: string; completed: boolean }[];
}> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={index} className="contents">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step.completed
                  ? "bg-purple-600 text-white"
                  : index === currentStep
                    ? "bg-purple-600 text-white ring-4 ring-purple-100"
                    : "bg-slate-100 text-slate-400"
                }`}
            >
              {step.completed ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`mt-2 text-sm ${index === currentStep
                  ? "text-slate-900 font-medium"
                  : "text-slate-400"
                }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mt-[-20px] ${step.completed ? "bg-purple-600" : "bg-slate-200"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export const BriefWizard: React.FC<BriefWizardProps> = ({
  useCase,
  onComplete,
  hideHeader = false,
}) => {
  const config = useCaseConfig[useCase];

  const [state, setState] = useState<WizardState>(() => ({
    currentStep: "website",
    websiteUrl: "",
    isAnalyzing: false,
    analysisError: null,
    analysisData: null,
    senderName: "",
    logoUrl: null as string | null,
    logoFile: null as File | null,
    formData: { useCase },
  }));

  const handleAnalyzeWebsite = async () => {
    if (!state.websiteUrl) return;

    setState((prev) => ({
      ...prev,
      isAnalyzing: true,
      analysisError: null,
    }));

    const normalizedUrl = normalizeWebsiteUrl(state.websiteUrl);

    try {
      const result = await analyzeWebsite(normalizedUrl, useCase);

      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
        analysisData: result,
        analysisError: result.fallback ? result.error || null : null,
        logoUrl: result.logo?.url || null,
        currentStep: "logo",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
        analysisError:
          error instanceof Error
            ? error.message
            : "Failed to analyze website",
        currentStep: "logo",
      }));
    }
  };

  const handleBriefComplete = (data: BriefData) => {
    const completeData: BriefData = {
      ...data,
      companyName: state.websiteUrl,
      companyLogo: state.logoFile || undefined,
      image_logo_url: state.logoUrl || undefined,
    };
    onComplete(completeData);
  };

  const goToStep = (step: WizardState["currentStep"]) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const steps = [
    { label: "Website", completed: state.currentStep !== "website" },
    { label: "Logo", completed: state.currentStep === "brief" },
    { label: "Details", completed: false },
    { label: "Generate", completed: false },
  ];

  const stepIndexMap: Record<string, number> = {
    website: 0,
    logo: 1,
    brief: 2,
  };
  const currentStepIndex = stepIndexMap[state.currentStep] ?? 0;

  return (
    <div className="max-w-5xl mx-auto relative">
      {!hideHeader && (
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">{config.icon}</div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            {config.title} brief
          </h2>
          <p className="text-slate-600 text-xl leading-relaxed max-w-3xl mx-auto">
            Tell us about your product to generate high-performing emails — in
            seconds.
          </p>
        </div>
      )}

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStepIndex} steps={steps} />

      {/* Step Content */}
      {state.currentStep === "website" && (
        <WebsiteStep
          websiteUrl={state.websiteUrl}
          onWebsiteUrlChange={(url) =>
            setState((prev) => ({ ...prev, websiteUrl: url }))
          }
          onAnalyze={handleAnalyzeWebsite}
          isAnalyzing={state.isAnalyzing}
          error={state.analysisError}
        />
      )}

      {state.currentStep === "logo" && (
        <LogoStep
          currentLogoUrl={state.logoUrl}
          onLogoChange={(file, url) =>
            setState((prev) => ({
              ...prev,
              logoFile: file,
              logoUrl: url || prev.logoUrl,
            }))
          }
          onNext={() => goToStep("brief")}
          onBack={() => goToStep("website")}
          isUploading={false}
        />
      )}

      {state.currentStep === "brief" && (
        <BriefStep
          useCase={useCase}
          websiteUrl={state.websiteUrl}
          senderName=""
          analysisData={state.analysisData}
          onComplete={handleBriefComplete}
          onBack={() => goToStep("logo")}
        />
      )}
    </div>
  );
};

export default BriefWizard;
