# ADR-0004: React Three Fiber + Vite + TypeScript Stack

- **Status:** Accepted
- **Date:** 2026-11-22
- **Amends:** [ADR-0003](0003-dom-projected-editor-hud.md) (HUD is still a projected DOM overlay, now rendered by React)

---

## Context

The single-file prototype (`prototype/index.html`) proved the look and feel, but rendering quality was capped by what could be hand-written inline: no ambient occlusion, no tilt-shift miniature depth of field, and hard-to-maintain UI wiring. We want a framework that makes a high-end render pipeline and a growing editor UI cheap to build.

## Decision

Use **Vite + TypeScript + React 19 + @react-three/fiber**, with **@react-three/drei** (soft PCSS shadows, Lightformer environment, texture loading) and **@react-three/postprocessing** (N8AO, TiltShift2, Bloom, ACES tone mapping, SMAA, Vignette). UI state that React needs lives in a small **zustand** store.

Simulation stays **imperative**: `src/game/sheep.ts` and `src/game/world.ts` own their Three.js objects and mutate them in a single `useFrame`. React never re-renders per frame; the projected selection frame, label and toolbar position are written straight to DOM refs.

## Alternatives considered

- **Vanilla Three.js + TypeScript** (the original Phase 0 plan): fewer dependencies, but we would re-implement PCSS, AO and post chains by hand.
- **Babylon.js / PlayCanvas**: capable engines, but a heavier mental model and less idiomatic for a DOM-heavy editor UI.

## Consequences

- `npm run dev` / `npm run build` replace the importmap workflow; `three` is a local dependency.
- Postprocessing requires `<Canvas flat>` and a `ToneMapping` effect (the composer bypasses renderer tone mapping).
- Expensive procedural bakes must be memoised outside React (`baked()` in `textures.ts`), because Suspense retries re-run render bodies.
- `?fx=0` disables the post stack for low-end devices.

## Revisit when

- The sim needs to run headless for tests/replays: extract the pure math from `Sheep` into `src/sim/` per ADR-0002.
