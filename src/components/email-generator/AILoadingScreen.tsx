import React, { useEffect, useState } from "react";
import { BriefData } from "@/types/emailGenerator";
import { ProgressBar } from "./ProgressBar";
import GENERATION_GIF from "../../assets/GENERATION.gif";
import { getFieldLabel } from "@/utils/getFieldLabel";

interface AILoadingScreenProps {
  briefData: BriefData;
  onComplete: (briefDataWithAPI: BriefData) => void;
  onStartOver?: () => void;
  showProgressBar?: boolean;
}

const AILoadingScreen: React.FC<AILoadingScreenProps> = ({
  briefData,
  onComplete,
  onStartOver,
  showProgressBar = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Starting up...");
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const statusMessages = [
    "Analyzing your brand...",
    "Crafting your personalized emails...",
    "Optimizing for maximum engagement...",
    "Generating multiple variations...",
    "Applying the final touches...",
    "Email generation complete!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 1.5 + 0.5, 95);
        const messageIndex = Math.floor(
          (newProgress / 100) * statusMessages.length
        );
        setStatusText(
          statusMessages[Math.min(messageIndex, statusMessages.length - 1)]
        );
        return newProgress;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const mapUseCaseToAPIValue = (useCase: string): string => {
    const useCaseMapping: { [key: string]: string } = {
      // Activation category
      welcome: "activation/welcome",
      "activate-trialists": "activation/activate_trialists",
      "trigger-nudge": "activation/trigger_nudge",
      "milestone-celebration": "activation/milestone_celebration",
      "stall-detection-rescue": "activation/stall_detection_rescue",
      "notify-trial-ending": "activation/notify_trial_ending",
      "reactivate-lost-trialist": "activation/reactivate_lost_trialist",
      "nurture-lost-trialists": "activation/nurture_lost_trialists",

      // Engagement category (mapped to retention on backend)
      "onboard-new-paid-users": "retention/onboard_new_paid_users",
      "acknowledge-upgrade": "retention/acknowledge_upgrade",
      "did-you-know-tips": "retention/did_you_know_tips",
      "offer-proactive-support": "retention/offer_proactive_support",
      "nps-survey": "retention/nps_survey",
      "ask-for-reviews": "retention/ask_for_reviews",
      "feature-drop": "retention/feature_drop",

      // Expansion category
      "upsell-paid-users": "expansion/upsell_paid_users",
      "switch-to-annual-billing": "expansion/switch_to_annual_billing",
      "usage-cap-warning": "expansion/usage_cap_warning",
      "plan-limit-hit": "expansion/plan_limit_hit",
      "unlock-feature-teaser": "expansion/unlock_feature_teaser",

      // Churn category
      "woo-passives": "churn/woo_passives",
      "make-things-right": "churn/make_things_right",
      "recover-failed-payments": "churn/recover_failed_payments",
      "prevent-cancellation": "churn/prevent_cancellation",
      "acknowledge-downgrade": "churn/acknowledge_downgrade",
      "confirm-plan-cancellation": "churn/confirm_plan_cancellation",
      "winback-lost-customer": "churn/winback_lost_customer",

      // Community category
      "invite-accepted-notification": "community/invite_accepted_notification",
      "invite-referrals": "community/invite_referrals",
      "join-the-community": "community/join_the_community",
      "product-feedback-request": "community/product_feedback_request",
      "beta-invite": "community/beta_invite",

      // Content category
      "promote-live-webinar": "content/promote_live_webinar",
      "new-article-drop": "content/new_article_drop",
      "share-guide-report-ebook": "content/share_guide_report_ebook",
      "case-study-spotlight": "content/case_study_spotlight",
      "growth-update-email": "content/growth_update_email",
      "press-mention": "content/press_mention",
    };

    return useCaseMapping[useCase] || "activation/welcome";
  };

  // Helper function to generate key_info JSON with dynamic fields using actual form labels
  const generateKeyInfo = (briefData: BriefData): string => {
    const keyInfo: { [key: string]: string } = {};

    console.log("Generating key_info for use case:", briefData.useCase);
    console.log("BriefData fields:", Object.keys(briefData));

    // System fields to exclude from key_info
    const systemFields = new Set([
      "useCase",
      "companyName",
      "companyLogo",
      "image_logo_url",
      "toneOfVoice",
      "emailSignOff",
      "apiResponse",
      "senderName",
    ]);

    // Dynamically add all user-input fields to keyInfo (excluding system fields)
    Object.entries(briefData).forEach(([field, value]) => {
      // Skip system fields and empty values
      if (
        systemFields.has(field) ||
        !value ||
        (typeof value === "string" && !value.trim())
      ) {
        return;
      }

      // Get the actual label the user saw in the form
      const questionLabel = getFieldLabel(briefData.useCase, field);

      if (typeof value === "string") {
        console.log(`Adding field: ${field} -> ${questionLabel}: ${value}`);
        keyInfo[questionLabel] = value;
      }
    });

    console.log("Generated keyInfo:", keyInfo);
    return JSON.stringify(keyInfo);
  };

  const makeAPICall = async () => {
    try {
      setError(null);
      setIsRetrying(false);

      console.log("Making API call with briefData:", briefData);

      const formData = new FormData();

      // Add static fields (keep as separate parameters)
      formData.append("company_url", briefData.companyName || "");
      formData.append("company_name", briefData.companyName || "");
      formData.append("cta", briefData.destinationUrl || "");
      formData.append("tone", briefData.toneOfVoice || "friendly");
      formData.append("signature_style", briefData.emailSignOff || "team");
      formData.append("use_case", mapUseCaseToAPIValue(briefData.useCase));
      if (briefData.senderName?.trim()) {
        formData.append("sender_name", briefData.senderName.trim());
      }

      // Add logo (file or URL) — required by the API
      if (briefData.companyLogo) {
        formData.append("image_logo", briefData.companyLogo);
      } else if (briefData.image_logo_url) {
        formData.append("image_logo_url", briefData.image_logo_url);
      }

      // Add consolidated dynamic fields as single key_info parameter
      formData.append("key_info", generateKeyInfo(briefData));

      // Log FormData contents for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log("formData", formData);

      console.log(
        "About to make fetch request to:",
        "https://api-test.digistorms.net/email-generator/new"
      );
      console.log("Current origin:", window.location.origin);
      console.log("User agent:", navigator.userAgent);

      const response = await fetch(
        "https://api-test.digistorms.net/email-generator/new",
        {
          method: "POST",
          body: formData,
          mode: "cors", // Explicitly set CORS mode
          credentials: "omit", // Don't send credentials
        }
      );

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      // let apiErrorDetails = null;

      console.log("response", response);

      if (!response.ok) {
        try {
          // Try to get error details from the response
          const errorData = await response.text();
          // apiErrorDetails = errorData;

          // Parse common error types
          if (errorData.includes("Prompt file not found")) {
            errorMessage = `The "${briefData.useCase}" email type is not yet supported by our AI system. Please try a different email type or contact support.`;
          } else if (response.status === 500) {
            errorMessage = `Server error occurred while generating your email. ${errorData.substring(
              0,
              200
            )}${errorData.length > 200 ? "..." : ""}`;
          } else if (response.status === 400) {
            errorMessage = `Invalid request: ${errorData.substring(0, 200)}${errorData.length > 200 ? "..." : ""
              }`;
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      const apiResponse = await response.json();
      console.log("API Response:", apiResponse);

      setProgress(100);
      setStatusText("Email generation complete!");

      setTimeout(() => {
        onComplete({
          ...briefData,
          apiResponse,
        });
      }, 1000);
    } catch (error) {
      console.error("API Error:", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error name:",
        error instanceof Error ? error.name : "Unknown"
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack"
      );

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Show the actual error to the user
      setProgress(0);
      setError(errorMessage);
      setStatusText("Email generation failed");
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setError(null);
    setProgress(0);
    setStatusText("Retrying email generation...");
    makeAPICall();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      makeAPICall();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Progress Bar - only show if showProgressBar is true */}
      {showProgressBar && (
        <div className="px-6 pt-8 pb-4">
          <div className="max-w-7xl mt-8 mx-auto">
            <ProgressBar currentStep={3} />
          </div>
        </div>
      )}
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {error ? (
            /* Error State */
            <div className="mb-12">
              <div className="w-24 h-24 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Email Generation Failed
              </h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm leading-relaxed">{error}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isRetrying ? "Retrying..." : "Try Again"}
                </button>

                <button
                  onClick={onStartOver || (() => window.location.reload())}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Back to Brief
                </button>
              </div>
            </div>
          ) : (
            /* Loading State */
            <div className="mb-12">
              {/* Premium Logo Animation */}
              <div className="w-60 h-60 mx-auto relative">
                <div className="absolute inset-8 rounded-sm flex items-center justify-center overflow-hidden">
                  <img
                    src={GENERATION_GIF}
                    alt="Generating animation"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
                Stormi is creating your emails
              </h2>

              <p
                className="text-gray-600 mb-8 text-lg animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                {statusText}
              </p>
            </div>
          )}

          {!error && (
            <>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden border border-gray-200 shadow-inner">
                <div
                  className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 h-3 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                </div>
              </div>

              <div className="text-gray-700 font-medium text-lg">
                {Math.round(progress)}% Complete
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AILoadingScreen;
