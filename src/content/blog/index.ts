export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  date: string;
  readTime: string;
  thumbnail?: string;
  heroImage?: string;
  /** Library tag slugs used to surface related email examples at the bottom of the article */
  libraryTags?: string[];
}

// Keep in sync with src/content/blog/*.md frontmatter. The `relatedPostsFor`
// logic in [slug].astro reads from this list. When adding a post, also add a
// matching .md file in this directory.

export const blogPosts: BlogPost[] = [
  {
    slug: "saas-email-benchmarks",
    title: "SaaS email benchmarks: what 1,051 lifecycle emails reveal",
    description: "We analyzed 1,051 lifecycle emails from 38 top SaaS companies. Here's what the data reveals about email types, subject lines, lifecycle coverage, and what the best brands do differently.",
    shortDescription: "Original research: what 1,051 SaaS lifecycle emails reveal about types, subject lines, and brand strategies.",
    date: "2026-04-07",
    readTime: "12 min read",
    libraryTags: ["welcome-free-users", "welcome-paid-users", "upgrade-cta", "product-update"],
  },
  {
    slug: "saas-welcome-email",
    title: "28 SaaS welcome email examples that activate users",
    description: "28 real welcome emails from SaaS brands that get activation right — plus behavior-based timing, subject-line patterns, and what to say in the first 24 hours.",
    shortDescription: "Get expert tips to craft welcome emails that wow users and kickstart product engagement!",
    date: "2026-03-23",
    readTime: "12 min read",
    thumbnail: "/blog/saas-welcome-email/banner.webp",
    heroImage: "/blog/saas-welcome-email/banner.webp",
    libraryTags: ["welcome-free-users", "welcome-paid-users"],
  },
  {
    slug: "product-launch-email",
    title: "23 product launch email examples from real SaaS (2026)",
    description: "23 real product launch emails from SaaS brands like Notion, Linear, Loom, and Figma — plus the timing, subject lines, and structure that actually drive adoption.",
    shortDescription: "Explore 23 standout emails and tips to nail your next big product launch.",
    date: "2026-03-15",
    readTime: "10 min read",
    thumbnail: "/blog/product-launch-email/banner.webp",
    heroImage: "/blog/product-launch-email/banner.webp",
    libraryTags: ["product-update", "feature-update", "new-feature-nudge"],
  },
  {
    slug: "saas-newsletter",
    title: "15 SaaS newsletter examples (and why they work)",
    description: "15 SaaS newsletters from teams that treat email as a product, not an afterthought. What they send, how often, and the structural choices that drive opens + clicks.",
    shortDescription: "Learn what makes a great newsletter with 15 SaaS examples that actually work.",
    date: "2026-03-01",
    readTime: "9 min read",
    thumbnail: "/blog/saas-newsletter/banner.webp",
    heroImage: "/blog/saas-newsletter/banner.webp",
    libraryTags: ["newsletter"],
  },
  {
    slug: "saas-onboarding-email-sequence",
    title: "The SaaS onboarding email sequence (7 emails, real examples)",
    description: "The complete 7-email SaaS onboarding sequence — from signup to upgrade — with real examples from Loom, Calendly, and Pipedrive. Timing, copy, and when to switch to behavior-based triggers.",
    shortDescription: "The 7-email SaaS onboarding sequence broken down, with real examples from Loom, Calendly, and Pipedrive.",
    date: "2026-04-21",
    readTime: "11 min read",
    libraryTags: ["welcome-free-users", "setup-prompt", "milestone-reached", "trial-expiration-warning", "upgrade-cta"],
  },
  {
    slug: "webinar-email-sequence",
    title: "The 7-email webinar sequence (25 SaaS examples, 2026)",
    description: "The 7-email webinar flow from invite to follow-up — with 25 real examples from Customer.io, Slack, HubSpot, and more. Timing, subject lines, and what to send when.",
    shortDescription: "Want more webinar signups and engagement? Here's how your emails can deliver big.",
    date: "2026-03-23",
    readTime: "11 min read",
    thumbnail: "/blog/webinar-email-sequence/banner.webp",
    heroImage: "/blog/webinar-email-sequence/banner.webp",
    libraryTags: ["webinar-invitation", "webinar-confirmation"],
  },
  {
    slug: "webinar-follow-up-email",
    title: "13 webinar follow up email examples (with subject lines)",
    description: "13 real webinar follow-up emails from top SaaS brands — with the subject lines that get opened, segmentation by attendance, and the path from recap to booked demo.",
    shortDescription: "Get 13 follow-up email examples and tips to boost engagement after your next webinar.",
    date: "2026-02-15",
    readTime: "8 min read",
    thumbnail: "/blog/webinar-follow-up-email/banner.webp",
    heroImage: "/blog/webinar-follow-up-email/banner.webp",
    libraryTags: ["webinar-recording", "follow-up"],
  },
  {
    slug: "webinar-follow-up-subject-lines",
    title: "25 webinar follow up subject lines (real SaaS examples)",
    description: "25 real webinar follow-up subject lines from Customer.io, Slack, Webflow, Stripe and other SaaS brands — organized by audience (attended vs no-show) and timing.",
    shortDescription: "25 real subject lines that get webinar follow-up emails opened — by audience and timing.",
    date: "2026-04-20",
    readTime: "6 min read",
    libraryTags: ["webinar-recording", "follow-up"],
  },
  {
    slug: "product-launch-email-subject-lines",
    title: "30 product launch email subject lines (real SaaS, 2026)",
    description: "30 real product launch subject lines from Notion, Loom, Linear, Zapier, and other SaaS brands — organized by launch type: new product, new feature, redesign, integration.",
    shortDescription: "30 real subject lines that get product launch emails opened — by launch type.",
    date: "2026-04-20",
    readTime: "7 min read",
    libraryTags: ["product-update", "new-feature-nudge", "feature-update"],
  },
  {
    slug: "milestone-emails",
    title: "12 SaaS milestone email examples that drive retention",
    description: "12 real milestone emails from top SaaS brands — and the timing, triggers, and copy choices that turn usage moments into retention and habit loops.",
    shortDescription: "Make milestone emails your secret weapon for better SaaS engagement and retention.",
    date: "2026-01-20",
    readTime: "8 min read",
    thumbnail: "/blog/milestone-emails/banner.webp",
    heroImage: "/blog/milestone-emails/banner.webp",
    libraryTags: ["milestone-reached", "usage-summary", "year-in-review"],
  },
  {
    slug: "upgrade-emails",
    title: "13 upgrade email examples that convert free users",
    description: "13 real upgrade emails that move SaaS users from free to paid — with the triggers, timing, and framing that consistently drive conversion without pressure.",
    shortDescription: "Turn free users into customers with pro tips and examples from top companies.",
    date: "2026-01-15",
    readTime: "9 min read",
    thumbnail: "/blog/upgrade-emails/banner.webp",
    heroImage: "/blog/upgrade-emails/banner.webp",
    libraryTags: ["upgrade-cta", "trial-expired-upgrade", "trial-expiration-warning"],
  },
  {
    slug: "dunning-emails",
    title: "Dunning emails: best practices + 8 SaaS examples (2026)",
    description: "A 2026 guide to dunning emails that recover failed payments without breaking trust. 8 real SaaS examples, timing + tone rules, and the exact sequence top brands use.",
    shortDescription: "Real tips and examples to turn failed payments into recovered revenue—fast.",
    date: "2025-03-28",
    readTime: "8 min read",
    thumbnail: "/blog/dunning-emails/banner.webp",
    heroImage: "/blog/dunning-emails/banner.webp",
    libraryTags: ["payment-declined", "payment-reminder", "billing-reminder"],
  },
];
