import React, { useState, useEffect, useCallback, useRef } from "react";
import { EmailTemplate, UseCase } from "@/types/emailGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmailSuggestions } from "./EmailSuggestions";
import { SuggestionInputRow } from "./EmailSubjectPreviewSection";
import { getCategoryForUseCase } from "@/utils/useCaseMapping";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  ChevronDown,
  Eye,
  Download,
  Copy,
  FileText,
  Code2,
  Mail,
  Calendar,
  Users,
  Zap,
  Clock,
  Lightbulb,
  Loader2,
  Copy as CopyIcon,
  Map,
  Settings2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCasesByCategory } from "@/utils/useCaseMapping";
import { renderEmailForContext, emailHasGrayBackground } from "@/utils/emailRenderer";
import { EmailClientPreview } from "./EmailClientPreview";

interface AIGeneratorPanelProps {
  email: EmailTemplate;
  onUpdate: (email: EmailTemplate) => void;
  onExport: () => void;
  selectedUseCase: UseCase | null;
  onSelectNewUseCase?: (useCase: UseCase) => void;
  sequenceMode?: boolean;
  // Sequence mode specific callbacks
  onViewJourney?: () => void;
  onExportAll?: () => void;
  onExportCurrent?: () => void;
  onOpenTemplateSettings?: () => void;
  isTemplateSettingsOpen?: boolean;
  /** When true, preview container uses gray background (e.g. from Template Tweaks Background Type). Overrides HTML detection when set. */
  previewContainerGray?: boolean;
  /** Direct callback for subject changes - bypasses onUpdate to avoid stale closure issues */
  onSubjectChange?: (subject: string) => void;
  /** Direct callback for preview text changes - bypasses onUpdate to avoid stale closure issues */
  onPreviewChange?: (preview: string) => void;
  /** Fires when suggestion fetching starts/ends so parent can show loading state */
  onSuggestionsLoading?: (loading: boolean) => void;
  /** Company domain extracted from brief data (e.g. "myapp.com") */
  companyDomain?: string;
  /** Sequence mode: founder name for preview "From" when not using verified domain sender */
  sequenceFromDisplayName?: string;
  /** When true, subject/preview fields are not rendered (parent renders EmailSubjectPreviewSection). */
  hideSubjectPreviewSection?: boolean;
  /** Controlled preview dialog (e.g. header "Email Preview" in sequence customize). Omit both for internal state. */
  emailPreviewOpen?: boolean;
  onEmailPreviewOpenChange?: (open: boolean) => void;
  /** Hide the default full-width Email Preview trigger; use with controlled open from parent. */
  hideEmailPreviewButton?: boolean;
}

interface SuggestionItem {
  subject: string;
  preview_text: string;
}

interface ApiSuggestionsResponse {
  status: string;
  suggestions: SuggestionItem[];
}

