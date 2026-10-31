---
name: assessment-engine
description: Implements quizzes, assignments, grading and progress tracking for the Dars LMS with server-authoritative timing, attempt rules, auto-grading, late penalties, file submissions and progress calculation. Use when building or changing quiz attempts, question types, submissions, grades, gradebook or progress percentages.
---

# Assessment engine

## Goal

Make assessment fair, tamper-resistant and reproducible. Rules are in `docs/ARCHITECTURE.md` section 8.

## Quizzes

1. **Question types (v1):** SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE. Each question has `points` and optional explanation. Multiple choice scores by exact match by default (partial credit as a quiz setting).
2. **Start attempt** `POST /quizzes/:id/attempts`: verify enrollment, quiz is available (opens and closes window), attempts remaining. Create the attempt with `startedAt`, a `shuffleSeed`, and `deadline = startedAt + timeLimit + 5s`. Return questions with options in seeded order and **without** `isCorrect` or explanations. If an attempt is already in progress, return it.
3. **Autosave** `PUT /attempts/:id/answers`: reject if past deadline. Store answers by question id. Idempotent.
4. **Submit** `POST /attempts/:id/submit`: idempotent. If past the deadline, close with the answers saved so far. Auto-grade in the same transaction, store score and per-question correctness, emit `quiz.graded`.
5. **Results** `GET /attempts/:id`: correct answers and explanations only after submission (and only if the quiz allows review).
6. **Expiry:** attempts past deadline are closed lazily on any access and by a scheduled sweep every minute.
7. **Scoring policy** per quiz: best, last or average. The reported quiz score uses it.

## Assignments

1. Instructor sets `dueAt`, `maxPoints`, `allowLate`, `latePenaltyPct`, text and or file submission.
2. Submit `POST /assignments/:id/submissions` (multipart): validate enrollment, validate files through `StorageService`, mark LATE if after `dueAt` (reject if late is not allowed). Resubmission allowed until graded or until due, keeping versions.
3. Grade `PATCH /submissions/:id/grade`: only the course owner or admin. Points between 0 and `maxPoints`, feedback in Markdown. Apply late penalty by formula, store both raw and final points. Write an audit row. Emit `submission.graded`.

## Progress

- `progressPct = completed required items / total required items` with items being required lessons, quizzes passed, assignments submitted. Clamp 0 to 100.
- Recompute inside the transaction of the triggering event. Provide a `progress:recompute` command for repair.
- Set `completedAt` once when reaching 100.
- Dashboard resume target = the first incomplete required lesson in course order for the most recently active enrollment.

## Gradebook

Instructor view: students by items matrix from one query set. Missing work is a dash, needs-grading is highlighted. Students see only their own rows (`/me/grades`).

## Tests required

Time boundary cases (just before, at, after deadline), double submit, attempt limit, shuffled order is stable per attempt, no answer leakage, late penalty arithmetic, progress after each event type, authorization for every endpoint.

## Constraints

- Never trust client time, score or correctness.
- Never delete an attempt or submission that has a grade. Soft delete only.
