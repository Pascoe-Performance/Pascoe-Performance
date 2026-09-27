import type { APIRoute } from 'astro';
import { site, pages } from '../data/site';

// Plain-language summary for AI assistants and answer engines.
export const GET: APIRoute = () => {
  const link = (k: keyof typeof pages) => `${site.url}${pages[k].path}`;
  const body = `# ${site.name}

> ${site.description}

${site.name} is coached by ${site.coach}, an NSCA Certified Strength and Conditioning Specialist (CSCS) with 10+ years of coaching experience.

## Services

- [Personal Training](${link('personal-training')}): one-hour sessions at Anytime Fitness in Hamilton and Ancaster, Ontario, for adults and athletes aged 16+. The first session includes a body composition scan. Pricing is discussed during the consultation.
- [Football Performance](${link('football-performance')}): group training and one-on-one coaching for football athletes, from high school to university, CFL and professional level, on turf and in the gym across the Greater Toronto & Hamilton Area.

## More

- [About ${site.coach}](${link('about')})
- [Home and inquiry form](${link('home')}#inquiry)
- [Privacy Policy](${link('privacy')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