const getBlueprintData = (useCase: UseCase | null) => {
  const blueprints = {
    // Activation / Onboarding
    welcome: {
      whenToUse: "Immediately after account creation.",
      whoToTarget: "All new free users.",
      triggerType: "Behavior-based (signup complete).",
      timingCadence: "Send within 5 minutes of signup. Don't repeat.",
      bestPracticeTip:
        "Guide them to one clear action — don't overload this first touchpoint.",
    },
    "activate-trialists": {
      whenToUse:
        "During the first days of trial, with up to 3 emails each showcasing a different core feature.",
      whoToTarget:
        "New trial users who haven't yet completed those key actions (skip users already activated).",
      triggerType: "Behavior-based (trial start + feature usage).",
      timingCadence:
        "Send the first within 24 hours of trial start, then follow up on days 2–3 and day 5 if features remain unused.",
      bestPracticeTip:
        'Highlight one clear value moment or feature that unlocks the "aha."',
    },
    "trigger-nudge": {
      whenToUse: "After X hours/days of inactivity post-signup.",
      whoToTarget: "Users who skipped a key action.",
      triggerType: "Behavior-based (incomplete event).",
      timingCadence: "Triggered 24–48 hours after expected action.",
      bestPracticeTip:
        "Remind them of the value that action unlocks — make it feel rewarding, not corrective.",
    },
    "milestone-celebration": {
      whenToUse: "Immediately after milestone (e.g. first campaign launched).",
      whoToTarget:
        "Active users crossing usage threshold — applies to both onboarding and paying users.",
      triggerType: "Behavior-based (event reached).",
      timingCadence: "Instant or within 2 hours of milestone.",
      bestPracticeTip:
        'Celebrate + guide next step — "You did this, now do that."',
    },
    "stall-detection-rescue": {
      whenToUse: "No activity for X days after signup or key event.",
      whoToTarget: "Inactive users mid-onboarding.",
      triggerType: "Behavior-based (inactivity).",
      timingCadence:
        "3–5 days of no action. Send once, then escalate if needed.",
      bestPracticeTip:
        "Mix empathy with action — offer help and highlight next best step.",
    },
    "notify-trial-ending": {
      whenToUse:
        "24 hours before trial ends, and again at the exact moment of expiration (for 1–2 week trials).",
      whoToTarget: "All trial users who haven't upgraded.",
      triggerType: "Behavior-based (trial day count).",
      timingCadence:
        "Two-touch sequence: one email 48 hours before end, one at expiration.",
      bestPracticeTip: "Show what they'll lose *and* what they could gain.",
    },
    "reactivate-lost-trialist": {
      whenToUse: "3–7 days after trial ends without upgrade.",
      whoToTarget: "Trial users who didn't convert.",
      triggerType: "Behavior-based (trial expired without upgrade).",
      timingCadence: "Send once. Optional 2nd nudge a few days later.",
      bestPracticeTip:
        "Offer value, not pressure — spotlight missed potential or offer a soft return path.",
    },
    "nurture-lost-trialists": {
      whenToUse: "Ongoing, after trial ends and user didn't upgrade.",
      whoToTarget: "Cold trial users, no recent activity.",
      triggerType: "Manual or time-based (e.g. 2 weeks post-trial).",
      timingCadence:
        "One email weekly for the first month, then switch to a monthly cadence indefinitely.",
      bestPracticeTip:
        "Lead with education or insight, and keep them warm with newsletters, webinar invites, long-form content, or industry updates.",
    },

    // Engagement / Retention
    "onboard-new-paid-users": {
      whenToUse: "Right after a user upgrades or converts to paid.",
      whoToTarget: "Free users who have just upgraded to a paid plan.",
      triggerType: "Behavior-based (plan upgrade).",
      timingCadence: "Send within 5 minutes of upgrade.",
      bestPracticeTip:
        "Guide them to their *first win* — don't treat it like a generic welcome.",
    },
    "acknowledge-upgrade": {
      whenToUse: "Immediately after a user moves to a higher-tier plan.",
      whoToTarget: "Existing paying users who upgraded.",
      triggerType: "Behavior-based (plan tier change).",
      timingCadence: "Send instantly or within 1 hour of upgrade.",
      bestPracticeTip:
        "Show them what they *now* have access to — and guide the next action to try it.",
    },
    "did-you-know-tips": {
      whenToUse: "Periodically, once users are already paying and active.",
      whoToTarget: "Semi-active or passive users.",
      triggerType: "Manual or behavior-based (feature not used).",
      timingCadence: "One tip every 2 weeks, until engagement increases.",
      bestPracticeTip:
        "Make each tip actionable — one feature, one benefit, one CTA.",
    },
    "offer-proactive-support": {
      whenToUse:
        "After a user visits support documentation, knowledge base, or FAQs.",
      whoToTarget: "Paying users actively seeking help resources.",
      triggerType: "Behavior-based (support/knowledge base visits).",
      timingCadence: "Triggered within 24 hours of visit.",
      bestPracticeTip:
        "Lead with empathy, summarize what might help, and link directly to support or a quick contact option.",
    },
    "nps-survey": {
      whenToUse: "After 14–30 days of usage, or post-onboarding.",
      whoToTarget: "All active paying users.",
      triggerType: "Time-based (X days after plan start).",
      timingCadence:
        "Send once per user, ideally after they've had a fair product experience. If no response, follow up again 3–4 months later.",
      bestPracticeTip:
        "Follow up based on score — that's where the magic happens.",
    },
    "ask-for-reviews": {
      whenToUse: "After a high NPS score or strong usage signal.",
      whoToTarget: "NPS Promoters (score 9–10), power users.",
      triggerType: "Behavior-based (NPS or usage flag).",
      timingCadence: "Send once, within 1–3 days of signal.",
      bestPracticeTip: "Make it personal and easy — one-click CTA, clear ask.",
    },
    "feature-drop": {
      whenToUse: "After a major product update or new capability is launched.",
      whoToTarget: "All active users (or filtered by feature relevance).",
      triggerType: "Manual or time-based (launch date).",
      timingCadence: "Send on launch day. Optional reminder 3–5 days later.",
      bestPracticeTip:
        "Show value first, not specs — what problem does it solve?",
    },

    // Expansion / Revenue
    "upsell-paid-users": {
      whenToUse:
        "After a period of sustained usage that shows the user is extracting strong value from their current plan.",
      whoToTarget:
        "Paying users on lower tiers with high engagement and signs of being power users.",
      triggerType:
        "Behavior-based (consistent activity, breadth of feature usage, or frequent logins).",
      timingCadence: "1–2 nudges across a 7–14 day window.",
      bestPracticeTip:
        'Anchor upgrades on benefits and outcomes — "Here\'s how much more you could achieve."',
    },
    "switch-to-annual-billing": {
      whenToUse: "Around one month after a user upgrades to a paid plan.",
      whoToTarget: "Monthly users with 30+ days of usage.",
      triggerType: "Time-based (30–45 days after plan start).",
      timingCadence:
        "One primary nudge after 30–45 days, plus a follow-up every six months if usage remains consistent.",
      bestPracticeTip:
        "Lead with savings or perks — reinforce it's a *reward* for loyal use.",
    },
    "usage-cap-warning": {
      whenToUse: "As user approaches 80–90% of quota.",
      whoToTarget:
        "Active users approaching usage caps (e.g. storage, emails, seats).",
      triggerType: "Behavior-based (threshold logic).",
      timingCadence: "Trigger once per threshold. Optional follow-up reminder.",
      bestPracticeTip: "Frame it as a signal of success — not a penalty.",
    },
    "plan-limit-hit": {
      whenToUse: "When the user is hard-blocked from key action.",
      whoToTarget: "Users on capped plans who hit full usage.",
      triggerType: "Behavior-based (event failure due to cap).",
      timingCadence:
        "Send immediately. Follow up two days later if no upgrade is made.",
      bestPracticeTip: "Focus on what they'll gain — not what they've lost.",
    },
    "unlock-feature-teaser": {
      whenToUse:
        "When a free or lower-tier user attempts to access a gated feature (hover, blocked click, or preview exposure).",
      whoToTarget:
        "Free users or lower-tier customers exploring advanced functionality.",
      triggerType:
        "Behavior-based (attempted interaction with locked feature).",
      timingCadence:
        "Send within 24 hours of interaction. Optional follow-up 3–5 days later.",
      bestPracticeTip:
        'Keep it contextual — "You just discovered this feature. Here\'s how to unlock it."',
    },

    // Churn / Re-engagement
    "woo-passives": {
      whenToUse: "Within 24 hours after an NPS response of 7–8.",
      whoToTarget: "Users who replied with a score of 7–8 in the NPS survey.",
      triggerType: "Behavior-based (NPS score).",
      timingCadence: "Send one email only, within 1–2 days of response.",
      bestPracticeTip:
        "Show them something new — a feature, update, or benefit they've missed.",
    },
    "make-things-right": {
      whenToUse: "After 0–6 NPS or negative feedback.",
      whoToTarget:
        "Detractors identified in the NPS survey or flagged by support.",
      triggerType: "Behavior-based (NPS score or CSAT flag).",
      timingCadence: "Send same day. Optional follow-up if no response.",
      bestPracticeTip: "Make it personal — name, apology, and concrete fix.",
    },
    "recover-failed-payments": {
      whenToUse: "After failed payment attempt.",
      whoToTarget: "All affected users.",
      triggerType: "System-based (payment fail webhook).",
      timingCadence: "Send immediately, retry 2–3x over 7 days.",
      bestPracticeTip: "Make it stupid simple — link, button, done.",
    },
    "prevent-cancellation": {
      whenToUse:
        "After a period of inactivity or when user shows cancel intent (e.g. opened cancel page, support message).",
      whoToTarget: "At-risk users before actual cancellation.",
      triggerType: "Behavior-based (inactivity or cancel intent).",
      timingCadence:
        "Trigger once during exit path, with an optional follow-up.",
      bestPracticeTip:
        "Offer help, alternatives, or pause options — don't fight, guide.",
    },
    "acknowledge-downgrade": {
      whenToUse: "Immediately after downgrade.",
      whoToTarget: "Users reducing plan tier.",
      triggerType: "Behavior-based (plan change event).",
      timingCadence: "Send immediately.",
      bestPracticeTip: "Respect the decision — but show the path back.",
    },
    "confirm-plan-cancellation": {
      whenToUse: "After user confirms cancellation.",
      whoToTarget: "All churned users.",
      triggerType: "Behavior-based (cancel confirmed).",
      timingCadence: "Send immediately.",
      bestPracticeTip:
        "Make it easy to return. Share how to reactivate if/when they're ready.",
    },
    "winback-lost-customer": {
      whenToUse: "2–6 weeks after account cancellation.",
      whoToTarget: "Past subscribers who churned.",
      triggerType: "Behavior-based (account marked churned).",
      timingCadence: "1–2 touch series max.",
      bestPracticeTip: "Show what's new, not what they left behind.",
    },

    // Community / Advocacy
    "invite-accepted-notification": {
      whenToUse: "When someone accepts a team invite.",
      whoToTarget: "The original inviter.",
      triggerType: "Behavior-based (invite accepted).",
      timingCadence: "Send within 1 hour of action.",
      bestPracticeTip:
        'Celebrate, then prompt more — "Want to invite more teammates?"',
    },
    "invite-referrals": {
      whenToUse: "After user hits NPS 9–10, milestone, or success event.",
      whoToTarget: "Happy users, promoters, power users.",
      triggerType: "Behavior-based (NPS, milestone, or usage).",
      timingCadence:
        "Send once. Follow up every 6 months if no referrals have been made.",
      bestPracticeTip: "Give a reason to share — reward or impact.",
    },
    "join-the-community": {
      whenToUse: "After onboarding or activation.",
      whoToTarget: "Engaged users who could benefit from community.",
      triggerType: "Time-based or manual (post-activation).",
      timingCadence: "Send once after onboarding.",
      bestPracticeTip:
        "Highlight real activity — show what they're joining, not just why.",
    },
    "product-feedback-request": {
      whenToUse:
        "After usage patterns emerge, or post key interactions (e.g. NPS response, milestone).",
      whoToTarget: "All users — power, engaged, or passive.",
      triggerType: "Manual or behavior-based (usage tags, NPS, milestones).",
      timingCadence: "One-off or quarterly cycle.",
      bestPracticeTip:
        'Ask specific questions — don\'t just ask "What do you think?"',
    },
    "beta-invite": {
      whenToUse: "Before or during a beta launch.",
      whoToTarget: "Engaged users, power users, or target personas.",
      triggerType: "Manual or campaign-based.",
      timingCadence:
        "One email. Only repeat if additional beta testers are needed after the first campaign.",
      bestPracticeTip: "Set expectations — and give early testers a voice.",
    },

    // Content / Credibility
    "promote-live-webinar": {
      whenToUse: "7–14 days before the webinar date.",
      whoToTarget: "Leads, users, or ICP matches.",
      triggerType: "Manual or calendar-based.",
      timingCadence: "2–3 touches: invite, reminder, last call.",
      bestPracticeTip:
        "Emphasize the unique value of the session — whether it's a topic, outcome, or high-profile guest.",
    },
    "new-article-drop": {
      whenToUse: "Every time you publish meaningful thought leadership.",
      whoToTarget: "Leads, nurture lists, active users.",
      triggerType: "Manual.",
      timingCadence: "Send once only, within 24 hours of publish.",
      bestPracticeTip: "Hook fast — lead with the problem, not the title.",
    },
    "share-guide-report-ebook": {
      whenToUse: "When publishing a big asset.",
      whoToTarget:
        "Entire list — MQLs, trial users, prospects, and even power users.",
      triggerType: "Manual or campaign-based.",
      timingCadence: "Send once for each asset.",
      bestPracticeTip:
        "Make it skimmable — tease value upfront, don't bury the lead.",
    },
    "case-study-spotlight": {
      whenToUse:
        "As part of nurturing flows for inactive trial users, or re-engagement for churning/churned accounts.",
      whoToTarget:
        "Inactive trial users, churn-risk accounts, or churned users.",
      triggerType: "Manual or automated within nurture/win-back campaigns.",
      timingCadence: "One email per case study; rotate new ones over time.",
      bestPracticeTip:
        "Frame it as \"here's what's possible\" — aspirational and outcome-driven.",
    },
    "growth-update-email": {
      whenToUse:
        "After key milestones (funding, major product release, big growth moment).",
      whoToTarget: "All users, leads, and community.",
      triggerType: "Manual (founder/ops cadence).",
      timingCadence: "One email per release.",
      bestPracticeTip: "Share vision, progress, and real proof — not fluff.",
    },
    "press-mention": {
      whenToUse: "After media coverage or podcast release.",
      whoToTarget:
        "Inactive trial users, churn-risk accounts, or churned users to reinforce trust.",
      triggerType: "Manual.",
      timingCadence: "Share within 48 hours of publish.",
      bestPracticeTip:
        "Highlight the quote that matters — and invite users to share it.",
    },
  };

  return blueprints[useCase as keyof typeof blueprints];
};

