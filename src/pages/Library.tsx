import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Search, X, ChevronDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchOverlay } from "@/components/library/SearchOverlay";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  buildWebSiteJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Email {
  id: string;
  slug: string;
  subject: string;
  thumb: string;
  templateTitle: string;
  summary: string;
  tags: string[];
  brand: string;
  useCase: string;
  setDate: string;
  sender: string;
}

interface Brand {
  slug: string;
  name: string;
  logo: string;
  emailCount: number;
  useCases: string[];
  duration: string;
  dateStart: string;
  dateEnd: string;
  avgDelay: string;
  summary: string;
  metaDesc: string;
}

interface Tag {
  slug: string;
  name: string;
  summary: string;
}

interface UseCase {
  slug: string;
  name: string;
  description: string;
  emailCount: number;
  order: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PURPLE = "#1D4ED8";
const PAGE_SIZE = 24;


// Use case display config (matches Webflow — 6 featured)
const USE_CASE_DISPLAY: Record<string, { emoji: string; bg: string; textColor: string }> = {
  "onboard-free-user":    { emoji: "👋", bg: "#EDE9FE", textColor: "#5B21B6" },
  "educate-engage":       { emoji: "💡", bg: "#FEF9C3", textColor: "#92400E" },
  "expand-user":          { emoji: "💸", bg: "#DCFCE7", textColor: "#166534" },
  "celebrate-milestones": { emoji: "🏆", bg: "#FEF3C7", textColor: "#92400E" },
  "request-feedback":     { emoji: "🗣️", bg: "#FCE7F3", textColor: "#9D174D" },
  "win-back-churned-user":{ emoji: "💔", bg: "#FEE2E2", textColor: "#991B1B" },
};

// Use case descriptions (from Webflow copy)
const USE_CASE_DESC: Record<string, string> = {
  "onboard-free-user":     "Activation-focused flows to get trial users to first value fast.",
  "educate-engage":        "Drive ongoing value perception. 'Did you know?', product tips, proactive nudges.",
  "expand-user":           "Upsells, cross-sells, usage caps, feature teases — drive revenue lift.",
  "celebrate-milestones":  "Usage-based triggers, year in review, success summaries — reinforce ROI.",
  "request-feedback":      "NPS, churn surveys, product roadmap input — create conversation loops.",
  "win-back-churned-user": "Re-engage lost customers or ghosted trials with smart, emotional reactivation.",
};

// Featured tags for the "Find the perfect email" section
const FEATURED_TAGS = [
  "welcome-free-users", "welcome-paid-users", "feature-usage-nudge",
  "trial-expiration-warning", "webinar-invitation", "upgrade-cta",
  "newsletter", "onboarding-checklist", "referral-prompt",
  "special-offer", "win-back-churned-user", "product-update",
];

// Loom journey — matches the live library.digistorms.ai journey section exactly
const LOOM_JOURNEY = [
  {
    day: "Day 1",
    tag: "welcome email",
    subject: "Loom Business! Welcome to your trial 🔮",
    slug: "loom-1",
  },
  {
    day: "Day 2",
    tag: "product nudge",
    subject: "Highlight new product features with Loom",
    slug: "loom-2",
  },
  {
    day: "Day 10",
    tag: "product nudge",
    subject: "Showcase your latest content marketing campaign with Loom",
    slug: "loom-3",
  },
  {
    day: "Day 14",
    tag: "trial expiring",
    subject: "Only 3 days left on your free trial of Loom Business",
    slug: "loom-4",
  },
  {
    day: "Day 15",
    tag: "feature launch",
    subject: "🤩 Redesigned Loom desktop recorder: faster, more reliable, and easier to use",
    slug: "loom-5",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function tagName(slug: string, tags: Tag[]): string {
  return tags.find((t) => t.slug === slug)?.name ?? slug;
}

function brandName(slug: string, brands: Brand[]): string {
  return brands.find((b) => b.slug === slug)?.name ?? slug;
}

function useCaseName(slug: string, usecases: UseCase[]): string {
  return usecases.find((u) => u.slug === slug)?.name ?? slug;
}

// ── Email Card ─────────────────────────────────────────────────────────────────

const EmailCard: React.FC<{
  email: Email;
  brands: Brand[];
  tags: Tag[];
}> = ({ email, brands, tags }) => {
  const brand = brands.find((b) => b.slug === email.brand);
  return (
    <Link
      to={`/library/email/${email.slug}`}
      className="group rounded-xl border border-gray-100/80 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow block"
    >
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
        {email.thumb ? (
          <img
            src={email.thumb}
            alt={email.subject}
            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-[#DBEAFE] flex items-center justify-center">
            <span className="text-4xl opacity-30">✉️</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <Link
          to={`/library/brand/${email.brand}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mb-2 group/brand"
        >
          {brand?.logo && (
            <img src={brand.logo} alt={brand.name} className="h-4 w-4 object-contain" />
          )}
          <span className="text-xs text-gray-400 font-medium group-hover/brand:text-[#1D4ED8] transition-colors">
            {brand?.name ?? email.brand}
          </span>
        </Link>
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-3">
          {email.subject || email.templateTitle}
        </p>
        {email.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {email.tags.slice(0, 3).map((tagSlug) => (
              <Link
                key={tagSlug}
                to={`/library/tag/${tagSlug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors"
              >
                {tagName(tagSlug, tags)}
              </Link>
            ))}
            {email.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                +{email.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

// ── Section Label ──────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-5"
    style={{ borderColor: "#E9D5FF", color: "#7C3AED", background: "#f8fafc" }}
  >
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
      <rect width="7.99" height="7.99" rx="3.995" fill="#A855F7" />
    </svg>
    {children}
  </div>
);

// ── Search Bar ─────────────────────────────────────────────────────────────────

const SearchBar: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  size?: "lg" | "md";
}> = ({ value, onChange, onSubmit, placeholder = "Search brands or keywords", size = "lg" }) => {
  const isLg = size === "lg";
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="flex flex-col gap-3 w-full"
    >
      <div className={`relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden ${isLg ? "h-14" : "h-12"}`}>
        <Search className={`absolute left-4 text-gray-400 pointer-events-none ${isLg ? "h-5 w-5" : "h-4 w-4"}`} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 h-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 ${isLg ? "pl-12 pr-4 text-base" : "pl-11 pr-4 text-sm"}`}
        />
        {value && (
          <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="pr-2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className={`w-full rounded-2xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] ${isLg ? "py-3.5 text-base" : "py-3 text-sm"}`}
        style={{ background: PURPLE }}
      >
        Search
      </button>
    </form>
  );
};

// ── Main Library Component ────────────────────────────────────────────────────

const Library: React.FC = () => {
  const [emails, setEmails]     = useState<Email[]>([]);
  const [brands, setBrands]     = useState<Brand[]>([]);
  const [tags, setTags]         = useState<Tag[]>([]);
  const [usecases, setUsecases] = useState<UseCase[]>([]);
  const [loading, setLoading]   = useState(true);

  const [query, setQuery]                     = useState("");
  const [draftQuery, setDraftQuery]           = useState("");
  const [selectedBrand, setSelectedBrand]     = useState<string | null>(null);
  const [selectedTag, setSelectedTag]         = useState<string | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [page, setPage]                       = useState(1);
  const [browseActive, setBrowseActive]       = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);

  const browserRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  // Apply filter from URL search params (e.g. /library?brand=clickup)
  useEffect(() => {
    const brand   = searchParams.get("brand");
    const tag     = searchParams.get("tag");
    const usecase = searchParams.get("usecase");
    const q       = searchParams.get("q");
    if (!brand && !tag && !usecase && !q) return;
    if (brand)   setSelectedBrand(brand);
    if (tag)     setSelectedTag(tag);
    if (usecase) setSelectedUseCase(usecase);
    if (q)       { setQuery(q); setDraftQuery(q); }
    setBrowseActive(true);
  }, [searchParams]);

  // Load data
  useEffect(() => {
    Promise.all([
      fetch("/data/library/emails.json").then((r) => r.json()),
      fetch("/data/library/brands.json").then((r) => r.json()),
      fetch("/data/library/tags.json").then((r) => r.json()),
      fetch("/data/library/usecases.json").then((r) => r.json()),
    ]).then(([e, b, t, u]) => {
      setEmails(e);
      setBrands(b);
      setTags(t);
      setUsecases(u);
      setLoading(false);
    });
  }, []);

  // Scroll to browser after data loads when URL params are present
  useEffect(() => {
    if (loading) return;
    const hasParam = searchParams.get("brand") || searchParams.get("tag") ||
                     searchParams.get("usecase") || searchParams.get("q");
    if (hasParam) scrollToBrowser();
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fuse search
  const emailFuse = useMemo(
    () => new Fuse(emails, {
      keys: ["subject", "sender", "summary", "brand", "tags", "useCase", "templateTitle"],
      threshold: 0.35,
    }),
    [emails]
  );

  useEffect(() => { setPage(1); }, [query, selectedBrand, selectedTag, selectedUseCase]);

  const emailCountByBrand = useMemo(() => {
    const map: Record<string, number> = {};
    emails.forEach((e) => { map[e.brand] = (map[e.brand] ?? 0) + 1; });
    return map;
  }, [emails]);

  const emailCountByTag = useMemo(() => {
    const map: Record<string, number> = {};
    emails.forEach((e) => e.tags.forEach((t) => { map[t] = (map[t] ?? 0) + 1; }));
    return map;
  }, [emails]);

  const filteredEmails = useMemo(() => {
    let result = emails;
    if (query.trim()) result = emailFuse.search(query).map((r) => r.item);
    if (selectedBrand)   result = result.filter((e) => e.brand === selectedBrand);
    if (selectedTag)     result = result.filter((e) => e.tags.includes(selectedTag));
    if (selectedUseCase) result = result.filter((e) => e.useCase === selectedUseCase);
    return result;
  }, [emails, query, selectedBrand, selectedTag, selectedUseCase, emailFuse]);

  const pagedEmails = useMemo(() => filteredEmails.slice(0, page * PAGE_SIZE), [filteredEmails, page]);

  const activeFilterLabel =
    selectedBrand   ? brandName(selectedBrand, brands) :
    selectedTag     ? tagName(selectedTag, tags) :
    selectedUseCase ? useCaseName(selectedUseCase, usecases) :
    query           ? `"${query}"` :
    null;

  const scrollToBrowser = useCallback(() => {
    setTimeout(() => {
      browserRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const handleSearch = useCallback(() => {
    setQuery(draftQuery);
    setSelectedBrand(null);
    setSelectedTag(null);
    setSelectedUseCase(null);
    setBrowseActive(true);
    scrollToBrowser();
  }, [draftQuery, scrollToBrowser]);

  const handleTagClick = useCallback((slug: string, _e?: React.MouseEvent) => {
    setSelectedTag(slug);
    setSelectedBrand(null);
    setSelectedUseCase(null);
    setQuery("");
    setDraftQuery("");
    setBrowseActive(true);
    scrollToBrowser();
  }, [scrollToBrowser]);

  const handleBrandClick = useCallback((slug: string, _e?: React.MouseEvent) => {
    setSelectedBrand(slug);
    setSelectedTag(null);
    setSelectedUseCase(null);
    setQuery("");
    setDraftQuery("");
    setBrowseActive(true);
    scrollToBrowser();
  }, [scrollToBrowser]);

  const handleUseCaseClick = useCallback((slug: string) => {
    setSelectedUseCase(slug);
    setSelectedBrand(null);
    setSelectedTag(null);
    setQuery("");
    setDraftQuery("");
    setBrowseActive(true);
    scrollToBrowser();
  }, [scrollToBrowser]);

  const handleBrowseAll = useCallback(() => {
    setQuery("");
    setDraftQuery("");
    setSelectedBrand(null);
    setSelectedTag(null);
    setSelectedUseCase(null);
    setBrowseActive(true);
    scrollToBrowser();
  }, [scrollToBrowser]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setDraftQuery("");
    setSelectedBrand(null);
    setSelectedTag(null);
    setSelectedUseCase(null);
  }, []);

  const tryLinks = [
    { label: "welcome email", slug: "welcome-free-users", type: "tag" },
    { label: "webinar",       slug: "webinar-invitation", type: "tag" },
    { label: "newsletter",    slug: "newsletter",          type: "tag" },
    { label: "win-back",      slug: "win-back-churned-user", type: "usecase" },
    { label: "survey",        slug: "survey",              type: "tag" },
    { label: "upgrade",       slug: "upgrade-cta",         type: "tag" },
  ];

  const featuredUseCaseSlugs = Object.keys(USE_CASE_DISPLAY);
  const featuredUseCases = usecases.filter((u) => featuredUseCaseSlugs.includes(u.slug));

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Email Library – B2B SaaS Lifecycle Emails | DigiStorms</title>
        <meta name="description" content="Browse 1,000+ lifecycle emails from the best B2B SaaS companies. Filter by brand, tag, or use case. The largest B2B SaaS email library." />
        <link rel="canonical" href={`${SITE_URL}/library`} />
        <meta property="og:title"       content="Email Library – B2B SaaS Lifecycle Emails | DigiStorms" />
        <meta property="og:description" content="Browse 1,000+ lifecycle emails from the best B2B SaaS companies. Filter by brand, tag, or use case. The largest B2B SaaS email library." />
        <meta property="og:url"         content={`${SITE_URL}/library`} />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Email Library – B2B SaaS Lifecycle Emails | DigiStorms" />
        <meta name="twitter:description" content="Browse 1,000+ lifecycle emails from the best B2B SaaS companies. Filter by brand, tag, or use case." />
        <meta name="twitter:image"       content={DEFAULT_OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(buildWebSiteJsonLd())}</script>
        <script type="application/ld+json">{JSON.stringify(buildCollectionPageJsonLd({
          name: "Email Library – B2B SaaS Lifecycle Emails",
          description: "Browse 1,000+ lifecycle emails from the best B2B SaaS companies. Filter by brand, tag, or use case.",
          url: `${SITE_URL}/library`,
        }))}</script>
      </Helmet>

      <Navbar />

      <main>
      {/* ══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="pt-20 pb-16 md:pb-40 bg-white min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
              The largest search engine for B2B SaaS{" "}
              <span className="italic" style={{ color: "#1D4ED8" }}>lifecycle emails.</span>
            </h1>

            <p className="text-gray-600 mb-8 leading-relaxed mx-auto" style={{ fontSize: "18px", maxWidth: 420 }}>
              See how the best PLG companies onboard, upsell, and re-engage — and copy what works.
            </p>

            <div className="max-w-md mx-auto space-y-3">
              <input
                type="text"
                value={draftQuery}
                readOnly
                onFocus={() => setSearchOverlayOpen(true)}
                placeholder="Search brands or email keywords"
                aria-label="Search brands or email keywords"
                className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-lg shadow-sm bg-white cursor-pointer"
              />
              <button
                onClick={handleSearch}
                data-flat-purple
                style={{ backgroundColor: "#1D4ED8", boxShadow: "none", outline: "none", border: "none" }}
                className="w-full text-white px-8 py-4 rounded-xl font-semibold text-lg"
              >
                Search
              </button>

              {/* Try: tag pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                <span className="text-sm text-gray-400 font-medium">Try:</span>
                {tryLinks.map((t) => (
                  <Link
                    key={t.slug}
                    to={`/library/${t.type === "tag" ? "tag" : "usecase"}/${t.slug}`}
                    className="text-sm font-medium border border-gray-200 bg-white px-3 py-1 rounded-full hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all text-gray-600"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          USE CASES — "Flows mapped to business goals"
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 lg:py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Flows mapped to business goals.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
              Discover what to send based on where your users are — from onboarding to retention and revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredUseCases.map((uc) => {
              const config = USE_CASE_DISPLAY[uc.slug];
              const desc = USE_CASE_DESC[uc.slug] ?? uc.description;
              if (!config) return null;
              return (
                <Link
                  key={uc.slug}
                  to={`/library/usecase/${uc.slug}`}
                  className="group text-left p-7 rounded-xl bg-white border border-gray-100/80 shadow-sm hover:shadow-md hover:border-[#1D4ED8]/20 transition-all block"
                >
                  <span className="text-3xl mb-4 block">{config.emoji}</span>
                  <p className="font-semibold text-[18px] mb-2 text-gray-900 group-hover:text-[#1D4ED8] transition-colors leading-snug">
                    {uc.name}
                  </p>
                  <p className="text-gray-500 leading-relaxed" style={{ fontSize: "16px" }}>{desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TAGS — "Find the perfect email in seconds"
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Find the perfect email in seconds.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
              Browse real SaaS emails by format, intent, or topic. Save time and grab what fits your next campaign.
            </p>
          </div>

        </div>

        {/* Auto-scrolling email screenshot marquee — tag label sits above each card */}
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex animate-scroll-emails items-end" style={{ width: "fit-content", gap: "20px" }}>
            {[
              { img: "/email-screenshots/upgrade.png",        label: "Upgrade",        slug: "upgrade-cta" },
              { img: "/email-screenshots/invite-team.png",    label: "Invite",         slug: "join-team" },
              { img: "/email-screenshots/feature-nudge.png",  label: "Feature",        slug: "feature-usage-nudge" },
              { img: "/email-screenshots/trial-expiring.png", label: "Trial expiring", slug: "trial-expiration-warning" },
              { img: "/email-screenshots/welcome-email.png",  label: "Welcome email",  slug: "welcome-free-users" },
              { img: "/email-screenshots/webinar.png",        label: "Webinar",        slug: "webinar-invitation" },
              /* duplicate for seamless loop */
              { img: "/email-screenshots/upgrade.png",        label: "Upgrade",        slug: "upgrade-cta" },
              { img: "/email-screenshots/invite-team.png",    label: "Invite",         slug: "join-team" },
              { img: "/email-screenshots/feature-nudge.png",  label: "Feature",        slug: "feature-usage-nudge" },
              { img: "/email-screenshots/trial-expiring.png", label: "Trial expiring", slug: "trial-expiration-warning" },
              { img: "/email-screenshots/welcome-email.png",  label: "Welcome email",  slug: "welcome-free-users" },
              { img: "/email-screenshots/webinar.png",        label: "Webinar",        slug: "webinar-invitation" },
            ].map((card, i) => (
              <Link
                key={i}
                to={`/library/tag/${card.slug}`}
                className="flex-shrink-0 flex flex-col gap-2 group"
                style={{ width: 200 }}
              >
                {/* Tag label above the card */}
                <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
                  {card.label}
                </span>
                {/* Email card */}
                <div className="rounded-xl overflow-hidden border border-gray-100/80 shadow-sm bg-white group-hover:shadow-md transition-shadow">
                  <img
                    src={card.img}
                    alt={card.label}
                    loading="lazy"
                    className="w-full h-auto block"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BRANDS TICKER — "Learn how top SaaS brands grow"
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 lg:py-24 bg-[#F8FAFC] overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Learn how top SaaS brands grow.
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
            See exactly how companies like Notion, Miro, and Calendly use email to convert and retain.
          </p>
        </div>

        {/* 3 scrolling brand rows — alternating direction, slow speed */}
        {!loading && (() => {
          const third = Math.ceil(brands.length / 3);
          const rows = [
            brands.slice(0, third),
            brands.slice(third, third * 2),
            brands.slice(third * 2),
          ];
          const mask = "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]";
          return (
            <div className="space-y-5">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} className={`relative flex overflow-hidden ${mask}`}>
                  <div
                    className={`flex gap-8 items-center ${rowIdx === 1 ? "animate-scroll-brands-reverse" : "animate-scroll-brands"}`}
                    style={{ width: "fit-content" }}
                  >
                    {[...row, ...row].map((brand, i) => (
                      <Link
                        key={`${brand.slug}-${i}`}
                        to={`/library/brand/${brand.slug}`}
                        className="flex-shrink-0 flex items-center gap-3 group bg-white rounded-xl border border-gray-100 px-3 py-2 shadow-sm hover:border-[#1D4ED8] hover:shadow-md transition-all"
                        title={brand.name}
                      >
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" loading="lazy" />
                          ) : (
                            <span className="text-sm font-bold text-gray-300">{brand.name[0]}</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#1D4ED8] transition-colors whitespace-nowrap">
                          {brand.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          JOURNEY — "See every email, in real order"
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              See every email, in real order.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
              Reconstruct full lifecycle journeys — day by day, touchpoint by touchpoint. No more guesswork.
            </p>
          </div>

          {/* Loom journey — auto-scrolling marquee */}
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
            <div className="flex animate-scroll-journey items-start" style={{ width: "fit-content", gap: "20px" }}>
              {/* Original + duplicate for seamless loop */}
              {[...LOOM_JOURNEY, ...LOOM_JOURNEY].map((step, i) => {
                const emailData = emails.find((e) => e.slug === step.slug || e.subject === step.subject);
                return (
                  <Link
                    key={i}
                    to={emailData ? `/library/email/${emailData.slug}` : "/library/brand/loom"}
                    className="flex-shrink-0 w-56 group"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                        style={{ background: "#EDE9FE", color: PURPLE }}
                      >
                        {step.day}
                      </span>
                      <span className="text-xs text-gray-400 font-medium truncate">{step.tag}</span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-100/80 shadow-sm mb-3 aspect-[3/4] bg-gray-50">
                      {emailData?.thumb ? (
                        <img
                          src={emailData.thumb}
                          alt={step.subject}
                          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#DBEAFE]" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#1D4ED8] transition-colors">
                      {step.subject}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* "View full journey" CTA below the marquee */}
          <div className="flex justify-center mt-8">
            <Link
              to="/library/brand/loom"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all bg-white"
            >
              👁️ View all Loom emails →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          EMAIL BROWSER — full grid (shown after search/filter or "Browse all")
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={browserRef}
        id="browse"
        className="py-16 md:py-20 lg:py-24 bg-[#F8FAFC]"
      >
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Browser header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                {activeFilterLabel ? `Emails — ${activeFilterLabel}` : "Browse all emails"}
              </h2>
              {!loading && (
                <p className="text-sm text-gray-400 mt-1">
                  {filteredEmails.length.toLocaleString()} email{filteredEmails.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeFilterLabel && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#1D4ED8] border border-[#1D4ED8]/30 px-3 py-1.5 rounded-full hover:bg-[#DBEAFE] transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Clear filter
                </button>
              )}
              {!browseActive && (
                <button
                  onClick={handleBrowseAll}
                  data-flat-purple
                  style={{ backgroundColor: PURPLE, boxShadow: "none", outline: "none", border: "none" }}
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                >
                  Browse all {emails.length > 0 ? `${emails.length.toLocaleString()} emails` : ""}
                </button>
              )}
            </div>
          </div>

          {/* Inline search within browser */}
          {browseActive && (
            <div className="relative max-w-lg mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={draftQuery}
                onChange={(e) => {
                  setDraftQuery(e.target.value);
                  setQuery(e.target.value);
                }}
                placeholder="Search emails…"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition"
              />
              {draftQuery && (
                <button type="button" onClick={() => { setDraftQuery(""); setQuery(""); }} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-[#1D4ED8] border-t-transparent animate-spin" />
            </div>
          ) : !browseActive ? (
            // Teaser grid — show 8 emails, blurred bottom
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {emails.slice(0, 8).map((email) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    brands={brands}
                    tags={tags}
                  />
                ))}
              </div>
              {/* Fade-out overlay */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F8FAFC] to-transparent pointer-events-none" />
              <div className="flex justify-center pt-4 pb-2">
                <button
                  onClick={handleBrowseAll}
                  data-flat-purple
                  style={{ backgroundColor: PURPLE, boxShadow: "none", outline: "none", border: "none" }}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-lg hover:opacity-90 transition-opacity"
                >
                  Browse all {emails.length.toLocaleString()} emails
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No emails found.</p>
              <p className="text-sm mt-1">Try a different search or clear your filters.</p>
              <button onClick={clearFilters} className="mt-4 text-[#1D4ED8] text-sm font-medium hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pagedEmails.map((email) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    brands={brands}
                    tags={tags}
                  />
                ))}
              </div>
              {pagedEmails.length < filteredEmails.length && (
                <div className="flex flex-col items-center mt-10 gap-2">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-semibold text-sm hover:text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] transition-all"
                    style={{ borderColor: PURPLE, color: PURPLE }}
                  >
                    Load more <ChevronDown className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-gray-400">
                    Showing {pagedEmails.length} of {filteredEmails.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA — "Start exploring"
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 lg:py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Start exploring.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
              Search real SaaS emails. Browse by use case, tag, or brand. Get inspired — and copy what works.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-3">
            <input
              type="text"
              value={draftQuery}
              readOnly
              onFocus={() => setSearchOverlayOpen(true)}
              placeholder="Search brands or email keywords"
              className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-lg shadow-sm bg-white cursor-pointer"
            />
            <button
              onClick={handleSearch}
              data-flat-purple
              style={{ backgroundColor: "#1D4ED8", boxShadow: "none", outline: "none", border: "none" }}
              className="w-full text-white px-8 py-4 rounded-xl font-semibold text-lg"
            >
              Search
            </button>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              <span className="text-sm text-gray-400 font-medium">Try:</span>
              {tryLinks.map((t) => (
                <Link
                  key={t.slug}
                  to={`/library/${t.type === "tag" ? "tag" : "usecase"}/${t.slug}`}
                  className="text-sm font-medium border border-gray-200 bg-white px-3 py-1 rounded-full hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all text-gray-600"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {searchOverlayOpen && (
        <SearchOverlay
          onClose={() => setSearchOverlayOpen(false)}
          onSearch={(q) => {
            setDraftQuery(q);
            setQuery(q);
            setSelectedBrand(null);
            setSelectedTag(null);
            setSelectedUseCase(null);
            setBrowseActive(true);
            setSearchOverlayOpen(false);
            scrollToBrowser();
          }}
          onNavigate={() => setSearchOverlayOpen(false)}
        />
      )}

      </main>

      <Footer />
    </div>
  );
};

export default Library;
