import { defineConfig } from 'astro/config';

// The public URL of the site. Set SITE_URL once the domain is live
// (e.g. https://pascoeperformance.ca). Netlify and Vercel provide a fallback.
const site =
  process.env.SITE_URL ||
  process.env.URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
