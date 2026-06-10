#!/usr/bin/env node
/*
 * Render email-notification-card banners for blog posts. Matches the existing
 * /public/blog/<slug>/banner.webp style used by older articles (purple
 * background with subtle curves + centered inbox-style notification card with
 * headline, icon, body, and blue CTA button).
 *
 * Renders 1200x630 WebPs. Uses satori (JSX-like tree → SVG) + sharp (SVG →
 * WebP). No browser, no API keys. Reproducible.
 *
 * Usage:
 *   node scripts/blog-banners/render.mjs            # render all cards
 *   node scripts/blog-banners/render.mjs <slug>     # render one
 */
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const W = 1200;
const H = 630;

const FONT_BASE = join(ROOT, 'node_modules', '@fontsource');
const fonts = [
  { name: 'Instrument Sans', weight: 400, style: 'normal',
    data: readFileSync(`${FONT_BASE}/instrument-sans/files/instrument-sans-latin-400-normal.woff`) },
  { name: 'Instrument Sans', weight: 600, style: 'normal',
    data: readFileSync(`${FONT_BASE}/instrument-sans/files/instrument-sans-latin-600-normal.woff`) },
];

const BRAND = {
  lavender: '#EDE7F6',
  lavenderLine: '#C7BFE1',
  cardHeader: '#E5E7EB',
  cardBody: '#FFFFFF',
  navy: '#0F172A',
  body: '#475569',
  blue: '#2563EB',
  pill: '#F3F4F6',
  pillText: '#1F2937',
};

// 1200x630 lavender background with subtle curves (same motif as older banners).
function backgroundSvgDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${BRAND.lavender}"/>
    <g fill="none" stroke="${BRAND.lavenderLine}" stroke-width="2" opacity="0.55">
      <path d="M -40 120 C 180 40, 420 180, 620 90 S 1060 20, 1260 140"/>
      <path d="M -40 520 C 200 430, 380 600, 620 520 S 1080 420, 1260 540"/>
      <path d="M 80 -40 C 60 160, 260 280, 160 460 S 40 640, 140 760"/>
      <path d="M 1060 -40 C 1080 180, 980 320, 1100 480 S 1180 620, 1080 760"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Inline SVG icons. All drawn 48x48 on a transparent bg, blue stroke.
