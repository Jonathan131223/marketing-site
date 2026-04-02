import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  buildCollectionPageJsonLd,
} from "@/lib/seo";

const PURPLE = "#754BDD";

interface Tag {
  slug: string;
  name: string;
}

interface Email {
  tags: string[];
}

const PAGE_TITLE = "All Tags — B2B SaaS Email Library | DigiStorms";
const PAGE_DESC  =
  "Browse lifecycle emails by tag — welcome, upgrade, trial expiring, NPS, win-back, feature nudge, and 75+ more email types from top B2B SaaS companies.";
const PAGE_URL   = `${SITE_URL}/library/tags`;

const jsonLd = buildCollectionPageJsonLd({
  name: "All Tags — B2B SaaS Email Library",
  description: PAGE_DESC,
  url: PAGE_URL,
  breadcrumbs: [
    { name: "Library", url: `${SITE_URL}/library` },
    { name: "Tags",    url: PAGE_URL },
  ],
});

const LibraryTags: React.FC = () => {
  const [tags, setTags]       = useState<Tag[]>([]);
  const [emails, setEmails]   = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/library/tags.json").then((r) => r.json()),
      fetch("/data/library/emails.json").then((r) => r.json()),
    ]).then(([t, e]) => {
      setTags(t);
      setEmails(e);
      setLoading(false);
    });
  }, []);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    emails.forEach((email) => {
      (email.tags ?? []).forEach((slug) => {
        counts[slug] = (counts[slug] ?? 0) + 1;
      });
    });
    return counts;
  }, [emails]);

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
    [tags]
  );

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
        <div className="bg-white border-b border-gray-100 pb-8 pt-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-gray-400">
                <li>
                  <Link to="/library" className="hover:text-[#754BDD] transition-colors">
                    Library
                  </Link>
                </li>
                <li aria-hidden="true"><span>/</span></li>
                <li aria-current="page">
                  <span className="text-gray-700 font-medium">Tags</span>
                </li>
              </ol>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">All Tags</h1>
            <p className="text-gray-400 text-sm">
              {sortedTags.length} tag{sortedTags.length !== 1 ? "s" : ""} in library
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
            <div className="flex flex-wrap gap-3">
              {sortedTags.map((tag) => {
                const count = tagCounts[tag.slug] ?? 0;
                return (
                  <Link
                    key={tag.slug}
                    to={`/library/tag/${tag.slug}`}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-[#754BDD] hover:bg-[#F3EEFF] transition-all"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#754BDD] transition-colors">
                      {tag.name}
                    </span>
                    {count > 0 && (
                      <span className="text-xs text-gray-400 group-hover:text-[#754BDD]/70">
                        {count}
                      </span>
                    )}
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

export default LibraryTags;
