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
  senderName?: string;
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
  dbId?: string;
  subject: string;
  preview: string;
  content: string;
  style: "professional" | "friendly" | "urgent" | string;
  brandTone: string;
  isHtml?: boolean;
}
