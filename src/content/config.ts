import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string(),
    shortDescription: z.string().optional(),
    date: z.string(),
    readTime: z.string().optional(),
    thumbnail: z.string().optional(),
    heroImage: z.string().optional(),
    // Optional OG card that overrides `heroImage` for social-share previews
    // only. Lets a post use a branded typography card for Open Graph while
    // keeping (or omitting) its in-article hero image independently.
    ogImage: z.string().optional(),
    libraryTags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
