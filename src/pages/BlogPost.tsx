import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { blogPosts, type BlogPost as BlogPostMeta } from "@/content/blog";
import { ArrowLeft, Calendar, Clock, UserRound } from "lucide-react";
import jonProfile from "@/assets/founder/jonathan-profile.png";

interface LibraryEmail {
  id: string;
  slug: string;
  subject: string;
  thumb: string;
  tags: string[];
  brand: string;
}

interface LibraryBrand {
  slug: string;
  name: string;
  logo: string;
}

const articleModules = import.meta.glob("../content/blog/*.md", { query: "?raw", import: "default" });

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const data: Record<string, string> = {};
  match[1].split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key) data[key] = val;
  });
  return { data, content: match[2] };
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  const el = node as React.ReactElement;
  return el?.props?.children ? extractText(el.props.children) : "";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Meta description / OG text — ~155 chars, word boundary (matches inject-meta.js intent). */
function truncateMetaDescription(text: string, limit = 155): string {
  const t = (text || "").trim();
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + "…";
}

function isEmailExamplePost(meta: BlogPostMeta | undefined): boolean {
  return (meta?.libraryTags?.length ?? 0) > 0;
}

/** Related posts: stay in the same "series" (email examples vs guides) when possible. */
function relatedPostsFor(currentSlug: string | undefined, meta: BlogPostMeta | undefined): BlogPostMeta[] {
  if (!currentSlug) return [];
  const others = blogPosts.filter((p) => p.slug !== currentSlug);
  const emailPool = others.filter((p) => isEmailExamplePost(p));
  const guidePool = others.filter((p) => !isEmailExamplePost(p));
  if (isEmailExamplePost(meta)) {
    const pool = emailPool.length >= 3 ? emailPool : [...emailPool, ...guidePool];
    return pool.slice(0, 3);
  }
  const pool = guidePool.length >= 3 ? guidePool : [...guidePool, ...emailPool];
  return pool.slice(0, 3);
}

