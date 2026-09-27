import type { APIRoute } from 'astro';
import { site, pages } from '../data/site';

export const GET: APIRoute = () => {
  const urls = Object.values(pages)
    .map((p) => `  <url><loc>${site.url}${p.path}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
