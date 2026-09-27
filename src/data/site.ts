// Business facts and page metadata used across the site.
// Only verified facts belong here. Leave a value empty ('') until it is confirmed;
// empty values are left out of the page and structured data.

export const site = {
  name: 'Pascoe Performance',
  coach: 'Ben Pascoe',
  // Set from the SITE_URL environment variable (see astro.config.mjs).
  url: (import.meta.env.SITE || '').replace(/\/$/, ''),
  // While PUBLIC_PREVIEW is anything other than "false", pages carry noindex
  // and robots.txt blocks crawling, so the preview never appears in search.
  preview: import.meta.env.PUBLIC_PREVIEW !== 'false',
  // Optional: a Formspree (or similar) endpoint. Leave empty on Netlify to use Netlify Forms.
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || '',
  contact: {
    email: '', // TODO: confirm public contact email
    phone: '', // TODO: confirm public phone number
  },
  areaServed: ['Hamilton, Ontario', 'Ancaster, Ontario', 'Greater Toronto Area, Ontario'],
  description:
    'Personal training in Hamilton & Ancaster and football performance training across the Greater Toronto & Hamilton Area with coach Ben Pascoe, supported by practical nutrition guidance.',
};

export type PageKey = 'home' | 'personal-training' | 'football-performance' | 'about' | 'privacy';

export const pages: Record<PageKey, { path: string; title: string; description: string; nav?: string }> = {
  home: {
    path: '/',
    title: 'Hamilton Personal Training & Football Performance | Pascoe Performance',
    description:
      'Personal training in Hamilton & Ancaster and football performance training across the Greater Toronto & Hamilton Area with coach Ben Pascoe.',
  },
  'personal-training': {
    path: '/personal-training/',
    nav: 'Personal Training',
    title: 'Personal Training in Hamilton & Ancaster | Pascoe Performance',
    description:
      'Build strength, conditioning and confidence with one-hour personal training sessions at Anytime Fitness in Hamilton and Ancaster, coached by Ben Pascoe, CSCS.',
  },
  'football-performance': {
    path: '/football-performance/',
    nav: 'Football Performance',
    title: 'Football Performance Training in Hamilton & GTA | Pascoe Performance',
    description:
      'Football performance training for high school, university, CFL and professional-level athletes. Group and one-on-one speed, strength and movement coaching.',
  },
  about: {
    path: '/about/',
    nav: 'About',
    title: 'Meet Ben Pascoe, Strength & Conditioning Coach | Pascoe Performance',
    description:
      'Ben Pascoe is an NSCA Certified Strength and Conditioning Specialist with 10+ years of coaching, working with personal training clients and football athletes.',
  },
  privacy: {
    path: '/privacy/',
    title: 'Privacy Policy | Pascoe Performance',
    description:
      'How Pascoe Performance collects, uses and protects personal information submitted through this website.',
  },
};

export const interestOptions = [
  { value: 'personal-training', label: 'Personal Training', hint: 'Strength, conditioning, mobility and confidence' },
  { value: 'group-football', label: 'Group Football Training', hint: 'Structured sessions with other athletes' },
  { value: 'one-on-one-football', label: 'One-on-One Football Coaching', hint: 'Individual sessions with Ben' },
  { value: 'help-me-choose', label: 'Help Me Choose', hint: 'Not sure yet? Ben will help you decide' },
];
