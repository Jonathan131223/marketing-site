import { posthog } from "./posthog";

/**
 * Single source of truth for every event we capture.
 *
 * Naming convention:
 *   <object>_<action>      e.g. url_submitted, cta_clicked, demo_video_played
 *
 * Property naming convention:
 *   snake_case             e.g. cta_label, page_section
 *
 * App-side events (signup, dns_configured, lifecycle_event_received,
 * email_sent, upgrade) are NOT defined here — they live in the app repo.
 * See docs/posthog-events.md for the cross-site event spec.
 */

type CtaSection =
  | "nav"
  | "hero"
  | "how-it-works"
  | "comparison"
  | "benefits"
  | "testimonial"
  | "faq"
  | "final-cta"
  | "footer"
  | "pricing-page"
  | "blog"
  | "library"
  | "compare"
  | "other";

interface BaseProps {
  page_path?: string;
}

interface UrlSubmittedProps extends BaseProps {
  page_section: "hero" | "final-cta";
  raw_url: string;
  normalized_url: string | null;
  is_valid: boolean;
}

interface CtaClickedProps extends BaseProps {
  cta_label: string;
  cta_destination: string;
  page_section: CtaSection;
}

interface DemoVideoProps extends BaseProps {
  video_id?: string;
  position_seconds?: number;
}

function safe(fn: () => void) {
  try {
    fn();
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[analytics]", err);
  }
}

export const track = {
  urlSubmitted(props: UrlSubmittedProps) {
    safe(() => posthog.capture("url_submitted", props));
  },

  ctaClicked(props: CtaClickedProps) {
    safe(() => posthog.capture("cta_clicked", props));
  },

  demoVideoPlayed(props: DemoVideoProps = {}) {
    safe(() => posthog.capture("demo_video_played", props));
  },

  demoVideoCompleted(props: DemoVideoProps = {}) {
    safe(() => posthog.capture("demo_video_completed", props));
  },

  pricingViewed(props: { plan_focus?: string } = {}) {
    safe(() => posthog.capture("pricing_viewed", props));
  },

  faqExpanded(props: { question: string }) {
    safe(() => posthog.capture("faq_expanded", props));
  },

  outboundLinkClicked(props: { destination: string; link_text?: string }) {
    safe(() => posthog.capture("outbound_link_clicked", props));
  },
};
