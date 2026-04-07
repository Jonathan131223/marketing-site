import type { UseCase } from "@/types/emailGenerator";
import { FORM_FIELDS } from "@/config/emailFormFields";

// Import the useCaseConfig from BriefForm to access label overrides
const getUseCaseFieldLabel = (useCase: UseCase, fieldKey: string): string | null => {
  // Map of use cases to their field label overrides
  const labelOverrides: Record<UseCase, Record<string, string>> = {
    "activate-trialists": {
      destinationUrl: "CTA: Link to your most-used feature or popular use case",
    },
    welcome: {
      keyOutcome: "What value will they get?",
      destinationUrl: "CTA: Link to your app dashboard or first-setup page",
    },
    "trigger-nudge": {
      destinationUrl: "CTA: Link to the action they missed (e.g. team invite, SDK install)",
    },
    "milestone-celebration": {
      companyName: "Website URL",
      destinationUrl: "CTA: Link to next logical step (e.g. invite team, upgrade, explore new feature)",
    },
    "stall-detection-rescue": {
      destinationUrl: "CTA: Link to quickstart video, setup help, or support call",
    },
    "notify-trial-ending": {
      companyName: "Website URL",
      destinationUrl: "CTA: Link to upgrade or pricing page",
    },
    "reactivate-lost-trialist": {
      destinationUrl: "CTA: Link to restart trial or explore features",
    },
    "nurture-lost-trialists": {
      destinationUrl: "CTA: Link to feature update, blog post, or customer story",
    },
    "onboard-new-paid-users": {
      destinationUrl: "CTA: Link to your app dashboard or setup page",
    },
    "acknowledge-upgrade": {
      destinationUrl: "CTA: Link to use-case templates or advanced guides for new tier",
    },
    "did-you-know-tips": {
      destinationUrl: "CTA: Link to underused feature guide or video",
    },
    "offer-proactive-support": {
      destinationUrl: "CTA: Link to help center, contact support, or book a call",
    },
    "nps-survey": {
      destinationUrl: "CTA: Link to 0–10 NPS survey or feedback form",
    },
    "ask-for-reviews": {
      destinationUrl: "CTA: Link to G2, Capterra, or App Store review page",
    },
    "feature-drop": {
      destinationUrl: "CTA: Link to product update page or in-app feature tour",
    },
    "upsell-paid-users": {
      destinationUrl: "CTA: Link to upgrade or feature unlock page",
    },
    "switch-to-annual-billing": {
      destinationUrl: "CTA: Link to billing settings or annual plan page",
    },
    "usage-cap-warning": {
      destinationUrl: "CTA: Link to usage dashboard or upgrade page",
    },
    "plan-limit-hit": {
      destinationUrl: "CTA: Link to upgrade page",
    },
    "unlock-feature-teaser": {
      destinationUrl: "CTA: Link to feature demo or upgrade page",
    },
    "woo-passives": {
      destinationUrl: "CTA: Link to feedback form, feature request page, or account manager",
    },
    "make-things-right": {
      destinationUrl: "CTA: Link to support ticket, account settings, or redeem offer",
    },
    "recover-failed-payments": {
      destinationUrl: "CTA: Link to billing settings or payment update page",
    },
    "prevent-cancellation": {
      destinationUrl: "CTA: Link to retention offer page, support call, or billing options",
    },
    "acknowledge-downgrade": {
      destinationUrl: "CTA: Link to help center, feature comparison, or feedback survey",
    },
    "confirm-plan-cancellation": {
      destinationUrl: "CTA: Link to re-subscribe page or export data",
    },
    "winback-lost-customer": {
      destinationUrl: "CTA: Link to reactivation page or special offer",
    },
    "invite-accepted-notification": {
      destinationUrl: "CTA: Link to team dashboard or invite more members",
    },
    "invite-referrals": {
      destinationUrl: "CTA: Link to referral dashboard or share page",
    },
    "join-the-community": {
      destinationUrl: "CTA: Link to community platform (Slack, Discord, forum)",
    },
    "product-feedback-request": {
      destinationUrl: "CTA: Link to feedback form or survey",
    },
    "beta-invite": {
      destinationUrl: "CTA: Link to beta signup or opt-in page",
    },
    "promote-live-webinar": {
      destinationUrl: "CTA: Link to webinar registration page",
    },
    "new-article-drop": {
      destinationUrl: "CTA: Link to article or blog post",
    },
    "share-guide-report-ebook": {
      destinationUrl: "CTA: Link to download page or gated content",
    },
    "case-study-spotlight": {
      destinationUrl: "CTA: Link to full case study or customer stories page",
    },
    "growth-update-email": {
      destinationUrl: "CTA: Link to full announcement, product page, or blog",
    },
    "press-mention": {
      destinationUrl: "CTA: Link to press article or coverage page",
    },
  };

  // Check for use case specific override first
  if (labelOverrides[useCase]?.[fieldKey]) {
    return labelOverrides[useCase][fieldKey];
  }

  // Fall back to the base field label from FORM_FIELDS
  if (FORM_FIELDS[fieldKey]) {
    return FORM_FIELDS[fieldKey].label;
  }

  return null;
};

export const getFieldLabel = (useCase: UseCase, fieldKey: string): string => {
  const label = getUseCaseFieldLabel(useCase, fieldKey);

  if (label) {
    return label;
  }

  // Fallback: convert camelCase to readable text
  return fieldKey
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/(Url|Id|Api)/, (match) => match.toUpperCase());
};
