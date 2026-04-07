import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, User, Tag, ExternalLink, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { blogPosts } from "@/content/blog";
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

const PURPLE = "#1D4ED8";

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
        <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-[3/4] mb-2 group-hover:shadow-md group-hover:border-[#1D4ED8]/30 transition-all">
          {rel.thumb ? (
            <img
              src={rel.thumb}
              alt={`${rel.subject} — email screenshot from ${getBrandName(rel.brand)}`}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#DBEAFE]" />
          )}
        </div>
        <p className="text-xs font-medium text-slate-700 group-hover:text-[#1D4ED8] transition-colors line-clamp-2 leading-snug">
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

  const relatedBlogPosts = useMemo(
    () => blogPosts.filter((p) => p.libraryTags?.some((lt) => email?.tags.includes(lt))),
    [email]
  );

  const subjectStats = useMemo(() => {
    if (!email) return null;
    const s = email.subject;
    const words = s.trim().split(/\s+/).length;
    const chars = s.length;
    const hasNumber = /\d/.test(s);
    const hasQuestion = s.includes("?");
    const hasEmoji = /[\u{1F600}-\u{1FFFF}]/u.test(s);
    const urgencyWords = ["last chance", "expires", "limited", "now", "today", "don't miss", "hurry", "urgent", "ending"];
    const hasUrgency = urgencyWords.some((w) => s.toLowerCase().includes(w));
    return { words, chars, hasNumber, hasQuestion, hasEmoji, hasUrgency };
  }, [email]);

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
            <ol className="flex items-center gap-2 text-sm text-slate-400">
              <li>
                <Link to="/library" className="hover:text-[#1D4ED8] transition-colors font-medium">
                  Library
                </Link>
              </li>
              <li aria-hidden="true"><span>/</span></li>
              {brand && (
                <>
                  <li>
                    <Link
                      to={`/library/brand/${brand.slug}`}
                      className="hover:text-[#1D4ED8] transition-colors font-medium"
                    >
                      {brand.name}
                    </Link>
                  </li>
                  <li aria-hidden="true"><span>/</span></li>
                </>
              )}
              <li aria-current="page">
                <span className="text-slate-600 font-medium truncate max-w-xs block">{email.subject}</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* ── Main layout ── */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

            {/* ── Left: email screenshot ── */}
            <div>
              <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
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
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Brand</p>
                    <p className="font-semibold text-slate-900 group-hover:text-[#1D4ED8] transition-colors">
                      {brand.name}
                    </p>
                  </div>
                </Link>
              )}

              {/* Subject */}
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Subject line</p>
                <h1 className="text-xl font-serif font-bold text-slate-900 leading-snug">{email.subject}</h1>
              </div>

              {/* Sender + Date row */}
              <div className="flex flex-wrap gap-4">
                {email.sender && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span>{email.sender}</span>
                  </div>
                )}
                {email.setDate && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span>{formatDate(email.setDate)}</span>
                  </div>
                )}
              </div>

              {/* Use case */}
              {useCase && (
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Use case</p>
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
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {emailTags.map((tag) => (
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

              {/* Email type context */}
              {useCase && firstTag && (
                <p className="text-sm text-slate-500 leading-relaxed">
                  This is a{" "}
                  <Link to={`/library/usecase/${useCase.slug}`} className="font-medium text-[#1D4ED8] hover:underline">
                    {useCase.name}
                  </Link>{" "}
                  email, tagged as{" "}
                  <Link to={`/library/tag/${firstTag.slug}`} className="font-medium text-[#1D4ED8] hover:underline">
                    {firstTag.name}
                  </Link>.
                </p>
              )}

              {/* Summary / Description */}
              {email.summary && (
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">About this email</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{email.summary}</p>
                </div>
              )}

              {/* Subject line breakdown */}
              {subjectStats && (
                <div className="rounded-xl border border-slate-100 bg-[#FAFAFA] p-4 space-y-2">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" /> Subject line
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Words</span>
                    <span className="text-xs font-semibold text-slate-900">{subjectStats.words}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Characters</span>
                    <span className="text-xs font-semibold text-slate-900">{subjectStats.chars}</span>
                  </div>
                  {subjectStats.hasNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Contains number</span>
                      <span className="text-xs font-semibold text-[#1D4ED8]">Yes</span>
                    </div>
                  )}
                  {subjectStats.hasQuestion && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Question format</span>
                      <span className="text-xs font-semibold text-[#1D4ED8]">Yes</span>
                    </div>
                  )}
                  {subjectStats.hasEmoji && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Contains emoji</span>
                      <span className="text-xs font-semibold text-[#1D4ED8]">Yes</span>
                    </div>
                  )}
                  {subjectStats.hasUrgency && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Urgency language</span>
                      <span className="text-xs font-semibold text-amber-600">Yes</span>
                    </div>
                  )}
                </div>
              )}

              {/* Brand stats */}
              {brand && (brand.duration || brand.emailCount) && (
                <div className="rounded-xl border border-slate-100 bg-[#FAFAFA] p-4 space-y-2">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">
                    {brand.name} journey
                  </p>
                  {brand.emailCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Emails in library</span>
                      <span className="text-xs font-semibold text-slate-900">{brand.emailCount}</span>
                    </div>
                  )}
                  {brand.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Journey span</span>
                      <span className="text-xs font-semibold text-slate-900">{brand.duration}</span>
                    </div>
                  )}
                  {brand.avgDelay && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Avg. send gap</span>
                      <span className="text-xs font-semibold text-slate-900">{brand.avgDelay}</span>
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
            <div className="border-t border-slate-100 pt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                More from {brandName}
              </h2>
              <RelatedGrid emails={relatedEmails} getBrandName={getBrandName} />
            </div>
          )}

          {relatedByUseCase.length > 0 && useCase && (
            <div className="border-t border-slate-100 pt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                More {useCase.name} emails
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                <Link to={`/library/usecase/${useCase.slug}`}
                  className="hover:text-[#1D4ED8] transition-colors">
                  Browse all {useCase.name} emails →
                </Link>
              </p>
              <RelatedGrid emails={relatedByUseCase} getBrandName={getBrandName} />
            </div>
          )}

          {relatedByTag.length > 0 && firstTag && (
            <div className="border-t border-slate-100 pt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                More {firstTag.name} emails
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                <Link to={`/library/tag/${firstTag.slug}`}
                  className="hover:text-[#1D4ED8] transition-colors">
                  Browse all {firstTag.name} emails →
                </Link>
              </p>
              <RelatedGrid emails={relatedByTag} getBrandName={getBrandName} />
            </div>
          )}

          {relatedBlogPosts.length > 0 && (
            <div className="border-t border-slate-100 pt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Related articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedBlogPosts.slice(0, 3).map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    className="group rounded-2xl border border-slate-100 bg-white overflow-hidden hover:shadow-md transition-shadow block"
                  >
                    {post.thumbnail && (
                      <div className="overflow-hidden bg-slate-50 aspect-[16/9]">
                        <img
                          src={post.thumbnail}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-[#1D4ED8] transition-colors">
                        {post.title}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2">{post.shortDescription}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default LibraryEmail;
