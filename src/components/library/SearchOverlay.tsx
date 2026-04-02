import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Brand {
  slug: string;
  name: string;
  logo: string;
  emailCount: number;
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

interface Email {
  id: string;
  slug: string;
  subject: string;
  thumb: string;
  brand: string;
  tags: string[];
}

type Tab = "trending" | "brands" | "usecases" | "tags";

// ── Featured tag slugs (Trending tab) ─────────────────────────────────────────

const FEATURED_TAGS = [
  "welcome-free-users", "welcome-paid-users", "feature-usage-nudge",
  "trial-expiration-warning", "webinar-invitation", "upgrade-cta",
  "newsletter", "onboarding-checklist", "referral-prompt",
  "special-offer", "win-back-churned-user", "product-update",
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onSearch: (query: string) => void;
  onNavigate: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const SearchOverlay: React.FC<Props> = ({ onClose, onSearch, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<Tab>("trending");
  const [query, setQuery] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [usecases, setUsecases] = useState<UseCase[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Self-load data on mount
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
    });
  }, []);

  // Auto-focus input when opened
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Filtered data for each tab
  const filteredBrands = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(q) || b.slug.includes(q));
  }, [brands, query]);

  const filteredUsecases = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return usecases;
    return usecases.filter((u) => u.name.toLowerCase().includes(q) || u.description?.toLowerCase().includes(q));
  }, [usecases, query]);

  const filteredTags = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q));
  }, [tags, query]);

  // Trending: top 4 brands by emailCount
  const trendingBrands = useMemo(
    () => [...brands].sort((a, b) => b.emailCount - a.emailCount).slice(0, 4),
    [brands]
  );

  const trendingTags = useMemo(
    () => tags.filter((t) => FEATURED_TAGS.includes(t.slug)),
    [tags]
  );

  // Latest email thumb per brand
  const latestThumbByBrand = useMemo(() => {
    const map: Record<string, string> = {};
    emails.forEach((e) => { if (e.thumb && !map[e.brand]) map[e.brand] = e.thumb; });
    return map;
  }, [emails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const handleItemClick = (to: string) => {
    navigate(to);
    onNavigate();
    onClose();
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "trending",  label: "Trending" },
    { id: "brands",    label: "Brands" },
    { id: "usecases",  label: "Use cases" },
    { id: "tags",      label: "Tags" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: 760, maxHeight: "75vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search bar row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords"
            className="flex-1 text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-sm font-semibold ml-2"
            style={{ color: "#754BDD" }}
          >
            Close
          </button>
        </form>

        {/* Body: sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <nav className="flex-shrink-0 flex flex-col gap-1 p-4 border-r border-gray-100" style={{ width: 140 }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
                style={activeTab === tab.id ? { backgroundColor: "#754BDD" } : {}}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right content pane */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* TRENDING */}
            {activeTab === "trending" && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag.slug}
                        onClick={() => handleItemClick(`/library/tag/${tag.slug}`)}
                        className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 font-medium hover:border-[#754BDD] hover:text-[#754BDD] transition-colors bg-white"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Brands</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {trendingBrands.map((brand) => (
                      <button
                        key={brand.slug}
                        onClick={() => handleItemClick(`/library/brand/${brand.slug}`)}
                        className="group text-left rounded-xl border border-gray-100 bg-gray-50 hover:border-[#754BDD] hover:bg-[#F3EEFF]/30 transition-all overflow-hidden"
                      >
                        <div className="h-24 bg-white overflow-hidden flex items-center justify-center border-b border-gray-100">
                          {latestThumbByBrand[brand.slug] ? (
                            <img
                              src={latestThumbByBrand[brand.slug]}
                              alt={brand.name}
                              className="w-full h-full object-cover object-top"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#F3EEFF]" />
                          )}
                        </div>
                        <div className="px-3 py-2 flex items-center gap-2">
                          {brand.logo && (
                            <img src={brand.logo} alt={brand.name} className="w-5 h-5 object-contain flex-shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#754BDD] transition-colors">
                            {brand.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BRANDS */}
            {activeTab === "brands" && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {filteredBrands.map((brand) => (
                  <button
                    key={brand.slug}
                    onClick={() => handleItemClick(`/library/brand/${brand.slug}`)}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white hover:border-[#754BDD] hover:shadow-sm transition-all"
                    title={brand.name}
                  >
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain" loading="lazy" />
                      ) : (
                        <span className="text-lg font-bold text-gray-300">{brand.name[0]}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-medium group-hover:text-[#754BDD] transition-colors text-center w-full truncate">
                      {brand.name}
                    </span>
                  </button>
                ))}
                {filteredBrands.length === 0 && (
                  <p className="col-span-full text-sm text-gray-400 text-center py-8">No brands found.</p>
                )}
              </div>
            )}

            {/* USE CASES */}
            {activeTab === "usecases" && (
              <ul className="space-y-1">
                {filteredUsecases.map((uc) => (
                  <li key={uc.slug}>
                    <button
                      onClick={() => handleItemClick(`/library/usecase/${uc.slug}`)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 hover:text-[#754BDD] transition-colors"
                    >
                      {uc.name}
                    </button>
                  </li>
                ))}
                {filteredUsecases.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No use cases found.</p>
                )}
              </ul>
            )}

            {/* TAGS */}
            {activeTab === "tags" && (
              <ul className="space-y-1">
                {filteredTags.map((tag) => (
                  <li key={tag.slug}>
                    <button
                      onClick={() => handleItemClick(`/library/tag/${tag.slug}`)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 hover:text-[#754BDD] transition-colors"
                    >
                      {tag.name}
                    </button>
                  </li>
                ))}
                {filteredTags.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No tags found.</p>
                )}
              </ul>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
