# ADR-0005: Hybrid Procedural + CC0 PBR Textures

- **Status:** Accepted
- **Date:** 2026-11-22
- **Amends:** [ADR-0001](0001-procedural-diorama-zero-external-assets.md)

---

## Context

ADR-0001 kept every asset procedural. Close-up views exposed flat-looking concrete, ramps and soil. We want real material relief without losing the painterly, pastel storybook look.

## Decision

- **Keep procedural** for everything that defines the style: the painted island albedo (now 3072 px wide), plaza decals, wool, trees, sheep, and all audio.
- **Derive normal maps procedurally** from the painted albedo (Sobel filter in `normalFromHeight`) so brush strokes and hedge lines catch the light; wool gets a tileable fibre/curl normal map.
- **Add a small set of CC0 1K PBR textures** from [Poly Haven](https://polyhaven.com) in `public/textures/` (~6 MB total): `smooth_concrete_floor`, `plywood`, `dirt`.
- Use their **normal + roughness maps for relief** on painted surfaces (plaza, ramps) and keep our own pastel base colours; the dirt slab uses the full set tinted by a vertex-colour gradient.

## Consequences

- Colour maps are tagged sRGB and data maps linear (`setupPbr`), with anisotropic filtering capped at 8.
- Textures are preloaded (`useTexture.preload`) and the loader overlay shows progress.
- Poly Haven assets are CC0 — no attribution required, but we credit them in the README.

## Revisit when

- Mobile GPU memory becomes a constraint: move to KTX2/Basis and drop the island bake to 2048 px.
