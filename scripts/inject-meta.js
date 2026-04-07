#!/usr/bin/env node
/**
 * Post-build meta injection script
 *
 * Generates static HTML files for every library route with the correct
 * <title>, <meta>, canonical, Open Graph, Twitter Card, and JSON-LD tags
 * already present in the HTML — no JavaScript execution required.
 *
 * Vercel serves static files before falling through to the catch-all
 * rewrite, so crawlers and LLMs that do not execute JS will still read
 * complete, accurate metadata.
 *
 * Usage:  node scripts/inject-meta.js
 * (runs automatically as part of the "build:seo" npm script)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const DIST      = join(ROOT, "dist");
const DATA      = join(ROOT, "public/data/library");
const BASE_URL  = "https://www.digistorms.ai";
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png`;

// ── Load data ─────────────────────────────────────────────────────────────────

const emails   = JSON.parse(readFileSync(join(DATA, "emails.json"),   "utf8"));
const brands   = JSON.parse(readFileSync(join(DATA, "brands.json"),   "utf8"));
const tags     = JSON.parse(readFileSync(join(DATA, "tags.json"),     "utf8"));
const usecases = JSON.parse(readFileSync(join(DATA, "usecases.json"), "utf8"));

const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b]));

// ── Helpers ───────────────────────────────────────────────────────────────────

function truncateAtWord(text, limit) {
  if (!text || text.length <= limit) return text ?? "";
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function esc(str) {
  return (str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildHead({ title, description, canonical, ogType = "website", ogImage, jsonLd }) {
  const desc = esc(truncateAtWord(description, 155));
  const t    = esc(title);
  const img  = esc(ogImage || DEFAULT_OG_IMAGE);
  const can  = esc(canonical);

  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${desc}" />`,
    `<link rel="canonical" href="${can}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${can}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:site_name" content="DigiStorms" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<meta name="twitter:site" content="@digistorms_ai" />`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : "",
  ].filter(Boolean).join("\n    ");
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── Read dist/index.html template ─────────────────────────────────────────────

const template = readFileSync(join(DIST, "index.html"), "utf8");

// ── Inject & write ────────────────────────────────────────────────────────────

let count = 0;
let staticPageCount = 0;

function writeRoute(urlPath, headMeta) {
  // Replace default title and description, then inject all tags before </head>
  let html = template
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/<meta name="description"[^>]*\/?>/, "")
    .replace("</head>", `    ${headMeta}\n  </head>`);

  const fsPath = join(DIST, ...urlPath.split("/").filter(Boolean), "index.html");
  mkdirSync(dirname(fsPath), { recursive: true });
  writeFileSync(fsPath, html);
  count++;
}

// ── Reusable schema fragments ────────────────────────────────────────────────

const publisherOrg = {
  "@type": "Organization",
  name: "DigiStorms",
  url: BASE_URL,
  logo: `${BASE_URL}/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png`,
};

const authorPerson = {
  "@type": "Person",
  name: "Jonathan Bernard",
  url: "https://www.linkedin.com/in/jonathan-digistorms/",
};

// ══════════════════════════════════════════════════════════════════════════════
// STATIC PAGES (non-library)
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. Homepage / ────────────────────────────────────────────────────────────

const homepageFAQs = [
  {
    q: "How does DigiStorms generate onboarding emails?",
    a: "DigiStorms analyzes your product to understand how users reach value. It identifies key steps in your onboarding journey, then generates a complete email sequence tailored to those milestones. Instead of writing emails from scratch, you get a structured onboarding flow aligned with how your product actually works.",
  },
  {
    q: "How is DigiStorms different from other email tools?",
    a: "Traditional tools require you to manually design sequences and guess what to send. DigiStorms does the opposite \u2014 it figures out your onboarding flow automatically and builds the right emails for you. It also triggers messages based on real user behavior, not fixed schedules, so users get the right message at the right time.",
  },
  {
    q: "Can I edit the emails before sending them?",
    a: "Yes. You have full control over every email. DigiStorms generates the initial sequence for you, but you can review, edit, and customize everything before going live.",
  },
  {
    q: "How long does it take to get started?",
    a: "Just a few minutes. You enter your website, DigiStorms analyzes your product, and your onboarding sequence is generated automatically. You can review and launch it right away.",
  },
  {
    q: "What do I need to connect to get started?",
    a: "All you need is your website to get started. To send emails and track user behavior, you\u2019ll connect your email provider and product events (via your existing tools or a simple integration).",
  },
  {
    q: "How does DigiStorms know when to send each email?",
    a: "DigiStorms sends emails based on what users actually do in your product. For example, it can trigger messages when someone signs up, reaches a milestone, or stops engaging. This ensures every email is sent at the most relevant moment.",
  },
  {
    q: "Does it really adapt to user behavior automatically?",
    a: "Yes. DigiStorms continuously reacts to user activity. If a user progresses quickly, stalls, or skips steps, the system adjusts and sends the most relevant message \u2014 no manual intervention needed.",
  },
  {
    q: "What results can I expect from using DigiStorms?",
    a: "Most SaaS products lose users before they reach value. DigiStorms helps fix that by guiding users through onboarding with the right messages at the right time. The result is typically higher activation, better engagement, and more users converting to paid.",
  },
];

writeRoute("/", buildHead({
  title: "DigiStorms.ai - AI Agent for Onboarding Emails",
  description: "DigiStorms is your AI agent for onboarding emails. It analyzes your product, maps the user journey, and builds a full lifecycle email system \u2014 automatically.",
  canonical: BASE_URL,
  ogType: "website",
  jsonLd: [
    // a. WebSite schema with SearchAction
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "DigiStorms",
      url: BASE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/library?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    // b. Organization schema
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "DigiStorms",
      url: BASE_URL,
      logo: `${BASE_URL}/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png`,
      description: "AI agent that builds lifecycle email systems for SaaS companies",
      founder: {
        "@type": "Person",
        name: "Jonathan Bernard",
        url: "https://www.linkedin.com/in/jonathan-digistorms/",
      },
      sameAs: [
        "https://www.linkedin.com/company/digistorms",
        "https://x.com/digistorms_ai",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        url: `${BASE_URL}/contact`,
      },
    },
    // c. SoftwareApplication schema
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "DigiStorms",
      url: BASE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "DigiStorms is your AI agent for onboarding emails. It analyzes your product, maps the user journey, and builds a full lifecycle email system \u2014 automatically.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "6",
        bestRating: "5",
      },
    },
    // d. FAQPage schema
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: homepageFAQs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ],
}));
staticPageCount++;

// ── 2. Blog index /blog ──────────────────────────────────────────────────────

writeRoute("/blog", buildHead({
  title: "Blog - SaaS Email Examples, Retention & Growth | DigiStorms",
  description: "Guides and real email examples for SaaS lifecycle marketing\u2014plus retention, PLG, and onboarding strategy. Activate users, reduce churn, and grow revenue.",
  canonical: `${BASE_URL}/blog`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "DigiStorms Blog",
    url: `${BASE_URL}/blog`,
    description: "Guides and real email examples for SaaS lifecycle marketing\u2014plus retention, PLG, and onboarding strategy. Activate users, reduce churn, and grow revenue.",
    publisher: publisherOrg,
  },
}));
staticPageCount++;

// ── 3. Blog posts ────────────────────────────────────────────────────────────

const blogPosts = [
  {
    slug: "saas-welcome-email",
    title: "SaaS welcome email: best practices with 28 examples | DigiStorms",
    description: "Build a winning SaaS welcome email! Discover best practices, timing tips, real-life examples and behavior-based ideas to level up your onboarding experience.",
    date: "2026-03-23",
    heroImage: "/blog/saas-welcome-email/banner.webp",
  },
  {
    slug: "webinar-email-sequence",
    title: "Webinar email sequence: best practices with 25 examples | DigiStorms",
    description: "Learn how to craft a high-converting webinar email sequence with proven strategies, timing tips, and real-life examples to boost signups and engagement.",
    date: "2026-03-23",
    heroImage: "/blog/webinar-email-sequence/banner.webp",
  },
  {
    slug: "product-launch-email",
    title: "Product launch email: best practices with 23 examples | DigiStorms",
    description: "Discover what makes a great product launch email for SaaS. See real examples, proven strategies, and templates to boost engagement and conversions.",
    date: "2026-03-15",
    heroImage: "/blog/product-launch-email/banner.webp",
  },
  {
    slug: "saas-newsletter",
    title: "SaaS newsletter: best practices with 15 examples | DigiStorms",
    description: "Explore how to craft a standout SaaS newsletter and build engagement with best practices, strategy tips, and 15 real life examples from top SaaS companies.",
    date: "2026-03-01",
    heroImage: "/blog/saas-newsletter/banner.webp",
  },
  {
    slug: "webinar-follow-up-email",
    title: "Webinar follow up email: best practices with 13 examples | DigiStorms",
    description: "Explore how to write an effective webinar follow up email with 13 real examples, smart segmentation, and tips to drive leads, clicks, and next steps.",
    date: "2026-02-15",
    heroImage: "/blog/webinar-follow-up-email/banner.webp",
  },
  {
    slug: "webinar-emails",
    title: "Webinar emails: best practices with 20 examples | DigiStorms",
    description: "Learn how to craft high-converting webinar emails with best practices and 20 real examples from top B2B SaaS brands to boost attendance and engagement.",
    date: "2026-02-01",
    heroImage: "/blog/webinar-emails/banner.webp",
  },
  {
    slug: "milestone-emails",
    title: "Milestone emails: best practices with 12 examples | DigiStorms",
    description: "Learn how to create a milestone email that drives engagement. Discover best practices, real SaaS examples, and tips to automate your customer success.",
    date: "2026-01-20",
    heroImage: "/blog/milestone-emails/banner.webp",
  },
  {
    slug: "upgrade-emails",
    title: "Upgrade emails: best practices with 13 examples | DigiStorms",
    description: "Learn how to write upgrade emails that convert trial users into paying customers. Includes timing tips, best practices, and examples from top SaaS companies.",
    date: "2026-01-15",
    heroImage: "/blog/upgrade-emails/banner.webp",
  },
  {
    slug: "dunning-emails",
    title: "8 Dunning emails: best practices with 8 examples | DigiStorms",
    description: "Learn how to write a dunning email that recovers failed payments, reduces churn, and keeps your customer relationships intact with these tips and examples.",
    date: "2025-03-28",
    heroImage: "/blog/dunning-emails/banner.webp",
  },
];

blogPosts.forEach((post) => {
  writeRoute(`/blog/${post.slug}`, buildHead({
    title: post.title,
    description: post.description,
    canonical: `${BASE_URL}/blog/${post.slug}`,
    ogType: "article",
    ogImage: `${BASE_URL}${post.heroImage}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: `${BASE_URL}${post.heroImage}`,
      url: `${BASE_URL}/blog/${post.slug}`,
      datePublished: post.date,
      author: authorPerson,
      publisher: publisherOrg,
    },
  }));
  staticPageCount++;
});

// ── 4. Pricing /pricing ──────────────────────────────────────────────────────

writeRoute("/pricing", buildHead({
  title: "Pricing - DigiStorms AI Agent for Onboarding Emails",
  description: "Simple, transparent pricing for DigiStorms. Get your full onboarding email system built and running \u2014 from signup to upgrade.",
  canonical: `${BASE_URL}/pricing`,
  jsonLd: breadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Pricing", url: `${BASE_URL}/pricing` },
  ]),
}));
staticPageCount++;

// ── 5. Manifesto /manifesto ──────────────────────────────────────────────────

writeRoute("/manifesto", buildHead({
  title: "The DigiStorms Manifesto \u2014 Turn Onboarding Into Revenue",
  description: "The DigiStorms manifesto. We believe onboarding is your growth engine. Discover how we map, build, and run lifecycle email systems that move users from signup to upgrade.",
  canonical: `${BASE_URL}/manifesto`,
  jsonLd: breadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Manifesto", url: `${BASE_URL}/manifesto` },
  ]),
}));
staticPageCount++;

// ── 6. Contact /contact ──────────────────────────────────────────────────────

writeRoute("/contact", buildHead({
  title: "Contact Us | DigiStorms",
  description: "Get in touch with the DigiStorms team. We help SaaS companies build lifecycle email sequences that drive activation, retention, and revenue.",
  canonical: `${BASE_URL}/contact`,
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact DigiStorms",
      url: `${BASE_URL}/contact`,
      description: "Get in touch with the DigiStorms team. We help SaaS companies build lifecycle email sequences that drive activation, retention, and revenue.",
    },
    breadcrumbSchema([
      { name: "Home", url: BASE_URL },
      { name: "Contact", url: `${BASE_URL}/contact` },
    ]),
  ],
}));
staticPageCount++;

// ── 7. ROI Calculator /roi-calculator ────────────────────────────────────────

writeRoute("/roi-calculator", buildHead({
  title: "Onboarding Email ROI Calculator | DigiStorms",
  description: "Calculate the ROI of better onboarding emails for your SaaS. See how improving free-to-paid conversion impacts your monthly revenue.",
  canonical: `${BASE_URL}/roi-calculator`,
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Onboarding Email ROI Calculator",
      url: `${BASE_URL}/roi-calculator`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "Calculate the ROI of better onboarding emails for your SaaS. See how improving free-to-paid conversion impacts your monthly revenue.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    breadcrumbSchema([
      { name: "Home", url: BASE_URL },
      { name: "ROI Calculator", url: `${BASE_URL}/roi-calculator` },
    ]),
  ],
}));
staticPageCount++;

// ── 8. Lifecycle Score /lifecycle-score ───────────────────────────────────────

writeRoute("/lifecycle-score", buildHead({
  title: "Check Your Onboarding Score | DigiStorms",
  description: "See how well you onboard new users in 60 seconds. Discover gaps in your welcome, activation, milestone, and upgrade emails \u2014 and fix them automatically.",
  canonical: `${BASE_URL}/lifecycle-score`,
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Lifecycle Score Checker",
      url: `${BASE_URL}/lifecycle-score`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "See how well you onboard new users in 60 seconds. Discover gaps in your welcome, activation, milestone, and upgrade emails \u2014 and fix them automatically.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    breadcrumbSchema([
      { name: "Home", url: BASE_URL },
      { name: "Lifecycle Score", url: `${BASE_URL}/lifecycle-score` },
    ]),
  ],
}));
staticPageCount++;

// ── 9. Email Generator /email-generator ──────────────────────────────────────

writeRoute("/email-generator", buildHead({
  title: "Lifecycle Email Generator | DigiStorms",
  description: "Generate a complete lifecycle email sequence for your SaaS product. Choose your use case, enter your website, and get onboarding emails in minutes.",
  canonical: `${BASE_URL}/email-generator`,
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Lifecycle Email Generator",
      url: `${BASE_URL}/email-generator`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "Generate a complete lifecycle email sequence for your SaaS product. Choose your use case, enter your website, and get onboarding emails in minutes.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    breadcrumbSchema([
      { name: "Home", url: BASE_URL },
      { name: "Email Generator", url: `${BASE_URL}/email-generator` },
    ]),
  ],
}));
staticPageCount++;

// ── 10. Privacy /privacy ─────────────────────────────────────────────────────

writeRoute("/privacy", buildHead({
  title: "Privacy Policy | DigiStorms",
  description: "DigiStorms privacy policy. Learn how we collect, use, and protect your data.",
  canonical: `${BASE_URL}/privacy`,
}));
staticPageCount++;

// ── 11. Terms /terms ─────────────────────────────────────────────────────────

writeRoute("/terms", buildHead({
  title: "Terms of Service | DigiStorms",
  description: "DigiStorms terms of service.",
  canonical: `${BASE_URL}/terms`,
}));
staticPageCount++;

// ══════════════════════════════════════════════════════════════════════════════
// LIBRARY PAGES
// ══════════════════════════════════════════════════════════════════════════════

// ── Library hub ───────────────────────────────────────────────────────────────

writeRoute("/library", buildHead({
  title: "Email Library \u2013 B2B SaaS Lifecycle Emails | DigiStorms",
  description: "Browse 1,000+ lifecycle emails from the best B2B SaaS companies. Filter by brand, tag, or use case. The largest B2B SaaS email library.",
  canonical: `${BASE_URL}/library`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Email Library \u2013 B2B SaaS Lifecycle Emails",
    description: "Browse 1,000+ lifecycle emails from the best B2B SaaS companies.",
    url: `${BASE_URL}/library`,
  },
}));

// ── Index pages ───────────────────────────────────────────────────────────────

writeRoute("/library/brands", buildHead({
  title: "All Brands \u2014 B2B SaaS Email Library | DigiStorms",
  description: `Explore lifecycle email sequences from ${brands.length}+ top B2B SaaS companies. Browse onboarding, engagement, expansion, and retention emails by brand.`,
  canonical: `${BASE_URL}/library/brands`,
  jsonLd: breadcrumbSchema([
    { name: "Library", url: `${BASE_URL}/library` },
    { name: "Brands",  url: `${BASE_URL}/library/brands` },
  ]),
}));

writeRoute("/library/tags", buildHead({
  title: "All Tags \u2014 B2B SaaS Email Library | DigiStorms",
  description: `Browse lifecycle emails by tag \u2014 welcome, upgrade, trial expiring, NPS, win-back, feature nudge, and ${tags.length - 10}+ more email types from top B2B SaaS companies.`,
  canonical: `${BASE_URL}/library/tags`,
  jsonLd: breadcrumbSchema([
    { name: "Library", url: `${BASE_URL}/library` },
    { name: "Tags",    url: `${BASE_URL}/library/tags` },
  ]),
}));

writeRoute("/library/usecases", buildHead({
  title: "All Use Cases \u2014 B2B SaaS Email Library | DigiStorms",
  description: "Explore lifecycle email use cases from top B2B SaaS companies \u2014 onboarding, education, expansion, milestone celebrations, win-back, feedback, and more.",
  canonical: `${BASE_URL}/library/usecases`,
  jsonLd: breadcrumbSchema([
    { name: "Library",   url: `${BASE_URL}/library` },
    { name: "Use Cases", url: `${BASE_URL}/library/usecases` },
  ]),
}));

// ── Brand detail pages ────────────────────────────────────────────────────────

brands.forEach((brand) => {
  const desc = brand.metaDesc || `Browse all ${brand.name} lifecycle emails in the DigiStorms library.`;
  writeRoute(`/library/brand/${brand.slug}`, buildHead({
    title: `${brand.name} Emails \u2014 B2B SaaS Library | DigiStorms`,
    description: desc,
    canonical: `${BASE_URL}/library/brand/${brand.slug}`,
    ogImage: brand.logo || DEFAULT_OG_IMAGE,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${brand.name} Emails`,
      description: truncateAtWord(desc, 155),
      url: `${BASE_URL}/library/brand/${brand.slug}`,
      breadcrumb: breadcrumbSchema([
        { name: "Library", url: `${BASE_URL}/library` },
        { name: "Brands",  url: `${BASE_URL}/library/brands` },
        { name: brand.name, url: `${BASE_URL}/library/brand/${brand.slug}` },
      ]),
    },
  }));
});

// ── Tag detail pages ──────────────────────────────────────────────────────────

tags.forEach((tag) => {
  const emailsForTag = emails.filter((e) => e.tags.includes(tag.slug));
  const desc = tag.summary ||
    `Browse ${emailsForTag.length} ${tag.name} emails from top B2B SaaS companies in the DigiStorms library.`;
  writeRoute(`/library/tag/${tag.slug}`, buildHead({
    title: `${tag.name} Emails \u2014 B2B SaaS Library | DigiStorms`,
    description: desc,
    canonical: `${BASE_URL}/library/tag/${tag.slug}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${tag.name} Emails`,
      description: truncateAtWord(desc, 155),
      url: `${BASE_URL}/library/tag/${tag.slug}`,
      breadcrumb: breadcrumbSchema([
        { name: "Library", url: `${BASE_URL}/library` },
        { name: "Tags",    url: `${BASE_URL}/library/tags` },
        { name: tag.name,  url: `${BASE_URL}/library/tag/${tag.slug}` },
      ]),
    },
  }));
});

// ── Use case detail pages ─────────────────────────────────────────────────────

usecases.forEach((uc) => {
  const emailsForUC = emails.filter((e) => e.useCase === uc.slug);
  const desc = uc.description ||
    `Browse ${emailsForUC.length} ${uc.name} emails from top B2B SaaS companies.`;
  writeRoute(`/library/usecase/${uc.slug}`, buildHead({
    title: `${uc.name} Emails \u2014 B2B SaaS Library | DigiStorms`,
    description: desc,
    canonical: `${BASE_URL}/library/usecase/${uc.slug}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${uc.name} Emails`,
      description: truncateAtWord(desc, 155),
      url: `${BASE_URL}/library/usecase/${uc.slug}`,
      breadcrumb: breadcrumbSchema([
        { name: "Library",   url: `${BASE_URL}/library` },
        { name: "Use Cases", url: `${BASE_URL}/library/usecases` },
        { name: uc.name,     url: `${BASE_URL}/library/usecase/${uc.slug}` },
      ]),
    },
  }));
});

// ── Email detail pages ────────────────────────────────────────────────────────

emails.forEach((email) => {
  const brand = brandMap[email.brand];
  const brandName = brand?.name ?? email.brand;
  const rawDesc = email.summary || `${email.subject} \u2014 a lifecycle email from ${brandName}.`;
  const desc = truncateAtWord(rawDesc, 155);

  let datePublished;
  if (email.setDate) {
    try { datePublished = new Date(email.setDate).toISOString().split("T")[0]; } catch {}
  }

  writeRoute(`/library/email/${email.slug}`, buildHead({
    title: `${email.subject} \u2014 ${brandName} | DigiStorms Library`,
    description: desc,
    canonical: `${BASE_URL}/library/email/${email.slug}`,
    ogType: "article",
    ogImage: email.thumb || DEFAULT_OG_IMAGE,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: email.subject,
      description: desc,
      ...(email.thumb ? { image: email.thumb } : {}),
      url: `${BASE_URL}/library/email/${email.slug}`,
      ...(datePublished ? { datePublished } : {}),
      author: { "@type": "Organization", name: brandName },
      publisher: { "@type": "Organization", name: "DigiStorms", url: BASE_URL },
      breadcrumb: breadcrumbSchema([
        { name: "Library",     url: `${BASE_URL}/library` },
        { name: brandName,     url: `${BASE_URL}/library/brand/${email.brand}` },
        { name: email.subject, url: `${BASE_URL}/library/email/${email.slug}` },
      ]),
    },
  }));
});

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\u2713 inject-meta: wrote ${count} pre-rendered HTML files to dist/`);
console.log(`  Static pages (non-library) : ${staticPageCount}`);
console.log(`  Library hub + index pages   : 4`);
console.log(`  Brand pages                 : ${brands.length}`);
console.log(`  Tag pages                   : ${tags.length}`);
console.log(`  Use case pages              : ${usecases.length}`);
console.log(`  Email pages                 : ${emails.length}`);
