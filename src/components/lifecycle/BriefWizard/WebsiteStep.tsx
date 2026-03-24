import React, { useState } from "react";
import { Globe, CheckCircle2 } from "lucide-react";
import { isValidWebsiteUrl } from "@/services/websiteAnalysis";

interface WebsiteStepProps {
  websiteUrl: string;
  onWebsiteUrlChange: (url: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
}

export const WebsiteStep: React.FC<WebsiteStepProps> = ({
  websiteUrl,
  onWebsiteUrlChange,
  onAnalyze,
  isAnalyzing,
  error,
}) => {
  const [touched, setTouched] = useState(false);
  const isValid = isValidWebsiteUrl(websiteUrl);
  const showError = touched && websiteUrl && !isValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isAnalyzing) {
      onAnalyze();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-900/10 p-10 border border-slate-200/50">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Enter Your Website
          </h2>
          <p className="text-slate-600">
            We'll analyze your site to suggest personalized email content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="website-url-input" className="block text-sm font-semibold text-slate-700 mb-3">
              Company Website
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
              <input
                id="website-url-input"
                type="text"
                value={websiteUrl}
                onChange={(e) => onWebsiteUrlChange(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="https://yourcompany.com"
                className={`w-full pl-12 pr-5 py-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-sm hover:shadow-md ${
                  showError ? "border-red-300" : "border-slate-200"
                }`}
                disabled={isAnalyzing}
              />
            </div>
            {showError && (
              <p className="mt-2 text-sm text-red-500">
                Please enter a valid website URL
              </p>
            )}
            {error && (
              <p className="mt-2 text-sm text-amber-600">
                {error} — We'll continue with manual input.
              </p>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-2xl p-6 border border-purple-100/50">
            <h3 className="font-semibold text-slate-800 mb-4">What we'll do:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-slate-700">Extract your value proposition</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-slate-700">Identify key features</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-slate-700">Suggest onboarding actions</span>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={!isValid || isAnalyzing}
            data-flat-purple
            style={{
              backgroundColor: "#754bdd",
              boxShadow: "none",
              outline: "none",
              border: "none",
            }}
            className="w-full text-white px-8 py-4 rounded-xl font-semibold text-lg disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Analyzing...
              </>
            ) : (
              "Generate my onboarding emails"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
