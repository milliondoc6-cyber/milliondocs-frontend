# Learning path — MillionDocs stack (with links)

Learn in **this order**. Each maps to a part of `ARCHITECTURE.md`.
Tip: if a specific video is outdated when you watch, open the channel link and
search for the newest version.

## 0. TypeScript (foundation — do this first)
- ▶️ Matt Pocock — TypeScript Crash Course: https://www.youtube.com/watch?v=p6dO9u0M7MQ
- 📖 Free Beginner's TypeScript (interactive, 18 lessons): https://www.totaltypescript.com/tutorials
- Channel: https://www.youtube.com/@mattpocockuk

## 1. Next.js App Router (core)
- 📖 Official interactive course (START HERE): https://nextjs.org/learn/dashboard-app
- 📖 App Router getting started: https://nextjs.org/docs/app/getting-started
- ▶️ Code With Antonio (full real-world builds): https://www.youtube.com/@codewithantonio
- 📌 For THIS repo, the source of truth is `node_modules/next/dist/docs/` (customized Next 16).

## 2. TanStack Query (server state) → features/*/hooks.ts
- ▶️ Simple As Possible TanStack Query Tutorial: https://www.youtube.com/watch?v=w9r55wd2CAk
- ▶️ Jack Herrington — "How to become a React Query God": https://www.youtube.com/watch?v=mPaCnwpFvZY
- 📖 TkDodo's blog (the reference — read "Practical React Query"): https://tkdodo.eu/blog
- 📖 Official docs: https://tanstack.com/query/latest

## 3. Zustand (client state) → features/auth/store.ts
- ▶️ Zustand Crash Course: https://www.youtube.com/watch?v=QztUD2g85jo
- 📖 Official docs (excellent README): https://github.com/pmndrs/zustand

## 4. Forms — React Hook Form + Zod
- 📖 freeCodeCamp — Validate forms with Zod + RHF: https://www.freecodecamp.org/news/react-form-validation-zod-react-hook-form/
- ▶️ Web Dev Simplified (RHF / Zod): https://www.youtube.com/@WebDevSimplified
- 📖 react-hook-form.com · https://zod.dev

## 5. UI — shadcn/ui + Tailwind v4 (already in our repo)
- 📖 shadcn/ui docs: https://ui.shadcn.com
- ▶️ Tailwind Labs (official): https://www.youtube.com/@TailwindLabs

## Concept that ties it together (watch early)
- "Server state vs client state / why you don't need Redux" — the mental model
  behind our architecture.
- 📖 Dan Abramov (Redux co-author) — "You Might Not Need Redux":
  https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367
- ▶️ Jack Herrington channel (server-state talks): https://www.youtube.com/@jherr

## When you come back
1. Free up `C:` disk space, then `npm install zustand`.
2. Read `ARCHITECTURE.md` → "Migration plan".
3. Use `features/contacts/` as your reference; refactor the Contacts page onto
   `useContacts()` + `<ContactCard/>`, then repeat per feature.
