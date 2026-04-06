import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
}

interface Tag {
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

const USE_CASE_DISPLAY: Record<string, { emoji: string }> = {
  "onboard-free-user":     { emoji: "👋" },
  "onboard-paid-user":     { emoji: "🎉" },
  "educate-engage":        { emoji: "💡" },
  "expand-user":           { emoji: "📈" },
  "celebrate-milestones":  { emoji: "🏆" },
  "request-feedback":      { emoji: "💬" },
  "win-back-churned-user": { emoji: "🔄" },
  "announce-new-features": { emoji: "🚀" },
  "transactional-email":   { emoji: "📧" },
};

// ── Component ──────────────────────────────────────────────────────────────────

const LibraryUseCase: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [emails, setEmails]     = useState<Email[]>([]);
  const [brands, setBrands]     = useState<Brand[]>([]);
  const [tags, setTags]         = useState<Tag[]>([]);
  const [usecases, setUsecases] = useState<UseCase[]>([]);
  const [loading, setLoading]   = useState(true);

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

  const useCase        = useMemo(() => usecases.find((u) => u.slug === slug), [usecases, slug]);
  const filteredEmails = useMemo(() => emails.filter((e) => e.useCase === slug), [emails, slug]);
  const sortedUseCases = useMemo(
    () => [...usecases].sort((a, b) => a.order - b.order),
    [usecases]
  );

  const groupedByBrand = useMemo(() => {
    const groups: Record<string, Email[]> = {};
    filteredEmails.forEach((e) => {
      if (!groups[e.brand]) groups[e.brand] = [];
      groups[e.brand].push(e);
    });
    Object.values(groups).forEach((g) =>
      g.sort((a, b) => new Date(a.setDate).getTime() - new Date(b.setDate).getTime())
    );
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filteredEmails]);

  // Related tags: most common tags across emails in this use case
  const relatedTags = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEmails.forEach((e) => {
      e.tags.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tagSlug]) => tags.find((t) => t.slug === tagSlug))
      .filter(Boolean) as Tag[];
  }, [filteredEmails, tags]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    if (!loading && usecases.length > 0 && !useCase) navigate("/library", { replace: true });
  }, [loading, useCase, usecases, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: PURPLE, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!useCase) return null;

  const config   = USE_CASE_DISPLAY[slug!] ?? null;
  const desc     = useCase.description;
  const pageDesc = truncateAtWord(
    desc || `Browse ${filteredEmails.length} ${useCase.name} emails from top B2B SaaS companies.`,
    155
  );
  const pageUrl  = `${SITE_URL}/library/usecase/${slug}`;

  const jsonLd = buildCollectionPageJsonLd({
    name: `${useCase.name} Emails — B2B SaaS Library`,
    description: pageDesc,
    url: pageUrl,
    breadcrumbs: [
      { name: "Library",   url: `${SITE_URL}/library` },
      { name: "Use Cases", url: `${SITE_URL}/library/usecases` },
      { name: useCase.name, url: pageUrl },
    ],
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{useCase.name} Emails — B2B SaaS Library | DigiStorms</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title"       content={`${useCase.name} Emails — DigiStorms Library`} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url"         content={pageUrl} />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={`${useCase.name} Emails — DigiStorms Library`} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image"       content={DEFAULT_OG_IMAGE} />
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
                  <Link to="/library/usecases" className="hover:text-[#1D4ED8] transition-colors">Use Cases</Link>
                </li>
                <li aria-hidden="true"><span>/</span></li>
                <li aria-current="page">
                  <span className="text-slate-700 font-medium">{useCase.name}</span>
                </li>
              </ol>
            </nav>

            {config && <span className="text-4xl mb-4 block">{config.emoji}</span>}
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{useCase.name}</h1>
            <p className="text-slate-400 text-sm mb-2">
              {filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""} in library
            </p>
            {desc && (
              <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">{desc}</p>
            )}

            {/* Related tags */}
            {relatedTags.length > 0 && (
              <div className="mt-5">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Related email types</p>
                <div className="flex flex-wrap gap-2">
                  {relatedTags.map((tag) => (
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

        {/* ── Use case tab navigation ── */}
        <div className="border-b border-slate-100 bg-white sticky top-16 z-10 shadow-sm">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
              {sortedUseCases.map((uc) => {
                const ucConfig = USE_CASE_DISPLAY[uc.slug];
                return (
                  <Link
                    key={uc.slug}
                    to={`/library/usecase/${uc.slug}`}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      uc.slug === slug
                        ? "text-white"
                        : "text-slate-600 hover:text-[#1D4ED8] hover:bg-[#DBEAFE]"
                    }`}
                    style={uc.slug === slug ? { background: PURPLE } : {}}
                  >
                    {ucConfig && <span>{ucConfig.emoji}</span>}
                    {uc.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Emails grouped by brand ── */}
        <section className="bg-[#FAFAFA] py-12 min-h-[400px]" aria-label={`${useCase.name} emails by brand`}>
          <div className="container mx-auto px-4 max-w-7xl">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-lg font-medium">No emails found for "{useCase.name}".</p>
              </div>
            ) : (
              <div className="space-y-14">
                {groupedByBrand.map(([brandSlug, brandEmails]) => {
                  const brand = brands.find((b) => b.slug === brandSlug);
                  return (
                    <div key={brandSlug}>
                      {/* Brand header */}
                      <div className="flex items-center gap-3 mb-5">
                        <h2 className="text-base font-semibold text-slate-900">
                          <Link
                            to={`/library/brand/${brandSlug}`}
                            className="flex items-center gap-3 group hover:text-[#1D4ED8] transition-colors"
                          >
                            {brand?.logo && (
                              <img
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                className="h-8 w-8 object-contain rounded-lg border border-slate-100 bg-white p-0.5"
                              />
                            )}
                            {brand?.name ?? brandSlug}
                          </Link>
                        </h2>
                        <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100">
                          {brandEmails.length} email{brandEmails.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Email cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {brandEmails.map((email) => (
                          <Link
                            key={email.id}
                            to={`/library/email/${email.slug}`}
                            className="group rounded-2xl border border-slate-100 bg-white overflow-hidden hover:shadow-md transition-shadow block"
                          >
                            <div className="relative overflow-hidden bg-slate-50 aspect-[4/3]">
                              {email.thumb ? (
                                <img
                                  src={email.thumb}
                                  alt={`${email.subject} — email screenshot from ${brand?.name ?? brandSlug}`}
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
    </div>
  );
};

export default LibraryUseCase;
