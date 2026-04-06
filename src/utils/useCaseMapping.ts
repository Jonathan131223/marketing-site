import { UseCase, UseCaseCategory } from '@/types/emailGenerator';

export const useCasesByCategory = {
  activation: [
    { id: 'welcome' as UseCase, icon: '👋', title: 'Welcome new free users', summary: 'Make a strong first impression and guide users to take their first key action fast.', active: true },
    { id: 'activate-trialists' as UseCase, icon: '🚀', title: 'Activate free trialists', summary: 'Turn interest into action with emails that push trial users to engage fast.', active: true },
    { id: 'trigger-nudge' as UseCase, icon: '🎯', title: 'Key action reminder', summary: 'Auto-nudge users who haven\'t taken a key action (e.g. invited team, installed SDK).', active: true },
    { id: 'milestone-celebration' as UseCase, icon: '🏆', title: 'Milestone celebration', summary: 'Trigger an email when user hits a key usage milestone.', active: true },
    { id: 'stall-detection-rescue' as UseCase, icon: '🛑', title: 'Stall detection rescue', summary: 'Detect inactivity during onboarding and intervene with help or motivation.', active: true },
    { id: 'notify-trial-ending' as UseCase, icon: '⏰', title: 'Notify about trial ending', summary: 'Give trial users a heads-up before their trial expires — with urgency, clear next steps, and upgrade CTA.', active: true },
    { id: 'reactivate-lost-trialist' as UseCase, icon: '🔁', title: 'Reactivate lost trialists', summary: 'Bring back trial users who ghosted — with smart, well-timed nudges.', active: true },
    { id: 'nurture-lost-trialists' as UseCase, icon: '🌱', title: 'Nurture lost trialists', summary: 'Stay top-of-mind for leads who didn\'t convert. Slow burn, high yield.', active: true }
  ],
  engagement: [
    { id: 'onboard-new-paid-users' as UseCase, icon: '🤝', title: 'Onboard new paid users', summary: 'Thank new paying customers for upgrading and help them get the most from their investment.', active: true },
    { id: 'acknowledge-upgrade' as UseCase, icon: '📈', title: 'Acknowledge upgrade', summary: 'Reinforce the value they\'ve unlocked and deepen commitment from already-paying customers.', active: true },
    { id: 'did-you-know-tips' as UseCase, icon: '💡', title: '"Did you know?" tips', summary: 'Lightweight education nudges to improve feature discovery & stickiness.', active: true },
    { id: 'offer-proactive-support' as UseCase, icon: '💬', title: 'Offer proactive support', summary: 'Anticipate friction and solve it before users even ask.', active: true },
    { id: 'nps-survey' as UseCase, icon: '📊', title: 'Send NPS survey', summary: 'Measure customer sentiment with a simple 0–10 score and trigger follow-ups based on response.', active: true },
    { id: 'ask-for-reviews' as UseCase, icon: '🌟', title: 'Ask for reviews (promoters)', summary: 'Turn fans into ambassadors with automated review requests.', active: true },
    { id: 'feature-drop' as UseCase, icon: '🧠', title: 'Feature drop', summary: 'Announce a new feature and guide users to try it out.', active: true }
  ],
  expansion: [
    { id: 'upsell-paid-users' as UseCase, icon: '💼', title: 'Upsell paid users', summary: 'Encourage existing paying users to move up to a higher plan by showcasing the outcomes and value they could unlock.', active: true },
    { id: 'switch-to-annual-billing' as UseCase, icon: '🛡️', title: 'Switch to annual billing', summary: 'Lock in committed users with timely annual plan nudges.', active: true },
    { id: 'usage-cap-warning' as UseCase, icon: '⚠️', title: 'Usage cap warning', summary: 'Let users know when they\'re close to hitting a plan limit — upsell moment.', active: true },
    { id: 'plan-limit-hit' as UseCase, icon: '❌', title: 'Plan limit hit', summary: 'Notify users when a usage cap has been fully reached and offer a clear path to unlock more.', active: true },
    { id: 'unlock-feature-teaser' as UseCase, icon: '🔓', title: 'Unlock feature X teaser', summary: 'Highlight a premium feature that the user tried to access but couldn\'t, and encourage them to upgrade.', active: true }
  ],
  churn: [
    { id: 'woo-passives' as UseCase, icon: '😐', title: 'Woo passives (from NPS survey)', summary: 'Turn "meh" into magic — engage passives and unlock new value.', active: true },
    { id: 'make-things-right' as UseCase, icon: '😠', title: 'Make things right (detractors)', summary: 'Repair trust with targeted, human-centered follow-up.', active: true },
    { id: 'recover-failed-payments' as UseCase, icon: '💳', title: 'Recover failed payments', summary: 'Win back lost revenue with smart retry flows + action buttons.', active: true },
    { id: 'prevent-cancellation' as UseCase, icon: '🔒', title: 'Prevent cancellation', summary: 'Detect churn signals early and counter with tailored retention plays.', active: true },
    { id: 'acknowledge-downgrade' as UseCase, icon: '📉', title: 'Acknowledge downgrade', summary: 'Confirm a plan change in a clear, respectful way while leaving the door open to revert.', active: true },
    { id: 'confirm-plan-cancellation' as UseCase, icon: '🚫', title: 'Confirm plan cancellation', summary: 'Close the loop with clarity and respect. Reaffirm what\'s changing, offer help, and leave the door open.', active: true },
    { id: 'winback-lost-customer' as UseCase, icon: '💔', title: 'Winback lost users', summary: 'Re-engage past customers with strong offers and emotional hooks.', active: true }
  ],
  community: [
    { id: 'invite-accepted-notification' as UseCase, icon: '👥', title: 'Invite accepted notification', summary: 'Celebrate small wins — a teammate joined! Encourages continued team adoption.', active: true },
    { id: 'invite-referrals' as UseCase, icon: '💌', title: 'Invite referrals', summary: 'Make it easy for happy users to bring friends. Built-in virality.', active: true },
    { id: 'join-the-community' as UseCase, icon: '🫂', title: 'Join the community', summary: 'Invite to Slack, Discord, or forum — deepen engagement + retention.', active: true },
    { id: 'product-feedback-request' as UseCase, icon: '🗣️', title: 'Product feedback request', summary: 'Ask users for roadmap input to surface insights from different perspectives.', active: true },
    { id: 'beta-invite' as UseCase, icon: '🏗️', title: 'Beta invite / early access', summary: 'Let users raise their hand for early features. Creates exclusivity.', active: true }
  ],
  content: [
    { id: 'promote-live-webinar' as UseCase, icon: '📅', title: 'Promote a live webinar', summary: 'Build anticipation and drive registrations with value-packed messaging.', active: true },
    { id: 'new-article-drop' as UseCase, icon: '🔥', title: 'New article drop', summary: 'Position it as solving a key pain. Include teaser bullets, quote preview, CTA.', active: true },
    { id: 'share-guide-report-ebook' as UseCase, icon: '📘', title: 'Share a guide, report, or ebook', summary: 'Position it as insider knowledge or exclusive insight. Use it to educate, engage, or deepen trust with your audience.', active: true },
    { id: 'case-study-spotlight' as UseCase, icon: '💼', title: 'Case study spotlight', summary: 'Real customer → real results. Use it to highlight product value + social proof.', active: true },
    { id: 'growth-update-email' as UseCase, icon: '🎊', title: 'Growth update email', summary: '"Here\'s what\'s new with us" — transparent, energizing, and social-shareable.', active: true },
    { id: 'press-mention' as UseCase, icon: '📣', title: 'Press mention or podcast feature', summary: 'Press coverage = instant credibility. Don\'t let that momentum go to waste.', active: true }
  ]
};

export const getCategoryForUseCase = (useCase: UseCase | null): UseCaseCategory | null => {
  if (!useCase) return null;

  for (const [category, useCases] of Object.entries(useCasesByCategory)) {
    if (useCases.some(uc => uc.id === useCase)) {
      return category as UseCaseCategory;
    }
  }
  return null;
};

export const getSuggestedUseCases = (currentUseCase: UseCase | null): Array<{id: UseCase, icon: string, title: string, summary: string}> => {
  const category = getCategoryForUseCase(currentUseCase);
  if (!category) return [];

  const categoryUseCases = useCasesByCategory[category];

  // Filter out the current use case and get up to 3 suggestions
  const suggestions = categoryUseCases
    .filter(uc => uc.id !== currentUseCase)
    .slice(0, 3);

  return suggestions;
};
