# Weight Loss Celebration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every submitted check-in weight replace the user's current goal weight, and celebrate a real decrease with the selected 10-second encouragement dialog.

**Architecture:** The check-in server action reads the user's existing goal weight, completes the current check-in insert, then upserts the submitted weight into the user's single `goals` row under the existing RLS policies. A pure weight-change helper decides whether the redirect carries celebration data; a client dialog owns the accessible close behavior and the 10-second timer.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase JS 2, Vitest, existing global CSS theme tokens.

## Global Constraints

- Only a submitted non-null weight updates `goals.current_weight`.
- A celebration is shown only when both weights exist and the submitted weight is lower than the previous current weight.
- A first recorded weight, an equal weight, or a higher weight does not celebrate.
- The dialog auto-closes after exactly 10 seconds and also closes from the button `我会坚持下去`.
- The selected visual target is Product Design option 3 at 390 × 844.
- Existing RLS ownership filters remain in force; no service-role key or `security definer` function is introduced.

---

### Task 1: Weight-change behavior

**Files:**
- Modify: `lib/goals.ts`
- Modify: `tests/goals.test.ts`

**Interfaces:**
- Produces: `getWeightLoss(previousWeight: number | null | undefined, currentWeight: number): number | null`

- [ ] **Step 1: Write the failing tests**

Add tests proving a decrease is rounded to one decimal and that missing, equal, or increased weights return `null`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/goals.test.ts`

Expected: FAIL because `getWeightLoss` is not exported.

- [ ] **Step 3: Write minimal implementation**

Implement `getWeightLoss` with finite-number protection and `toFixed(1)` rounding.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/goals.test.ts`

Expected: PASS.

### Task 2: Auto-close scheduling and selected dialog

**Files:**
- Create: `lib/celebration.ts`
- Create: `components/WeightLossCelebration.tsx`
- Create: `tests/weight-loss-celebration.test.ts`
- Create: `public/weight-loss-celebration-heart.png`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `scheduleCelebrationAutoClose(onClose: () => void, durationMs?: number): () => void`
- Produces: `<WeightLossCelebration previousWeight currentWeight weightLoss />`

- [ ] **Step 1: Write failing tests**

Test with Vitest fake timers that the callback fires at 10,000 ms and cancellation prevents it. Add source assertions for `role="dialog"`, the exact button copy, the generated asset path, and the component close handler.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/weight-loss-celebration.test.ts`

Expected: FAIL because the scheduler and component do not exist.

- [ ] **Step 3: Generate and add the selected illustration asset**

Generate the glossy pink heart-and-arrow artwork from selected option 3, remove its flat background for a clean transparent PNG, and save it at `public/weight-loss-celebration-heart.png`.

- [ ] **Step 4: Implement minimal behavior and styling**

Build an accessible fixed modal using the selected pink/blue layout, restore focus on close, allow Escape, display the exact weight-loss data, animate a 10-second progress indicator, and use existing button/theme tokens where compatible.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- tests/weight-loss-celebration.test.ts`

Expected: PASS.

### Task 3: Check-in to goal synchronization

**Files:**
- Modify: `app/checkin/actions.ts`
- Modify: `app/checkin/page.tsx`
- Modify: `tests/checkin-create-source.test.ts`

**Interfaces:**
- Consumes: `getWeightLoss` and `WeightLossCelebration`.
- Produces: redirect query parameters `celebrate`, `previousWeight`, `currentWeight`, and `weightLoss` only for a decrease.

- [ ] **Step 1: Write failing source-flow tests**

Assert that the action selects the current goal weight with an ownership filter, upserts a submitted weight, revalidates `/goals`, and includes celebration parameters only through the helper. Assert that the page parses finite numeric values and renders the selected dialog.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/checkin-create-source.test.ts`

Expected: FAIL because synchronization and dialog rendering are absent.

- [ ] **Step 3: Implement the synchronization flow**

Read `goals.current_weight` before insert when weight is present, preserve the existing legacy check-in fallback, upsert `{ user_id, current_weight }` after the check-in succeeds, log synchronization failures without creating duplicate check-ins, revalidate `/goals`, and redirect with celebration data only after a real decrease.

- [ ] **Step 4: Implement page parsing and rendering**

Treat URL values as untrusted input, require finite non-negative numbers and a positive loss, and render the dialog only for a valid celebration payload.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- tests/checkin-create-source.test.ts`

Expected: PASS.

### Task 4: Full verification and design QA

**Files:**
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: selected mock and rendered `/checkin` celebration state.

- [ ] **Step 1: Run automated verification**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

Expected: all commands exit 0.

- [ ] **Step 2: Verify the mobile interaction**

At 390 × 844, confirm the dialog is visible, the exact copy and weight values render, the button closes it, the timer closes it at 10 seconds, the page has no horizontal overflow, and the console has no errors.

- [ ] **Step 3: Compare source and implementation**

Create a combined visual comparison of selected option 3 and the browser capture. Record and fix all P0/P1/P2 differences, then recapture at the same viewport and state.

- [ ] **Step 4: Save the QA gate**

Update `design-qa.md` with source and implementation paths, comparison history, required fidelity surfaces, interaction evidence, and exactly `final result: passed` when no blocking mismatch remains.
