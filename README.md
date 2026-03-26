# In-Session CRM (Executed State)

This folder is the live coding output for Sessions 1 and 2.

## Run Locally

```bash
npm install
npm run dev
```

App runs on [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env` with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_API_URL`

## Implemented So Far (Sessions 1-2)

- Next.js 16 + TypeScript + Tailwind + shadcn baseline
- Supabase auth clients:
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/server.ts`
  - `src/lib/supabase/admin.ts`
- Prisma 7 setup:
  - `prisma/schema.prisma`
  - `prisma.config.ts`
  - `src/lib/prisma.ts`
  - generated client under `src/generated/prisma`
- Seed script at `prisma/seed/seed.ts` (admin user + profile)
- Auth proxy + protected layout:
  - `src/proxy.ts`
  - `src/app/(protected)/layout.tsx`
- Lead API and service layer:
  - `src/app/api/leads/route.ts`
  - `src/services/lead/schema.ts`
  - `src/services/lead/service.ts`
  - `src/services/lead/db.ts`
- TanStack Query provider + hooks:
  - `src/providers/query-provider.tsx`
  - `src/lib/tanstack/useLeads.ts`

## Known Deferred Items

- Leads table UI (filters, pagination, role-aware columns)
- Create Lead dialog UI
- Bulk reassign UX:
  - AGENT: no bulk controls
  - MANAGER/ADMIN: bulk checkboxes + reassign toolbar (planned for Session 7 scope)

These deferred notes are also embedded in:
- `src/app/(protected)/leads/page.tsx`
- `src/services/lead/service.ts`
