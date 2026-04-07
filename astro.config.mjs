import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.digistorms.ai',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      filter: (page) => !page.includes('/email-generator/'),
      serialize(item) {
        const url = item.url;

        // Homepage
        if (url === 'https://www.digistorms.ai/' || url === 'https://www.digistorms.ai') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        }
        // Core pages (pricing, about, manifesto, contact, tools)
        else if (
          ['/pricing/', '/about/', '/manifesto/', '/contact/', '/lifecycle-score/', '/roi-calculator/'].some(p => url.endsWith(p))
        ) {
          item.priority = 0.9;
          item.changefreq = 'monthly';
        }
        // Blog listing
        else if (url.endsWith('/blog/')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        }
        // Blog posts
        else if (url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        // Comparison pages
        else if (url.includes('/compare/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        // Library landing + listing pages
        else if (
          url.endsWith('/library/') ||
          url.endsWith('/library/brands/') ||
          url.endsWith('/library/usecases/') ||
          url.endsWith('/library/tags/')
        ) {
          item.priority = 0.7;
          item.changefreq = 'weekly';
        }
        // Library brand pages
        else if (url.includes('/library/brand/')) {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }
        // Library use case pages
        else if (url.includes('/library/usecase/')) {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }
        // Library tag pages
        else if (url.includes('/library/tag/')) {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        }
        // Individual email pages (lowest priority -- 1,051 pages)
        else if (url.includes('/library/email/')) {
          item.priority = 0.4;
          item.changefreq = 'yearly';
        }
        // Legal pages
        else if (url.includes('/privacy/') || url.includes('/terms/')) {
          item.priority = 0.2;
          item.changefreq = 'yearly';
        }
        // Everything else
        else {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        }

        return item;
      },
    }),
  ],
  vite: {
    resolve: {
      alias: { '@': '/src' },
    },
  },
});
