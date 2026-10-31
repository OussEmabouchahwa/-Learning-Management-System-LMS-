# Design System: Dars

Single source of truth for look and behavior. A live visual reference is in [`design-reference.html`](design-reference.html). Open it in a browser first. Components consume **tokens**, never raw values.

## 1. Direction

**Who:** a student opening Dars at 8am between classes to see what is due, or an instructor at night grading a stack of submissions. Both are in a task, not browsing.

**Mode:** Operate (authenticated app) with a Read surface inside it (the lesson viewer). Scanability and consistency outrank expression. Brand lives in precise details.

**Feel:** calm like a reading room, exact like a gradebook. Chalk paper, board-green structure, one pencil-orange accent.

**World (where the tokens come from):** a classroom. Chalk (the paper), the board (the green-teal structure), the pencil (the one warm accent). Token names use those words on purpose.

**Signature element, the Lesson Trail:** a segmented bar with one segment per lesson (done, current, upcoming). It appears on the resume panel, course header and course rows. It tells a story ("14 of 24, lesson 15 next, quiz after 17") where a progress ring only fills space.

**Rejected defaults:** purple-indigo SaaS accent (replaced by board and pencil), four KPI tiles with icons in circles (replaced by one divided stat band of type), progress rings and sparklines (replaced by the Lesson Trail), "Welcome back" hero (replaced by a noun title).

## 2. Color: the 60 / 30 / 10 rule

| Share | Role | Family | Where it appears |
|---|---|---|---|
| **60%** | Dominant neutral | **Chalk** | Page ground, panels, table rows, inputs |
| **30%** | Secondary structure | **Board** | Sidebar, section bands, rules, secondary text, headings and body ink, completed trail segments |
| **10%** | Accent | **Pencil** | The one primary action per view, the current lesson segment, selection marks, search highlight |
| outside | Status only | Leaf, Redpen | Passed or graded (leaf), overdue or destructive (redpen). Never decoration |

The proportion is measured by screen area, not by token count. If pencil is visible in more than a few places on one screen, something is over-accented.

### Tokens

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--chalk-0` | `#FFFFFF` | Panels, inputs | n/a |
| `--chalk-50` | `#F4F6F5` | Page ground | n/a |
| `--chalk-100` | `#EBEFED` | Sunken fills, code blocks, hover | n/a |
| `--board-100` | `#E3EBEA` | Sidebar, table header band, tag fill | n/a |
| `--board-200` | `#CFDCDA` | Upcoming trail segments, track of bars | n/a |
| `--board-300` | `#AFC2C0` | Disabled content, decorative | n/a |
| `--board-400` | `#768D8C` | **Control borders** (inputs, selects, secondary buttons) | 3.5:1 on white, 3.2:1 on chalk-50, 3.0:1 on chalk-100 |
| `--board-500` | `#587473` | Tertiary text on chalk only | 5.0:1 on white |
| `--board-700` | `#2E4A4D` | Secondary text, completed segments | 9.5:1 on white |
| `--board-900` | `#0F2A2E` | Primary text (ink) | 15:1 on white |
| `--pencil-100` | `#FFF1CC` | Due-soon tag fill, current-segment halo | n/a |
| `--pencil-300` | `#FFD166` | Button hover, text selection | n/a |
| `--pencil-500` | `#F2A100` | Primary button, current segment | ink on it 7.1:1 |
| `--pencil-700` | `#955700` | Accent text and links on chalk | 5.8:1 on white |
| `--leaf-100` / `--leaf-600` | `#E1F2E8` / `#1F7A4D` | Passed, graded, published | 5.3:1 |
| `--redpen-100` / `--redpen-600` | `#FCE9E7` / `#B42318` | Overdue, errors, destructive | 6.6:1 |
| `--line` | `rgb(15 42 46 / .12)` | Resting borders, row rules | decorative |
| `--line-strong` | `rgb(15 42 46 / .22)` | Emphasized dividers and table frames. **Never for controls** (about 1.6:1) | decorative |

Rules:

- Text on chalk uses `board-900`, `board-700` or `board-500`. **On board-100 surfaces use `board-700` or darker** (board-500 fails 4.5:1 there).
- Text on a pencil fill is always `board-900`, never white.
- Status tags are a pale tint with dark text of the same family, never a saturated chip with white text.
- Color encodes meaning (good, late, current). Up or down alone is not a color event. Zero or unknown is neutral, never green or red.
- No gradients, no tinted shadows, no second accent hue. Dark mode is out of scope for v1; the tokens are structured so a dark set can be added later.

