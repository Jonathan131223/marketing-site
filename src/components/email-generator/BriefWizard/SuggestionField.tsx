import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { FieldSuggestion } from "./types";

interface SuggestionFieldProps {
  label: string;
  sublabel?: string;
  value: string;
  suggestion?: FieldSuggestion;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "select";
  options?: Array<{ value: string; label: string }>;
}

export const SuggestionField: React.FC<SuggestionFieldProps> = ({
  label,
  sublabel,
  value,
  suggestion,
  onChange,
  onBlur,
  placeholder,
  required = false,
  type = "text",
  options,
}) => {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const isAiSuggested = suggestion && value === suggestion.selected;
  const hasAlternatives = suggestion && suggestion.alternatives.length > 0;

  const handleSelectAlternative = (alt: string) => {
    onChange(alt);
    setShowAlternatives(false);
  };

  if (type === "select" && options) {
    return (
      <div className="w-full">
        <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {sublabel && (
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            {sublabel}
          </p>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-full px-5 py-4 h-[58px] border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-900 shadow-sm hover:shadow-md appearance-none cursor-pointer"
          required={required}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {sublabel && (
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{sublabel}</p>
      )}

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-sm hover:shadow-md"
          required={required}
        />
      </div>

      {/* AI suggestion indicator and alternatives */}
      {suggestion && (
        <div className="mt-2 flex items-center gap-3">
          {isAiSuggested && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
              <Check className="w-4 h-4" />
              AI-suggested
            </span>
          )}

          {/* {hasAlternatives && (
            <button
              type="button"
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              Other suggestions
              {showAlternatives ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )} */}
        </div>
      )}

      {/* Alternatives dropdown */}
      {showAlternatives && hasAlternatives && (
        <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          {suggestion.alternatives.map((alt, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectAlternative(alt)}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-purple-50 transition-colors ${value === alt
                  ? "bg-purple-50 text-purple-700"
                  : "text-slate-700"
                }`}
            >
              {alt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
