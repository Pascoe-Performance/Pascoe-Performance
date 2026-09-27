// Structured data (JSON-LD) built from the same verified facts shown on the pages.
import { site, pages, type PageKey } from './site';
import faqs from './faqs.json';

type Faq = { id: string; q: string; a: string };
type FaqGroup = { category: string; items: Faq[] };

const abs = (path: string) => `${site.url}${path}`;
const ids = {
  business: abs('/#business'),
  website: abs('/#website'),
  coach: abs('/#coach'),
};

const stripHtml = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

// Only questions whose visible answer is complete (no placeholder text) go into FAQ markup.
function faqPage(key: PageKey) {
  const groups = (faqs as Record<string, FaqGroup[]>)[key] || [];
  const items = groups.flatMap((g) => g.items).filter((f) => !f.a.includes('ph-text'));
  if (!items.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': abs(`${pages[key].path}#faq`),
    url: abs(pages[key].path),
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: stripHtml(f.q),
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.a) },
    })),
  };
}

const business = {
  '@type': 'LocalBusiness',
  '@id': ids.business,
  name: site.name,
  url: abs('/'),
  description: site.description,
  areaServed: site.areaServed,
  image: abs('/media/share-logo.jpg'),
  logo: abs('/favicon.svg'),
  founder: { '@id': ids.coach },
  ...(site.contact.email ? { email: site.contact.email } : {}),
  ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
};

const coach = {
  '@type': 'Person',
  '@id': ids.coach,
  name: site.coach,
  url: abs('/about/'),
  jobTitle: 'Strength and Conditioning Coach',
  worksFor: { '@id': ids.business },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    name: 'Certified Strength and Conditioning Specialist (CSCS)',
    recognizedBy: { '@type': 'Organization', name: 'National Strength and Conditioning Association' },
  },
};

function service(key: 'personal-training' | 'football-performance') {
  const isPt = key === 'personal-training';
  return {
    '@type': 'Service',
    '@id': abs(`${pages[key].path}#service`),
    name: isPt ? 'Personal Training' : 'Football Performance Training',
    serviceType: isPt ? 'Personal Training' : 'Football Performance Training',
    url: abs(pages[key].path),
    description: pages[key].description,
    provider: { '@id': ids.business },
    areaServed: isPt ? ['Hamilton, Ontario', 'Ancaster, Ontario'] : site.areaServed,
  };
}

export function schemaFor(key: PageKey) {
  const graph: object[] = [];
  if (key === 'home') {
    graph.push(business, coach, {
      '@type': 'WebSite',
      '@id': ids.website,
      url: abs('/'),
      name: site.name,
      publisher: { '@id': ids.business },
    });
  }
  if (key === 'personal-training' || key === 'football-performance') graph.push(service(key));
  if (key === 'about') graph.push(coach);
  const faq = faqPage(key);
  if (faq) graph.push(faq);
  return graph.length ? { '@context': 'https://schema.org', '@graph': graph } : null;
}
