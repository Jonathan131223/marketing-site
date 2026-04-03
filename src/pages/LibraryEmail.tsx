import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, User, Tag, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  truncateAtWord,
  buildArticleJsonLd,
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
  metaDesc: string;
}

interface TagType {
  slug: string;
  name: string;
}

interface UseCase {
  slug: string;
  name: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const PURPLE = "#754BDD";

function formatDate(raw: string): string {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return raw;
  }
}

function isoDate(raw: string): string {
  if (!raw) return "";
  try { return new Date(raw).toISOString().split("T")[0]; } catch { return ""; }
}

// ── Shared related-emails grid ────────────────────────────────────────────────

interface RelatedGridProps {
  emails: Email[];
  getBrandName: (brandSlug: string) => string;
}

const RelatedGrid: React.FC<RelatedGridProps> = ({ emails: items, getBrandName }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
    {items.map((rel) => (
      <Link key={rel.id} to={`/library/email/${rel.slug}`} className="group block">
        <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[3/4] mb-2 group-hover:shadow-md group-hover:border-[#754BDD]/30 transition-all">
          {rel.thumb ? (
            <img
              src={rel.thumb}
              alt={`${rel.subject} — email screenshot from ${getBrandName(rel.brand)}`}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#F3EEFF]" />
          )}
        </div>
        <p className="text-xs font-medium text-gray-700 group-hover:text-[#754BDD] transition-colors line-clamp-2 leading-snug">
          {rel.subject}
        </p>
      </Link>
    ))}
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────────

const LibraryEmail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [emails, setEmails]     = useState<Email[]>([]);
  const [brands, setBrands]     = useState<Brand[]>([]);
  const [tags, setTags]         = useState<TagType[]>([]);
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

  const email   = useMemo(() => emails.find((e) => e.slug === slug), [emails, slug]);
  const brand   = useMemo(() => brands.find((b) => b.slug === email?.brand), [brands, email]);
  const useCase = useMemo(() => usecases.find((u) => u.slug === email?.useCase), [usecases, email]);

  const emailTags = useMemo(
    () => tags.filter((t) => email?.tags.includes(t.slug)),
    [tags, email]
  );

  const relatedEmails = useMemo(
    () => emails.filter((e) => e.brand === email?.brand && e.slug !== slug).slice(0, 6),
    [emails, email, slug]
  );

  const relatedByUseCase = useMemo(
    () => emails.filter((e) => e.useCase === email?.useCase && e.slug !== slug).slice(0, 6),
    [emails, email, slug]
  );

  const firstTag = emailTags[0];
  const relatedByTag = useMemo(
    () =>
      firstTag
        ? emails.filter((e) => e.tags.includes(firstTag.slug) && e.slug !== slug).slice(0, 6)
        : [],
    [emails, firstTag, slug]
  );

  const getBrandName = useMemo(() => {
    const map: Record<string, string> = {};
    brands.forEach((b) => { map[b.slug] = b.name; });
    return (brandSlug: string) => map[brandSlug] ?? brandSlug;
  }, [brands]);

  useEffect(() => {
    if (!loading && !email) navigate("/library", { replace: true });
  }, [loading, email, navigate]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

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

  if (!email) return null;

  const brandName  = brand?.name ?? email.brand;
  const pageTitle  = `${email.subject} — ${brandName} | DigiStorms Library`;
  const rawDesc    = email.summary || `${email.subject} — a lifecycle email from ${brandName}.`;
  const pageDesc   = truncateAtWord(rawDesc, 155);
  const pageUrl    = `${SITE_URL}/library/email/${slug}`;
  const ogImage    = email.thumb || DEFAULT_OG_IMAGE;

  const jsonLd = buildArticleJsonLd({
    headline: email.subject,
    description: pageDesc,
    image: email.thumb || undefined,
    url: pageUrl,
    datePublished: isoDate(email.setDate) || undefined,
    authorName: brandName,
    breadcrumbs: [
      { name: "Library",  url: `${SITE_URL}/library` },
      { name: brandName,  url: `${SITE_URL}/library/brand/${email.brand}` },
      { name: email.subject, url: pageUrl },
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
        <meta property="og:type"        content="article" />
        <meta property="og:image"       content={ogImage} />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image"       content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-20 pb-24">

        {/* ── Breadcrumb ── */}
        <div className="container mx-auto px-4 max-w-7xl mb-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-400">
              <li>
                <Link to="/library" className="hover:text-[#754BDD] transition-colors font-medium">
                  Library
                </Link>
              </li>
              <li aria-hidden="true"><span>/</span></li>
              {brand && (
                <>
                  <li>
                    <Link
                      to={`/library/brand/${brand.slug}`}
                      className="hover:text-[#754BDD] transition-colors font-medium"
                    >
                      {brand.name}
                    </Link>
                  </li>
                  <li aria-hidden="true"><span>/</span></li>
                </>
              )}
              <li aria-current="page">
                <span className="text-gray-600 font-medium truncate max-w-xs block">{email.subject}</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* ── Main layout ── */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

            {/* ── Left: email screenshot ── */}
            <div>
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                <img
                  src={email.thumb}
                  alt={`${email.subject} — email screenshot from ${brandName}`}
                  className="w-full block"
                  loading="eager"
                />
              </div>
            </div>

            {/* ── Right: metadata sidebar ── */}
            <div className="lg:sticky lg:top-20 space-y-5">

              {/* Brand */}
              {brand && (
                <Link
                  to={`/library/brand/${brand.slug}`}
                  className="flex items-center gap-3 group"
                >
                  {brand.logo && (
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Brand</p>
                    <p className="font-semibold text-gray-900 group-hover:text-[#754BDD] transition-colors">
                      {brand.name}
                    </p>
                  </div>
                </Link>
              )}

              {/* Subject */}
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Subject line</p>
                <h1 className="text-xl font-bold text-gray-900 leading-snug">{email.subject}</h1>
              </div>

              {/* Sender + Date row */}
              <div className="flex flex-wrap gap-4">
                {email.sender && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{email.sender}</span>
                  </div>
                )}
                {email.setDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{formatDate(email.setDate)}</span>
                  </div>
                )}
              </div>

              {/* Use case */}
              {useCase && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Use case</p>
                  <Link
                    to={`/library/usecase/${useCase.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                    style={{ background: "#EDE9FE", color: PURPLE }}
                  >
                    {useCase.name}
                  </Link>
                </div>
              )}

              {/* Tags */}
              {emailTags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {emailTags.map((tag) => (
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

              {/* Summary / Description */}
              {email.summary && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">About this email</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{email.summary}</p>
                </div>
              )}

              {/* Brand stats */}
              {brand && (brand.duration || brand.emailCount) && (
                <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4 space-y-2">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
                    {brand.name} journey
                  </p>
                  {brand.emailCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Emails in library</span>
                      <span className="text-xs font-semibold text-gray-900">{brand.emailCount}</span>
                    </div>
                  )}
                  {brand.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Journey span</span>
                      <span className="text-xs font-semibold text-gray-900">{brand.duration}</span>
                    </div>
                  )}
                  {brand.avgDelay && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Avg. send gap</span>
                      <span className="text-xs font-semibold text-gray-900">{brand.avgDelay}</span>
                    </div>
                  )}
                  <Link
                    to={`/library/brand/${brand.slug}`}
                    className="flex items-center gap-1 text-xs font-semibold mt-2 transition-colors"
                    style={{ color: PURPLE }}
                  >
                    See all {brand.name} emails
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Related sections ── */}
        <div className="container mx-auto px-4 max-w-7xl mt-16 space-y-12">

          {relatedEmails.length > 0 && (
            <div className="border-t border-gray-100 pt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                More from {brandName}
              </h2>
              <RelatedGrid emails={relatedEmails} getBrandName={getBrandName} />
            </div>
          )}

          {relatedByUseCase.length > 0 && useCase && (
            <div className="border-t border-gray-100 pt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                More {useCase.name} emails
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                <Link to={`/library/usecase/${useCase.slug}`}
                  className="hover:text-[#754BDD] transition-colors">
                  Browse all {useCase.name} emails →
                </Link>
              </p>
              <RelatedGrid emails={relatedByUseCase} getBrandName={getBrandName} />
            </div>
          )}

          {relatedByTag.length > 0 && firstTag && (
            <div className="border-t border-gray-100 pt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                More {firstTag.name} emails
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                <Link to={`/library/tag/${firstTag.slug}`}
                  className="hover:text-[#754BDD] transition-colors">
                  Browse all {firstTag.name} emails →
                </Link>
              </p>
              <RelatedGrid emails={relatedByTag} getBrandName={getBrandName} />
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default LibraryEmail;
