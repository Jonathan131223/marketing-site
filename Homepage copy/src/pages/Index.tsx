import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthIntent, clearAuthIntent } from "@/utils/authIntent";
import { useAppStore } from "@/hooks/useAppStore";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { BrandInspirationSection } from "@/components/homepage/BrandInspirationSection";
import { BenefitsSection } from "@/components/homepage/BenefitsSection";
import { ROISectionHomepage } from "@/components/homepage/ROISectionHomepage";
import { FAQSection } from "@/components/homepage/FAQSection";
import { FounderStorySection } from "@/components/homepage/FounderStorySection";
import { OnboardingPainSection } from "@/components/homepage/OnboardingPainSection";
import { Footer } from "@/components/Footer";

import { TestimonialSection } from "@/components/homepage/TestimonialSection";
import mixpanel from "mixpanel-browser";
import { WebsiteStep } from "@/components/lifecycle/BriefWizard/WebsiteStep";
import { normalizeWebsiteUrl } from "@/services/websiteAnalysis";
import { useOrganizationData } from "@/hooks/useOrganizationData";

export type UseCase =
  | "welcome"
  | "activate-trialists"
  | "trigger-nudge"
  | "milestone-celebration"
  | "stall-detection-rescue"
  | "notify-trial-ending"
  | "reactivate-lost-trialist"
  | "nurture-lost-trialists"
  | "onboard-new-paid-users"
  | "acknowledge-upgrade"
  | "did-you-know-tips"
  | "offer-proactive-support"
  | "nps-survey"
  | "ask-for-reviews"
  | "feature-drop"
  | "upsell-paid-users"
  | "switch-to-annual-billing"
  | "usage-cap-warning"
  | "plan-limit-hit"
  | "unlock-feature-teaser"
  | "woo-passives"
  | "make-things-right"
  | "recover-failed-payments"
  | "prevent-cancellation"
  | "acknowledge-downgrade"
  | "confirm-plan-cancellation"
  | "winback-lost-customer"
  | "invite-accepted-notification"
  | "invite-referrals"
  | "join-the-community"
  | "product-feedback-request"
  | "beta-invite"
  | "promote-live-webinar"
  | "new-article-drop"
  | "share-guide-report-ebook"
  | "case-study-spotlight"
  | "growth-update-email"
  | "press-mention";
export type UseCaseCategory =
  | "activation"
  | "engagement"
  | "expansion"
  | "churn"
  | "community"
  | "content";

export interface BriefData {
  useCase: UseCase;
  companyName: string;
  productName: string;
  targetAudience: string;
  primaryAction: string;
  supportOffered?: string;
  keyOutcome?: string;
  trialDuration?: string;
  milestone?: string;
  destinationUrl?: string;
  emailSignOff?: string;
  toneOfVoice?: string;
  customSignature?: string;
  mediaFile?: File | null;
  imageDescription?: string;
  companyLogo?: File | null;
  image_logo_url?: string;
  helpOffered?: string;
  failingAction?: string;
  benefitUnlocked?: string;
  milestoneTrigger?: string;
  nextStep?: string;
  caseStudyTestimonial?: string;
  accessLoss?: string;
  recommendedPlan?: string;
  enticementOffer?: string;
  mainTheme?: string;
  featureUpdates?: string;
  firstValueMoment?: string;
  powerFeatureTip?: string;
  newPlan?: string;
  nextAction?: string;
  powerTipsTemplates?: string;
  underusedFeature?: string;
  featureBenefit?: string;
  guideVideoExample?: string;
  supportEvent?: string;
  helpType?: string;
  surveyTiming?: string;
  reviewPlatform?: string;
  successReference?: string;
  reviewIncentive?: string;
  featureName?: string;
  featureValue?: string;
  featureAvailability?: string;
  premiumFeatures?: string;
  annualDiscount?: string;
  usageLimit?: string;
  capConsequence?: string;
  planRecommendation?: string;
  limitHit?: string;
  upgradePath?: string;
  gatedFeature?: string;
  userLeverageExample?: string;
  offerHelp?: string;
  sneakPeek?: string;
  sneakPeekDetractors?: string;
  directSupportLine?: string;
  helpOffer?: string;
  paymentDeadline?: string;
  billingContact?: string;
  churnSignal?: string;
  productImprovements?: string;
  caseStudyTestimonialPrevent?: string;
  planChange?: string;
  featureLoss?: string;
  lastMinuteIncentive?: string;
  dataLoss?: string;
  feedbackRequest?: string;
  winbackValue?: string;
  winbackOffer?: string;
  winbackCaseStudy?: string;
  teamManagementLink?: string;
  referralIncentive?: string;
  idealReferralProfile?: string;
  communityType?: string;
  communityBenefits?: string;
  feedbackTopic?: string;
  feedbackMethod?: string;
  feedbackReward?: string;
  betaFeature?: string;
  betaBenefit?: string;
  betaInviteType?: string;
  webinarTopic?: string;
  webinarHost?: string;
  webinarDateTime?: string;
  articleMainIdea?: string;
  articleBenefit?: string;
  guideType?: string;
  guideValue?: string;
  caseStudyCustomer?: string;
  caseStudyFeature?: string;
  caseStudyResult?: string;
  growthMilestones?: string;
  growthStatsType?: string;
  roadmapPreview?: string;
  pressOutlet?: string;
  pressTopic?: string;
  apiResponse?: {
    html_content: Array<{
      variant_name: string;
      html: string;
    }>;
  };
}

