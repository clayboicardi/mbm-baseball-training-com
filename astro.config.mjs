// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://mbm-baseball-training.com',
  integrations: [sitemap(), icon()],
  // @ts-ignore – tailwindcss/vite ships Vite 8 types; Astro 6 bundles Vite 7; runtime is fine
  vite: { plugins: [tailwindcss()] },
});
