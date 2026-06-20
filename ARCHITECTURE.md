# MillionDocs Frontend — Architecture

> Read this before adding code. The goal: a new feature should be obvious to
> place, and the app should stay maintainable as it grows to many domains.

## Stack

| Concern            | Choice                          | Status                       |
| ------------------ | ------------------------------- | ---------------------------- |
| Framework          | Next.js 16 (App Router) + React 19 | ✅ in place               |
| **Server state**   | TanStack Query                  | ✅ installed                  |
| **Client state**   | Zustand                         | ⚠️ run `npm install zustand` |
| Forms + validation | React Hook Form + Zod           | ✅ installed (adopt in forms) |
| UI components      | shadcn/ui (`components/ui/`)     | ✅ in place                   |
| Styling            | Tailwind CSS v4                 | ✅ in place                   |
| URL state (filters)| nuqs                            | 🔜 add when needed           |

> ⚠️ **`npm install` is currently failing because `C:` has 0 GB free** (npm
> caches to `C:`, even though the project is on `D:`). Free up `C:` space, then
> `npm install zustand`. Until then, `features/auth/store.ts` won't compile.

## State management — the one decision to internalize

There are **two kinds of state**. Do not mix them:

1. **Server state** (contacts, products, shipments, the user) → **TanStack Query**.
   It handles caching, refetch, dedup, loading/error, invalidation. _Never_ copy
   server data into a global store.
2. **Client state** (auth session, current workspace, sidebar open, theme) →
   **Zustand**. Tiny, no boilerplate.

This is why we do **not** use Redux — ~80% of "state" is server state (Query's job)
and the rest is a handful of values Zustand handles in ~15 lines. Redux Toolkit
would be boilerplate for no benefit at this size.

## Folder structure (current)

We use a **centralized API layer**: every endpoint lives under `lib/api/`, one
file per domain (each holding that domain's types + endpoints), all going through
one shared `client.ts`. Pages import a single `api` object.

```
src/
├── app/                          # ROUTING ONLY — pages stay thin
│   ├── (app)/                    # authed shell (sidebar + topbar)
│   │   ├── layout.tsx            # renders <AppSidebar/> + page
│   │   ├── dashboard/ shipments/[id]/ contacts/ products/ ...
│   ├── login/ register/ forgot-password/ onboarding/   # public auth routes
│   ├── resources/                # public marketing/SEO pages
│   ├── layout.tsx  page.tsx  error.tsx  not-found.tsx  sitemap.ts  globals.css
│
├── lib/
│   ├── api/                      # ⭐ THE centralized API layer
│   │   ├── client.ts             # the ONLY place that calls fetch (auth, errors, tokens, getErrorMessage)
│   │   ├── index.ts              # `export const api = { auth, contacts, products, shipments }` + re-exports
│   │   ├── auth.ts               # UserResponse/AuthToken + authApi (login, register, verifyOtp, me)
│   │   ├── contacts.ts           # ContactResponse + contactsApi
│   │   ├── products.ts           # ProductResponse + productsApi
│   │   ├── shipments.ts          # ShipmentResponse + shipmentsApi
│   │   ├── query-keys.ts         # central cache-key factory (for React Query)
│   │   └── query-client.ts       # QueryClient defaults
│   ├── validation/               # zod form schemas (UI input rules) — e.g. auth.ts
│   ├── env.ts                    # validated env vars
│   ├── format.ts                 # currency/date/number formatters
│   └── utils.ts                  # cn()
│
├── components/
│   ├── ui/                       # shadcn primitives (the design system)
│   ├── layout/                   # app shell: app-sidebar · topbar · auth-shell
│   ├── common/                   # reusable: page-header · empty-state · error-state · form-error · loading-spinner
│   └── providers.tsx             # global provider tree (React Query …)
│
├── stores/                       # cross-cutting client state (ui-store) [zustand]
├── config/                       # nav.ts · site.ts — static config, no logic
├── types/                        # globally shared types
└── hooks/                        # cross-cutting hooks (use-mobile…)
```

> ⚠️ `stores/ui-store.ts` imports `zustand`, which won't typecheck until you free
> `C:` and run `npm install zustand`. Nothing imports it yet, so the dev server
> is unaffected.

## Data flow (must follow)

```
page.tsx → lib/api (api.<domain>.<method>) → lib/api/client.ts → fetch
 compose    typed endpoint per domain          auth + errors + tokens
```

- Components/pages get data through the `api` object from `@/lib/api` — never raw `fetch`.
- `client.ts` is the single transport: it attaches the auth token, sets the base
  URL, and turns failures into a typed `ApiError` (use `getErrorMessage()` to show users).
- Each `lib/api/<domain>.ts` owns that domain's request/response types + endpoints.
- Forms use RHF + `zodResolver(schema)` with schemas from `lib/validation/`.

> When a domain needs another domain's data, call the other domain's methods on
> the same `api` object (e.g. shipments UI calls `api.products.list()`) — the
> endpoint is defined once, in its owning `lib/api/<domain>.ts`.

## Auth & route protection (Next.js 16 specifics)

⚠️ This build is a **customized Next.js 16** (see `AGENTS.md`). Confirmed from
`node_modules/next/dist/docs/`:

- Request interception / redirects use **`proxy.ts`** at the project root —
  **not** `middleware.ts`. See `docs/01-app/01-getting-started/16-proxy.md`.
- Routes needing instant client navigation should `export const unstable_instant`
  — see `docs/01-app/02-guides/instant-navigation.mdx`.
- Always read `node_modules/next/dist/docs/` before using a Next API; do not
  trust generic Next.js tutorials for version-specific behavior.

Target auth flow: store token in an httpOnly cookie + Zustand session, guard the
`(app)` group via `proxy.ts`, bootstrap the user with a `useCurrentUser()` hook.

## Next steps

1. **Free C: disk → `npm install zustand`** (and later `nuqs`,
   `@tanstack/react-query-devtools`, prettier/husky).
2. **Auth session** — once zustand installs, fix `stores/ui-store.ts`; add a small
   auth store (token + current user), add the `proxy.ts` guard for `(app)`, and
   bootstrap the user via `api.auth.me()`. Kill the hardcoded "Mehta Exports" in
   the sidebar.
3. **Adopt React Query** — wrap `api.<domain>` calls in hooks using
   `lib/api/query-keys.ts`, so pages get caching/refetch/loading for free.
4. **Replace mocks** — swap `lib/mock-data.ts` for real `api.*` calls as backend
   routes land; delete it when nothing imports it.
5. **Polish** — `loading.tsx`/`error.tsx` per route segment, add Vitest +
   Playwright + CI (typecheck + lint + test).
```
