import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import Fuse from "fuse.js";
import { SearchOverlay } from "@/components/library/SearchOverlay";

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

const PRIMARY = "#1D4ED8";
const PAGE_SIZE = 24;

const USE_CASE_DISPLAY: Record<string, { emoji: string; bg: string; textColor: string }> = {
  "onboard-free-user":    { emoji: "\u{1F44B}", bg: "#EFF6FF", textColor: "#1D4ED8" },
  "educate-engage":       { emoji: "\u{1F4A1}", bg: "#FEF9C3", textColor: "#92400E" },
  "expand-user":          { emoji: "\u{1F4B8}", bg: "#DCFCE7", textColor: "#166534" },
  "celebrate-milestones": { emoji: "\u{1F3C6}", bg: "#FEF3C7", textColor: "#92400E" },
  "request-feedback":     { emoji: "\u{1F5E3}\uFE0F", bg: "#FCE7F3", textColor: "#9D174D" },
  "win-back-churned-user":{ emoji: "\u{1F494}", bg: "#FEE2E2", textColor: "#991B1B" },
};

const USE_CASE_DESC: Record<string, string> = {
  "onboard-free-user":     "Activation-focused flows to get trial users to first value fast.",
  "educate-engage":        "Drive ongoing value perception. 'Did you know?', product tips, proactive nudges.",
  "expand-user":           "Upsells, cross-sells, usage caps, feature teases \u2014 drive revenue lift.",
  "celebrate-milestones":  "Usage-based triggers, year in review, success summaries \u2014 reinforce ROI.",
  "request-feedback":      "NPS, churn surveys, product roadmap input \u2014 create conversation loops.",
  "win-back-churned-user": "Re-engage lost customers or ghosted trials with smart, emotional reactivation.",
};

const LOOM_JOURNEY = [
  { day: "Day 1",  tag: "welcome email",  subject: "Loom Business! Welcome to your trial \u{1F52E}", slug: "loom-1" },
  { day: "Day 2",  tag: "product nudge",  subject: "Highlight new product features with Loom", slug: "loom-2" },
  { day: "Day 10", tag: "product nudge",  subject: "Showcase your latest content marketing campaign with Loom", slug: "loom-3" },
  { day: "Day 14", tag: "trial expiring",  subject: "Only 3 days left on your free trial of Loom Business", slug: "loom-4" },
  { day: "Day 15", tag: "feature launch",  subject: "\u{1F929} Redesigned Loom desktop recorder: faster, more reliable, and easier to use", slug: "loom-5" },
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
    <a
      href={`/library/email/${email.slug}`}
      className="group rounded-xl border border-slate-100/80 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow block"
    >
      {/* Brand + Subject on top */}
      <div className="px-3 pt-3 pb-2">
        <a
          href={`/library/brand/${email.brand}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 mb-1 group/brand"
        >
          {brand?.logo && (
            <img src={brand.logo} alt={brand.name} className="h-3.5 w-3.5 object-contain" />
          )}
          <span className="text-[11px] text-slate-400 font-medium group-hover/brand:text-[#1D4ED8] transition-colors truncate">
            {brand?.name ?? email.brand}
          </span>
        </a>
        <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
          {email.subject || email.templateTitle}
        </p>
      </div>
      <div className="relative overflow-hidden bg-slate-50 aspect-[4/3]">
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
            <span className="text-4xl opacity-30">{"\u2709\uFE0F"}</span>
          </div>
        )}
      </div>
      {/* Tags at bottom */}
      {email.tags.length > 0 && (
        <div className="px-3 pb-2.5 pt-1.5 flex flex-wrap gap-1">
          {email.tags.slice(0, 2).map((tagSlug) => (
            <a
              key={tagSlug}
              href={`/library/tag/${tagSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors"
            >
              {tagName(tagSlug, tags)}
            </a>
          ))}
          {email.tags.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">
              +{email.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </a>
  );
};

// ── Main Library Component (React island) ────────────────────────────────────

