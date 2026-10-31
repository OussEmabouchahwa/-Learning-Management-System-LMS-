---
description: Measure performance against the stated budgets
---

1. Build production artifacts and report initial JavaScript size (gzipped) against the 180KB budget.
2. Run Lighthouse on the dashboard (target 90+, LCP under 2.5s, CLS under 0.1).
3. Run `npm run perf:load` and report p95 per endpoint (budget 200ms for reads) and error rate.
4. For any slow endpoint, run `EXPLAIN ANALYZE`, name the cause, apply the fix, re-measure.
5. Report before and after numbers.
