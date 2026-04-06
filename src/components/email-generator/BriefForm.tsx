import React, { useState } from "react";
import { UseCase, BriefData } from "@/types/emailGenerator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Lightbulb, User } from "lucide-react";
import { useCaseConfig, getWhyThisWorks } from "./briefFormConfig";

const INPUT_CLASS =
  "w-full px-5 py-4 h-[58px] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7444DD] focus:border-[#7444DD] focus:outline-none transition-all duration-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-300";

interface BriefFormProps {
  useCase: UseCase;
  onComplete: (data: BriefData) => void;
  hideHeader?: boolean;
}

export const BriefForm: React.FC<BriefFormProps> = ({
  useCase,
  onComplete,
  hideHeader = false,
}) => {
  const config = useCaseConfig[useCase];

  const [formData, setFormData] = useState<Partial<BriefData>>({
    useCase,
    companyName: "",
    senderName: "",
    productName: "",
    targetAudience: "",
    primaryAction: "",
  });

  const handleInputChange = async (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = config.questions.filter((q) => q.required);

    const missingFields = requiredFields.filter(
      (field) => !formData[field.key as keyof BriefData]
    );

    if (!formData.senderName?.trim()) {
      alert("Please enter your name — it appears in the From line and signature.");
      return;
    }

    const isValid = requiredFields.every(
      (field) => formData[field.key as keyof BriefData]
    );

    if (!isValid) {
      alert(
        `Please fill in all required fields. Missing: ${missingFields
          .map((f) => f.key)
          .join(", ")}`
      );
      return;
    }

    onComplete(formData as BriefData);
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {!hideHeader && (
        <div className="text-center mb-12">
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

      <div className="bg-white rounded-3xl shadow-sm p-10 border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {config.questions
                .filter((q) => q.key === "companyName")
                .map((question) => (
                  <div key={question.key} className="w-full">
                    <label className="block text-sm font-semibold text-slate-800 mb-3 tracking-wide">
                      {question.label}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {question.sublabel && (
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                        {question.sublabel}
                      </p>
                    )}

                    <input
                      type="text"
                      value={
                        (formData[question.key as keyof BriefData] as string) ||
                        ""
                      }
                      onChange={(e) =>
                        handleInputChange(question.key, e.target.value)
                      }
                      placeholder={question.placeholder}
                      className={INPUT_CLASS}
                      required={question.required}
                    />
                  </div>
                ))}

              <div className="w-full">
                <label className="block text-sm font-semibold text-slate-800 mb-3 tracking-wide">
                  Your name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Shown in the preview From line and used for your email
                  signature.
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.senderName || ""}
                    onChange={(e) =>
                      handleInputChange("senderName", e.target.value)
                    }
                    placeholder="e.g. Alex"
                    className={`${INPUT_CLASS} pl-12`}
                    required
                  />
                </div>
              </div>
            </div>

            {config.questions.find((q) => q.key === "primaryAction") && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 mb-3 tracking-wide">
                  {
                    config.questions.find((q) => q.key === "primaryAction")
                      ?.label
                  }
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {config.questions.find((q) => q.key === "primaryAction")
                  ?.sublabel && (
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    {
                      config.questions.find((q) => q.key === "primaryAction")!
                        .sublabel
                    }
                  </p>
                )}

                <input
                  type="text"
                  value={formData.primaryAction || ""}
                  onChange={(e) =>
                    handleInputChange("primaryAction", e.target.value)
                  }
                  placeholder={
                    config.questions.find((q) => q.key === "primaryAction")
                      ?.placeholder
                  }
                  className={INPUT_CLASS}
                  required
                />
              </div>
            )}

            {config.questions
              .filter(
                (q) =>
                  q.key !== "primaryAction" &&
                  q.key !== "companyName" &&
                  q.key !== "supportOffered"
              )
              .map((question) => (
                <div
                  key={question.key}
                  className={
                    question.key === "keyOutcome" ||
                    question.key === "supportOffered" ||
                    question.key === "destinationUrl"
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  <label className="block text-sm font-semibold text-slate-800 mb-3 tracking-wide">
                    {question.label}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {question.sublabel && (
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      {question.sublabel}
                    </p>
                  )}

                  {question.type === "select" ? (
                    <Select
                      value={
                        (formData[question.key as keyof BriefData] as string) ||
                        ""
                      }
                      onValueChange={(value) => {
                        handleInputChange(question.key, value);
                      }}
                    >
                      <SelectTrigger
                        className={`${INPUT_CLASS} h-[58px]`}
                      >
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                        {question.options?.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="px-4 py-3 cursor-pointer"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <input
                      type="text"
                      value={
                        (formData[question.key as keyof BriefData] as string) ||
                        ""
                      }
                      onChange={(e) =>
                        handleInputChange(question.key, e.target.value)
                      }
                      placeholder={question.placeholder}
                      className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7444DD] focus:border-[#7444DD] focus:outline-none transition-all duration-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-300"
                      required={question.required}
                    />
                  )}
                </div>
              ))}
          </div>

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
                <h3 className="text-lg font-semibold text-slate-900">
                  Why this works:
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {getWhyThisWorks(useCase)}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="group inline-flex items-center justify-center bg-[#7444DD] text-white px-8 py-5 rounded-2xl font-semibold text-lg hover:opacity-95 transition-opacity shadow-sm"
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