const LibraryPage: React.FC = () => {
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

  // Apply filter from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const brand   = params.get("brand");
    const tag     = params.get("tag");
    const usecase = params.get("usecase");
    const q       = params.get("q");
    if (!brand && !tag && !usecase && !q) return;
    if (brand)   setSelectedBrand(brand);
    if (tag)     setSelectedTag(tag);
    if (usecase) setSelectedUseCase(usecase);
    if (q)       { setQuery(q); setDraftQuery(q); }
    setBrowseActive(true);
  }, []);

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
    const params = new URLSearchParams(window.location.search);
    const hasParam = params.get("brand") || params.get("tag") ||
                     params.get("usecase") || params.get("q");
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

  const handleBrowseAll = useCallback(() => {
    setQuery("");
    setDraftQuery("");
    setSelectedBrand(null);
    setSelectedTag(null);
    setSelectedUseCase(null);
    setBrowseActive(true);
    scrollToBrowser();
  }, [scrollToBrowser]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main>
      {/* HERO SECTION */}
      <section className="pt-24 pb-16 md:pb-40 bg-white min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
              Email Library
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-serif text-slate-900 mb-4 leading-[1.1] tracking-[-0.02em]">
              The largest search engine for B2B SaaS{" "}
              <span className="italic text-primary">lifecycle emails</span>
            </h1>

            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-[640px] mx-auto">
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
                className="w-full px-5 py-4 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-lg shadow-sm bg-white cursor-pointer"
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
                <span className="text-sm text-slate-400 font-medium">Try:</span>
                {tryLinks.map((t) => (
                  <a
                    key={t.slug}
                    href={`/library/${t.type === "tag" ? "tag" : "usecase"}/${t.slug}`}
                    className="text-sm font-medium border border-slate-200 bg-white px-3 py-1 rounded-full hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all text-slate-600"
                  >
                    {t.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-12 bg-background-warm">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
              Use cases
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 mb-4 tracking-[-0.01em]">
              Flows mapped to business goals
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Discover what to send based on where your users are — from onboarding to retention and revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredUseCases.map((uc) => {
              const config = USE_CASE_DISPLAY[uc.slug];
              const desc = USE_CASE_DESC[uc.slug] ?? uc.description;
              if (!config) return null;
              return (
                <a
                  key={uc.slug}
                  href={`/library/usecase/${uc.slug}`}
                  className="group text-left p-7 rounded-xl bg-white border border-slate-100/80 shadow-sm hover:shadow-md hover:border-[#1D4ED8]/20 transition-all block"
                >
                  <span className="text-3xl mb-4 block">{config.emoji}</span>
                  <p className="font-semibold text-[18px] mb-2 text-slate-900 group-hover:text-[#1D4ED8] transition-colors leading-snug">
                    {uc.name}
                  </p>
                  <p className="text-slate-500 leading-relaxed" style={{ fontSize: "16px" }}>{desc}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* TAGS MARQUEE */}
      <section className="py-12 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
              Browse by tag
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 mb-4 tracking-[-0.01em]">
              Find the perfect email in seconds
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Browse real SaaS emails by format, intent, or topic. Save time and grab what fits your next campaign.
            </p>
          </div>
        </div>

        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex animate-scroll-emails items-end" style={{ width: "fit-content", gap: "20px" }}>
            {[
              { img: "/email-screenshots/upgrade.png",        label: "Upgrade",        slug: "upgrade-cta" },
              { img: "/email-screenshots/invite-team.png",    label: "Invite",         slug: "join-team" },
              { img: "/email-screenshots/feature-nudge.png",  label: "Feature",        slug: "feature-usage-nudge" },
              { img: "/email-screenshots/trial-expiring.png", label: "Trial expiring", slug: "trial-expiration-warning" },
              { img: "/email-screenshots/welcome-email.png",  label: "Welcome email",  slug: "welcome-free-users" },
              { img: "/email-screenshots/webinar.png",        label: "Webinar",        slug: "webinar-invitation" },
              { img: "/email-screenshots/upgrade.png",        label: "Upgrade",        slug: "upgrade-cta" },
              { img: "/email-screenshots/invite-team.png",    label: "Invite",         slug: "join-team" },
              { img: "/email-screenshots/feature-nudge.png",  label: "Feature",        slug: "feature-usage-nudge" },
              { img: "/email-screenshots/trial-expiring.png", label: "Trial expiring", slug: "trial-expiration-warning" },
              { img: "/email-screenshots/welcome-email.png",  label: "Welcome email",  slug: "welcome-free-users" },
              { img: "/email-screenshots/webinar.png",        label: "Webinar",        slug: "webinar-invitation" },
            ].map((card, i) => (
              <a
                key={i}
                href={`/library/tag/${card.slug}`}
                className="flex-shrink-0 flex flex-col gap-2 group"
                style={{ width: 200 }}
              >
                <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
                  {card.label}
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-100/80 shadow-sm bg-white group-hover:shadow-md transition-shadow">
                  <img src={card.img} alt={card.label} loading="lazy" className="w-full h-auto block" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS TICKER */}
      <section className="py-12 bg-background-warm overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl mb-10 text-center">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
            Browse by brand
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 mb-4 tracking-[-0.01em]">
            Learn how top SaaS brands grow
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            See exactly how companies like Notion, Miro, and Calendly use email to convert and retain.
          </p>
        </div>

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
                      <a
                        key={`${brand.slug}-${i}`}
                        href={`/library/brand/${brand.slug}`}
                        className="flex-shrink-0 flex items-center gap-3 group bg-white rounded-xl border border-slate-100 px-3 py-2 shadow-sm hover:border-[#1D4ED8] hover:shadow-md transition-all"
                        title={brand.name}
                      >
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" loading="lazy" />
                          ) : (
                            <span className="text-sm font-bold text-slate-300">{brand.name[0]}</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-[#1D4ED8] transition-colors whitespace-nowrap">
                          {brand.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* JOURNEY */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
              Full journeys
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 mb-4 tracking-[-0.01em]">
              See every email, in real order
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Reconstruct full lifecycle journeys — day by day, touchpoint by touchpoint. No more guesswork.
            </p>
          </div>

          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
            <div className="flex animate-scroll-journey items-start" style={{ width: "fit-content", gap: "20px" }}>
              {[...LOOM_JOURNEY, ...LOOM_JOURNEY].map((step, i) => {
                const emailData = emails.find((e) => e.slug === step.slug || e.subject === step.subject);
                return (
                  <a
                    key={i}
                    href={emailData ? `/library/email/${emailData.slug}` : "/library/brand/loom"}
                    className="flex-shrink-0 w-56 group"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                        style={{ background: "#EFF6FF", color: PRIMARY }}
                      >
                        {step.day}
                      </span>
                      <span className="text-xs text-slate-400 font-medium truncate">{step.tag}</span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-100/80 shadow-sm mb-3 aspect-[3/4] bg-slate-50">
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
                    <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#1D4ED8] transition-colors">
                      {step.subject}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <a
              href="/library/brand/loom"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all bg-white"
            >
              {"\u{1F441}\uFE0F"} View all Loom emails {"\u2192"}
            </a>
          </div>
        </div>
      </section>

      {/* EMAIL BROWSER */}
      <section
        ref={browserRef}
        id="browse"
        className="py-12 bg-background-warm"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 tracking-[-0.01em]">
                {activeFilterLabel ? `Emails \u2014 ${activeFilterLabel}` : "Browse all emails"}
              </h2>
              {!loading && (
                <p className="text-sm text-slate-400 mt-1">
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
                  style={{ backgroundColor: PRIMARY, boxShadow: "none", outline: "none", border: "none" }}
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                >
                  Browse all {emails.length > 0 ? `${emails.length.toLocaleString()} emails` : ""}
                </button>
              )}
            </div>
          </div>

          {browseActive && (
            <div className="relative max-w-lg mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={draftQuery}
                onChange={(e) => {
                  setDraftQuery(e.target.value);
                  setQuery(e.target.value);
                }}
                placeholder="Search emails\u2026"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition"
              />
              {draftQuery && (
                <button type="button" onClick={() => { setDraftQuery(""); setQuery(""); }} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
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
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {emails.slice(0, 8).map((email) => (
                  <EmailCard key={email.id} email={email} brands={brands} tags={tags} />
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
              <div className="flex justify-center pt-4 pb-2">
                <button
                  onClick={handleBrowseAll}
                  data-flat-purple
                  style={{ backgroundColor: PRIMARY, boxShadow: "none", outline: "none", border: "none" }}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-lg hover:opacity-90 transition-opacity"
                >
                  Browse all {emails.length.toLocaleString()} emails
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg font-medium">No emails found.</p>
              <p className="text-sm mt-1">Try a different search or clear your filters.</p>
              <button onClick={clearFilters} className="mt-4 text-[#1D4ED8] text-sm font-medium hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {pagedEmails.map((email) => (
                  <EmailCard key={email.id} email={email} brands={brands} tags={tags} />
                ))}
              </div>
              {pagedEmails.length < filteredEmails.length && (
                <div className="flex flex-col items-center mt-10 gap-2">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-semibold text-sm hover:text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] transition-all"
                    style={{ borderColor: PRIMARY, color: PRIMARY }}
                  >
                    Load more <ChevronDown className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-slate-400">
                    Showing {pagedEmails.length} of {filteredEmails.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 mb-4 leading-[1.15] tracking-[-0.01em]">
              Start exploring
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
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
              className="w-full px-5 py-4 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-lg shadow-sm bg-white cursor-pointer"
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
              <span className="text-sm text-slate-400 font-medium">Try:</span>
              {tryLinks.map((t) => (
                <a
                  key={t.slug}
                  href={`/library/${t.type === "tag" ? "tag" : "usecase"}/${t.slug}`}
                  className="text-sm font-medium border border-slate-200 bg-white px-3 py-1 rounded-full hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all text-slate-600"
                >
                  {t.label}
                </a>
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
  );
};

export default LibraryPage;
