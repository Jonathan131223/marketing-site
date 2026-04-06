import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  buildCollectionPageJsonLd,
} from "@/lib/seo";

const PURPLE = "#1D4ED8";

const USE_CASE_EMOJI: Record<string, string> = {
  "onboard-free-user":     "👋",
  "onboard-paid-user":     "🎉",
  "educate-engage":        "💡",
  "expand-user":           "📈",
  "celebrate-milestones":  "🏆",
  "request-feedback":      "💬",
  "win-back-churned-user": "🔄",
  "announce-new-features": "🚀",
  "transactional-email":   "📧",
};

interface UseCase {
  slug: string;
  name: string;
  description: string;
  emailCount: number;
  order: number;
}

const PAGE_TITLE = "All Use Cases — B2B SaaS Email Library | DigiStorms";
const PAGE_DESC  =
  "Explore lifecycle email use cases from top B2B SaaS companies — onboarding, education, expansion, milestone celebrations, win-back, feedback, and more.";
const PAGE_URL   = `${SITE_URL}/library/usecases`;

const jsonLd = buildCollectionPageJsonLd({
  name: "All Use Cases — B2B SaaS Email Library",
  description: PAGE_DESC,
  url: PAGE_URL,
  breadcrumbs: [
    { name: "Library",   url: `${SITE_URL}/library` },
    { name: "Use Cases", url: PAGE_URL },
  ],
});

const LibraryUseCases: React.FC = () => {
  const [usecases, setUsecases] = useState<UseCase[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/data/library/usecases.json")
      .then((r) => r.json())
      .then((data: UseCase[]) => {
        setUsecases([...data].sort((a, b) => a.order - b.order));
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title"       content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESC} />
        <meta property="og:url"         content={PAGE_URL} />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESC} />
        <meta name="twitter:image"       content={DEFAULT_OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-16">
        <div className="bg-white border-b border-slate-100 pb-8 pt-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-slate-400">
                <li>
                  <Link to="/library" className="hover:text-[#1D4ED8] transition-colors">
                    Library
                  </Link>
                </li>
                <li aria-hidden="true"><span>/</span></li>
                <li aria-current="page">
                  <span className="text-slate-700 font-medium">Use Cases</span>
                </li>
              </ol>
            </nav>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-1">All Use Cases</h1>
            <p className="text-slate-400 text-sm">
              {usecases.length} use case{usecases.length !== 1 ? "s" : ""} in library
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl py-10">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: PURPLE, borderTopColor: "transparent" }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {usecases.map((uc) => {
                const emoji = USE_CASE_EMOJI[uc.slug] ?? "📧";
                return (
                  <Link
                    key={uc.slug}
                    to={`/library/usecase/${uc.slug}`}
                    className="group flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md hover:border-[#1D4ED8]/30 transition-all"
                  >
                    <span className="text-3xl flex-shrink-0">{emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1D4ED8] transition-colors mb-1">
                        {uc.name}
                      </p>
                      {uc.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {uc.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        {uc.emailCount} email{uc.emailCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LibraryUseCases;
