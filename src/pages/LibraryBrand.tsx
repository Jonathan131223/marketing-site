import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { X, Calendar, Tag } from "lucide-react";
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

const PURPLE = "#754BDD";

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
  const [loading, setLoading]     = useState(true);
  const [journeyOpen, setJourneyOpen] = useState(false);

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

  useEffect(() => {
    if (!journeyOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setJourneyOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [journeyOpen]);

  useEffect(() => {
    document.body.style.overflow = journeyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
        <div className="bg-white border-b border-gray-100 pb-8 pt-10">
          <div className="container mx-auto px-4 max-w-6xl">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-gray-400">
                <li>
                  <Link to="/library" className="hover:text-[#754BDD] transition-colors">Library</Link>
                </li>
                <li aria-hidden="true"><span>/</span></li>
                <li>
                  <Link to="/library/brands" className="hover:text-[#754BDD] transition-colors">Brands</Link>
                </li>
                <li aria-hidden="true"><span>/</span></li>
                <li aria-current="page">
                  <span className="text-gray-700 font-medium">{brand.name}</span>
                </li>
              </ol>
            </nav>

            {/* Two-column header: left = logo + name + summary, right = stats */}
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">

              {/* Left */}
              <div className="flex items-start gap-5 flex-1 min-w-0">
                {brand.logo && (
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={brand.logo} alt={`${brand.name} logo`} className="w-10 h-10 object-contain" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{brand.name}</h1>
                  {brand.summary && (
                    <div
                      className="text-gray-500 text-sm leading-relaxed max-w-2xl [&_p]:mb-2 [&_p:last-child]:mb-0"
                      dangerouslySetInnerHTML={{ __html: brand.summary }}
                    />
                  )}
                </div>
              </div>

              {/* Right: stats card */}
              <div className="md:flex-shrink-0 md:w-52">
                <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                  <ul className="space-y-2 mb-4">
                    {filteredEmails.length > 0 && (
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-[#754BDD] font-bold">·</span>
                        <span>{filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""}</span>
                      </li>
                    )}
                    {brand.duration && (
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-[#754BDD] font-bold">·</span>
                        <span>{brand.duration}</span>
                      </li>
                    )}
                    {brand.avgDelay && (
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-[#754BDD] font-bold">·</span>
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
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Common email types
                </p>
                <div className="flex flex-wrap gap-2">
                  {topBrandTags.map((tag) => (
                    <Link
                      key={tag.slug}
                      to={`/library/tag/${tag.slug}`}
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#754BDD] hover:text-[#754BDD] hover:bg-[#F3EEFF] transition-all"
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
        <div className="border-b border-gray-100 bg-white sticky top-16 z-10 shadow-sm">
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
                      : "text-gray-600 hover:text-[#754BDD] hover:bg-[#F3EEFF]"
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
              <div className="text-center py-20 text-gray-400">
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
                        <h2 className="text-base font-semibold text-gray-900">
                          <Link
                            to={`/library/usecase/${uc.slug}`}
                            className="hover:text-[#754BDD] transition-colors"
                          >
                            {uc.name}
                          </Link>
                        </h2>
                        <span className="text-xs text-gray-400 font-medium px-2 py-0.5 rounded-full bg-gray-100">
                          {ucEmails.length} email{ucEmails.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {ucEmails.map((email) => (
                          <Link
                            key={email.id}
                            to={`/library/email/${email.slug}`}
                            className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow block"
                          >
                            <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
                              {email.thumb ? (
                                <img
                                  src={email.thumb}
                                  alt={`${email.subject} — email screenshot from ${brand.name}`}
                                  className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#F3EEFF] flex items-center justify-center">
                                  <span className="text-4xl opacity-30">✉️</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
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
                                      className="text-xs px-2 py-0.5 rounded-full bg-[#F3EEFF] text-[#754BDD] hover:bg-[#754BDD] hover:text-white transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
          onClick={handleJourneyClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full flex flex-col"
            style={{ maxWidth: 680, maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                {brand.logo && (
                  <img src={brand.logo} alt={`${brand.name} logo`} className="w-7 h-7 object-contain" />
                )}
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email Journey</p>
                  <p className="font-semibold text-gray-900">{brand.name}</p>
                </div>
              </div>
              <button
                onClick={handleJourneyClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close journey modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {journeyEmails.map((email, idx) => {
                const uc = usecases.find((u) => u.slug === email.useCase);
                const firstTagName = tags.find((t) => t.slug === email.tags[0])?.name;
                return (
                  <Link
                    key={email.id}
                    to={`/library/email/${email.slug}`}
                    onClick={handleJourneyClose}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-xs font-semibold text-gray-300 w-5 text-right flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="w-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
                      style={{ height: 64 }}>
                      {email.thumb ? (
                        <img
                          src={email.thumb}
                          alt={`${email.subject} — email screenshot from ${brand.name}`}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F3EEFF]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#754BDD] transition-colors line-clamp-1 leading-snug mb-1">
                        {email.subject || email.templateTitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {email.setDate && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(email.setDate)}
                          </span>
                        )}
                        {uc && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3EEFF] text-[#754BDD] font-medium">
                            {uc.name}
                          </span>
                        )}
                        {firstTagName && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Tag className="h-3 w-3" />
                            {firstTagName}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryBrand;
