import React from "react";
import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  className?: string;
}

const steps = [
  {
    id: 1,
    title: "Choose Use Case",
    description: "Choose your use case to get started",
  },
  {
    id: 2,
    title: "Details",
    description: "Tell us about your product",
  },
  {
    id: 3,
    title: "Generate",
    description: "Stormi is creating your emails",
  },
  {
    id: 4,
    title: "Select Email",
    description: "Choose the email that best fits",
  },
  {
    id: 5,
    title: "Customize",
    description: "Make it yours",
  },
  {
    id: 6,
    title: "Export Email",
    description: "Export it to your email tool",
  },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Desktop version */}
      <div className="hidden lg:flex items-start mb-4">
        {steps.map((step, index) => {
          // Step is completed if currentStep is greater than step.id, OR if we're at step 6 (final step)
          const isCompleted =
            currentStep > step.id || (currentStep === 6 && step.id === 6);
          // Step is current only if it matches currentStep AND we're not at the final step (6)
          const isCurrent = currentStep === step.id && currentStep !== 6;
          // const isUpcoming = currentStep < step.id;

          return (
            <div
              key={step.id}
              className={`flex flex-col relative ${
                index < steps.length - 1 ? "flex-1" : ""
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                  isCompleted
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : isCurrent
                    ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-400/30"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>

              {/* Step Title */}
              <div className="mt-2">
                <div
                  className={`text-xs font-semibold ${
                    isCompleted || isCurrent
                      ? "text-blue-600"
                      : "text-slate-400"
                  }`}
                >
                  {step.title}
                </div>
                <div
                  className={`text-[10px] ${
                    isCompleted || isCurrent
                      ? "text-blue-500"
                      : "text-slate-400"
                  }`}
                >
                  {step.description}
                </div>
              </div>

              {/* Connecting Line - show between completed steps and current step */}
              {index < steps.length - 1 && (
                <div className="absolute top-4 left-8 w-full h-0.5 z-0">
                  <div
                    className={`h-full ${
                      isCompleted || currentStep === step.id + 1
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : "bg-slate-200"
                    }`}
                    style={{
                      width: "calc(100% - 2rem)",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile/Tablet version (simplified) */}
      <div className="lg:hidden flex items-center justify-between mb-4 relative">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 rounded-full -translate-y-1/2 -z-10" />

        {/* Progress line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full -translate-y-1/2 -z-10 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          // Step is completed if currentStep is greater than step.id, OR if we're at step 6 (final step)
          const isCompleted =
            currentStep > step.id || (currentStep === 6 && step.id === 6);
          // Step is current only if it matches currentStep AND we're not at the final step (6)
          const isCurrent = currentStep === step.id && currentStep !== 6;

          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 ${
                  isCompleted
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : isCurrent
                    ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="text-xs font-semibold">{step.id}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