export interface TemplateTweaks {
  tone: string;
  ctaButtonLook?: string;
  ctaButtonColor?: string;
  ctaButtonAlignment?: string;
  ctaButtonBorderRadius?: string;
  iconFamily: string;
  socialIconsFamily?: string;
  /** Which social platforms to show. undefined = show all detected. e.g. ["linkedin","twitter","instagram"] */
  enabledSocialIcons?: string[];
  language: string;
  logoAlignment?: string;
  logoBlendBackground?: boolean;
  footerType?: string;
  footerBlendBackground?: boolean;
  backgroundStyle?:
  | "default"
  | "gray"
  | "gray_border"
  | "gray_border_no_radius";
}

export interface EmailTemplate {
  id: string;
  dbId?: string; // Supabase record id for persistence
  subject: string;
  preview: string;
  content: string;
  style: "professional" | "friendly" | "urgent" | string;
  brandTone: string;
  isHtml?: boolean;
}

// type FlowStep = "picker" | "brief" | "loading" | "gallery" | "editor";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { workflow } = useAppStore();
  const { setWebsiteUrl } = useOrganizationData();
  const [sequenceWebsiteUrl, setSequenceWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Log homepage view on initial load
  useEffect(() => {
    console.log("🏠 Homepage: User landed on homepage");
    console.log(`👤 Homepage: User authenticated: ${!!user}`);
    console.log(`📍 Homepage: Current workflow step: ${workflow.currentStep}`);
    if (user) {
      console.log(`👤 Homepage: User ID: ${user.id}`);
    }

    // Track homepage view with Mixpanel
    mixpanel.track("custom.homepage_landed", {
      user_authenticated: !!user,
      user_id: user?.id || "",
    });
  }, []); // Empty dependency array - only runs once on mount

  // Redirect authenticated users, honoring auth intent to continue work
  useEffect(() => {
    if (!loading && user) {
      // Check if user is completing questionnaire (works for both email and Google signup)
      const completingQuestionnaire = localStorage.getItem(
        "completing_questionnaire"
      );
      if (completingQuestionnaire === "true") {
        console.log(
          "🛑 Preventing redirect - user is completing questionnaire"
        );
        return;
      }

      // Also check if SignupModal is showing questionnaire (fallback check)
      const modalElement = document.querySelector('[role="dialog"]');
      const isSignupModalOpen =
        modalElement &&
        (modalElement.innerHTML.includes("Where did you hear about us?") ||
          modalElement.innerHTML.includes("What describes you best?"));

      // Don't redirect if user is in the middle of questionnaire
      if (isSignupModalOpen) {
        console.log(
          "🛑 Preventing redirect - user is completing questionnaire (modal check)"
        );
        return;
      }

      // Additional check: if any dialog modal is open, delay redirect briefly
      // This handles timing issues where flag might not be set yet
      if (modalElement) {
        console.log("⏳ Modal is open, delaying redirect check...");
        return;
      }

      try {
        // Check for pending invite token first
        const pendingInviteToken = localStorage.getItem("pending_invite_token");
        if (pendingInviteToken) {
          console.log(
            "🎫 Found pending invite token, redirecting to accept invitation"
          );
          localStorage.removeItem("pending_invite_token");
          navigate(`/invite?token=${pendingInviteToken}`);
          return;
        }

        // Check for stored return URL (from Google OAuth flow on non-portal pages)
        const storedReturnUrl = localStorage.getItem("ds_auth_return_url");
        if (storedReturnUrl) {
          localStorage.removeItem("ds_auth_return_url");
          console.log("🔙 Found stored return URL, redirecting to:", storedReturnUrl);
          navigate(storedReturnUrl);
          return;
        }

        const intent = getAuthIntent();
        const lsWorkflow =
          localStorage.getItem("emailGenerationState") ||
          localStorage.getItem("digistorms_workflow_state");
        const parsed = lsWorkflow ? JSON.parse(lsWorkflow) : null;
        const step = parsed?.currentStep;
        const selectedEmail = parsed?.selectedEmail;
        const briefData = parsed?.briefData;

        // Determine target route - use same logic as Continue button and SignupModal
        // Priority: 1) Auth intent targetRoute, 2) Check for selectedEmail (editor), 3) Check for generated emails (gallery), 4) Check step, 5) Default
        let target = "/portal";

        if (intent?.targetRoute) {
          // Use auth intent route if available (most specific)
          target = intent.targetRoute;
        } else if (selectedEmail) {
          // If we have a selected email, go to customize (editor)
          target = "/portal/customize";
        } else if (briefData?.apiResponse?.html_content) {
          // If briefData has apiResponse, emails are generated - go to templates (gallery)
          target = "/portal/templates";
        } else if (briefData) {
          // If we have briefData but no generated emails, continue generation
          target = "/portal/generate/loading";
        } else if (step === "editor") {
          // If step is editor, go to customize
          target = "/portal/customize";
        } else if (step === "gallery") {
          // If step is gallery, go to templates
          target = "/portal/templates";
        } else if (step === "loading") {
          // If step is loading, go to generate/loading
          target = "/portal/generate/loading";
        } else if (step === "brief" || step === "picker") {
          // If step is brief or picker, go to generate
          target = "/portal/generate";
        }

        if (intent) {
          clearAuthIntent();
        }
        console.log("🚀 Redirecting authenticated user to:", target);
        navigate(target);
      } catch {
        console.log("🚀 Redirecting authenticated user to: /portal (fallback)");
        navigate("/portal");
      }
    }
  }, [user, loading, navigate]);

  const goToUseCases = () => {
    navigate("/use-cases");
  };

  const handleHeroSubmit = () => {
    const trimmed = sequenceWebsiteUrl.trim();
    if (!trimmed) return;
    navigate(`/analyzing?url=${encodeURIComponent(trimmed)}`);
  };

  const handleSequenceWebsiteAnalyze = async () => {
    const normalized = normalizeWebsiteUrl(sequenceWebsiteUrl);
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      await setWebsiteUrl(normalized);
      navigate("/email-sequence-generator?analyze=1");
    } catch {
      setAnalysisError("Failed to save. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Navbar />

      {/* Only show homepage content - all other steps are on separate routes */}
      <HeroSection
        websiteUrl={sequenceWebsiteUrl}
        onWebsiteUrlChange={setSequenceWebsiteUrl}
        onSubmit={handleHeroSubmit}
      />

      <OnboardingPainSection />

      <BenefitsSection />

      <TestimonialSection />

      <BrandInspirationSection />

      <ROISectionHomepage />

      <FounderStorySection />

      <FAQSection />

      {/* Email sequence generator trigger - final CTA; full flow on /email-sequence-generator */}
      <section id="email-sequence-generator-section" className="py-16 md:py-20 lg:py-24 container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Turn more free users into paying customers automatically
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
              Enter your website and our agent will generate your onboarding sequence in minutes.
            </p>
          </div>
          {/* Step indicator - step 1 of 4 to create illusion of continuous flow */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[
              { label: "Website", completed: false },
              { label: "Logo", completed: false },
              { label: "Brief", completed: false },
              { label: "Generate", completed: false },
            ].map((step, index) => (
              <Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${index === 0
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-slate-100 text-slate-400"
                      }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm ${index === 0 ? "text-slate-900 font-medium" : "text-slate-400"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className="w-8 sm:w-16 h-0.5 mt-[-20px] bg-slate-200" />
                )}
              </Fragment>
            ))}
          </div>
          <div className="max-w-2xl mx-auto">
            <WebsiteStep
              websiteUrl={sequenceWebsiteUrl}
              onWebsiteUrlChange={setSequenceWebsiteUrl}
              onAnalyze={handleSequenceWebsiteAnalyze}
              isAnalyzing={isAnalyzing}
              error={analysisError}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
