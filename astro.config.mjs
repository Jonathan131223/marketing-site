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
    }),
  ],
  vite: {
    resolve: {
      alias: { '@': '/src' },
    },
  },
});
