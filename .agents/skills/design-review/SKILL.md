---
name: design-review
description: Reviews the running Dars interface against docs/DESIGN_SYSTEM.md using browser screenshots at 1440, 768 and 390 pixels, checking the 60/30/10 color balance, typography, states, accessibility and web interface guidelines, then fixes differences. Use after any UI change, before declaring a screen finished, or when the interface looks generic.
---

# Design review

## Goal

Find the problems code review cannot see and fix them in a short loop.

## Instructions

1. Start the app, sign in with the seeded accounts, open the reference `docs/design-reference.html` alongside.
2. Capture screenshots at **1440, 768 and 390px** of: student dashboard, catalog, course page, lesson viewer, quiz in progress, quiz result, assignment submit, grades, instructor course builder, submissions queue, gradebook, admin users. Include loading, empty and error states.
3. **Balance check (60/30/10).** Squint at each screenshot. Chalk should dominate, board should read as structure, pencil should be a few small marks. If pencil is everywhere or absent, fix it. Status colors only on status marks.
4. **Craft checks**
   - Squint test: hierarchy readable, nothing harsh.
   - Swap test: would swapping the fonts or layout for defaults change the feel? If not, it defaulted.
   - Signature test: point to five places the Lesson Trail or board-and-pencil system shows.
   - Token test: no raw hex, no off-scale spacing or radius.
5. **Typography check:** only IBM Plex, only the scale in the design system, serif absent from controls, numbers tabular and right-aligned, prose measure at most 68ch.
6. **States:** hover, focus-visible, active, disabled, loading, empty, error exist and look intentional.
7. **Web interface guidelines** (from Vercel's list, fetch the latest from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` when network allows): icon buttons have labels, inputs have labels and correct `type`, `autocomplete` and `inputmode`, no `transition: all`, `prefers-reduced-motion` honored, long text truncates or wraps without breaking layout (`min-w-0`), loading labels end with an ellipsis, links are `<a>` and actions are `<button>`, zoom is not disabled, focus is never removed without replacement, `touch-action: manipulation` on controls, dates and numbers use `Intl`.
8. **Accessibility:** keyboard-only pass through one full flow, focus visible and logical, contrast spot-check with devtools, reduced motion on.
9. **Report as a table** with columns Before, After, Why, ranked by severity.
10. Fix the top issues in tokens or components (never one-off overrides), re-capture, re-check. Stop after three iterations or when clean.

## Constraints

- Match the design system, do not reinvent it.
- Do not add decoration to make a screen "feel designed". Fix hierarchy, spacing and copy first.
