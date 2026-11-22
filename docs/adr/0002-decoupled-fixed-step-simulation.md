# ADR-0002: Decoupled Pure Simulation & Fixed 60Hz Timestep

- **Status:** Accepted
- **Date:** 2026-11-22

---

## Context

In the initial prototype ([`index.html`](../../index.html)), the `Sheep` class directly owns Three.js `THREE.Group` transforms (`root`, `lean`, `air`, `board`, `rider`), fires `Sfx.*` audio methods, reads global `keys`, calls DOM `syncBar()` / `award()`, and integrates movement/gravity using clamped variable `dt` (`Math.min(clock.getDelta(), 1/30)`).

This tight coupling creates three concrete problems:
1. **No headless testing:** Simulating a trick, combo, or grind requires spinning up WebGL, Canvas, and DOM globals.
2. **Refresh-rate physics drift:** Variable Euler steps (`vy -= G * dt; y += vy * dt`) yield slightly different jump heights and rail catch windows between `60Hz`, `120Hz`, and `144Hz` displays.
3. **Undo/Lifecycle bugs:** Deleting a grinding sheep calls `exitGrind()` on the live object, corrupting subsequent undo restoration (`BUG-01` in [Implementation Plan](../IMPLEMENTATION_PLAN.md)).

---

## Decision

Separate simulation cleanly from rendering, audio, and UI:
1. Extract all physics, state transitions, grind paths, cone springs, scoring, and obstacle collision into **`src/sim/`** as pure TypeScript with **zero** `three`, `DOM`, or `Web Audio` imports.
2. Advance `src/sim/` on a **fixed `1/60 s` (`60Hz`) timestep accumulator** (`dt` clamped `<= 0.1 s`), emitting typed domain events (`TrickLanded`, `RailCaught`, `ConeBonked`, `SheepBaaed`) and storing previous/current state snapshots so `src/render/` interpolates smoothly at any monitor refresh rate (`alpha = accumulator / FIXED_DT`).

---

## Alternatives Considered

1. **Keep Unified `Sheep` Class with Variable `dt`:**
   - *Rejected:* Makes automated trick/physics regression tests brittle, allows per-frame allocation bugs and DOM coupling to creep back in, and causes display-dependent physics variance.
2. **Adopt a Full 3D Rigid-Body Engine (e.g., Rapier / Cannon-es):**
   - *Rejected (`[SIMPLICITY]`):* Adds ~1–2 MB WASM/JS weight and makes arcade skate feel (snappy rail catches, `0.09 s` crouch wind-ups, clean `easeIO` kickflip/360 arcs, guaranteed ground landings) harder to tune than direct parametric skate kinematics.

---

## Consequences & Trade-Offs

- **Pros:**
  - `src/sim/` tests execute in `< 10 ms` per test in Node/Vitest without WebGL mocks.
  - Identical trick trajectories, combo windows (`2.4 s`), and rail timing across `60Hz`/`120Hz`/`144Hz` devices.
  - Serializable pure-data snapshots simplify bounded Undo/Redo (`CommandStack`) and Zod-validated JSON save/load.
- **Cons / Mitigations:**
  - Requires maintaining an explicit state-to-mesh sync mapping in `src/render/sheepView.ts` and ensuring smooth `alpha` angle wrapping (`wrapA`) during interpolation.

---

## Revisit Triggers

Re-evaluate external rigid-body physics only if Sheep Skate evolves into full freeform multi-body ragdoll physics or stacked destructible multi-prop towers beyond parametric skate surfaces.
