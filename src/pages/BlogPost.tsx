import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { blogPosts } from "@/content/blog";
import { ArrowLeft, Calendar, UserRound } from "lucide-react";
import jonProfile from "@/assets/founder/jonathan-profile.png";

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
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  const title = frontmatter.title || postMeta?.title || "";
  const description = frontmatter.description || postMeta?.description || "";
  const date = frontmatter.date || postMeta?.date || "";
  const heroImage = postMeta?.heroImage;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{title ? `${title} | DigiStorms` : "DigiStorms - AI Lifecycle Email Generator"}</title>
        <meta name="description" content={description || "Generate high-converting lifecycle emails with AI."} />
        <link rel="canonical" href={`https://digistorms.ai/blog/${slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {heroImage && <meta property="og:image" content={`https://digistorms.ai${heroImage}`} />}
        <meta property="og:url" content={`https://digistorms.ai/blog/${slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {heroImage && <meta name="twitter:image" content={`https://digistorms.ai${heroImage}`} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": title,
          "description": description,
          "image": heroImage ? `https://digistorms.ai${heroImage}` : undefined,
          "url": `https://digistorms.ai/blog/${slug}`,
          "datePublished": date,
          "author": {
            "@type": "Person",
            "name": "Jonathan Bernard",
            "url": "https://www.linkedin.com/in/jonathan-digistorms/"
          },
          "publisher": {
            "@type": "Organization",
            "name": "DigiStorms",
            "url": "https://digistorms.ai",
            "logo": {
              "@type": "ImageObject",
              "url": "https://digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png"
            }
          }
        })}</script>
      </Helmet>
      <Navbar />
      {/* Scroll progress bar */}
      <div className="fixed top-14 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
        <div
          className="h-full"
          style={{ width: `${scrollProgress}%`, backgroundColor: '#754BDD', transition: 'none' }}
        />
      </div>
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          {/* Article header — centered, narrow */}
          <header className="text-center mb-10 max-w-xl mx-auto">
            <h1
              className="leading-tight"
              style={{ color: '#754BDD', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '400', margin: '0px 0px 20px' }}
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
            <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
              <img
                src={jonProfile}
                alt="Jonathan Bernard"
                className="w-8 h-8 rounded-full object-cover"
                loading="lazy"
                decoding="async"
                width={32}
                height={32}
              />
              <span className="text-gray-700">Jonathan Bernard</span>
              {formattedDate && (
                <>
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formattedDate}</span>
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
                  <p className="text-sm font-semibold text-gray-900 mb-4">Table of Contents</p>
                  <ul className="space-y-3">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`text-sm leading-snug transition-colors block ${
                            activeId === item.id
                              ? "font-medium text-gray-900"
                              : "text-gray-500 hover:text-gray-800"
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
                          style={{ color: '#754BDD', fontSize: '28px', fontWeight: '500', margin: '28px 0px 12px' }}
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => (
                      <h3 style={{ color: '#754BDD', fontSize: '22px', fontWeight: '500', margin: '20px 0px 10px' }}>
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => {
                      const text = extractText(children);
                      if (/^subject(\s+line)?\s*:/i.test(text)) {
                        return (
                          <p className="text-center text-sm font-normal text-gray-400 mb-6 px-2">
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
                      <blockquote className="bg-violet-50 border-l-4 border-violet-400 rounded-r-xl px-6 py-4 my-6 text-gray-700 text-base">
                        {children}
                      </blockquote>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-800">{children}</strong>
                    ),
                    img: ({ src, alt }) =>
                      src ? (
                        <div className="aspect-auto max-w-sm mx-auto mt-6 mb-1">
                          <img
                            src={src}
                            alt={alt || ""}
                            className="w-full rounded-xl border border-gray-100 shadow-sm"
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
                      <ul className="list-disc list-inside space-y-2 mb-5 text-gray-600 text-base sm:text-lg">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-2 mb-5 text-gray-600 text-base sm:text-lg">
                        {children}
                      </ol>
                    ),
                    hr: () => <hr className="border-gray-200 my-10" />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>

              {/* About the author */}
              <div className="mt-12 bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <UserRound className="w-5 h-5" style={{ color: '#754BDD' }} />
                  <span className="font-bold text-gray-900">About the author</span>
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
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Thanks for reading all the way! I'm Jonathan, founder and CEO of DigiStorms,
                    specializing in helping SaaS founders grow with lifecycle email marketing.
                    Feel free to connect with me on{" "}
                    <a
                      href="https://www.linkedin.com/in/jonathan-digistorms/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline"
                    >
                      LinkedIn
                    </a>{" "}
                    or{" "}
                    <a
                      href="https://x.com/jonathanbrnd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline"
                    >
                      X
                    </a>
                    . See you 👋
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10 pt-10 border-t border-gray-100">
                <div className="bg-violet-50 rounded-2xl p-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to automate your onboarding emails?
                  </h3>
                  <p className="text-gray-500 mb-6">
                    DigiStorms analyzes your product and generates a full onboarding sequence — in minutes.
                  </p>
                  <a
                    href="https://app.digistorms.ai"
                    className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
                  >
                    Try DigiStorms free
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Related articles */}
        {(() => {
          const related = blogPosts
            .filter((p) => p.slug !== slug)
            .slice(0, 3);
          if (related.length === 0) return null;
          return (
            <div className="mt-20 border-t border-gray-100 pt-16 pb-4">
              <div className="container mx-auto px-4 max-w-6xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-10">
                  You might also be interested in...
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {related.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[16/9] overflow-hidden bg-violet-50">
                        <img
                          src={post.heroImage || post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col flex-1 p-5">
                        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-violet-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">
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
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
