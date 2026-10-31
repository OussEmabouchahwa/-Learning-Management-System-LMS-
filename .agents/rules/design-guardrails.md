# Design guardrails (always on for any UI work)

Full specification: `docs/DESIGN_SYSTEM.md`. Visual truth: `docs/design-reference.html`. Open the reference before building a screen.

## Must

- **60/30/10.** Chalk (neutral ground and surfaces) is about 60% of any screen, board (sidebar, rules, text, completed progress) about 30%, pencil (one primary action, current lesson, selection) about 10% or less. Status colors (leaf, redpen) appear on status marks only.
- Colors, radii, shadows, fonts and durations come from tokens through Tailwind. A raw hex value or an arbitrary Tailwind color in a component is a bug.
- IBM Plex only: Serif 600 for titles and big figures, Sans for the interface, Serif 400 for lesson prose, Mono for code. Fixed rem scale at ratio 1.2. No serif in buttons, inputs, tabs, tags or table cells.
- Hierarchy from weight and color first, size second. Numbers use tabular figures and numeric columns are right-aligned.
- Each view has one focal element, and exactly one primary (pencil) button.
- Every interactive element has hover (gated by `hover: hover`), focus-visible, active (`scale(.97)`), disabled. Every data view has loading (skeleton), empty (teaches), error (with retry) and populated states.
- Touch targets 44px. Text contrast 4.5:1, UI contrast 3:1: control borders use `board-400`, never `line-strong`. On board-100 surfaces use board-700 text or darker.
- Motion: transform and opacity only, under 300ms, custom ease-out, never `transition: all`, no animation on keyboard-initiated actions, respect `prefers-reduced-motion`.
- Use CSS logical properties so right-to-left can be added.
- Theme the browser surfaces: selection, caret, focus ring, scrollbar, accent-color.

## Must not

- Gradients, glass or blur as decoration, glow, hard offset shadows, colored border-left stripes.
- Dark or saturated sidebar, violet or indigo, a second accent hue.
- Progress rings, sparklines, donut charts, icon-in-tinted-circle KPIs, rainbow charts.
- Eyebrows, section numbers, ALL-CAPS tracked labels, "Welcome back" heroes, emoji in UI or copy.
- Identical card grids as page structure, nested cards, a modal where a page or drawer works.
- Placeholder content ("Lorem ipsum", "John Doe", "Course 1").

## Before declaring a screen finished

Run the `design-review` skill at 1440px, 768px and 390px. Apply the squint test (hierarchy still readable when blurred), the swap test (would swapping the font change the feel?), and the signature test (can you point to five places the Lesson Trail or the board-and-pencil system shows up?).
