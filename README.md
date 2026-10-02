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

## Deploy (Cloudflare Pages)

1. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, pick this repo.
2. Build settings: framework preset **Astro**, build command `npm run build`, output directory `dist`.
3. **Settings → Variables and Secrets** (Production), then redeploy:
   - `RESEND_API_KEY` (type: Secret): API key from resend.com → API Keys
   - `INQUIRY_TO`: email address that receives inquiries
   - `INQUIRY_FROM` (optional, after a domain is verified in Resend): e.g. `Pascoe Performance <inquiries@pascoeperformance.ca>`
   - `NODE_VERSION`: `22`
   - `SITE_URL` and `PUBLIC_PREVIEW` as below

The inquiry form posts to `/api/inquiry` (`functions/api/inquiry.ts`), which emails each submission through Resend with reply-to set to the visitor.

Until a domain is verified in Resend, emails come from Resend's test sender and can only be delivered to the Resend account's own email address. At launch, verify the site's domain in Resend (DNS records), then set `INQUIRY_FROM` and `INQUIRY_TO`.

## Custom domain

Once the domain is bought, add it in Cloudflare Pages (**Custom domains**), follow the DNS steps shown there, then set `SITE_URL` to the new address and redeploy.

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
- [ ] Verify the domain in Resend, set `INQUIRY_FROM` and `INQUIRY_TO`
- [ ] Send a test inquiry and confirm it arrives
- [ ] Optional: self-host the Archivo font instead of loading it from Google Fonts
- [ ] Submit `https://<domain>/sitemap.xml` in Google Search Console and create a Google Business Profile
