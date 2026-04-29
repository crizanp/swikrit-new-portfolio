# Swikrit Pokhrel Portfolio

Full-stack portfolio website for Swikrit Pokhrel, a professional video editor and motion graphics designer based in Nepal and available worldwide.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI components
- Supabase (database, auth, storage)
- next-themes for dark/light theme switching
- GSAP + animejs + Three.js for motion and interactive hero visuals

## Environment

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tpoqymhzdegzqhkwcsfy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_kSA8hYMybn8ki5BEKUK7bA_RHK1Smcj
NEXT_PUBLIC_SITE_URL=https://swikritpokhrel.com.np
```

Optional for CI/CD and non-local automation:

```env
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

## Supabase Setup

1. Run SQL from `supabase/migrations/001_initial_schema.sql` in Supabase SQL editor.
2. Run SQL from `supabase/migrations/002_admin_panel_extensions.sql` in Supabase SQL editor.
3. Create these public storage buckets in Supabase Storage:
   - `portfolio-videos`
   - `portfolio-images`
   - `blog-images`
   - `avatars`

## Admin Login

- Admin authentication uses Supabase Auth (`/admin/login`).
- Create or invite admin users inside Supabase Authentication.
- If email confirmation is enabled in Supabase Auth settings, the user must verify the email before dashboard login works.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

## Routes

- Public: `/`, `/work`, `/services`, `/about`, `/blog`, `/contact`
- Public detail: `/work/[id]`, `/blog/[slug]`
- Admin: `/admin/dashboard`, `/admin/portfolio`, `/admin/services`, `/admin/blog`, `/admin/inquiries`, `/admin/social`, `/admin/settings`
- API: `/api/portfolio`, `/api/portfolio/[id]`, `/api/services`, `/api/blog`, `/api/blog/[slug]`, `/api/contact`, `/api/inquiries`, `/api/social`, `/api/settings`, `/api/stats`, `/api/storage/usage`, `/api/upload`

## SEO and Social System

- Root metadata is defined in `app/layout.tsx`.
- Per-page metadata is defined with Next.js Metadata API in public routes.
- Dynamic OG image generation runs from `app/opengraph-image.tsx` via `@vercel/og`.
- Structured data is injected with `components/seo/JsonLd.tsx` and helpers from `lib/seo.ts`:
  - `Person`
  - `BreadcrumbList`
  - `BlogPosting`
- Robots and sitemap:
  - `app/robots.ts`
  - `app/sitemap.ts`

## Performance and UX Notes

- Most UI images now use `next/image` for optimized loading.
- ISR is enabled for key content-heavy routes (`blog`, `work`, detail pages).
- Route loading skeletons are included for `/work` and `/blog`.
- Hero Three.js background is lazy loaded with `next/dynamic` and `ssr: false`.
- Global polish includes:
  - initial SP monogram loader
  - top scroll progress bar
  - section reveal observer animation
  - back-to-top floating action button
  - skip link and focus-visible enhancements

## Deployment

### Vercel

1. Import repository into Vercel.
2. Set project environment variables from the Environment section above.
3. Ensure `next.config.mjs` security headers and remote image hosts fit your deployment setup.
4. `vercel.json` is included for standard Next.js deployment defaults.

### GitHub Actions

Workflow file: `.github/workflows/deploy.yml`

Required repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Pipeline behavior:

- On PR: install, lint, typecheck, build
- On push to `main`: same checks, then Vercel prebuilt deploy
