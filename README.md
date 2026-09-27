# Pascoe Performance

Website for **Pascoe Performance**: personal training in Hamilton & Ancaster and football performance training across the Greater Toronto & Hamilton Area, with coach Ben Pascoe.

Built with [Astro](https://astro.build) as a fast, fully static site. There is no database or server to maintain.

## Pages

| Route | File |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/personal-training/` | `src/pages/personal-training.astro` |
| `/football-performance/` | `src/pages/football-performance.astro` |
| `/about/` | `src/pages/about.astro` |
| `/privacy/` | `src/pages/privacy.astro` |

Also generated: `/sitemap.xml`, `/robots.txt` and `/llms.txt`.

## Project layout

```
public/            favicon and compressed video/images (served as-is)
src/components/    Header, Footer, Logo, InquiryForm, FaqList
src/data/site.ts   business details, page titles and descriptions, form options
src/data/faqs.json FAQ questions and answers (shown on the page and in structured data)
src/data/schema.ts structured data (JSON-LD) for search engines
src/layouts/       shared page shell: meta tags, header, footer
src/scripts/       mobile menu, video controls, form submission
src/styles/        global styles plus one stylesheet per page
```

## Run it locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Put it on GitHub

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-account>/pascoe-performance.git
git push -u origin main
```

## Deploy

### Netlify (recommended)

1. In Netlify, choose **Add new site → Import an existing project** and pick the GitHub repo.
2. Build settings are read from `netlify.toml` (`npm run build`, publish `dist`).
3. Deploy. The inquiry form works right away through **Netlify Forms**. Submissions appear under **Forms** in the Netlify dashboard. Turn on email notifications under **Forms → Form notifications**.

### Vercel

1. In Vercel, choose **Add New → Project** and import the GitHub repo. Astro is detected automatically.
2. Vercel has no built-in form handling. Create a free form endpoint (for example at [Formspree](https://formspree.io)) and add it as the `PUBLIC_FORM_ENDPOINT` environment variable.
3. Note: Vercel's free Hobby plan is for non-commercial use only. A business site needs the Pro plan, or use Netlify.

After any change to environment variables, redeploy so the new values are built in.

## Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Public address of the site, e.g. `https://pascoeperformance.ca`. Used for canonical links, social previews and the sitemap. If unset, the Netlify or Vercel address is used. |
| `PUBLIC_PREVIEW` | Defaults to preview mode: every page is marked `noindex` and `robots.txt` blocks search engines. **Set to `false` at launch.** |
| `PUBLIC_FORM_ENDPOINT` | Only for hosts other than Netlify. Form service URL that accepts a POST. |

## Custom domain

Once the domain is bought, add it in Netlify (**Domain management**) or Vercel (**Settings → Domains**), follow the DNS steps shown there, then set `SITE_URL` to the new address and redeploy.

## Editing content

- **Text on a page:** edit the matching file in `src/pages/`.
- **FAQs:** edit `src/data/faqs.json`. The page and the search-engine FAQ data update together.
- **Page titles and descriptions:** `src/data/site.ts`.
- **Form options:** `interestOptions` in `src/data/site.ts`.
- **Videos:** replace files in `public/media/` and keep the same names (MP4 plus WebM, with a JPG poster frame).

## Launch checklist

- [ ] Set `PUBLIC_PREVIEW=false`
- [ ] Set `SITE_URL` to the final domain
- [ ] Replace every placeholder (search the project for `ph-text`)
- [ ] Add the public contact email and phone in `src/data/site.ts`
- [ ] Add real testimonials, with written permission from each client
- [ ] Replace the placeholder personal training video
- [ ] Have the privacy policy reviewed and fill in the contact details it lists
- [ ] Send a test inquiry and confirm it arrives
- [ ] Optional: self-host the Archivo font instead of loading it from Google Fonts
- [ ] Submit `https://<domain>/sitemap.xml` in Google Search Console and create a Google Business Profile
