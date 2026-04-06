import { UseCase } from "@/types/emailGenerator";
import { FORM_FIELDS } from "@/config/emailFormFields";

export interface Question {
  key: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  sublabel?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface UseCaseConfig {
  title: string;
  icon: string;
  color: string;
  questions: Question[];
}

export const getWhyThisWorks = (useCase: UseCase): string => {
  const explanations: Record<UseCase, string> = {
    "activate-trialists":
      "Most trials fail from inaction — nudging users early increases product stickiness.",
    welcome:
      "Early momentum builds confidence — users who act quickly are more likely to upgrade.",
    "trigger-nudge":
      "Timely nudges recover drop-off and drive users toward activation milestones.",
    "milestone-celebration":
      "Recognizing progress builds emotional momentum and deepens engagement.",
    "stall-detection-rescue":
      "Strategic check-ins stop silent churn before it becomes permanent.",
    "notify-trial-ending":
      "Urgency drives decision — a timely nudge converts fence-sitters.",
    "reactivate-lost-trialist":
      "Users don't hate your product — they just got distracted. Smart follow-ups re-engage intent.",
    "nurture-lost-trialists":
      'Trust builds over time — strategic nurturing turns "not now" into "now I\'m ready."',
    "onboard-new-paid-users":
      "Thank new paying customers for upgrading and help them get the most from their investment.",
    "acknowledge-upgrade":
      "Upgrade moments are fragile — reinforcing value boosts confidence and prevents churn regret.",
    "did-you-know-tips":
      "Users don't explore — they follow cues. Tips surface value they didn't know existed.",
    "offer-proactive-support":
      "Preventing churn is easier than recovering it. Support that shows up early builds trust.",
    "nps-survey":
      "NPS is the fastest way to segment fans, passives, and churn risks — and act accordingly.",
    "ask-for-reviews":
      "Your happiest users won't write reviews unless you ask — at the right time.",
    "feature-drop":
      "New features drive re-engagement — if users know what's new and why it matters.",
    "upsell-paid-users":
      "Customers already seeing value are naturally more open to expanding.",
    "switch-to-annual-billing":
      "Annual plans reduce churn and signal commitment — but you have to ask.",
    "usage-cap-warning":
      "Scarcity drives urgency — especially when framed as a growth milestone.",
    "plan-limit-hit":
      "Blocker moments create conversion — if the upgrade path is obvious.",
    "unlock-feature-teaser":
      "Seeing value just out of reach makes the upgrade feel natural, not forced.",
    "woo-passives":
      "Passives are often one moment away from becoming promoters — if you give them a reason.",
    "make-things-right":
      "Acknowledging pain with action is the fastest way to rebuild loyalty.",
    "recover-failed-payments":
      "Most billing failures are accidental — fast, clear prompts recover them.",
    "prevent-cancellation":
      "Early intervention is the single best way to reduce churn.",
    "acknowledge-downgrade":
      "Downgrades often mean shifting needs — respecting the choice keeps trust and leaves space for return.",
    "confirm-plan-cancellation":
      "A graceful goodbye leaves a better chance for return.",
    "winback-lost-customer":
      "Time builds perspective — what didn't stick once might now.",
    "invite-accepted-notification":
      "Acknowledging this moment reinforces the behavior of inviting teammates and motivates users to keep growing their workspace.",
    "invite-referrals":
      "People trust peers more than marketing — referral nudges tap into that trust.",
    "join-the-community":
      "Belonging turns users into believers — especially when support and peers are in the room.",
    "product-feedback-request":
      "Feedback gives unique insights that shape product direction and strengthen user connection.",
    "beta-invite":
      "Exclusivity drives curiosity — and early adopters become advocates.",
    "promote-live-webinar":
      "Email is the most reliable way to maximize webinar attendance.",
    "new-article-drop":
      "Sharing educational content via email ensures the right audience sees it, driving authority and engagement.",
    "share-guide-report-ebook":
      "Deep content builds authority — and earns more attention than generic updates.",
    "case-study-spotlight":
      "People trust people like them — case studies prove outcomes, not just features.",
    "growth-update-email":
      "Momentum is magnetic — users want to be part of something growing.",
    "press-mention":
      "Credibility borrowed is credibility earned — social proof from the outside hits different.",
  };

  return (
    explanations[useCase] ||
    "Smart email timing and personalization drives user engagement and conversion."
  );
};

export const useCaseConfig: Record<UseCase, UseCaseConfig> = {
  "activate-trialists": {
    title: "Activate free trialists",
    icon: "🚀",
    color: "from-blue-400 via-blue-500 to-indigo-600",
    questions: [
      FORM_FIELDS.companyName,
      FORM_FIELDS.popularFeature,
      FORM_FIELDS.keyOutcome,
      FORM_FIELDS.supportOffered,
      {
        ...FORM_FIELDS.destinationUrl,
        label: "CTA: Link to your most-used feature or popular use case",
        placeholder: "e.g. https://yourapp.com/features/editor",
      },
    ],
  },
  welcome: {
    title: "Welcome new free users",
    icon: "👋",
    color: "from-emerald-400 via-teal-500 to-cyan-600",
    questions: [
      FORM_FIELDS.companyName,
      FORM_FIELDS.primaryAction,
      {
        ...FORM_FIELDS.keyOutcome,
        label: "What value will they get?",
        placeholder: "e.g., Start monitoring their company's performance",
      },
      {
        ...FORM_FIELDS.destinationUrl,
        label: "CTA: Link to your app dashboard or first-setup page",
        placeholder: "e.g., https://yourapp.com/dashboard",
      },
      FORM_FIELDS.supportOffered,
    ],
  },
  "trigger-nudge": {
    title: "Key Action Reminder",
    icon: "🎯",
    color: "from-orange-400 via-red-500 to-pink-600",
    questions: [
      FORM_FIELDS.companyName,
      FORM_FIELDS.failingAction,
      FORM_FIELDS.benefitUnlocked,
      {
        ...FORM_FIELDS.destinationUrl,
        label:
          "CTA: Link to the action they missed (e.g. team invite, SDK install)",
        placeholder: "e.g. https://yourapp.com/invite",
      },
    ],
  },
  "milestone-celebration": {
    title: "Milestone celebration",
    icon: "🏆",
    color: "from-amber-400 via-orange-500 to-red-500",
    questions: [
      { ...FORM_FIELDS.companyName, label: "Website URL" },
      FORM_FIELDS.milestoneTrigger,
      FORM_FIELDS.nextStep,
      {
        ...FORM_FIELDS.destinationUrl,
        label:
          "CTA: Link to next logical step (e.g. invite team, upgrade, explore new feature)",
        placeholder: "e.g. https://yourapp.com/invite",
      },
    ],
  },
  "stall-detection-rescue": {
    title: "Stall detection rescue",
    icon: "🛑",
    color: "from-red-400 via-rose-500 to-pink-600",
    questions: [
      FORM_FIELDS.companyName,
      FORM_FIELDS.caseStudyTestimonial,
      {
        ...FORM_FIELDS.destinationUrl,
        label: "CTA: Link to quickstart video, setup help, or support call",
        placeholder: "e.g. https://yourapp.com/help/onboarding",
      },
    ],
  },
  "notify-trial-ending": {
    title: "Trial ending notification",
    icon: "⏰",
    color: "from-rose-400 via-pink-500 to-blue-600",
    questions: [
      { ...FORM_FIELDS.companyName, label: "Website URL" },
      FORM_FIELDS.notificationTiming,
      FORM_FIELDS.accessLoss,
      FORM_FIELDS.recommendedPlan,
      {
        ...FORM_FIELDS.destinationUrl,
        label: "CTA: Link to upgrade or pricing page",
        placeholder: "e.g. https://yourapp.com/upgrade",
      },
    ],
  },
  "reactivate-lost-trialist": {
    title: "Reactivate lost trialists",
    icon: "🔁",
    color: "from-blue-400 via-indigo-500 to-blue-600",
    questions: [
      FORM_FIELDS.companyName,
      FORM_FIELDS.enticementOffer,
      FORM_FIELDS.caseStudyTestimonial,
      {
        ...FORM_FIELDS.destinationUrl,
        label: "CTA: Link to restart trial or explore features",
        placeholder: "e.g. https://yourapp.com/restart",
      },
    ],
  },
  "nurture-lost-trialists": {
    title: "Nurture lost trialists",
    icon: "🌱",
    color: "from-green-400 via-emerald-500 to-teal-600",
    questions: [
      FORM_FIELDS.companyName,
      FORM_FIELDS.mainTheme,
      FORM_FIELDS.featureUpdates,
      {
        ...FORM_FIELDS.destinationUrl,
        label: "CTA: Link to feature update, blog post, or customer story",
        placeholder: "e.g. https://yourapp.com/blog/update-2025",
      },
    ],
  },
  "onboard-new-paid-users": {
    title: "Onboard new paid users",
    icon: "🤝",
    color: "from-blue-400 via-cyan-500 to-teal-600",
    questions: [
      FORM_FIELDS.companyName,
      FORM_FIELDS.firstValueMoment,
      FORM_FIELDS.powerFeatureTip,
      {
        ...FORM_FIELDS.destinationUrl,
        label: "CTA: Link to your app dashboard or setup page",
        placeholder: "e.g. https://yourapp.com/checklist",
      },
    ],
  },
  "acknowledge-upgrade": {
    title: "Acknowledge upgrade",
    icon: "📈",
    color: "from-emerald-400 via-green-500 to-teal-600",
    questions: [
      FORM_FIELDS.companyName,
      FORM_FIELDS.newPlan,
      FORM_FIELDS.nextAction,
      {
        ...FORM_FIELDS.destinationUrl,
        label:
          "CTA: Link to use-case templates or advanced guides for new tier",
        placeholder: "e.g. https://yourapp.com/templates/team",
      },
    ],
  },
  "did-you-know-tips": {
    title: '"Did you know?" tips',
    icon: "💡",
    color: "from-yellow-400 via-amber-500 to-orange-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "underusedFeature",
        label: "What underused feature should users discover?",
        type: "text",
        placeholder: "Bulk editing",
        required: true,
      },
      {
        key: "featureBenefit",
        label: "What outcome or benefit does that feature unlock?",
        type: "text",
        placeholder: "Save time with fewer manual steps",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to underused feature guide or video",
        type: "text",
        placeholder: "e.g. https://yourapp.com/feature/saved-views",
        required: true,
      },
    ],
  },
  "offer-proactive-support": {
    title: "Offer proactive support",
    icon: "💬",
    color: "from-indigo-400 via-blue-500 to-pink-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "supportEvent",
        label:
          "Is this support tied to a recent event (e.g. error, inactivity)?",
        type: "text",
        placeholder: "User triggered an error",
        required: true,
      },
      {
        key: "helpType",
        label:
          "What type of help are you offering (e.g. guide, call, tutorials)?",
        type: "text",
        placeholder: "15-min call",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to help center, contact support, or book a call",
        type: "text",
        placeholder: "e.g. https://yourapp.com/support",
        required: true,
      },
    ],
  },
  "nps-survey": {
    title: "Send NPS survey",
    icon: "📊",
    color: "from-blue-400 via-slate-500 to-slate-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "surveyTiming",
        label: "What timing triggers this survey (e.g. 14 days post-signup)?",
        type: "text",
        placeholder: "14 days after signup",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to 0–10 NPS survey or feedback form",
        type: "text",
        placeholder: "e.g. https://yourapp.com/nps",
        required: true,
      },
    ],
  },
  "ask-for-reviews": {
    title: "Ask for reviews (promoters)",
    icon: "🌟",
    color: "from-yellow-400 via-orange-500 to-red-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "reviewPlatform",
        label: "Where do you want to send them (G2, Capterra, App Store)?",
        type: "text",
        placeholder: "G2",
        required: true,
      },
      {
        key: "reviewIncentive",
        label: "Do you want to offer any reward or incentive?",
        type: "text",
        placeholder: "Offer 20 AI tokens",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to G2, Capterra, or App Store review page",
        type: "text",
        placeholder: "e.g. https://g2.com/review/yourapp",
        required: true,
      },
    ],
  },
  "feature-drop": {
    title: "Feature drop",
    icon: "🧠",
    color: "from-blue-400 via-indigo-500 to-blue-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "featureName",
        label: "What's the name of the new feature?",
        type: "text",
        placeholder: "Insights 2.0",
        required: true,
      },
      {
        key: "featureValue",
        label: "What problem does it solve or value does it unlock?",
        type: "text",
        placeholder: "Saves teams 3+ hours/week on manual reporting",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to product update page or in-app feature tour",
        type: "text",
        placeholder: "e.g. https://yourapp.com/new/ai-editor",
        required: true,
      },
    ],
  },
  "upsell-paid-users": {
    title: "Upsell paid users",
    icon: "💼",
    color: "from-green-400 via-emerald-500 to-teal-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "premiumFeatures",
        label: "What premium feature(s) do you want to highlight?",
        type: "text",
        placeholder: "Advanced analytics and integrations",
        required: true,
      },
      {
        key: "featureBenefit",
        label: "What benefit or outcome does that feature drive?",
        type: "text",
        placeholder: "Increase efficiency",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to upgrade or feature unlock page",
        type: "text",
        placeholder: "e.g. https://yourapp.com/upgrade/pro",
        required: true,
      },
    ],
  },
  "switch-to-annual-billing": {
    title: "Switch to annual billing",
    icon: "🛡️",
    color: "from-indigo-400 via-blue-500 to-cyan-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "annualDiscount",
        label: "What is your discount or incentive for switching?",
        type: "text",
        placeholder: "Get 20% off when you switch to annual billing",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to annual billing page with discount",
        type: "text",
        placeholder: "e.g. https://yourapp.com/billing/annual",
        required: true,
      },
    ],
  },
  "usage-cap-warning": {
    title: "Usage cap warning",
    icon: "⚠️",
    color: "from-yellow-400 via-orange-500 to-red-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "usageLimit",
        label:
          "What usage limit are they approaching (e.g. tokens, operations, storage)?",
        type: "text",
        placeholder: "They're close to hitting their monthly token limit",
        required: true,
      },
      {
        key: "capConsequence",
        label: "What happens if they hit the cap (e.g. stop access)?",
        type: "text",
        placeholder: "Their access may be paused until upgrade",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to plan comparison or usage dashboard",
        type: "text",
        placeholder: "e.g. https://yourapp.com/plans",
        required: true,
      },
    ],
  },
  "plan-limit-hit": {
    title: "Plan limit hit",
    icon: "❌",
    color: "from-red-400 via-rose-500 to-pink-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "limitHit",
        label:
          "What exact limit did they hit (e.g. tokens, operations, storage)?",
        type: "text",
        placeholder: "Tokens",
        required: true,
      },
      {
        key: "upgradePath",
        label: "What's the best upgrade path to unlock it?",
        type: "text",
        placeholder: "Upgrade to Pro plan to unlock more tokens",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to upgrade or contact sales",
        type: "text",
        placeholder: "e.g. https://yourapp.com/upgrade",
        required: true,
      },
    ],
  },
  "unlock-feature-teaser": {
    title: "Unlock feature X teaser",
    icon: "🔓",
    color: "from-blue-400 via-indigo-500 to-blue-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "gatedFeature",
        label: "What's the gated feature you want to promote?",
        type: "text",
        placeholder: "AI-powered assistant",
        required: true,
      },
      {
        key: "featureBenefit",
        label: "What result or benefit does it deliver?",
        type: "text",
        placeholder: "Higher output, premium results",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to gated feature info or plan upgrade page",
        type: "text",
        placeholder: "e.g. https://yourapp.com/unlock/automation",
        required: true,
      },
    ],
  },
  "woo-passives": {
    title: "Woo passives (from NPS survey)",
    icon: "😐",
    color: "from-slate-400 via-slate-500 to-slate-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "offerHelp",
        label: "Do you want to offer help (e.g. call, demo, walkthrough)?",
        type: "text",
        placeholder: "Schedule a free 15-min call to discuss next steps",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to feature roadmap, update, or demo booking",
        type: "text",
        placeholder: "e.g. https://yourapp.com/roadmap",
        required: true,
      },
    ],
  },
  "make-things-right": {
    title: "Make things right (detractors)",
    icon: "😠",
    color: "from-red-400 via-orange-500 to-yellow-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "sneakPeekDetractors",
        label: "Do you want to include a sneak peek of what's coming?",
        type: "text",
        placeholder: "You'll love our new team templates dropping next week",
        required: true,
      },
      {
        key: "directSupportLine",
        label: "Do you want to include a direct line to support or founder?",
        type: "text",
        placeholder: "Reply to Sarah@yourbrand.com for support",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to support, personal email, or feedback form",
        type: "text",
        placeholder: "e.g. https://yourapp.com/support-call",
        required: true,
      },
    ],
  },
  "recover-failed-payments": {
    title: "Recover failed payments",
    icon: "💳",
    color: "from-red-400 via-pink-500 to-rose-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "paymentDeadline",
        label: "Do you want to include a deadline?",
        type: "text",
        placeholder: "72h to update card and avoid disruptions",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to billing page to retry payment",
        type: "text",
        placeholder: "e.g. https://yourapp.com/billing",
        required: true,
      },
    ],
  },
  "prevent-cancellation": {
    title: "Prevent cancellation",
    icon: "🔒",
    color: "from-orange-400 via-red-500 to-pink-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "productImprovements",
        label: "Should we highlight recent product improvements?",
        type: "text",
        placeholder: "We recently launched new integrations and speed upgrades",
        required: true,
      },
      {
        key: "caseStudyTestimonialPrevent",
        label: "Do you want to highlight any case study or testimonial?",
        type: "text",
        placeholder: "Link to case study or insert testimonial",
        required: false,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to success case, feature page, or schedule call",
        type: "text",
        placeholder: "e.g. https://yourapp.com/stay",
        required: true,
      },
    ],
  },
  "acknowledge-downgrade": {
    title: "Acknowledge downgrade",
    icon: "📉",
    color: "from-slate-400 via-slate-500 to-blue-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "planChange",
        label: "What plan are they switching from and to?",
        type: "text",
        placeholder: "Pro to Free",
        required: true,
      },
      {
        key: "featureLoss",
        label: "Should we highlight what they're losing (gently)?",
        type: "text",
        placeholder: "You'll lose access to bulk exports and analytics",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to feedback form or plan reconsideration page",
        type: "text",
        placeholder: "e.g. https://yourapp.com/switchback",
        required: true,
      },
    ],
  },
  "confirm-plan-cancellation": {
    title: "Confirm plan cancellation",
    icon: "🚫",
    color: "from-red-400 via-rose-500 to-pink-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "dataLoss",
        label: "What will be lost or disabled?",
        type: "text",
        placeholder: "Your data will be deleted in 7 days",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to exit survey or comeback offer (optional)",
        type: "text",
        placeholder: "e.g. https://yourapp.com/goodbye",
        required: true,
      },
    ],
  },
  "winback-lost-customer": {
    title: "Winback lost users",
    icon: "💔",
    color: "from-blue-400 via-pink-500 to-red-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "winbackValue",
        label: "What's the main value or feature you want to re-sell them on?",
        type: "text",
        placeholder: "Reclaim lost productivity with AI workflows",
        required: true,
      },
      {
        key: "winbackOffer",
        label: "Do you want to offer a discount, free trial, or special plan?",
        type: "text",
        placeholder: "We're offering a 7-day premium plan trial + 25% off",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to reactivation offer, new feature, or special plan",
        type: "text",
        placeholder: "e.g. https://yourapp.com/return",
        required: true,
      },
    ],
  },
  "invite-accepted-notification": {
    title: "Invite accepted notification",
    icon: "👥",
    color: "from-blue-400 via-indigo-500 to-blue-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "teamManagementLink",
        label: "Should we include links to manage team or permissions?",
        type: "text",
        placeholder: "If so, add link to manage team permissions in dashboard",
        required: true,
      },
    ],
  },
  "invite-referrals": {
    title: "Invite referrals",
    icon: "💌",
    color: "from-pink-400 via-rose-500 to-red-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "referralIncentive",
        label: "What incentive (if any) do you want to offer for referrals?",
        type: "text",
        placeholder: "Get a free month free credit for every friend you refer",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to referral program page",
        type: "text",
        placeholder: "e.g. https://yourapp.com/referrals",
        required: true,
      },
    ],
  },
  "join-the-community": {
    title: "Join the community",
    icon: "🫂",
    color: "from-indigo-400 via-blue-500 to-pink-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "communityType",
        label: "What kind of community is this (Slack, Discord, forum)?",
        type: "text",
        placeholder: "Slack group for product-led founders",
        required: true,
      },
      {
        key: "communityBenefits",
        label: "What benefit do users get from joining (support, tips, news)?",
        type: "text",
        placeholder: "Tips, support, and early product updates",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to Slack, Discord, or forum",
        type: "text",
        placeholder: "e.g. https://discord.gg/yourapp",
        required: true,
      },
    ],
  },
  "product-feedback-request": {
    title: "Product feedback request",
    icon: "🗣️",
    color: "from-blue-400 via-cyan-500 to-teal-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "feedbackTopic",
        label: "Is this a general request or for a specific topic/feature?",
        type: "text",
        placeholder: "Feedback on new dashboard layout",
        required: true,
      },
      {
        key: "feedbackMethod",
        label:
          "Is this leading to an external form or can users just reply to the email?",
        type: "text",
        placeholder: "Just reply to this email",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to feedback form or single-question survey",
        type: "text",
        placeholder: "e.g. https://yourapp.com/feedback",
        required: false,
      },
    ],
  },
  "beta-invite": {
    title: "Beta invite / early access",
    icon: "🏗️",
    color: "from-orange-400 via-amber-500 to-yellow-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "betaFeature",
        label: "What's the feature or product they'll get early access to?",
        type: "text",
        placeholder: "AI onboarding bot for new users",
        required: true,
      },
      {
        key: "betaBenefit",
        label: "What's the key benefit or reason to try it early?",
        type: "text",
        placeholder: "Be first to explore personalized setup",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to beta signup or early access form",
        type: "text",
        placeholder: "e.g. https://yourapp.com/beta",
        required: true,
      },
    ],
  },
  "promote-live-webinar": {
    title: "Promote a live webinar",
    icon: "📅",
    color: "from-blue-400 via-indigo-500 to-blue-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "webinarTopic",
        label: "What's the topic or promise of the webinar?",
        type: "text",
        placeholder: "How to onboard users 3x faster with AI",
        required: true,
      },
      {
        key: "webinarHost",
        label: "Who's hosting or speaking and why should users care?",
        type: "text",
        placeholder: "Jane Doe, Head of Lifecycle at Acme Co",
        required: true,
      },
      {
        key: "webinarDateTime",
        label: "What's the date/time and timezone?",
        type: "text",
        placeholder: "July 25 at 11am PST",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to webinar registration landing page",
        type: "text",
        placeholder: "e.g. https://yourapp.com/webinar",
        required: true,
      },
    ],
  },
  "new-article-drop": {
    title: "New article drop",
    icon: "🔥",
    color: "from-red-400 via-orange-500 to-yellow-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "articleMainIdea",
        label: "What's the main idea or takeaway of the article?",
        type: "text",
        placeholder: "How top SaaS brands onboard users with email",
        required: true,
      },
      {
        key: "articleBenefit",
        label: "How can this benefit your recipients?",
        type: "text",
        placeholder: "Learn better onboarding strategies",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to blog post or content hub",
        type: "text",
        placeholder: "e.g. https://yourapp.com/blog/product-led-onboarding",
        required: true,
      },
    ],
  },
  "share-guide-report-ebook": {
    title: "Share a guide, report, or ebook",
    icon: "📘",
    color: "from-blue-400 via-indigo-500 to-blue-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "guideType",
        label: "Is this a guide, report, or an eBook?",
        type: "text",
        placeholder: "It's a guide",
        required: true,
      },
      {
        key: "guideValue",
        label: "What's the main value or insight it delivers?",
        type: "text",
        placeholder: "Learn what top-performing SaaS teams do to reduce churn",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to gated or downloadable content",
        type: "text",
        placeholder: "e.g. https://yourapp.com/resources/retention-report",
        required: true,
      },
    ],
  },
  "case-study-spotlight": {
    title: "Case study spotlight",
    icon: "💼",
    color: "from-slate-400 via-slate-500 to-blue-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "caseStudyCustomer",
        label: "What customer is featured and what do they do?",
        type: "text",
        placeholder: "Figma, a design platform for teams",
        required: true,
      },
      {
        key: "caseStudyFeature",
        label: "What feature or use case did they leverage?",
        type: "text",
        placeholder: "Used collaborative templates to boost retention",
        required: true,
      },
      {
        key: "caseStudyResult",
        label: "What result or outcome did they achieve?",
        type: "text",
        placeholder: "Retention increased by 28% in 60 days",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to the full case study or customer story",
        type: "text",
        placeholder: "e.g. https://yourapp.com/customers/calendly",
        required: true,
      },
    ],
  },
  "growth-update-email": {
    title: "Growth update email",
    icon: "🎊",
    color: "from-green-400 via-emerald-500 to-teal-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "growthMilestones",
        label: "What key milestones or updates should we highlight?",
        type: "text",
        placeholder: "Hit 1M users",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to full update page or roadmap preview",
        type: "text",
        placeholder: "e.g. https://yourapp.com/updates/q3-2025",
        required: false,
      },
    ],
  },
  "press-mention": {
    title: "Press mention or podcast feature",
    icon: "📣",
    color: "from-yellow-400 via-orange-500 to-red-600",
    questions: [
      {
        key: "companyName",
        label: "What's your company URL?",
        type: "text",
        placeholder: "e.g., myapp.com",
        required: true,
      },
      {
        key: "pressOutlet",
        label: "What outlet or person featured you?",
        type: "text",
        placeholder: "Mention in TechCrunch by Sarah Smith",
        required: true,
      },
      {
        key: "pressTopic",
        label: "What was the topic or angle of the feature?",
        type: "text",
        placeholder: "Discussed the rise of AI in lifecycle marketing",
        required: true,
      },
      {
        key: "destinationUrl",
        label: "CTA: Link to podcast or article",
        type: "text",
        placeholder: "e.g. https://podcasts.apple.com/yourapp-feature",
        required: true,
      },
    ],
  },
};