## 3. Typography: one superfamily, one scale

**IBM Plex**, designed as a family, so the three faces share proportions, stroke contrast and rhythm. This is why the pairing is harmonious without tuning.

| Role | Face | Where |
|---|---|---|
| Titles | IBM Plex Serif 600 | Page titles, course and lesson titles, section headings, large figures |
| Interface | IBM Plex Sans 400, 500, 600 | Navigation, labels, buttons, tables, forms, body |
| Reading | IBM Plex Serif 400 | Lesson prose only |
| Code | IBM Plex Mono 400 | Code blocks, inline code, student IDs, quiz timers |

Load with `font-display: swap` and real fallbacks (`Georgia, serif`, `system-ui, sans-serif`, `ui-monospace, monospace`). Subset to Latin. If Arabic is added later, pair with IBM Plex Sans Arabic.

### Scale (fixed rem, ratio 1.2, base 16px)

| Step | Size / line-height | Face and weight | Use |
|---|---|---|---|
| Display | 2.5rem (40) / 1.15 | Serif 600, tracking -0.015em | Course header, completion moment. Rare |
| H1 | 1.75rem (28) / 1.2 | Serif 600, tracking -0.01em | Page title (a noun, never a greeting) |
| H2 | 1.4375rem (23) / 1.25 | Serif 600 | Panel and resume titles |
| H3 | 1.1875rem (19) / 1.3 | Serif 600 | Section headings inside panels |
| Body | 1rem (16) / 1.5 | Sans 400 | Default text |
| UI small | 0.875rem (14) / 1.43 | Sans 400/500 | Secondary text, table cells, tags |
| Caption | 0.75rem (12) / 1.33 | Sans 500 | Axis, meta. Nothing smaller |
| Prose | 1.125rem (18) / 1.7 | Serif 400 | Lesson reading, max 68ch |
| Code | 0.875rem (14) / 1.6 | Mono 400 | Code and IDs |

Hierarchy comes from **weight and color first, size second**. Four text levels: primary `board-900`, secondary `board-700`, tertiary `board-500`, disabled `board-300`.

Rules: never fluid type in the app shell (fixed rem). Sentence case everywhere. No ALL-CAPS labels. `font-variant-numeric: tabular-nums` on every number, and right-align numeric columns. `text-wrap: balance` on headings, `pretty` on prose. Serif never appears in buttons, tabs, inputs, tags or table cells.

## 4. Space, density, depth

- 4px base. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 56, 72. Panels pad 24, rows pad 14 vertically, controls are 44px high.
- Density is **medium**: dense enough for tables, airy around the one focal element of each view.
- Rhythm is uneven on purpose. Tight inside groups (8 to 12), generous between them (32 to 56).
- **Depth strategy: borders only at rest.** 1px `--line`. Shadows appear only on what floats (menu, popover, dialog, drawer, toast): `0 8px 24px rgb(15 42 46 / .14), 0 0 0 1px rgb(15 42 46 / .08)`. Never both on a resting element.
- Radius scale: `--r-sm` 4 (tags, trail segments), `--r-md` 8 (controls), `--r-lg` 12 (panels, dialogs). Nested radius follows concentric rule (outer = inner + padding, within the scale).

## 5. Layout

- App shell: 232px sidebar on `board-100` with a 1px right border, content max-width 1160px, page padding `clamp(20px, 4vw, 48px)`.
- Sidebar items: 40px high, neutral active state (chalk pill, bold text). The active item is not colored.
- Every view has **one focal element** and it wins by position and space: the Resume panel on the dashboard, the lesson on the viewer, the question on the quiz player.
- Breakpoints (structural, not fluid): 980px (two columns become one), 820px (sidebar becomes a horizontal top strip, stat band stacks).
- Lists beat cards. The course catalog and course lists are divided rows, not grids of identical tiles.

## 6. Motion

Motion explains a state change. Nothing else.

| Use | Duration | Easing |
|---|---|---|
| Hover color, press feedback | 120 to 150ms | `ease`; press = `scale(.97)` |
| Menus, popovers | 150 to 200ms | `cubic-bezier(.23, 1, .32, 1)`, scale from trigger |
| Drawer, dialog | 200 to 240ms | `cubic-bezier(.32, .72, 0, 1)` |
| Toast | 200ms in, 150ms out | ease-out |
| Course completed (rare moment) | trail segments fill, 40ms stagger | ease-out |

