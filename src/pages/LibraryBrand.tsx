import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { X, Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  truncateAtWord,
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
  duration: string;
  dateStart: string;
  dateEnd: string;
  avgDelay: string;
  summary: string;
  metaDesc: string;
}

interface TagType {
  slug: string;
  name: string;
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

function formatDate(raw: string): string {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return raw;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

const LibraryBrand: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [emails, setEmails]       = useState<Email[]>([]);
  const [brands, setBrands]       = useState<Brand[]>([]);
  const [tags, setTags]           = useState<TagType[]>([]);
  const [usecases, setUsecases]   = useState<UseCase[]>([]);
  const [loading, setLoading]         = useState(true);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

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

  const brand          = useMemo(() => brands.find((b) => b.slug === slug), [brands, slug]);
  const filteredEmails = useMemo(() => emails.filter((e) => e.brand === slug), [emails, slug]);
  const sortedBrands   = useMemo(() => [...brands].sort((a, b) => a.name.localeCompare(b.name)), [brands]);

  const sortedUseCases = useMemo(
    () => [...usecases].sort((a, b) => a.order - b.order),
    [usecases]
  );

  const emailsByUseCase = useMemo(() => {
    const map: Record<string, Email[]> = {};
    filteredEmails.forEach((e) => {
      if (!map[e.useCase]) map[e.useCase] = [];
      map[e.useCase].push(e);
    });
    Object.values(map).forEach((g) =>
      g.sort((a, b) => new Date(a.setDate).getTime() - new Date(b.setDate).getTime())
    );
    return map;
  }, [filteredEmails]);

  const journeyEmails = useMemo(
    () => [...filteredEmails].sort((a, b) => new Date(a.setDate).getTime() - new Date(b.setDate).getTime()),
    [filteredEmails]
  );

  // Top tags for this brand (most common across its emails)
  const topBrandTags = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEmails.forEach((e) => {
      e.tags.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tagSlug]) => tags.find((t) => t.slug === tagSlug))
      .filter(Boolean) as TagType[];
  }, [filteredEmails, tags]);

  const scrollJourney = useCallback((dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  }, []);

  const handleJourneyScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    if (!journeyOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setJourneyOpen(false);
      if (e.key === "ArrowRight") scrollJourney("right");
      if (e.key === "ArrowLeft") scrollJourney("left");
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [journeyOpen, scrollJourney]);

  useEffect(() => {
    document.body.style.overflow = journeyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [journeyOpen]);

  // Initialise scroll-arrow visibility whenever the modal opens
  useEffect(() => {
    if (!journeyOpen) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    setCanScrollLeft(false);
    setCanScrollRight(el.scrollWidth > el.clientWidth + 8);
  }, [journeyOpen]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    if (!loading && brands.length > 0 && !brand) navigate("/library", { replace: true });
  }, [loading, brand, brands, navigate]);

  const handleJourneyClose = useCallback(() => setJourneyOpen(false), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: PURPLE, borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!brand) return null;

  const pageTitle = `${brand.name} Emails — B2B SaaS Library | DigiStorms`;
  const rawDesc   = brand.metaDesc || `Browse all ${brand.name} lifecycle emails in the DigiStorms library.`;
  const pageDesc  = truncateAtWord(rawDesc, 155);
  const pageUrl   = `${SITE_URL}/library/brand/${slug}`;
  const ogImage   = brand.logo || DEFAULT_OG_IMAGE;

  const jsonLd = buildCollectionPageJsonLd({
    name: pageTitle,
    description: pageDesc,
    url: pageUrl,
    breadcrumbs: [
      { name: "Library", url: `${SITE_URL}/library` },
      { name: "Brands",  url: `${SITE_URL}/library/brands` },
      { name: brand.name, url: pageUrl },
    ],
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title"       content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url"         content={pageUrl} />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content={ogImage} />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image"       content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-16">

        {/* ── Page header ── */}
        <div className="bg-white border-b border-slate-100 pb-8 pt-10">
          <div className="container mx-auto px-4 max-w-6xl">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-slate-400">
                <li>
                  <Link to="/library" className="hover:text-[#1D4ED8] transition-colors">Library</Link>
                </li>
                <li aria-hidden="true"><span>/</span></li>
                <li>
                  <Link to="/library/brands" className="hover:text-[#1D4ED8] transition-colors">Brands</Link>
                </li>
                <li aria-hidden="true"><span>/</span></li>
                <li aria-current="page">
                  <span className="text-slate-700 font-medium">{brand.name}</span>
                </li>
              </ol>
            </nav>

            {/* Two-column header: left = logo + name + summary, right = stats */}
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">

              {/* Left */}
              <div className="flex items-start gap-5 flex-1 min-w-0">
                {brand.logo && (
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={brand.logo} alt={`${brand.name} logo`} className="w-10 h-10 object-contain" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{brand.name}</h1>
                  {brand.summary && (
                    <div
                      className="text-slate-500 text-sm leading-relaxed max-w-2xl [&_p]:mb-2 [&_p:last-child]:mb-0"
                      dangerouslySetInnerHTML={{ __html: brand.summary }}
                    />
                  )}
                </div>
              </div>

              {/* Right: stats card */}
              <div className="md:flex-shrink-0 md:w-52">
                <div className="rounded-xl border border-slate-100 bg-[#FAFAFA] p-4">
                  <ul className="space-y-2 mb-4">
                    {filteredEmails.length > 0 && (
                      <li className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-[#1D4ED8] font-bold">·</span>
                        <span>{filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""}</span>
                      </li>
                    )}
                    {brand.duration && (
                      <li className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-[#1D4ED8] font-bold">·</span>
                        <span>{brand.duration}</span>
                      </li>
                    )}
                    {brand.avgDelay && (
                      <li className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-[#1D4ED8] font-bold">·</span>
                        <span>avg {brand.avgDelay} between sends</span>
                      </li>
                    )}
                  </ul>
                  <button
                    onClick={() => setJourneyOpen(true)}
                    className="w-full text-sm font-semibold text-white py-2 px-3 rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: PURPLE }}
                  >
                    View email journey
                  </button>
                </div>
              </div>

            </div>

            {/* Top tags for this brand */}
            {topBrandTags.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Common email types
                </p>
                <div className="flex flex-wrap gap-2">
                  {topBrandTags.map((tag) => (
                    <Link
                      key={tag.slug}
                      to={`/library/tag/${tag.slug}`}
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:border-[#1D4ED8] hover:text-[#1D4ED8] hover:bg-[#DBEAFE] transition-all"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Brand tab navigation ── */}
        <div className="border-b border-slate-100 bg-white sticky top-16 z-10 shadow-sm">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
              {sortedBrands.map((b) => (
                <Link
                  key={b.slug}
                  to={`/library/brand/${b.slug}`}
                  title={b.name}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    b.slug === slug
                      ? "text-white"
                      : "text-slate-600 hover:text-[#1D4ED8] hover:bg-[#DBEAFE]"
                  }`}
                  style={b.slug === slug ? { background: PURPLE } : {}}
                >
                  {b.logo && (
                    <img src={b.logo} alt="" className="w-4 h-4 object-contain flex-shrink-0" loading="lazy" />
                  )}
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Emails grouped by use case ── */}
        <section className="bg-[#FAFAFA] py-12 min-h-[400px]" aria-label={`${brand.name} emails by use case`}>
          <div className="container mx-auto px-4 max-w-7xl">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-lg font-medium">No emails found for {brand.name}.</p>
              </div>
            ) : (
              <div className="space-y-14">
                {sortedUseCases.map((uc) => {
                  const ucEmails = emailsByUseCase[uc.slug];
                  if (!ucEmails?.length) return null;
                  return (
                    <div key={uc.slug}>
                      <div className="flex items-center gap-3 mb-5">
                        <h2 className="text-base font-semibold text-slate-900">
                          <Link
                            to={`/library/usecase/${uc.slug}`}
                            className="hover:text-[#1D4ED8] transition-colors"
                          >
                            {uc.name}
                          </Link>
                        </h2>
                        <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100">
                          {ucEmails.length} email{ucEmails.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {ucEmails.map((email) => (
                          <Link
                            key={email.id}
                            to={`/library/email/${email.slug}`}
                            className="group rounded-2xl border border-slate-100 bg-white overflow-hidden hover:shadow-md transition-shadow block"
                          >
                            <div className="relative overflow-hidden bg-slate-50 aspect-[4/3]">
                              {email.thumb ? (
                                <img
                                  src={email.thumb}
                                  alt={`${email.subject} — email screenshot from ${brand.name}`}
                                  className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#DBEAFE] flex items-center justify-center">
                                  <span className="text-4xl opacity-30">✉️</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-3">
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
                                      {tags.find((t) => t.slug === tagSlug)?.name ?? tagSlug}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />

      {/* ── Journey modal ── */}
      {journeyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
          onClick={handleJourneyClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full flex flex-col"
            style={{ maxWidth: "min(90vw, 1100px)", maxHeight: "75vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                {brand.logo && (
                  <img src={brand.logo} alt={`${brand.name} logo`} className="w-7 h-7 object-contain" />
                )}
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Email Journey</p>
                  <p className="font-semibold text-slate-900">
                    {brand.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {journeyEmails.length} email{journeyEmails.length !== 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="hidden sm:block text-xs text-slate-400 mr-1">Use ← → to navigate</p>
                <button
                  onClick={handleJourneyClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close journey modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal body: relative wrapper holds arrows + horizontal scroll */}
            <div className="relative flex-1 overflow-hidden">

              {/* Left arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollJourney("left")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-[#1D4ED8] hover:border-[#1D4ED8] transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Right arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scrollJourney("right")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-[#1D4ED8] hover:border-[#1D4ED8] transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              {/* Horizontal scroll strip */}
              <div
                ref={scrollRef}
                onScroll={handleJourneyScroll}
                className="h-full overflow-x-auto flex flex-row gap-4 px-6 py-5"
                style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
              >
                {journeyEmails.map((email, idx) => {
                  const uc = usecases.find((u) => u.slug === email.useCase);
                  const firstTag = tags.find((t) => t.slug === email.tags[0]);
                  return (
                    <Link
                      key={email.id}
                      to={`/library/email/${email.slug}`}
                      onClick={handleJourneyClose}
                      className="flex-shrink-0 flex flex-col rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                      style={{ width: 240, scrollSnapAlign: "start" }}
                    >
                      {/* Metadata */}
                      <div className="p-4 flex flex-col gap-2 border-b border-slate-50">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                            style={{ backgroundColor: PURPLE }}
                          >
                            #{idx + 1}
                          </span>
                          {email.setDate && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              {formatDate(email.setDate)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1D4ED8] transition-colors line-clamp-2 leading-snug">
                          {email.subject || email.templateTitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 min-h-[20px]">
                          {uc && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-medium whitespace-nowrap">
                              {uc.name}
                            </span>
                          )}
                          {firstTag && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                              <Tag className="h-3 w-3 flex-shrink-0" />
                              {firstTag.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timeline connector */}
                      <div className="relative flex items-center px-4 py-2 flex-shrink-0">
                        <div className="flex-1 h-px bg-slate-100" />
                        <div
                          className="w-2.5 h-2.5 rounded-full border-2 bg-white flex-shrink-0 mx-1"
                          style={{ borderColor: PURPLE }}
                        />
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>

                      {/* Email thumbnail */}
                      <div className="flex-1 overflow-hidden bg-[#DBEAFE]" style={{ minHeight: 180 }}>
                        {email.thumb ? (
                          <img
                            src={email.thumb}
                            alt={`${email.subject} — email screenshot from ${brand.name}`}
                            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl opacity-20">✉️</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryBrand;
