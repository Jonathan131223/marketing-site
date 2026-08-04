export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  date: string;
  readTime: string;
  thumbnail?: string;
  heroImage?: string;
  /** Library tag slugs used to surface related email examples at the bottom of the article */
  libraryTags?: string[];
}

// The hand-maintained `blogPosts` array that used to live here is gone. It was
// a mirror of the .md frontmatter that had drifted to 13 entries against 31
// real posts, and its only remaining consumers were the unrouted
// src/_legacy-pages/*.tsx React components, which have since been deleted.
//
// Posts are derived from `getCollection('blog')` in src/pages/blog/[slug].astro,
// which cannot go out of date. This file now exists solely for the `BlogPost`
// type, which that page still imports.