- Animate `transform` and `opacity` only. Never `transition: all`. Never start from `scale(0)` (use `.95` plus opacity).
- No animation on keyboard-initiated actions (shortcuts, command palette). No page-load sequences, no scroll reveals.
- Gate hover effects with `@media (hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion`: drop movement, keep opacity and color changes.

## 7. Components

Every component ships default, hover, focus-visible, active, disabled, plus loading and error where they apply. Build on Radix primitives, style with tokens.

| Component | Spec |
|---|---|
| **Button** | 44px. Primary: pencil fill, ink text, one per view. Secondary: chalk fill, `board-400` border. Destructive: redpen fill, white text, only inside a confirm dialog. Loading keeps width and swaps label for a spinner. |
| **IconButton** | 40px (44 on coarse pointers), transparent, `chalk-100` hover, `aria-label` names the target. |
| **Field, Input, Select, Textarea** | Visible label above, helper below, error below in redpen with `aria-describedby`. Inputs are inset: `chalk-100` fill on a chalk-0 panel, `board-400` border, focus ring 2px `board-900` with 2px offset. |
| **AppShell and Sidebar** | See section 5. Shows product mark and name, nav with 18px outline icons (lucide, one stroke weight), user block at the bottom. |
| **PageHeader** | Noun title (H1) left, a short fact right (date, count). No hero, no greeting, no breadcrumbs unless depth is 3+. |
| **LessonTrail** | One 10px-high segment per lesson, 3px gap, radius 4. Done `board-700`, current `pencil-500` with a `pencil-100` 2px halo, upcoming `board-200`. Caption underneath: completed count left, next milestone right. Has `role="img"` and a full text alternative. Compact variant (6px, no caption) for course rows, with the percentage beside it. |
| **ResumePanel** | Course, lesson title (H2), location line, Lesson Trail, one primary button "Resume lesson". The dashboard focal element. |
| **StatBand** | One panel divided by hairlines into 3 cells: small label, figure in serif 28 (tabular), unit in secondary text. No icons, no deltas without a window. |
| **DueList** | Rows: title (600), type and course and due date (secondary), right-aligned tag ("In 2 days" pencil tint, "Overdue" redpen tint, "Submitted" neutral). Sorted by due date. Never hidden below the fold. |
| **CourseRow** | Title, next lesson, compact trail with percent. Catalog rows add instructor, level, duration, enrolled count. |
| **DataTable** | 12px grey sentence-case headers on `board-100` band, row rules `--line`, no zebra, numbers right-aligned tabular, one row action at most, sticky header for long tables, row hover `chalk-50`. |
| **StatusTag** | 22px, radius 99, pale tint plus dark text. Map: Draft (board), Published and Graded and Passed (leaf), Due soon (pencil), Overdue and Failed (redpen), Archived (board-500). |
| **Tabs** | Underline style, active = ink text and 2px ink underline (not pencil). |
| **Dialog and Drawer** | Radix. Dialog only for confirmation or a short decision. Anything longer is a page or a drawer. Focus trapped, returns to trigger. |
| **Toast** | Bottom-center, ink fill, white text, `role="status"`. Repeats the action verb: "Submitted SQL joins worksheet". |
| **Skeleton** | Row-shaped, `chalk-100`, no shimmer sweep (static pulse at most, disabled under reduced motion). |
| **EmptyState** | Frame is kept. One sentence that teaches ("No submissions yet. They appear here as students hand in work."), one action. No illustrations. |
| **LessonViewer** | Reading surface: Plex Serif prose 18/1.7 at 68ch, headings serif, code in `chalk-100` blocks with a 1px `line-strong` border (decorative frame) and mono, images with a 1px inset outline. Footer: Previous, "Mark as complete" (primary), Next. Video embeds are 16:9 with a title and a transcript link. |
| **QuizPlayer** | Question navigator is a segment strip (answered `board-700`, current `pencil-500`, unanswered `board-200`). Timer top-right in mono tabular, turns `redpen-600` only in the last minute. Autosave indicator ("Saved 12:04:31"). Submit opens a dialog listing unanswered questions. One question per screen on mobile. |
| **AssignmentSubmit** | Drop zone with type and size limits stated before the user fails them. Shows due date, late policy, attempts. After submit shows the receipt (time, file name, size). |
| **GradeFeedback** | Score as serif figure with "out of N", rubric or feedback in prose, grader and date in secondary text. |
| **CourseBuilder** | Instructor tree: modules containing lessons, quizzes and assignments. Reorder by drag (dnd-kit) and by keyboard buttons. Autosave status. Publish checklist (no empty modules, every quiz has questions). |
| **Gradebook** | Students down the left (fixed column, 200px), items across, right-aligned tabular scores, grey dash for not submitted, redpen text only for overdue, pencil tint for needs grading. |

