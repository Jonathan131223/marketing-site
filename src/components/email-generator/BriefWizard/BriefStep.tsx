import React, { useState, useEffect } from "react";
import { UseCase, BriefData } from "@/types/emailGenerator";
import { Sparkles, Lightbulb, ArrowLeft } from "lucide-react";
import { SuggestionField } from "./SuggestionField";
import { WebsiteAnalysisResponse, FieldSuggestion } from "./types";
import { useCaseConfig, getWhyThisWorks } from "../briefFormConfig";

interface BriefStepProps {
  useCase: UseCase;
  websiteUrl: string;
  senderName: string;
  analysisData: WebsiteAnalysisResponse | null;
  onComplete: (data: BriefData) => void;
  onBack: () => void;
}

export const BriefStep: React.FC<BriefStepProps> = ({
  useCase,
  websiteUrl,
  senderName,
  analysisData,
  onComplete,
  onBack,
}) => {
  const config = useCaseConfig[useCase];
  const [formData, setFormData] = useState<Partial<BriefData>>({
    useCase,
    companyName: websiteUrl,
    senderName: senderName || "",
  });

  // Initialize form with AI suggestions
  useEffect(() => {
    if (analysisData?.success && analysisData.suggestions) {
      const initialData: Partial<BriefData> = {
        useCase,
        companyName: websiteUrl,
        senderName: senderName || "",
      };

      // Pre-fill with AI suggestions
      Object.entries(analysisData.suggestions).forEach(([key, suggestion]) => {
        if (suggestion?.selected) {
          (initialData as Record<string, unknown>)[key] = suggestion.selected;
        }
      });

      setFormData(initialData);
    }
  }, [analysisData, useCase, websiteUrl, senderName]);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.senderName?.trim()) {
      alert("Please go back and enter your name — it appears in the From line and signature.");
      return;
    }
    const requiredFields = config.questions.filter((q) => q.required);
    const missingFields = requiredFields.filter(
      (field) => !formData[field.key as keyof BriefData]
    );

    if (missingFields.length > 0) {
      alert(
        `Please fill in all required fields: ${missingFields
          .map((f) => f.label)
          .join(", ")}`
      );
      return;
    }

    onComplete(formData as BriefData);
  };

  const getSuggestion = (key: string): FieldSuggestion | undefined => {
    return analysisData?.suggestions?.[key];
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-900/10 p-10 border border-slate-200/50">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Tell us about your onboarding goals
          </h2>
          <p className="text-slate-600">
            We'll use this to create personalized emails for your users
          </p>
        </div>

        {/* AI Analysis Complete Banner */}
        {analysisData?.success && (
          <div className="mb-8 p-6 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: "#7444DD" }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">
                  AI Analysis Complete
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {analysisData.company.value_proposition ||
                    "Generate high-performing lifecycle emails instantly with AI-powered precision."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysisData.company.industry && (
                    <span className="px-3 py-1 bg-white rounded-full text-sm text-slate-600 border border-slate-200">
                      {analysisData.company.industry}
                    </span>
                  )}
                  {analysisData.company.category && (
                    <span className="px-3 py-1 bg-white rounded-full text-sm text-slate-600 border border-slate-200">
                      {analysisData.company.category}
                    </span>
                  )}
                  {analysisData.company.detected_tone && (
                    <span className="px-3 py-1 bg-white rounded-full text-sm text-slate-600 border border-slate-200">
                      Tone: {analysisData.company.detected_tone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Questions - rendered directly from config */}
          <div className="space-y-6">
            <div className="space-y-6">
              {config.questions
                .filter((q) => q.key !== "companyName")
                .map((question) => (
                  <SuggestionField
                    key={question.key}
                    label={question.label}
                    sublabel={question.sublabel}
                    value={
                      (formData[question.key as keyof BriefData] as string) ||
                      ""
                    }
                    suggestion={getSuggestion(question.key)}
                    onChange={(value) =>
                      handleInputChange(question.key, value)
                    }
                    placeholder={question.placeholder}
                    required={question.required}
                    type={question.type as "text" | "select"}
                    options={question.options}
                  />
                ))}
            </div>
          </div>

          {/* Why This Works Section */}
          <div className="text-center pt-3">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ backgroundColor: "#7444DD" }}
              />
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 rounded-full">
                  <Lightbulb className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Why this works:
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {getWhyThisWorks(useCase)}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <button
              type="submit"
              className="flex-1 group inline-flex items-center justify-center bg-[#7444DD] text-white px-8 py-5 rounded-2xl font-semibold text-lg hover:opacity-95 transition-opacity shadow-sm"
            >
              <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
              Pick a style
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