export const AIGeneratorPanel: React.FC<AIGeneratorPanelProps> = ({
  email,
  onUpdate,
  // onExport,
  selectedUseCase,
  onSelectNewUseCase,
  sequenceMode = false,
  onViewJourney,
  onExportAll,
  onExportCurrent,
  onOpenTemplateSettings,
  isTemplateSettingsOpen = false,
  previewContainerGray,
  onSubjectChange,
  onPreviewChange,
  onSuggestionsLoading,
  companyDomain,
  sequenceFromDisplayName,
  hideSubjectPreviewSection = false,
  emailPreviewOpen,
  onEmailPreviewOpenChange,
  hideEmailPreviewButton = false,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewControlled =
    emailPreviewOpen !== undefined && onEmailPreviewOpenChange !== undefined;
  const dialogOpen = previewControlled ? !!emailPreviewOpen : isPreviewOpen;
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [previewSuggestions, setPreviewSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  // Propagate loading state to parent (so EmailEditor header can show loading indicator)
  useEffect(() => {
    if (hideSubjectPreviewSection) return;
    onSuggestionsLoading?.(isFetchingSuggestions);
  }, [isFetchingSuggestions, hideSubjectPreviewSection, onSuggestionsLoading]);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [localSubject, setLocalSubject] = useState<string>("");
  const [localPreview, setLocalPreview] = useState<string>("");
  const suggestionListsLoadedForEmailIdRef = useRef<string | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // Update preview content when email content changes
  useEffect(() => {
    // Always use centralized renderer for consistent preview
    const updatedContent = renderEmailForContext(email.content, "preview");
    setPreviewContent(updatedContent);
  }, [email.content]);

  // Listen for iframe content changes for immediate preview updates
  useEffect(() => {
    if (!dialogOpen) return;

    const handleIframeMessages = (event: MessageEvent) => {
      // Listen for DnD updates from the iframe to refresh preview immediately
      if (
        event.data.type === "dnd-update" ||
        event.data.type === "content-changed"
      ) {
        // Use centralized renderer for consistent preview updates
        const updatedContent = renderEmailForContext(email.content, "preview");
        setPreviewContent(updatedContent);
      }
    };

    window.addEventListener("message", handleIframeMessages);
    return () => window.removeEventListener("message", handleIframeMessages);
  }, [dialogOpen, email.content]);

  // Fetch subject and preview suggestions from API
  // In sequence mode selectedUseCase is null; use fallback so we still call the API
  const effectiveUseCase = selectedUseCase ?? (sequenceMode ? "welcome" : null);
  const emailRefForSuggest = useRef(email);
  emailRefForSuggest.current = email;
  const fetchSuggestions = async (opts?: { listsOnly?: boolean }) => {
    const listsOnly = opts?.listsOnly ?? false;
    if (!email.content) return;
    if (!effectiveUseCase) return;

    suggestAbortRef.current?.abort();
    const controller = new AbortController();
    suggestAbortRef.current = controller;

    setIsFetchingSuggestions(true);
    setSubjectSuggestions([]);
    setPreviewSuggestions([]);

    try {
      // Get the category for the use case (for sequence mode effectiveUseCase is "welcome" -> activation)
      const category =
        Object.entries(useCasesByCategory).find(([_, useCases]) =>
          useCases.some((uc) => uc.id === effectiveUseCase)
        )?.[0] || "activation";

      // Extract plain text from HTML - clean it first to remove editor controls and scripts
      const parser = new DOMParser();
      const doc = parser.parseFromString(email.content, "text/html");

      // Validate that we have a valid document
      if (!doc || (!doc.body && !doc.documentElement)) {
        console.error(
          "Failed to parse email content - invalid document structure"
        );
        throw new Error("Failed to parse email content");
      }

      // Remove all script tags, editor controls, and non-content elements
      const scripts = doc.querySelectorAll("script");
      scripts.forEach((script) => script.remove());

      // Remove iframes (they can contain website content)
      const iframes = doc.querySelectorAll("iframe");
      iframes.forEach((iframe) => iframe.remove());

      const editorControls = doc.querySelectorAll(
        ".gemini-left-controls, .gemini-right-controls, .gemini-control-button, .gemini-insert-popover, .gemini-button-control-popover, .gemini-image-control-popover, .gemini-social-control-popover, .gemini-social-block-control-popover, .gemini-padding-control-popover, .gemini-padding-icon"
      );
      editorControls.forEach((control) => control.remove());

      // Remove all style tags (both in head and body)
      const styles = doc.querySelectorAll("style");
      styles.forEach((style) => style.remove());

      // Remove preview text placeholders (hidden td elements with invisible characters)
      const previewTextElements = doc.querySelectorAll(
        'td[style*="display: none"], td[style*="font-size: 0"], td[style*="line-height: 0"]'
      );
      previewTextElements.forEach((el) => el.remove());

      // Remove footer content (copyright, address, unsubscribe links)
      const footerElements = doc.querySelectorAll(
        '#email-footer, #email-copy, [id*="footer"], td[id*="footer"]'
      );
      footerElements.forEach((el) => el.remove());

      // Remove social media sections (usually in footer)
      const socialElements = doc.querySelectorAll(
        '#email-socials, [id*="social"]'
      );
      socialElements.forEach((el) => el.remove());

      // Remove elements containing common footer patterns
      const allElements = doc.querySelectorAll("*");
      allElements.forEach((el) => {
        const text = el.textContent?.toLowerCase() || "";
        if (
          text.includes("unsubscribe") ||
          text.includes("\u00a9") ||
          text.includes("copyright") ||
          (text.includes("address") && text.includes("city")) ||
          text.match(/\d{4}\s*\.?\s*address/i)
        ) {
          if (el.children.length <= 2) {
            el.remove();
          }
        }
      });

      // Helper function to validate we have actual content (not just CSS or invisible chars)
      const hasRealContent = (text: string): boolean => {
        if (!text || text.trim().length < 20) return false;
        const cssPattern = /[{:;}]/g;
        const cssMatches = (text.match(cssPattern) || []).length;
        const textLength = text.length;
        if (cssMatches / textLength > 0.1) return false;
        const words = text.split(/\s+/).filter((w) => w.length > 2);
        if (words.length < 3) return false;
        return true;
      };

      // Get text content from main email body only (exclude footer)
      const contentSelectors = [
        "#email-intro, #email-body, #email-headline, #email-cta",
        'td[id^="email-"]:not([id*="footer"]):not([id*="social"]):not([id*="copy"])',
        "h1, h2, h3, h4, h5, h6",
        "p",
        "li",
      ];

      const emailContentPatterns = [
        ".email-block td",
        "table[width] td:not([id*='footer']):not([id*='social']):not([id*='copy'])",
      ];

      const contentElements: string[] = [];
      const seenText = new Set<string>();

      const websiteContentPatterns = [
        /\$\d+(\/month|\/year|\.\d{2})/i,
        /(free|pro|business|enterprise)\s+(plan|tier|pricing)/i,
        /(get started|sign up|login|register|dashboard)/i,
        /(features|pricing|about|contact|blog)/i,
        /digistorms\.ai/i,
        /(monthly|annual|yearly)\s+(price|billing)/i,
      ];

      const isWebsiteContent = (text: string): boolean => {
        const lowerText = text.toLowerCase();
        return websiteContentPatterns.some((pattern) =>
          pattern.test(lowerText)
        );
      };

      // First, try specific email content selectors
      contentSelectors.forEach((selector) => {
        try {
          const elements = doc.querySelectorAll(selector);
          elements.forEach((el) => {
            if (el.closest('#email-footer, #email-copy, [id*="footer"]')) {
              return;
            }

            const text = el.textContent?.trim() || "";
            const hasVisibleText =
              text.length > 3 &&
              !/^[\s\u200B-\u200D\uFEFF\u2060\u8291]*$/.test(text) &&
              !text.match(/^[\s\u8291]+$/);

            if (hasVisibleText) {
              let cleanText = text
                .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
                .trim();

              if (isWebsiteContent(cleanText)) {
                return;
              }

              cleanText = cleanText
                .replace(/HTML\s+Online\s+Viewer\s*\u00a9?\s*\d{4}\.?\s*/gi, "")
                .replace(/Address,\s*City/gi, "")
                .replace(/Unsubscribe/gi, "")
                .trim();

              if (cleanText.length > 3 && !seenText.has(cleanText)) {
                seenText.add(cleanText);
                contentElements.push(cleanText);
              }
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });

      // If we didn't find enough content, try email content patterns
      if (contentElements.length < 3) {
        emailContentPatterns.forEach((selector) => {
          try {
            const elements = doc.querySelectorAll(selector);
            elements.forEach((el) => {
              if (
                el.closest(
                  '#email-footer, #email-copy, #email-socials, [id*="footer"], [id*="social"]'
                )
              ) {
                return;
              }

              const text = el.textContent?.trim() || "";
              const hasVisibleText =
                text.length > 10 &&
                !/^[\s\u200B-\u200D\uFEFF\u2060\u8291]*$/.test(text) &&
                !text.match(/^[\s\u8291]+$/);

              if (hasVisibleText) {
                let cleanText = text
                  .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
                  .trim();

                if (isWebsiteContent(cleanText)) {
                  return;
                }

                cleanText = cleanText
                  .replace(/HTML\s+Online\s+Viewer\s*\u00a9?\s*\d{4}\.?\s*/gi, "")
                  .replace(/Address,\s*City/gi, "")
                  .replace(/Unsubscribe/gi, "")
                  .trim();

                if (cleanText.length > 10 && !seenText.has(cleanText)) {
                  seenText.add(cleanText);
                  contentElements.push(cleanText);
                }
              }
            });
          } catch (e) {
            // Ignore selector errors
          }
        });
      }

      // Join all content elements
      let plainText = contentElements.join(" ");

      // If we didn't find content with selectors, fall back to body text but filter invisible chars
      if (!plainText || !hasRealContent(plainText)) {
        const emailWrapper = doc.querySelector("#emailWrapper");
        if (emailWrapper) {
          const wrapperClone = emailWrapper.cloneNode(true) as Element;

          const nonContentSelectors = [
            "#email-footer",
            "#email-copy",
            "#email-socials",
            '[id*="footer"]',
            '[id*="social"]',
            '[id*="copy"]',
          ];
          nonContentSelectors.forEach((selector) => {
            const elements = wrapperClone.querySelectorAll(selector);
            elements.forEach((el) => el.remove());
          });

          const tableCells = wrapperClone.querySelectorAll("td");
          const cellTexts: string[] = [];
          tableCells.forEach((cell) => {
            const text =
              (cell as HTMLElement).innerText?.trim() ||
              cell.textContent?.trim() ||
              "";
            if (
              text.length > 15 &&
              hasRealContent(text) &&
              !isWebsiteContent(text) &&
              !text.match(/^(unsubscribe|copyright|\u00a9|\d{4})/i) &&
              !text.match(/^[{:;}\s]+$/)
            ) {
              cellTexts.push(text);
            }
          });

          if (cellTexts.length > 0) {
            plainText = cellTexts.join(" ");
          } else {
            const allText =
              (wrapperClone as HTMLElement).innerText ||
              wrapperClone.textContent ||
              "";

            plainText = allText
              .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
              .replace(/HTML\s+Online\s+Viewer\s*\u00a9?\s*\d{4}\.?\s*/gi, "")
              .replace(/Address,\s*City/gi, "")
              .replace(/Unsubscribe/gi, "")
              .trim();

            if (!hasRealContent(plainText)) {
              plainText = "";
            }
          }
        } else {
          const contentElement = doc.body || doc.documentElement;
          if (!contentElement) {
            let rawContent = email.content;
            rawContent = rawContent.replace(
              /<style[^>]*>[\s\S]*?<\/style>/gi,
              ""
            );
            rawContent = rawContent.replace(
              /<script[^>]*>[\s\S]*?<\/script>/gi,
              ""
            );
            plainText = rawContent
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            if (!hasRealContent(plainText)) {
              plainText = "";
            }
          } else {
            const tableCells = contentElement.querySelectorAll("td");
            const cellTexts: string[] = [];
            tableCells.forEach((cell) => {
              if (
                cell.closest(
                  '#email-footer, #email-copy, #email-socials, [id*="footer"], [id*="social"]'
                )
              ) {
                return;
              }

              const text =
                (cell as HTMLElement).innerText?.trim() ||
                cell.textContent?.trim() ||
                "";
              if (
                text.length > 15 &&
                hasRealContent(text) &&
                !isWebsiteContent(text) &&
                !text.match(/^(unsubscribe|copyright|\u00a9|\d{4})/i) &&
                !text.match(/^[{:;}\s]+$/)
              ) {
                cellTexts.push(text);
              }
            });

            if (cellTexts.length > 0) {
              plainText = cellTexts.join(" ");
            } else {
              const allText =
                (contentElement as HTMLElement).innerText ||
                contentElement.textContent ||
                "";

              plainText = allText
                .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
                .replace(/HTML\s+Online\s+Viewer\s*\u00a9?\s*\d{4}\.?\s*/gi, "")
                .replace(/Address,\s*City/gi, "")
                .replace(/Unsubscribe/gi, "")
                .trim();

              if (!hasRealContent(plainText)) {
                plainText = "";
              }
            }
          }
        }
      }

      // Clean up the text
      plainText = plainText
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();

      plainText = plainText
        .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
        .replace(/HTML\s+Online\s+Viewer\s*\u00a9?\s*\d{4}\.?\s*/gi, "")
        .replace(/Address,\s*City/gi, "")
        .replace(/Unsubscribe/gi, "")
        .trim();

      // Remove duplicate sentences/phrases
      const allSentences = plainText.split(/[.!?]\s+/);
      const uniqueSentences: string[] = [];
      const seenSentences = new Set<string>();

      allSentences.forEach((sentence) => {
        const trimmed = sentence.trim();
        if (trimmed.length < 10) return;
        if (isWebsiteContent(trimmed)) return;
        if (
          trimmed.match(
            /(digistorms\.ai|pricing|plans|features|get started|sign up|login|register)/i
          )
        ) {
          return;
        }

        const normalized = trimmed.toLowerCase();
        if (!seenSentences.has(normalized)) {
          seenSentences.add(normalized);
          uniqueSentences.push(trimmed);
        }
      });

      plainText = uniqueSentences.join(". ").trim();

      if (!plainText || !hasRealContent(plainText)) {
        throw new Error(
          "Failed to extract meaningful content from email. Please ensure the email contains text content."
        );
      }

      // Limit to reasonable length
      if (plainText.length > 2000) {
        plainText = plainText.substring(0, 2000) + "...";
      }

      // Format use case as required by API
      const formattedUseCase = `${category}: ${effectiveUseCase}`;

      // Prepare form data
      const formData = new FormData();
      formData.append("use_case", formattedUseCase);
      formData.append("email_body", plainText);

      const response = await fetch(
        "https://api-test.digistorms.net/email-generator/subject/suggest",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      if (controller.signal.aborted) return;

      const data: ApiSuggestionsResponse = await response.json();
      if (controller.signal.aborted) return;

      if (response.ok) {
        if (data.status === "success" && data.suggestions?.length > 0) {
          setSubjectSuggestions(data.suggestions.map((s) => s.subject));
          setPreviewSuggestions(data.suggestions.map((s) => s.preview_text));

          if (!listsOnly) {
            const firstSuggestion = data.suggestions[0];
            const newSubject = firstSuggestion.subject || "";
            const newPreview = firstSuggestion.preview_text || "";

            setLocalSubject(newSubject);
            setLocalPreview(newPreview);

            if (newSubject) onSubjectChange?.(newSubject);
            if (newPreview) onPreviewChange?.(newPreview);

            onUpdate({
              ...email,
              subject: newSubject,
              preview: newPreview,
              _subjectOnlyUpdate: true,
              _previewOnlyUpdate: true,
            } as any);
          }
          suggestionListsLoadedForEmailIdRef.current = email.id;
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("Error fetching suggestions:", error);
      // Fall back to default suggestions if API fails
      const fallbackSubjects = [
        "Welcome to our service - Let's get you started!",
        "Your account is ready",
        "Welcome! Here's what to do first",
        "Let's create your first email",
        "Your journey begins now",
      ];
      const fallbackPreviews = [
        "Get started with our amazing features",
        "Everything you need to create powerful emails",
        "Your step-by-step guide to success",
        "Create, customize, and convert with ease",
        "Welcome to effortless email marketing",
      ];

      setSubjectSuggestions(fallbackSubjects);
      setPreviewSuggestions(fallbackPreviews);

      const newSubject = fallbackSubjects[0];
      const newPreview = fallbackPreviews[0];
      if (!listsOnly) {
        setLocalSubject(newSubject);
        setLocalPreview(newPreview);
        onSubjectChange?.(newSubject);
        onPreviewChange?.(newPreview);
        onUpdate({
          ...email,
          subject: newSubject,
          preview: newPreview,
          _subjectOnlyUpdate: true,
          _previewOnlyUpdate: true,
        } as any);
      }
      suggestionListsLoadedForEmailIdRef.current = email.id;
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // Initialize local state from email prop - only sync when email ID changes (new email)
  const previousEmailIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (hideSubjectPreviewSection) return;
    const isNewEmail = previousEmailIdRef.current !== email.id;

    if (isNewEmail) {
      setLocalSubject(email.subject || "");
      setLocalPreview(email.preview || "");
      setSubjectSuggestions([]);
      setPreviewSuggestions([]);
      suggestionListsLoadedForEmailIdRef.current = null;
      previousEmailIdRef.current = email.id;
    }
  }, [email.id, hideSubjectPreviewSection]);

  // Fetch /subject/suggest once per email when content is available
  const hasSuggestableContent = Boolean(
    email.content && email.content.trim().length > 0
  );
  useEffect(() => {
    if (hideSubjectPreviewSection) return;
    if (!hasSuggestableContent || !effectiveUseCase) return;
    if (suggestionListsLoadedForEmailIdRef.current === email.id) return;

    const e = emailRefForSuggest.current;
    const hasSubject = !!e.subject?.trim();
    const hasPreview = e.preview != null && String(e.preview).trim() !== "";
    const listsOnly = hasSubject && hasPreview;

    void fetchSuggestions({ listsOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally stable; emailRef has fresh fields
  }, [
    effectiveUseCase,
    sequenceMode,
    email.id,
    hasSuggestableContent,
    hideSubjectPreviewSection,
  ]);

  const handleSubjectChange = (value: string) => {
    setLocalSubject(value);

    // Use dedicated callback if available (bypasses stale closure in onUpdate)
    if (onSubjectChange) {
      onSubjectChange(value);
    }

    // Also update via onUpdate for store persistence
    onUpdate({
      id: email.id,
      subject: value,
      preview: email.preview || "",
      content: email.content || "",
      style: email.style || "professional",
      brandTone: email.brandTone || "",
      isHtml: email.isHtml ?? true,
      _subjectOnlyUpdate: true
    } as any);
  };

  const handlePreviewChange = (value: string) => {
    setLocalPreview(value);

    if (onPreviewChange) {
      onPreviewChange(value);
    }

    onUpdate({ ...email, preview: value, _previewOnlyUpdate: true } as any);
  };

  const handleCopySubject = async () => {
    try {
      await navigator.clipboard.writeText(localSubject);
      toast.success("Subject line copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy subject line");
    }
  };

  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(localPreview);
      toast.success("Preview text copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy preview text");
    }
  };

  const handleCopyHTML = async () => {
    try {
      const contentToCopy = renderEmailForContext(
        email.content,
        "email-client"
      );
      await navigator.clipboard.writeText(contentToCopy);
      toast.success("HTML copied to clipboard!");
      setShowSuggestions(true);
    } catch (err) {
      console.error("Error copying HTML:", err);
      toast.error("Failed to copy HTML");
    }
  };

  // Preload images to prevent layout shifts
  const preloadImages = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const images = doc.querySelectorAll("img");
    const imageUrls: string[] = [];

    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (src && !src.startsWith("data:")) {
        imageUrls.push(src);
      }
    });

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  };

  // Update preview content when preview opens
  const handlePreviewOpen = (open: boolean) => {
    setIsPreviewOpen(open);
    setIsPreviewMode(open);

    if (open) {
      const previewContent = renderEmailForContext(email.content, "preview");
      setPreviewContent(previewContent);
      preloadImages(previewContent);
    }
  };

  // Keep preview content in sync when dialog is controlled from the parent (sequence header button).
  useEffect(() => {
    if (!previewControlled) return;
    setIsPreviewMode(!!emailPreviewOpen);
    if (emailPreviewOpen) {
      const pc = renderEmailForContext(email.content, "preview");
      setPreviewContent(pc);
      preloadImages(pc);
    }
  }, [previewControlled, emailPreviewOpen, email.content]);

  const hasGrayBackground = previewContainerGray ?? emailHasGrayBackground(email.content || "");

  const previewFromLabel =
    sequenceMode &&
      sequenceFromDisplayName?.trim() &&
      companyDomain?.trim()
      ? `${sequenceFromDisplayName.trim()} <hello@${companyDomain.trim()}>`
      : `DigiStorms <hello@digistorms.com>`;

  return (
    <div className="space-y-1">
      {/* Preview Button (trigger hidden when parent opens preview, e.g. sequence header) */}
      <div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (previewControlled) {
              onEmailPreviewOpenChange?.(open);
            } else {
              handlePreviewOpen(open);
            }
          }}
        >
          {!hideEmailPreviewButton && (
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={`w-full ${!sequenceMode ? "" : ""}bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300`}
              >
                Email Preview
                <Eye className="w-4 h-4 mr-2" />
              </Button>
            </DialogTrigger>
          )}
          <DialogContent
            className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            role="dialog"
            data-modal="preview"
          >
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Email Preview</DialogTitle>
            </DialogHeader>

            {/* Scrollable email preview area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <EmailClientPreview
                htmlContent={email.content}
                subject={
                  hideSubjectPreviewSection
                    ? email.subject || "No subject"
                    : localSubject || "No subject"
                }
                hasGrayBackground={hasGrayBackground}
                headerLabel="Email Client"
                iframeHeight="auto"
                iframeRef={previewIframeRef}
                fromLabel={previewFromLabel}
              />
            </div>

            {/* Export HTML button at bottom of preview */}
            <div className="flex-shrink-0 pt-4 border-t mt-4 bg-background">
              <Button
                onClick={handleCopyHTML}
                className="w-full"
              >
                <Code2 className="w-4 h-4 mr-2" />
                Export HTML
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!hideSubjectPreviewSection && (
        <div className="bg-white rounded-lg border border-border p-6 relative">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Subject Line & Preview
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isFetchingSuggestions}
              aria-busy={isFetchingSuggestions}
              className={cn(
                "text-muted-foreground transition-[opacity,filter] hover:text-foreground",
                isFetchingSuggestions && "blur-[0.4px]"
              )}
              onClick={() => {
                suggestionListsLoadedForEmailIdRef.current = null;
                void fetchSuggestions({ listsOnly: false });
              }}
            >
              Regenerate
            </Button>
          </div>

          {isFetchingSuggestions ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <p className="ml-4 text-muted-foreground">Getting suggestions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="subject"
                  className="text-sm font-medium text-foreground"
                >
                  Subject Line
                </Label>
                <div className="flex gap-2 mt-1">
                  <SuggestionInputRow
                    id="subject"
                    value={localSubject}
                    onValueChange={handleSubjectChange}
                    suggestions={subjectSuggestions}
                    inputClassName="flex-1"
                    ariaLabel="Subject line suggestions"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySubject}
                    className="px-3 shrink-0"
                    title="Copy subject line"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="preview"
                  className="text-sm font-medium text-foreground"
                >
                  Preview Text
                </Label>
                <div className="flex gap-2 mt-1">
                  <SuggestionInputRow
                    id="preview"
                    value={localPreview}
                    onValueChange={handlePreviewChange}
                    suggestions={previewSuggestions}
                    inputClassName="flex-1"
                    ariaLabel="Preview text suggestions"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPreview}
                    className="px-3 shrink-0"
                    title="Copy preview text"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Suggestions - shown after export actions */}
      {showSuggestions && onSelectNewUseCase && (
        <EmailSuggestions
          currentUseCase={selectedUseCase}
          onSelectUseCase={onSelectNewUseCase}
        />
      )}
    </div>
  );
};
