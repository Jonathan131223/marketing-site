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

export const blogPosts: BlogPost[] = [
  {
    slug: "saas-welcome-email",
    title: "SaaS welcome email: best practices with 28 examples",
    description: "Build a winning SaaS welcome email! Discover best practices, timing tips, real-life examples and behavior-based ideas to level up your onboarding experience.",
    shortDescription: "Get expert tips to craft welcome emails that wow users and kickstart product engagement!",
    date: "2026-03-23",
    readTime: "12 min read",
    thumbnail: "/blog/saas-welcome-email/banner.webp",
    heroImage: "/blog/saas-welcome-email/banner.webp",
    libraryTags: ["welcome-free-users", "welcome-paid-users"],
  },
  {
    slug: "product-launch-email",
    title: "Product launch email: best practices with 23 examples",
    description: "Discover what makes a great product launch email for SaaS. See real examples, proven strategies, and templates to boost engagement and conversions.",
    shortDescription: "Explore 23 standout emails and tips to nail your next big product launch.",
    date: "2026-03-15",
    readTime: "10 min read",
    thumbnail: "/blog/product-launch-email/banner.webp",
    heroImage: "/blog/product-launch-email/banner.webp",
    libraryTags: ["product-update", "feature-update", "new-feature-nudge"],
  },
  {
    slug: "saas-newsletter",
    title: "SaaS newsletter: best practices with 15 examples",
    description: "Explore how to craft a standout SaaS newsletter and build engagement with best practices, strategy tips, and 15 real life examples from top SaaS companies.",
    shortDescription: "Learn what makes a great newsletter with 15 SaaS examples that actually work.",
    date: "2026-03-01",
    readTime: "9 min read",
    thumbnail: "/blog/saas-newsletter/banner.webp",
    heroImage: "/blog/saas-newsletter/banner.webp",
    libraryTags: ["newsletter"],
  },
  {
    slug: "webinar-email-sequence",
    title: "Webinar email sequence: best practices with 25 examples",
    description: "Learn how to craft a high-converting webinar email sequence with proven strategies, timing tips, and real-life examples to boost signups and engagement.",
    shortDescription: "Want more webinar signups and engagement? Here's how your emails can deliver big.",
    date: "2026-03-23",
    readTime: "11 min read",
    thumbnail: "/blog/webinar-email-sequence/banner.webp",
    heroImage: "/blog/webinar-email-sequence/banner.webp",
    libraryTags: ["webinar-invitation", "webinar-confirmation"],
  },
  {
    slug: "webinar-follow-up-email",
    title: "Webinar follow up email: best practices with 13 examples",
    description: "Explore how to write an effective webinar follow up email with 13 real examples, smart segmentation, and tips to drive leads, clicks, and next steps.",
    shortDescription: "Get 13 follow-up email examples and tips to boost engagement after your next webinar.",
    date: "2026-02-15",
    readTime: "8 min read",
    thumbnail: "/blog/webinar-follow-up-email/banner.webp",
    heroImage: "/blog/webinar-follow-up-email/banner.webp",
    libraryTags: ["webinar-recording", "follow-up"],
  },
  {
    slug: "webinar-emails",
    title: "Webinar emails: best practices with 20 examples",
    description: "Learn how to craft high-converting webinar emails with best practices and 20 real examples from top B2B SaaS brands to boost attendance and engagement.",
    shortDescription: "See how top brands write compelling emails that drive signups, clicks, and webinar buzz.",
    date: "2026-02-01",
    readTime: "9 min read",
    thumbnail: "/blog/webinar-emails/banner.webp",
    heroImage: "/blog/webinar-emails/banner.webp",
    libraryTags: ["webinar-invitation", "webinar-confirmation", "webinar-recording"],
  },
  {
    slug: "milestone-emails",
    title: "Milestone emails: best practices with 12 examples",
    description: "Learn how to create a milestone email that drives engagement. Discover best practices, real SaaS examples, and tips to automate your customer success.",
    shortDescription: "Make milestone emails your secret weapon for better SaaS engagement and retention.",
    date: "2026-01-20",
    readTime: "8 min read",
    thumbnail: "/blog/milestone-emails/banner.webp",
    heroImage: "/blog/milestone-emails/banner.webp",
    libraryTags: ["milestone-reached", "usage-summary", "year-in-review"],
  },
  {
    slug: "upgrade-emails",
    title: "Upgrade emails: best practices with 13 examples",
    description: "Learn how to write upgrade emails that convert trial users into paying customers. Includes timing tips, best practices, and examples from top SaaS companies.",
    shortDescription: "Turn free users into customers with pro tips and examples from top companies.",
    date: "2026-01-15",
    readTime: "9 min read",
    thumbnail: "/blog/upgrade-emails/banner.webp",
    heroImage: "/blog/upgrade-emails/banner.webp",
    libraryTags: ["upgrade-cta", "trial-expired-upgrade", "trial-expiration-warning"],
  },
  {
    slug: "dunning-emails",
    title: "8 Dunning emails: best practices with 8 examples",
    description: "Learn how to write a dunning email that recovers failed payments, reduces churn, and keeps your customer relationships intact with these tips and examples.",
    shortDescription: "Real tips and examples to turn failed payments into recovered revenue—fast.",
    date: "2025-03-28",
    readTime: "7 min read",
    thumbnail: "/blog/dunning-emails/banner.webp",
    heroImage: "/blog/dunning-emails/banner.webp",
    libraryTags: ["payment-declined", "payment-reminder", "billing-reminder"],
  },
];
