# Design QA — Tonal Theme Color System

- Source visual truth: `/Users/mac/.codex/generated_images/019f4b35-287f-71c0-a235-8c19e36e8d9c/exec-c0f1b5c6-1b10-45d2-9a9e-434eb370c5ff.png`
- Implementation screenshot: `/tmp/fitness-dashboard-impl-final.png`
- Combined comparison: `/tmp/fitness-theme-comparison-final.png`
- Viewport: `390 x 844`
- State: authenticated user dashboard, pink theme, page scroll container at top

**Findings**

- No actionable P0, P1, or P2 differences remain for the approved color-system scope.
- [P3] The implementation hero is slightly deeper at the dark end of its gradient than the generated reference.
  Location: dashboard hero.
  Evidence: the reference is close to a uniform berry rose, while the product preserves its existing `primaryDark → primary` gradient.
  Impact: the result feels a little more athletic and less cosmetic, but remains cohesive with the approved palette.
  Fix: optional future polish could add a dedicated hero-tone token. It is not required for this color-system pass.

**Required Fidelity Surfaces**

- Fonts and typography: Existing Arial / Microsoft YaHei typography, weights, wrapping, and hierarchy were intentionally preserved. The reference uses a larger illustrative type scale, but changing type or layout was outside the approved color-only scope. All visible text remains clear at the mobile viewport.
- Spacing and layout rhythm: Existing dashboard spacing, three-part hero status, metric grid, bottom navigation, radii, and section density were preserved. The generated reference intentionally omitted some product sections; those differences are product constraints rather than design drift. No horizontal overflow was detected.
- Colors and visual tokens: Pink now uses berry `#a9275d`, blush `#f7e8ee`, porcelain `#fff9fb`, charcoal plum `#241b20`, mauve gray `#75676e`, and rose-gray `#e8d9df`. Canvas, cards, soft panels, borders, navigation, and shadows share one undertone instead of mixing pink accents with a green canvas. Equivalent semantic tonal palettes exist for all six themes.
- Image quality and asset fidelity: The selected reference contains no standalone raster assets that need generation. The user's real avatar and existing Lucide interface icons were intentionally preserved; there are no placeholder, CSS-drawn, or substitute image assets.
- Copy and content: Existing Chinese labels, real metrics, navigation, and account data were preserved. The source mock's abbreviated navigation and content were not copied because the approved scope explicitly kept product structure and behavior unchanged.

**Interaction and Accessibility Checks**

- Primary dashboard CTA: exactly one `a.dashboard-action-button[href="/checkin"]`.
- Bottom navigation: five links present.
- Horizontal overflow: none on the document or fixed page shell at `390 x 844`.
- Browser console: no page errors.
- Contrast: every theme passes `4.5:1` for text/canvas, muted/canvas, and white/button combinations.

**Comparison History**

1. Baseline finding: non-green themes changed only accent variables while page canvas, neutral surfaces, and shadows remained green-tinted. Fix: introduced semantic canvas, surface, foreground, divider, and shadow tokens for all themes and replaced green visual-foundation values.
2. Accessibility finding: green, blue, purple, and black muted foregrounds were below `4.5:1`; orange primary buttons were also below `4.5:1` against white. Fix: darkened the affected muted values and refined orange primary/button colors. Post-fix automated contrast checks pass for all themes.
3. Final visual comparison: the selected reference and final implementation share the same berry/blush/porcelain hierarchy. Remaining hero-gradient difference is P3 and intentional within the existing component language.

**Implementation Checklist**

- Semantic palette contract implemented for all six themes.
- Pink theme matches the approved option-1 palette.
- Green-tinted global canvas and soft fills removed from theme-dependent UI.
- Theme-aware shadows and dividers applied.
- Responsive, interaction, console, contrast, tests, typecheck, and production build verified.

**Follow-up Polish**

- Optionally introduce a dedicated hero gradient token if future themes need independently art-directed hero intensity.

final result: passed
