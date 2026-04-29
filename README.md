# Swikrit Pokhrel Portfolio

Full-stack portfolio website for Swikrit Pokhrel, a professional video editor and motion graphics designer based in Nepal and available worldwide.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI components
- Supabase (database, auth, storage)
- next-themes for dark/light theme switching

## Environment

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tpoqymhzdegzqhkwcsfy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_kSA8hYMybn8ki5BEKUK7bA_RHK1Smcj
NEXT_PUBLIC_SITE_URL=https://swikritpokhrel.com.np
```

## Supabase Setup

1. Run SQL from `supabase/migrations/001_initial_schema.sql` in Supabase SQL editor.
2. Create these public storage buckets in Supabase Storage:
	- `portfolio-videos`
	- `portfolio-images`
	- `blog-images`
	- `avatars`

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm run lint
```

## Routes

- Public: `/`, `/work`, `/services`, `/about`, `/blog`, `/contact`
- Admin: `/admin/dashboard`, `/admin/portfolio`, `/admin/services`, `/admin/blog`, `/admin/inquiries`, `/admin/social`, `/admin/settings`
- API: `/api/portfolio`, `/api/services`, `/api/blog`, `/api/contact`, `/api/upload`
