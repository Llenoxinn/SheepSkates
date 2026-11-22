# ADR-0003: Projected HTML/CSS DOM Overlay for Editor HUD

- **Status:** Accepted
- **Date:** 2026-11-22

---

## Context

**Sheep Skate** pairs a 3D WebGL canvas with a precision editor interface: a top brand/score HUD, a 3D-projected Figma-style selection rectangle (`#sel`), a dimension readout badge (`#tag`), a damped floating toolbar (`#bar`) with a sliding segmented pill, floating outlined score pops, speech bubbles, and a context-sensitive keyboard shortcut footer.

We must decide whether to preserve and harden this lightweight native DOM overlay or adopt a UI framework (React / Preact / Three.js `CSS2DRenderer` / WebGL canvas-drawn HUD).

---

## Decision

Retain and harden the **lightweight projected HTML/CSS DOM overlay** architecture (`src/ui/` + `src/render/overlayProjector.ts`), projecting 3D bounding corners via `Vector3.project(camera)` into CSS-positioned DOM elements with spring transitions (`--spring`), frosted glass (`backdrop-filter`), and strict `.textContent` updates.

---

## Alternatives Considered

1. **React + React Three Fiber (R3F):**
   - *Rejected (`[SIMPLICITY]`):* Pulls in heavy reconciler dependencies, encourages accidental React re-renders during `60fps` selection box tracking, and adds bundle overhead for an interface with `< 20` interactive controls.
2. **Three.js `CSS2DRenderer` / `CSS3DRenderer`:**
   - *Rejected:* Adds another full-viewport wrapper tree and struggles with viewport clamping (`clamp(..., 8, innerWidth - bw - 8)`) and damped toolbar inertia (`#bar` staying put when hovered).
3. **In-Canvas WebGL / Canvas2D UI:**
   - *Rejected:* Loses crisp sub-pixel typography (`Fredoka`/`Inter`), native `<kbd>` accessibility, ARIA `role="toolbar"` support, CSS `@media (prefers-reduced-motion)`, and effortless glassmorphism.

---

## Consequences & Trade-Offs

- **Pros:**
  - Crisp Retina text, native browser accessibility/focus rings, and instant CSS spring curves without re-implementing layout in WebGL.
  - Zero runtime UI framework overhead.
- **Cons / Mitigations:**
  - **XSS Risk (`DEBT-03`):** Current prototype uses `.innerHTML` for `#tag` and `.pop`. Enforce strict `.textContent` child-node updates via `AGENTS.md` and ESLint rules.
  - **Layout Thrashing Risk:** Reading `offsetWidth`/`offsetHeight` after writing styles in the same frame triggers forced synchronous reflows. Cache element dimensions on resize or text change, and pool floating `.pop`/`.bubble` DOM nodes instead of creating/destroying nodes on rapid combos.

---

## Revisit Triggers

Re-evaluate adopting a lightweight UI library (e.g., Preact Signals or Solid) only if the Phase 3–4 park builder grows into multi-tab inspector panels, searchable prop palettes, and complex nested modals where imperative DOM synchronization becomes error-prone.
