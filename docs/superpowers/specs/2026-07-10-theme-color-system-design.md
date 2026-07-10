# TnT Theme Color System Design

## Approved visual target

- Source: `/Users/mac/.codex/generated_images/019f4b35-287f-71c0-a235-8c19e36e8d9c/exec-c0f1b5c6-1b10-45d2-9a9e-434eb370c5ff.png`
- Selected direction: option 1, a tonal berry-rose system with a warm porcelain canvas, restrained blush surfaces, deep berry actions, charcoal-plum text, mauve-gray secondary text, and subtle rose-gray dividers.
- The existing dashboard layout, content, routes, interactions, data, icons, typography, spacing, and component structure remain unchanged.

## Problem

Theme selection currently changes primary accents but leaves the global canvas, many neutral surfaces, dividers, and shadows hard-coded to green-tinted values. A pink theme therefore appears on top of a green visual foundation, reducing cohesion and making the product look like multiple palettes layered together.

## Color architecture

Each theme owns one complete semantic palette rather than only an accent family:

- `primary`, `primarySoft`, `primaryVerySoft`, and `primaryDark` control brand emphasis.
- `canvas`, `canvasTop`, and `canvasBottom` control the application background.
- `surface`, `surfaceSoft`, and `card` control cards and nested summary regions.
- `text` and `muted` control foreground hierarchy.
- `line`, `border`, and `accentBorder` control neutral and branded separation.
- `shadowRgb` lets existing elevation levels keep their opacity while adopting the theme's undertone.

Pink is the reference palette: deep berry `#a9275d`, warm blush `#f7e8ee`, porcelain `#fff9fb`, charcoal plum `#241b20`, muted mauve gray `#75676e`, and rose-gray dividers `#e8d9df`. The other five themes use the same tonal relationships with their own hue.

## CSS behavior

The global page gradient, fixed user shell, cards, soft panels, bottom navigation, dividers, and shadows consume semantic variables. Theme changes continue to flow through `getThemeCssVariableRecord`, `UserShell`, and `ThemeMetaUpdater`; no new client state or persistence behavior is introduced.

Hard-coded semantic colors such as danger, warning, and information remain independent of theme. White-on-primary hero content and existing Lucide icons are preserved because they match the selected visual and current product language.

## Accessibility and responsive requirements

- Body text keeps strong contrast against every canvas and surface.
- Muted text remains readable at small mobile sizes.
- White button and hero text must remain readable against each primary color.
- Focus rings, selected navigation, and branded borders remain visible without relying on color alone.
- The dashboard must remain free of horizontal overflow at `390 x 844`.

## Verification

- Source tests assert the expanded semantic theme contract and ensure the global canvas no longer hard-codes green.
- TypeScript, the full Vitest suite, and the production build must pass.
- The authenticated pink dashboard is captured at `390 x 844` and compared with the approved source.
- `design-qa.md` records the source, implementation capture, findings, iterations, and `final result: passed` before handoff.
