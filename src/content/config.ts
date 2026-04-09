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
    libraryTags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
