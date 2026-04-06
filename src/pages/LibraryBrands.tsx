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

interface Brand {
  slug: string;
  name: string;
  logo: string;
  emailCount: number;
}

const PAGE_TITLE = "All Brands — B2B SaaS Email Library | DigiStorms";
const PAGE_DESC  =
  "Explore lifecycle email sequences from 38+ top B2B SaaS companies. Browse onboarding, engagement, expansion, and retention emails by brand.";
const PAGE_URL   = `${SITE_URL}/library/brands`;

const jsonLd = buildCollectionPageJsonLd({
  name: "All Brands — B2B SaaS Email Library",
  description: PAGE_DESC,
  url: PAGE_URL,
  breadcrumbs: [
    { name: "Library", url: `${SITE_URL}/library` },
    { name: "Brands",  url: PAGE_URL },
  ],
});

const LibraryBrands: React.FC = () => {
  const [brands, setBrands]   = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/library/brands.json")
      .then((r) => r.json())
      .then((data: Brand[]) => {
        setBrands([...data].sort((a, b) => a.name.localeCompare(b.name)));
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
                  <span className="text-slate-700 font-medium">Brands</span>
                </li>
              </ol>
            </nav>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-1">All Brands</h1>
            <p className="text-slate-400 text-sm">
              {brands.length} brand{brands.length !== 1 ? "s" : ""} in library
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  to={`/library/brand/${brand.slug}`}
                  className="group flex flex-col items-center text-center p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md hover:border-[#1D4ED8]/30 transition-all"
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      className="w-12 h-12 object-contain mb-3"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-white text-lg font-bold"
                      style={{ backgroundColor: PURPLE }}
                    >
                      {brand.name[0]}
                    </div>
                  )}
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1D4ED8] transition-colors leading-snug mb-1">
                    {brand.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {brand.emailCount} email{brand.emailCount !== 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LibraryBrands;
