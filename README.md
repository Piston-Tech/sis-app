# sis-app

Web front end for Piston & Fusion Business Academy:

- **Student portal** on `app.<domain>`: sign-in, dashboard, courses and
  recommendations, enrollments, certificates and badges, payments, profile.
- **Admin portal** on `admin.<domain>`: students, companies, courses, classes,
  transactions, payments, Foundations Program.
- **Public pages** on `www.<domain>`: landing page and the Foundations Program
  application form.

`proxy.ts` maps each subdomain to its folder (`app/app`, `app/admin`) and
enforces CSRF checks on `/api`.

## How it talks to the backend

The browser only calls same-origin `/api/*` route handlers. They call
`sis-backend` server-side (`services/apiServer.ts`), attach the access token
from an httpOnly cookie, and refresh it when it expires. Tokens are never
readable by JavaScript. The catch-all routes forward only an explicit
allowlist of backend resources (`lib/api/forward.ts`).

## Setup

```bash
yarn install
cp .env.example .env   # BACKEND_URL is required
yarn dev               # http://localhost:4000, http://app.localhost:4000, http://admin.localhost:4000
```

Never prefix a secret with `NEXT_PUBLIC_`: those values are bundled into the
JavaScript sent to browsers.

## Scripts

| Script | What it does |
| --- | --- |
| `yarn dev` / `yarn build` / `yarn start` | Next.js dev server / production build / serve the build |
| `yarn typecheck`, `yarn lint`, `yarn test`, `yarn format` | Checks (CI runs all but format, plus build) |

## Conventions

- Server data in client components goes through TanStack Query
  (`app/QueryProvider.tsx`). Admin hooks live in `hooks/admin/`, student hooks
  in `components/student/queries.ts`.
- Forms validate with zod and show field errors from the backend's
  `{ errors: { field: message } }`.
- Shared vocabularies (proficiency levels, personas) live in
  `constants/profile.ts`. Use them instead of hardcoding labels.
- Never show placeholder data to users. If a feature has no backend yet, hide
  it.