const HeroPlaceholder = () => (
  <svg viewBox="0 0 800 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="800" height="420" fill="#EDE9FE" />
    <rect x="220" y="50" width="360" height="320" rx="16" fill="white" />
    <rect x="220" y="50" width="360" height="64" rx="16" fill="#7C3AED" />
    <rect x="252" y="74" width="140" height="14" rx="7" fill="white" opacity="0.9" />
    <rect x="252" y="134" width="296" height="10" rx="5" fill="#E5E7EB" />
    <rect x="252" y="154" width="260" height="10" rx="5" fill="#E5E7EB" />
    <rect x="252" y="174" width="280" height="10" rx="5" fill="#E5E7EB" />
    <rect x="252" y="194" width="240" height="10" rx="5" fill="#E5E7EB" />
    <rect x="292" y="230" width="216" height="48" rx="10" fill="#7C3AED" />
    <rect x="330" y="248" width="140" height="12" rx="6" fill="white" opacity="0.9" />
    <rect x="252" y="308" width="200" height="8" rx="4" fill="#E5E7EB" />
    <rect x="252" y="324" width="160" height="8" rx="4" fill="#E5E7EB" />
  </svg>
);

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [frontmatter, setFrontmatter] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  const postMeta = blogPosts.find((p) => p.slug === slug);

  const relatedArticles = useMemo(
    () => relatedPostsFor(slug, postMeta),
    [slug, postMeta],
  );

  const [libraryEmails, setLibraryEmails] = useState<LibraryEmail[]>([]);
  const [libraryBrands, setLibraryBrands] = useState<LibraryBrand[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/data/library/emails.json").then((r) => r.json()),
      fetch("/data/library/brands.json").then((r) => r.json()),
    ]).then(([emails, brands]) => {
      setLibraryEmails(emails);
      setLibraryBrands(brands);
    }).catch(() => {/* silently ignore — section stays hidden */});
  }, []);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const key = `../content/blog/${slug}.md`;
        if (!articleModules[key]) {
          navigate("/blog");
          return;
        }
        const raw = await articleModules[key]() as string;
        const { data, content: body } = parseFrontmatter(raw);
        setFrontmatter(data);
        setContent(body);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load article:", err);
        setLoading(false);
      }
    };
    loadArticle();
  }, [slug, navigate]);

  // Extract H2s for the table of contents
  const tocItems = useMemo(() => {
    const h2Regex = /^## (.+)$/gm;
    return [...content.matchAll(h2Regex)].map((m) => ({
      text: m[1].trim(),
      id: slugify(m[1].trim()),
    }));
  }, [content]);

  // Track active H2 via scroll position
  useEffect(() => {
    if (!tocItems.length) return;
    const OFFSET = 120; // accounts for sticky navbar + some breathing room
    const handleScroll = () => {
      const headings = Array.from(document.querySelectorAll<HTMLElement>("h2[id]"));
      if (!headings.length) return;
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.offsetTop <= window.scrollY + OFFSET) {
          current = heading.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };
    // Set initial state after a short delay to let the DOM settle
    const timer = setTimeout(() => {
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 150);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [tocItems]);

  useEffect(() => {
    const handleProgressScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    };
    window.addEventListener("scroll", handleProgressScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleProgressScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  const title = frontmatter.title || postMeta?.title || "";
  const description = frontmatter.description || postMeta?.description || "";
  const date = frontmatter.date || postMeta?.date || "";
  const readTime = frontmatter.readTime || postMeta?.readTime || "";
  const metaDescription = truncateMetaDescription(description || "Generate high-converting lifecycle emails with AI.");
  const heroImage = postMeta?.heroImage;
  const ogImage = heroImage
    ? `https://digistorms.ai${heroImage}`
    : "https://digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png";

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  const emailSeries = isEmailExamplePost(postMeta);
  const articleSection = emailSeries ? "SaaS email examples" : "SaaS growth and retention";

  const readTimeIso = (() => {
    const m = readTime.match(/(\d+)\s*min/i);
    return m ? `PT${m[1]}M` : undefined;
  })();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: metaDescription,
    image: ogImage,
    url: `https://digistorms.ai/blog/${slug}`,
    datePublished: date,
    articleSection,
    ...(readTimeIso ? { timeRequired: readTimeIso } : {}),
    author: {
      "@type": "Person",
      name: "Jonathan Bernard",
      url: "https://www.linkedin.com/in/jonathan-digistorms/",
    },
    publisher: {
      "@type": "Organization",
      name: "DigiStorms",
      url: "https://digistorms.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{title ? `${title} | DigiStorms` : "DigiStorms - AI Lifecycle Email Generator"}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://digistorms.ai/blog/${slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`https://digistorms.ai/blog/${slug}`} />
        {date ? <meta property="article:published_time" content={`${date}T12:00:00.000Z`} /> : null}
        <meta property="article:section" content={articleSection} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />
      {/* Scroll progress bar */}
      <div className="fixed top-14 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
        <div
          className="h-full"
          style={{ width: `${scrollProgress}%`, backgroundColor: '#1D4ED8', transition: 'none' }}
        />
      </div>
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          {/* Article header — centered, narrow */}
          <header className="text-center mb-10 max-w-xl mx-auto">
            <h1
              className="leading-tight"
              style={{ color: '#1D4ED8', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '400', margin: '0px 0px 20px' }}
            >
              {title}
            </h1>
            {description && (
              <p
                className="leading-relaxed max-w-2xl mx-auto mb-6"
                style={{ color: '#333333', fontSize: '17px' }}
              >
                {description}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <img
                src={jonProfile}
                alt="Jonathan Bernard"
                className="w-8 h-8 rounded-full object-cover"
                loading="lazy"
                decoding="async"
                width={32}
                height={32}
              />
              <span className="text-slate-700">Jonathan Bernard</span>
              {formattedDate && (
                <>
                  <span className="text-slate-300 hidden sm:inline" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{formattedDate}</span>
                  </span>
                </>
              )}
              {readTime && (
                <>
                  <span className="text-slate-300 hidden sm:inline" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{readTime}</span>
                  </span>
                </>
              )}
            </div>
          </header>

          {/* Hero image — centered, narrow */}
          <div className="rounded-2xl overflow-hidden bg-[#EDE9FE] mb-12 aspect-[16/9] max-w-xl mx-auto">
            {heroImage ? (
              <img src={heroImage} alt={title} className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
            ) : (
              <HeroPlaceholder />
            )}
          </div>

          {/* Two-column body: TOC left + article right */}
          <div className="flex gap-12">

            {/* Sticky Table of Contents */}
            {tocItems.length > 0 && (
              <aside className="hidden lg:block w-52 shrink-0">
                <div className="sticky top-28">
                  <p className="text-sm font-semibold text-slate-900 mb-4">Table of Contents</p>
                  <ul className="space-y-3">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`text-sm leading-snug transition-colors block ${
                            activeId === item.id
                              ? "font-medium text-slate-900"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}

            {/* Main article */}
            <div className="flex-1 min-w-0 max-w-2xl">
              <article>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => {
                      const text = React.Children.toArray(children)
                        .map((c) => (typeof c === "string" ? c : ""))
                        .join("");
                      const id = slugify(text);
                      return (
                        <h2
                          id={id}
                          style={{ color: '#1D4ED8', fontSize: '28px', fontWeight: '500', margin: '28px 0px 12px' }}
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => (
                      <h3 style={{ color: '#1D4ED8', fontSize: '22px', fontWeight: '500', margin: '20px 0px 10px' }}>
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => {
                      const text = extractText(children);
                      if (/^subject(\s+line)?\s*:/i.test(text)) {
                        return (
                          <p className="text-center text-sm font-normal text-slate-400 mb-6 px-2">
                            {children}
                          </p>
                        );
                      }
                      return (
                        <p className="leading-relaxed" style={{ color: '#333333', fontSize: '17px', margin: '0px 0px 10px' }}>
                          {children}
                        </p>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="bg-violet-50 border-l-4 border-violet-400 rounded-r-xl px-6 py-4 my-6 text-slate-700 text-base">
                        {children}
                      </blockquote>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-slate-800">{children}</strong>
                    ),
                    img: ({ src, alt }) =>
                      src ? (
                        <div className="w-full mt-6 mb-1">
                          <img
                            src={src}
                            alt={alt || ""}
                            className="w-full h-auto rounded-xl border border-slate-100 shadow-sm"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : null,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-violet-600 hover:underline"
                        target={href?.startsWith("http") ? "_blank" : undefined}
                        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {children}
                      </a>
                    ),
                    ul: ({ children }) => (
                      <ul
                        className="list-disc list-outside space-y-2 mb-5 ml-5 pl-1 text-slate-600 leading-relaxed text-base sm:text-lg"
                      >
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol
                        className="list-decimal list-outside space-y-2 mb-5 ml-5 pl-1 text-slate-600 leading-relaxed text-base sm:text-lg"
                      >
                        {children}
                      </ol>
                    ),
                    hr: () => <hr className="border-slate-200 my-10" />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>

              {/* About the author */}
              <div className="mt-12 bg-slate-50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <UserRound className="w-5 h-5" style={{ color: '#1D4ED8' }} />
                  <span className="font-bold text-slate-900">About the author</span>
                </div>
                <div className="flex items-start gap-5">
                  <img
                    src={jonProfile}
                    alt="Jonathan Bernard"
                    className="w-16 h-16 rounded-full object-cover shrink-0"
                    loading="lazy"
                    decoding="async"
                    width={64}
                    height={64}
                  />
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {emailSeries ? (
                      <>
                        Thanks for reading all the way! I'm Jonathan, founder of DigiStorms,
                        specializing in helping SaaS companies activate, retain, and expand their users
                        with lifecycle emails. Connect with me on{" "}
                        <a
                          href="https://www.linkedin.com/in/jonathan-digistorms/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                        . See you 👋
                      </>
                    ) : (
                      <>
                        Thanks for reading! I'm Jonathan, founder of DigiStorms. We help SaaS teams
                        improve retention, onboarding, and expansion—with strategy, lifecycle email,
                        and product-led motion in mind. Say hello on{" "}
                        <a
                          href="https://www.linkedin.com/in/jonathan-digistorms/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                        . See you 👋
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Library email examples */}
              {(() => {
                const tags = postMeta?.libraryTags ?? [];
                if (!tags.length || !libraryEmails.length) return null;

                const matched = libraryEmails
                  .filter((e) => e.tags.some((t) => tags.includes(t)))
                  .slice(0, 3);

                if (matched.length < 1) return null;

                const primaryTag = tags[0];

                return (
                  <div className="mt-10 pt-10 border-t border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      See it in the wild
                    </h3>
                    <p className="text-sm text-slate-500 mb-5">
                      Real examples from our library — see how top SaaS brands do it.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {matched.map((email) => {
                        const brand = libraryBrands.find((b) => b.slug === email.brand);
                        const matchingTag = email.tags.find((t) => tags.includes(t)) ?? email.tags[0];
                        return (
                          <Link
                            key={email.slug}
                            to={`/library/email/${email.slug}`}
                            className="group flex flex-col rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                          >
                            {/* Thumbnail */}
                            <div className="aspect-[4/3] overflow-hidden bg-[#DBEAFE]">
                              {email.thumb ? (
                                <img
                                  src={email.thumb}
                                  alt={email.subject}
                                  loading="lazy"
                                  className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-3xl opacity-20">✉️</span>
                                </div>
                              )}
                            </div>
                            {/* Card body */}
                            <div className="p-3 flex flex-col gap-1.5">
                              {brand && (
                                <div className="flex items-center gap-1.5">
                                  {brand.logo && (
                                    <img src={brand.logo} alt={brand.name} className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                                  )}
                                  <span className="text-[11px] text-slate-400 font-medium truncate">{brand.name}</span>
                                </div>
                              )}
                              <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                                {email.subject}
                              </p>
                              {matchingTag && (
                                <span className="self-start text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
                                  {matchingTag.replace(/-/g, " ")}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="mt-4 text-right">
                      <Link
                        to={`/library/tag/${primaryTag}`}
                        className="text-sm font-medium text-violet-600 hover:underline"
                      >
                        Browse all examples →
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>

        {/* Related articles */}
        {(() => {
          if (relatedArticles.length === 0) return null;
          return (
            <div className="mt-20 border-t border-slate-100 pt-16 pb-4">
              <div className="container mx-auto px-4 max-w-6xl">
                <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-10">
                  You might also be interested in...
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {relatedArticles.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="group flex flex-col rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-[#EDE9FE]">
                        <img
                          src={post.heroImage || post.thumbnail || ""}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col flex-1 p-5">
                        <h3 className="font-semibold text-slate-900 text-base leading-snug mb-2 group-hover:text-violet-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-4">
                          {post.shortDescription || post.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-violet-600">
                          Read more →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 border border-violet-600 text-violet-600 hover:bg-violet-50 font-medium px-6 py-3 rounded-xl transition-colors"
                  >
                    See all articles
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* CTA */}
        <div className="container mx-auto px-4 max-w-6xl mt-16 mb-4">
          <div className="bg-violet-50 rounded-2xl p-8 text-center">
            {emailSeries ? (
              <>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Ready to automate your onboarding emails?
                </h3>
                <p className="text-slate-500 mb-6">
                  DigiStorms analyzes your product and generates a full onboarding sequence — in minutes.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Turn retention insights into lifecycle emails
                </h3>
                <p className="text-slate-500 mb-6">
                  Pair your growth strategy with onboarding and lifecycle sequences tailored to your product—generated in minutes.
                </p>
              </>
            )}
            <a
              href="https://app.digistorms.ai"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Try DigiStorms free
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
