# ADR-0001: Procedural 3D Diorama with Zero External Assets

- **Status:** Accepted
- **Date:** 2026-11-22

---

## Context

**Sheep Skate** originated as a self-contained single-file Three.js diorama ([`index.html`](../../index.html)) featuring painted meadow fields, a concrete skate plaza, glossy pond, trees, clouds, articulated skateboarding sheep, and 10 synthesized sound effects—all without `.glb`, `.png`, or `.mp3`/`.wav` asset pipelines.

As we scale into a modular codebase (`src/`) with a park builder, custom flock cosmetics, and arcade mode, we must decide whether to replace procedural construction with imported glTF models, external PBR texture packs, and audio files, or preserve procedural generation as the core asset strategy.

---

## Decision

Keep **100% procedural asset generation** (Three.js primitive composition + `BufferGeometryUtils.mergeGeometries`, Canvas2D offscreen textures via `paintIsland()`, and synthesized Web Audio via `SfxEngine`) as the primary asset pipeline for Sheep Skate.

---

## Alternatives Considered

1. **External `.glb` Models + Texture Atlases + Sampled Audio:**
   - *Rejected for core assets:* Introduces Blender export pipelines, binary asset bloat, network loading states/spinners, CORS/bundling friction, and breaks instant parametric tinting of wool, decks, hats, and Voronoi grass patches.
2. **External Physics/Asset Pack Mix:**
   - *Rejected:* Mixes visual styles and disrupts the cohesive storybook diorama aesthetic established in [Art & Audio Direction](../ART_AND_AUDIO_DIRECTION.md).

---

## Consequences & Trade-Offs

- **Pros:**
  - Instant startup with minimal bundle payload (only JS + Three.js + optional Google Fonts fallback).
  - Deterministic, parametric customization (seedable Voronoi fields, arbitrary `BOARD_COLORS`, dynamic wool sheen, programmatic pitch-shifted *baa* formants).
  - Zero asset-loading race conditions or broken CDN binary URLs.
- **Cons / Mitigations:**
  - **Init CPU spike:** `paintIsland()` (`2048 × 1418`) and `woolGeo` generation execute synchronously at boot. Mitigate via `1024 px` mobile preset or progressive/cached canvas generation.
  - **Triangle budget:** Naive high-segment procedural spheres/icosahedrons bloat triangle counts (`~99k` tris across 11 trees, `~9.3k` tris/sheep). Mitigate via Phase 4 geometry segment tuning and `InstancedMesh` batching (see [3D Architecture](../3D_ARCHITECTURE.md)).

---

## Revisit Triggers

Re-evaluate only if we add complex skeletal character animations (e.g., articulated human riders or intricate multi-jointed animals) or licensed user-imported custom 3D prop packs where procedural CSG/primitive assembly becomes unmaintainable.
