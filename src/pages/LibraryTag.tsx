import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronDown } from "lucide-react";
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

const PURPLE = "#754BDD";
const PAGE_SIZE = 24;

// ── Component ──────────────────────────────────────────────────────────────────

const LibraryTag: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [emails, setEmails]     = useState<Email[]>([]);
  const [brands, setBrands]     = useState<Brand[]>([]);
  const [tags, setTags]         = useState<Tag[]>([]);
  const [usecases, setUsecases] = useState<UseCase[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);

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

  const tag            = useMemo(() => tags.find((t) => t.slug === slug), [tags, slug]);
  const filteredEmails = useMemo(() => emails.filter((e) => e.tags.includes(slug!)), [emails, slug]);
  const pagedEmails    = useMemo(() => filteredEmails.slice(0, page * PAGE_SIZE), [filteredEmails, page]);
  const sortedTags     = useMemo(() => [...tags].sort((a, b) => a.name.localeCompare(b.name)), [tags]);

  // Related use cases: use cases that appear in emails with this tag
  const relatedUseCases = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEmails.forEach((e) => {
      if (e.useCase) counts[e.useCase] = (counts[e.useCase] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([ucSlug]) => usecases.find((u) => u.slug === ucSlug))
      .filter(Boolean) as UseCase[];
  }, [filteredEmails, usecases]);

  useEffect(() => { setPage(1); }, [slug]);
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    if (!loading && tags.length > 0 && !tag) navigate("/library", { replace: true });
  }, [loading, tag, tags, navigate]);

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

  if (!tag) return null;

  const rawDesc  = tag.summary || `Browse ${filteredEmails.length} ${tag.name} emails from top B2B SaaS companies in the DigiStorms library.`;
  const pageDesc = truncateAtWord(rawDesc, 155);
  const pageUrl  = `${SITE_URL}/library/tag/${slug}`;

  const jsonLd = buildCollectionPageJsonLd({
    name: `${tag.name} Emails — B2B SaaS Library`,
    description: pageDesc,
    url: pageUrl,
    breadcrumbs: [
      { name: "Library", url: `${SITE_URL}/library` },
      { name: "Tags",    url: `${SITE_URL}/library/tags` },
      { name: tag.name,  url: pageUrl },
    ],
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{tag.name} Emails — B2B SaaS Library | DigiStorms</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title"       content={`${tag.name} Emails — DigiStorms Library`} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url"         content={pageUrl} />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={`${tag.name} Emails — DigiStorms Library`} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image"       content={DEFAULT_OG_IMAGE} />
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
                  <Link to="/library/tags" className="hover:text-[#754BDD] transition-colors">Tags</Link>
                </li>
                <li aria-hidden="true"><span>/</span></li>
                <li aria-current="page">
                  <span className="text-gray-700 font-medium">{tag.name}</span>
                </li>
              </ol>
            </nav>

            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ background: "#EDE9FE", color: PURPLE }}
            >
              {tag.name}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{tag.name} emails</h1>
            <p className="text-gray-400 text-sm">
              {filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""} in library
            </p>
            {tag.summary && (
              <div
                className="text-gray-500 text-sm mt-2 max-w-2xl leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: tag.summary }}
              />
            )}

            {/* Related use cases */}
            {relatedUseCases.length > 0 && (
              <div className="mt-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Related use cases</p>
                <div className="flex flex-wrap gap-2">
                  {relatedUseCases.map((uc) => (
                    <Link
                      key={uc.slug}
                      to={`/library/usecase/${uc.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#754BDD] hover:text-[#754BDD] hover:bg-[#F3EEFF] transition-all"
                    >
                      {uc.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tag tab navigation ── */}
        <div className="border-b border-gray-100 bg-white sticky top-16 z-10 shadow-sm">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="overflow-x-auto scrollbar-hide py-2">
              <div
                className="grid grid-rows-2 gap-1.5"
                style={{ gridAutoFlow: "column", gridAutoColumns: "max-content" }}
              >
                {sortedTags.map((t) => (
                  <Link
                    key={t.slug}
                    to={`/library/tag/${t.slug}`}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                      t.slug === slug
                        ? "text-white"
                        : "text-gray-600 border border-gray-200 hover:border-[#754BDD] hover:text-[#754BDD] hover:bg-[#F3EEFF]"
                    }`}
                    style={t.slug === slug ? { background: PURPLE } : {}}
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Email grid ── */}
        <section className="bg-[#FAFAFA] py-12 min-h-[400px]" aria-label={`${tag.name} emails`}>
          <div className="container mx-auto px-4 max-w-7xl">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-medium">No emails found for "{tag.name}".</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {pagedEmails.map((email) => {
                    const brand = brands.find((b) => b.slug === email.brand);
                    return (
                      <Link
                        key={email.id}
                        to={`/library/email/${email.slug}`}
                        className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow block"
                      >
                        <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
                          {email.thumb ? (
                            <img
                              src={email.thumb}
                              alt={`${email.subject} — email screenshot from ${brand?.name ?? email.brand}`}
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
                          <Link
                            to={`/library/brand/${email.brand}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 mb-2 group/brand"
                          >
                            {brand?.logo && (
                              <img
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                className="h-4 w-4 object-contain"
                              />
                            )}
                            <span className="text-xs text-gray-400 font-medium group-hover/brand:text-[#754BDD] transition-colors">
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
                                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                                    tagSlug === slug
                                      ? "bg-[#754BDD] text-white"
                                      : "bg-[#F3EEFF] text-[#754BDD] hover:bg-[#754BDD] hover:text-white"
                                  }`}
                                >
                                  {tags.find((t) => t.slug === tagSlug)?.name ?? tagSlug}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {pagedEmails.length < filteredEmails.length && (
                  <div className="flex flex-col items-center mt-10 gap-2">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="flex items-center gap-2 px-6 py-3 rounded-full border-2 font-semibold text-sm hover:text-white hover:bg-[#754BDD] hover:border-[#754BDD] transition-all"
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

      </main>

      <Footer />
    </div>
  );
};

export default LibraryTag;
