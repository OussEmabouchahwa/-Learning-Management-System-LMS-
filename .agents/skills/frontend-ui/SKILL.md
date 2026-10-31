---
name: frontend-ui
description: Builds the React, TypeScript and Tailwind interface for the Dars LMS following docs/DESIGN_SYSTEM.md with the 60/30/10 chalk, board and pencil palette, IBM Plex typography and the Lesson Trail. Use when creating or changing screens, components, forms, tables, the lesson viewer, quiz player, course builder, loading and empty states, or client data fetching.
---

# Frontend UI

## Goal

Ship screens that are accessible, fast and unmistakably Dars, built from tokens and primitives. Open `docs/design-reference.html` before starting.

## Before each component, state this briefly

Intent (who, what task, what feel), focal element and how it wins, palette share (60/30/10 check), depth (borders at rest), typography levers, spacing. If you cannot say why, you are defaulting.

## Folder layout

```
apps/web/src/
  app/                 router, providers (QueryClient, Auth, Toaster), AppShell
  components/ui/       Button, IconButton, Field, Input, Select, Textarea, Tabs,
                       Dialog, Drawer, Toast, Skeleton, EmptyState, StatusTag,
                       DataTable, LessonTrail, Markdown
  features/
    auth/  dashboard/  catalog/  learn/  quiz/  assignments/  grades/
    instructor/ (course builder, submissions, gradebook)  admin/
    each: api/, components/, hooks/, pages/, copy.ts
  lib/                 http.ts (refresh logic), auth-store.ts, format.ts, cn.ts
  styles/              tokens.css, globals.css
```

## Instructions

1. **Foundation first:** `tokens.css`, Tailwind mapping, fonts (IBM Plex Serif, Sans, Mono, `swap`, Latin subset), global styles (selection, caret, focus ring, scrollbar, tabular numerals), then `components/ui` primitives on Radix. Build a temporary `/__kit` route showing every primitive in every state, then remove it before release.
2. **Auth:** access token in memory, shared in-flight refresh, route guards by role, redirect back after login.
3. **Data:** one typed `http.ts`; features expose hooks (`useDashboard`, `useCourse`, `useStartAttempt`). Query keys per feature. Mutations invalidate precisely and show a toast with the action verb. Use `keepPreviousData` for paginated tables.
4. **URL state:** search, filters, sort, page and active tab live in search params.
5. **Forms:** React Hook Form with the Zod schema from `packages/contracts`. Map server `fields` errors onto inputs, focus the first invalid field, disable submit while pending.
6. **Dashboard:** noun title, ResumePanel (Lesson Trail), StatBand, DueList, CourseRows. One aggregated call.
7. **Lesson viewer:** Markdown via `react-markdown` with `rehype-sanitize` and syntax highlighting, prose at 68ch, previous/next, "Mark as complete" (optimistic with rollback), video embeds from the allow-list.
8. **Quiz player:** one question per view on mobile, segment-strip navigator, server deadline drives the timer (resync on focus), autosave on change with visible status, polite live-region announcements at 10, 5, 1 minutes, submit confirmation lists unanswered questions, results screen after submit.
9. **Assignments:** drop zone states limits before failure, receipt after submit, grade and feedback view.
10. **Instructor:** course builder with drag (dnd-kit) and keyboard reordering, autosave status, publish checklist; submissions queue sorted by oldest first; gradebook table per design system.
11. **States:** skeleton, empty (teaches), error with retry, offline notice. Never a blank screen.
12. **Performance:** route-level code splitting, lazy images with dimensions (no layout shift), no layout-thrashing animations, bundle analyzer run before release.
13. **Accessibility:** skip link, landmarks, labels, focus management in dialogs, `aria-live` regions, keyboard operability of every flow, reduced motion.

## Constraints

- No raw colors, no arbitrary Tailwind values for color, no inline styles except dynamic widths (trail, bars).
- No `useEffect` for data fetching. No copying query data to local state.
- No hard-coded copy scattered through JSX: use each feature's `copy.ts`.
- No component over 150 lines. Extract.
