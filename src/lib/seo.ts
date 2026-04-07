export const SITE_URL  = "https://www.digistorms.ai";
export const SITE_NAME = "DigiStorms";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Cut text at the last full word before `limit` chars and append "…" */
export function truncateAtWord(text: string, limit: number): string {
  if (!text || text.length <= limit) return text ?? "";
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

// ── JSON-LD builders ──────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface CollectionPageOptions {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function buildCollectionPageJsonLd(opts: CollectionPageOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    ...(opts.breadcrumbs ? { breadcrumb: buildBreadcrumbJsonLd(opts.breadcrumbs) } : {}),
  };
}

export interface ArticleOptions {
  headline: string;
  description: string;
  image?: string;
  url: string;
  datePublished?: string;
  authorName: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function buildArticleJsonLd(opts: ArticleOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    ...(opts.image ? { image: opts.image } : {}),
    url: opts.url,
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    author: {
      "@type": "Organization",
      name: opts.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
    ...(opts.breadcrumbs ? { breadcrumb: buildBreadcrumbJsonLd(opts.breadcrumbs) } : {}),
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Browse 1,100+ lifecycle emails from the best B2B SaaS companies. Filter by brand, tag, or use case.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/library?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