## 8. Voice and copy

Words of the trade, active, sentence case. "Resume lesson", "Hand in", "Awaiting feedback", "Attempt 2 of 3", "Opens Mon 2 Nov". Errors say what happened and what to do, never apologize. Realistic sample data (diverse names, real course titles, dates computed relative to today). Never "Lorem ipsum", "John Doe", "Course 1". Keep copy in per-feature dictionaries (no hardcoded strings scattered in JSX) so translation can be added later.

## 9. Accessibility and internationalization

- WCAG 2.2 AA: contrast 4.5:1 text and 3:1 UI, full keyboard use, visible focus, skip link, landmarks, labels on every control, errors linked and announced, 44px targets, no color-only meaning (the trail has a text caption, tags have words).
- Control borders and focus rings meet 3:1. The upcoming-lesson segments and bar tracks are deliberately quiet (below 3:1) because the same information is always carried by text (the caption, the percentage, the `role="img"` alternative).
- Timed quiz: announce remaining time at 10, 5 and 1 minute through an `aria-live="polite"` region, never every second.
- Use CSS logical properties (`margin-inline`, `padding-block`, `inset-inline`) so right-to-left (Arabic) can be added without rewrites.

## 10. Never do this

Gradients or gradient text, glass or blur as decoration, glow, hard offset shadows, a dark or saturated sidebar, a colored `border-left` stripe on cards, icon-in-tinted-circle on KPIs, progress rings, sparklines, donut charts, rainbow charts (one hue per chart), eyebrows above headings, section numbers, ALL-CAPS tracked labels, emoji as icons or in copy, "Welcome back" greetings, hero banners, identical card grids as page structure, nested cards, a modal where a page or drawer works, violet or indigo, a second accent hue, serif in controls, fluid type in the app shell.

## 11. Token implementation

`apps/web/src/styles/tokens.css`:

```css
:root {
  --chalk-0: #ffffff;
  --chalk-50: #f4f6f5;
  --chalk-100: #ebefed;
  --board-100: #e3ebea;
  --board-200: #cfdcda;
  --board-300: #afc2c0;
  --board-400: #768d8c;
  --board-500: #587473;
  --board-700: #2e4a4d;
  --board-900: #0f2a2e;
  --pencil-100: #fff1cc;
  --pencil-300: #ffd166;
  --pencil-500: #f2a100;
  --pencil-700: #955700;
  --leaf-100: #e1f2e8;
  --leaf-600: #1f7a4d;
  --redpen-100: #fce9e7;
  --redpen-600: #b42318;

  --line: rgb(15 42 46 / 0.12);
  --line-strong: rgb(15 42 46 / 0.22);
  --shadow-float: 0 8px 24px rgb(15 42 46 / 0.14), 0 0 0 1px rgb(15 42 46 / 0.08);

  --font-serif: "IBM Plex Serif", Georgia, serif;
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 12px;

  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  --dur-press: 120ms;
  --dur-base: 180ms;
  --dur-panel: 240ms;
  color-scheme: light;
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-press: 0.01ms; --dur-base: 0.01ms; --dur-panel: 0.01ms; }
}

::selection { background: var(--pencil-300); color: var(--board-900); }
body { caret-color: var(--pencil-500); accent-color: var(--pencil-500); }
```

Expose every token through `tailwind.config.ts` (`colors.chalk[50]`, `colors.board[700]`, `colors.pencil[500]`, `fontFamily.serif`, `borderRadius.md`, and so on) so utilities like `bg-chalk-0 text-board-900 border-line` are the only way color reaches a component. Theme the browser surfaces too: text selection, caret, focus ring, scrollbar (`scrollbar-color`), `accent-color`, tabular numerals.
