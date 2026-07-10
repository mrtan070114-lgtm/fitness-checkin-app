# TnT Theme Color System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace accent-only theming with a cohesive semantic palette for all six themes, matching the approved tonal berry-rose reference without changing product structure or behavior.

**Architecture:** Extend `AppTheme` with semantic canvas, surface, foreground, divider, and shadow values, expose them through the existing CSS-variable bridge, and consume those variables in the global visual foundation. Existing theme persistence, Supabase data, routes, components, and iconography remain unchanged.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS custom properties, Vitest.

## Global Constraints

- Preserve all existing layout, content, routes, interactions, data flow, typography, spacing, and Lucide icons.
- Pink reference colors are `#a9275d`, `#f7e8ee`, `#fff9fb`, `#241b20`, `#75676e`, and `#e8d9df`.
- Apply equivalent tonal relationships to green, blue, purple, orange, and black.
- Do not modify Supabase schema, authentication, persistence, or user records.
- Do not overwrite unrelated working-tree changes in `components/ExerciseDetailsFields.tsx` or `tests/exercise-details-source.test.ts`.

---

### Task 1: Lock the semantic palette contract with a regression test

**Files:**
- Modify: `tests/theme-source.test.ts`
- Test: `tests/theme-source.test.ts`

**Interfaces:**
- Consumes: `lib/themes.ts` and `app/globals.css` as source text.
- Produces: assertions for `canvas`, `canvasTop`, `canvasBottom`, `surface`, `surfaceSoft`, `text`, `muted`, `line`, `shadowRgb`, and their CSS-variable mappings.

- [ ] **Step 1: Write the failing test**

Add a test that requires every semantic field and mapping, requires the approved pink values, requires `body` and `.user-shell` to use `--app-bg-top` and `--app-bg-bottom`, and rejects the old hard-coded green page gradient.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `npm test -- tests/theme-source.test.ts`

Expected: FAIL because the semantic palette fields and background variables do not exist yet.

- [ ] **Step 3: Keep the failing output as implementation evidence**

Confirm the failure points at the new assertions rather than a syntax or fixture error.

### Task 2: Add complete semantic values to every theme

**Files:**
- Modify: `lib/themes.ts`
- Test: `tests/theme-source.test.ts`

**Interfaces:**
- Consumes: existing `ThemeColor`, `AppTheme`, and `getThemeCssVariableRecord`.
- Produces: CSS variables `--bg`, `--app-bg-top`, `--app-bg-bottom`, `--surface`, `--surface-soft`, `--text`, `--muted`, `--line`, and `--theme-shadow-rgb`.

- [ ] **Step 1: Extend `AppTheme`**

Add exact string fields for `canvas`, `canvasTop`, `canvasBottom`, `surface`, `surfaceSoft`, `text`, `muted`, `line`, and `shadowRgb`.

- [ ] **Step 2: Define all six palettes**

Give each theme a hue-compatible canvas and neutral hierarchy. Use the approved option-1 values for pink and restrained equivalents for green, blue, purple, orange, and black.

- [ ] **Step 3: Extend the CSS-variable record**

Map each semantic field to the interface listed above without changing function signatures.

- [ ] **Step 4: Run the targeted test**

Run: `npm test -- tests/theme-source.test.ts`

Expected: the palette contract assertions pass; page-background assertions remain failing until Task 3.

### Task 3: Replace the green visual foundation with semantic variables

**Files:**
- Modify: `app/globals.css`
- Test: `tests/theme-source.test.ts`

**Interfaces:**
- Consumes: semantic CSS variables from `getThemeCssVariableRecord`.
- Produces: a hue-cohesive page canvas, neutral cards, soft panels, dividers, navigation, and themed shadow undertones.

- [ ] **Step 1: Update root defaults**

Define semantic defaults for the green theme so unauthenticated and pre-hydration states remain stable.

- [ ] **Step 2: Theme the application canvas**

Change `body` and `.user-shell` to `linear-gradient(180deg, var(--app-bg-top) 0%, var(--bg) 48%, var(--app-bg-bottom) 100%)`.

- [ ] **Step 3: Theme neutral soft surfaces and shadows**

Replace green-tinted neutral fills with `var(--surface-soft)` and green RGB shadow bases with `rgba(var(--theme-shadow-rgb), opacity)`. Keep existing opacity and elevation levels.

- [ ] **Step 4: Run the targeted test and verify GREEN**

Run: `npm test -- tests/theme-source.test.ts`

Expected: PASS.

### Task 4: Verify functionality and visual fidelity

**Files:**
- Create: `design-qa.md`
- Modify only if QA finds P0/P1/P2 drift: `lib/themes.ts`, `app/globals.css`, `tests/theme-source.test.ts`

**Interfaces:**
- Consumes: approved image `/Users/mac/.codex/generated_images/019f4b35-287f-71c0-a235-8c19e36e8d9c/exec-c0f1b5c6-1b10-45d2-9a9e-434eb370c5ff.png` and authenticated `/dashboard`.
- Produces: passing build evidence, a `390 x 844` implementation capture, a combined comparison image, and `design-qa.md` with `final result: passed`.

- [ ] **Step 1: Run code verification**

Run: `npm run typecheck && npm test && npm run build && git diff --check`

Expected: exit code 0; all tests pass.

- [ ] **Step 2: Capture the implementation**

Reload `/dashboard`, set the browser viewport to `390 x 844`, return the fixed scroll container to the top, and save a screenshot.

- [ ] **Step 3: Test core interactions**

Confirm the dashboard primary CTA remains a working `/checkin` link, bottom navigation links remain present, there is no horizontal overflow, and the browser console has no new errors.

- [ ] **Step 4: Compare source and implementation together**

Create one side-by-side comparison artifact containing the selected source and the implementation screenshot, then inspect color hierarchy, typography, spacing, imagery/assets, and copy.

- [ ] **Step 5: Fix blocking visual differences and repeat**

Fix every P0/P1/P2 mismatch, recapture at the same viewport and state, and update the comparison history until no blocking mismatch remains.

- [ ] **Step 6: Save the final QA report**

Write `design-qa.md` with exact artifact paths, viewport, state, interaction checks, console result, comparison history, residual P3 notes, and `final result: passed`.
