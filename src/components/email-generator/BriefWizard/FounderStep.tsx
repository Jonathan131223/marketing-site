import React from "react";
import { ArrowRight, ArrowLeft, User } from "lucide-react";

interface FounderStepProps {
  founderName: string;
  onFounderNameChange: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const INPUT_CLASS =
  "w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-sm hover:shadow-md";

export const FounderStep: React.FC<FounderStepProps> = ({
  founderName,
  onFounderNameChange,
  onNext,
  onBack,
}) => {
  const canContinue = founderName.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-900/10 p-10 border border-slate-200/50">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Who's sending these emails?
          </h2>
          <p className="text-slate-600">
            Your name will appear in the email signature and the "From" field.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
              Your name (founder / team lead)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={founderName}
                onChange={(e) => onFounderNameChange(e.target.value)}
                placeholder="e.g. Sarah, Mike, Alex"
                className={`${INPUT_CLASS} pl-12`}
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              This is how you'll sign off every email. Keep it first-name only for a personal feel.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-sm text-slate-500 mb-2 font-medium">Preview</p>
            <div className="text-slate-700 text-[15px] leading-relaxed font-[Arial,Helvetica,sans-serif]">
              <p className="mb-1">Cheers,</p>
              <p className="font-semibold">{founderName || "Your name"}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canContinue}
              className="flex-1 group inline-flex items-center justify-center bg-[#7444DD] text-white px-6 py-4 rounded-xl font-semibold hover:opacity-95 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