const ICONS = {
  envelope: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="20" fill="${BRAND.blue}"/>
    <rect x="9" y="12" width="22" height="16" rx="2" fill="#FFFFFF"/>
    <path d="M9 14 L20 22 L31 14" fill="none" stroke="#CBD5E1" stroke-width="1.5"/>
    <path d="M20 18 l-3 -3 a2 2 0 1 1 3 -1 a2 2 0 1 1 3 1 Z" fill="#EF4444"/>
  </svg>`,
  chart: `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="${BRAND.blue}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="6" width="44" height="44" rx="6"/>
    <line x1="14" y1="38" x2="14" y2="30"/>
    <line x1="22" y1="38" x2="22" y2="22"/>
    <line x1="30" y1="38" x2="30" y2="26"/>
    <line x1="38" y1="38" x2="38" y2="16"/>
  </svg>`,
  sparkle: `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="${BRAND.blue}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M28 6 L32 22 L48 26 L32 30 L28 46 L24 30 L8 26 L24 22 Z"/>
    <path d="M42 38 L44 44 L50 46 L44 48 L42 54 L40 48 L34 46 L40 44 Z" opacity="0.7"/>
  </svg>`,
  rocket: `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="${BRAND.blue}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M28 4 C 38 14, 42 24, 38 34 L 18 34 C 14 24, 18 14, 28 4 Z"/>
    <circle cx="28" cy="20" r="4"/>
    <path d="M18 34 L12 40 L18 42 Z"/>
    <path d="M38 34 L44 40 L38 42 Z"/>
    <path d="M24 44 L22 50 M32 44 L34 50 M28 46 L28 52"/>
  </svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="${BRAND.blue}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="14" width="34" height="28" rx="4"/>
    <path d="M40 22 L50 16 L50 40 L40 34 Z"/>
  </svg>`,
  templates: `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="${BRAND.blue}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="8" width="24" height="18" rx="2"/>
    <rect x="34" y="8" width="16" height="12" rx="2"/>
    <rect x="34" y="24" width="16" height="24" rx="2"/>
    <rect x="6" y="30" width="24" height="18" rx="2"/>
  </svg>`,
  onboarding: `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="${BRAND.blue}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="10" cy="16" r="3"/>
    <circle cx="28" cy="16" r="3"/>
    <circle cx="46" cy="16" r="3"/>
    <circle cx="10" cy="40" r="3"/>
    <circle cx="28" cy="40" r="3"/>
    <circle cx="46" cy="40" r="3"/>
    <line x1="13" y1="16" x2="25" y2="16"/>
    <line x1="31" y1="16" x2="43" y2="16"/>
    <line x1="28" y1="19" x2="28" y2="37"/>
    <line x1="13" y1="40" x2="25" y2="40"/>
    <line x1="31" y1="40" x2="43" y2="40"/>
  </svg>`,
};

function svgDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildCard({ subject, headline, body, cta, iconKey }) {
  return {
    type: 'div',
    props: {
      style: {
        width: W,
        height: H,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: '"Instrument Sans"',
      },
      children: [
        // Background
        {
          type: 'img',
          props: {
            src: backgroundSvgDataUri(),
            width: W,
            height: H,
            style: { position: 'absolute', top: 0, left: 0 },
          },
        },
        // Card
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: 680,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
              background: BRAND.cardBody,
            },
            children: [
              // Header row
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    background: BRAND.cardHeader,
                    padding: '18px 24px',
                    gap: 14,
                  },
                  children: [
                    {
                      type: 'img',
                      props: { src: svgDataUri(ICONS.envelope), width: 40, height: 40 },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          flex: 1,
                          fontSize: 22,
                          fontWeight: 600,
                          color: BRAND.navy,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                        children: subject,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          background: '#FFFFFF',
                          borderRadius: 10,
                          padding: '6px 14px',
                          fontSize: 16,
                          color: BRAND.pillText,
                        },
                        children: 'Inbox',
                      },
                    },
                  ],
                },
              },
              // Body
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: BRAND.cardBody,
                    padding: '36px 48px 40px',
                    gap: 18,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 34,
                          fontWeight: 600,
                          color: BRAND.navy,
                          textAlign: 'center',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.15,
                        },
                        children: headline,
                      },
                    },
                    {
                      type: 'img',
                      props: { src: svgDataUri(ICONS[iconKey]), width: 56, height: 56 },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 20,
                          color: BRAND.navy,
                          textAlign: 'center',
                          lineHeight: 1.4,
                          maxWidth: 520,
                        },
                        children: body,
                      },
                    },
                    // CTA button
                    {
                      type: 'div',
                      props: {
                        style: {
                          marginTop: 8,
                          background: BRAND.blue,
                          color: '#FFFFFF',
                          fontSize: 22,
                          fontWeight: 600,
                          padding: '14px 36px',
                          borderRadius: 999,
                          display: 'flex',
                        },
                        children: cta,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

const CARDS = [
  {
    slug: 'onboarding-email-sequence-templates',
    subject: 'Templates inside',
    headline: '7 onboarding email templates',
    body: 'Copy-paste templates backed by real emails from Calendly, Slack, Stripe, Figma, Grammarly, Miro.',
    cta: 'Copy the templates',
    icon: 'templates',
  },
  {
    slug: 'saas-email-benchmarks',
    subject: 'Inside the data',
    headline: '1,051 lifecycle emails analyzed',
    body: 'What 38 top SaaS brands send, how often, and what separates the best from the rest.',
    cta: 'See the data',
    icon: 'chart',
  },
  {
    slug: 'saas-email-templates',
    subject: 'Templates inside',
    headline: '14 lifecycle templates to steal',
    body: 'Ready-to-copy SaaS emails from Buffer, Monday, Grammarly, Notion, Miro, SemRush, and more.',
    cta: 'Browse templates',
    icon: 'templates',
  },
  {
    slug: 'saas-onboarding-email-sequence',
    subject: 'Onboarding playbook',
    headline: '12 onboarding email examples',
    body: 'Real onboarding emails from Loom, Calendly, Asana, Stripe, Zapier, Monday — subject lines, timing, patterns.',
    cta: 'See the examples',
    icon: 'onboarding',
  },
  {
    slug: 'webinar-follow-up-subject-lines',
    subject: 'Webinar follow-up',
    headline: '25 subject lines that get opened',
    body: 'Real subject lines from Customer.io, Slack, Webflow, Stripe, and more — by audience and timing.',
    cta: 'Steal them',
    icon: 'video',
  },
  {
    slug: 'product-launch-email-subject-lines',
    subject: 'Product launch',
    headline: '30 launch subject lines',
    body: 'Real subject lines from Notion, Loom, Linear, Zapier, and more — organized by launch type.',
    cta: 'Copy them',
    icon: 'rocket',
  },
  {
    slug: 'product-launch-email',
    subject: 'Launch playbook',
    headline: '28 product launch & release emails',
    body: 'Real launches from Notion, Slack, ClickUp, Asana, Webflow, Loom, Figma — copy, timing, and what works.',
    cta: 'See the launches',
    icon: 'rocket',
  },
  {
    slug: 'b2b-lead-nurturing-email-examples',
    subject: 'Lead nurture playbook',
    headline: '15 B2B lead nurturing emails',
    body: 'Real nurture emails from Apollo, Notion, Ahrefs, Calendly, Asana, ClickUp — patterns that move cold leads to closed.',
    cta: 'See the patterns',
    icon: 'sparkle',
  },
  {
    slug: 're-engagement-email-examples',
    subject: 'Win-back playbook',
    headline: '12 emails that win back inactive users',
    body: 'Real win-backs from Adobe, Canva, Apollo, Semrush, Pipedrive — the patterns that wake dormant users up.',
    cta: 'See the win-backs',
    icon: 'envelope',
  },
  {
    slug: 'transactional-email-vs-marketing-email',
    subject: 'Email types compared',
    headline: 'Transactional vs marketing email',
    body: 'The practical difference — with real examples from Stripe, Calendly, Notion, Beehiiv, Zapier.',
    cta: 'See the difference',
    icon: 'chart',
  },
  {
    slug: 'customer-retention-email-examples',
    subject: 'Retention playbook',
    headline: '12 customer retention email examples',
    body: 'Real retention emails from Adobe, Semrush, Dropbox, Notion, Grammarly, Mailchimp — patterns that keep paying users paying.',
    cta: 'See the patterns',
    icon: 'envelope',
  },
  {
    slug: 'saas-welcome-email',
    subject: 'Welcome templates',
    headline: '28 SaaS welcome email templates',
    body: 'Real welcome emails from Calendly, Miro, Loom, Stripe, Notion, Figma — copy-ready templates with subject lines.',
    cta: 'See the templates',
    icon: 'templates',
  },
  {
    slug: 'upsell-email-examples',
    subject: 'Upsell playbook',
    headline: '12 upsell email examples',
    body: 'Real upsell emails from Semrush, Hunter, Zapier, Loom, Typeform, Figma — the triggers that grow account value.',
    cta: 'See the examples',
    icon: 'chart',
  },
  {
    slug: 'behavior-based-vs-time-based-emails',
    subject: 'Triggers vs timing',
    headline: 'Behavior-based vs time-based email',
    body: 'Real triggered emails from Loom, Zapier, Apollo, Jira, Calendly — when to send on action, not a schedule.',
    cta: 'See the triggers',
    icon: 'chart',
  },
  {
    slug: 'customer-activation-email-examples',
    subject: 'Activation playbook',
    headline: '10 customer activation emails',
    body: 'Real activation emails from Calendly, Asana, Slack, Ahrefs, Loom, Jira — the nudges that turn signups into active users.',
    cta: 'See the playbook',
    icon: 'onboarding',
  },
  {
    slug: 'behavioral-email-marketing',
    subject: 'Behavioral playbook',
    headline: '10 behavioral email examples',
    body: 'Real behavioral emails from Freepik, Notion, Buffer, Webflow, Ahrefs — triggered by what users do, not the calendar.',
    cta: 'See the triggers',
    icon: 'sparkle',
  },
  {
    slug: 'best-time-to-send-marketing-emails',
    subject: 'Send-time playbook',
    headline: 'Best time to send emails',
    body: 'Mid-week mornings for broadcasts — but real SaaS emails from Calendly, Canva, Buffer run on triggers, not the clock.',
    cta: 'See the timing',
    icon: 'chart',
  },
];

async function renderOne(card) {
  const svg = await satori(buildCard({
    subject: card.subject,
    headline: card.headline,
    body: card.body,
    cta: card.cta,
    iconKey: card.icon,
  }), { width: W, height: H, fonts });

  const outDir = join(ROOT, 'public', 'blog', card.slug);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const webpPath = join(outDir, 'banner.webp');
  const pngPath = join(outDir, 'banner.png');

  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(webpPath);
  await sharp(Buffer.from(svg)).png().toFile(pngPath);
  console.log(`✓ ${card.slug}`);
}

async function main() {
  const only = process.argv[2];
  const list = only ? CARDS.filter((c) => c.slug === only) : CARDS;
  if (!list.length) {
    console.error(`No card found for slug: ${only}`);
    process.exit(1);
  }
  for (const c of list) await renderOne(c);
}

main().catch((e) => { console.error(e); process.exit(1); });
