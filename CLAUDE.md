# Project Rules & Skills Context

Mandatory rules for every AI agent working in this frontend project.

---

## 1. Core rules

- Reply in Vietnamese; English only for technical terms and code. No filler, no echoing the question. Fix/cause in one or two lines.
- Every task that changes code ends with a written "Lưu ý" list in the reply text: what was skipped or not tested, and risks the user must know (e.g. breaking changes on deploy). It must be the LAST visible message of the turn: call the closing/next-step summary tool (wrap_up) WITHOUT a question/buttons, then write the final message with the "Lưu ý" list, and put any question (commit?...) as its last line. Never write the list before that tool call (it gets collapsed with the work log) and never leave it only inside the summary box.
- Before finishing a code task: run `npm run lint` and `npx tsc --noEmit`, fix errors you introduced.
- UI stack: ONLY Tailwind, shadcn/ui, react-icons (`react-icons/lu` by default). No other UI/CSS/icon library, no emoji or raw SVG icons, no inline style or CSS modules. Add shadcn via `npx shadcn@latest add`, never hand-write it.
- Use brand tokens (`bg-main`, `text-subText`...) instead of hex or arbitrary values.
- Precedence with ponytail: ponytail governs logic and code volume; this file governs UI. Table and dropdown: ALWAYS shadcn (`Table`, `DropdownMenu`, `Select`), never raw `<table>`/`<select>` or custom dropdowns, even when ponytail says "use native". All other components: follow ponytail (native HTML elements + Tailwind are fine). Never drop for brevity: loading/empty/error states, aria/keyboard support, Form + zod, design tokens. Do not use ponytail "ultra" mode.
- Search by name to find reusable components before creating new ones; don't scan unrelated folders.

---

## 2. Server vs Client Components

- Default to Server Components. `page.tsx`/`layout.tsx` stay server and fetch shared content (`lib/data/content.ts`) there.
- Add `'use client'` only for state, effects, event handlers or browser APIs, and push it down to the smallest leaf (button, input, results list), not the whole page.
- Need server-rendered content inside a client wrapper (Dialog, Tabs, Collapsible)? Pass it as `children`/props from the server file; never import it inside the client file (that turns it client too).
- Session lives in cookies (`@supabase/ssr`); `proxy.ts` refreshes it and redirects guests away from protected routes. Per-user data (`lib/data/user-data.ts`) stays client-side (guest mode uses `localStorage`). Server-side auth/role checks use `createServerSupabase()` (`lib/supabase-server.ts`) inside `<Suspense>`; the shared `supabase` client is anon on the server.
- Interaction-heavy screens (exam rooms: timer, recording, editor) may be one client tree; don't split them just to shrink the client.

---
