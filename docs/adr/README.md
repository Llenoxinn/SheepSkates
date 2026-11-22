# Architecture Decision Records (ADRs) — Sheep Skate

This directory records major architectural decisions for **Sheep Skate**, capturing context, rejected alternatives, trade-offs, and explicit triggers for revisiting each decision.

---

## Status Legend

- **Proposed:** Under discussion; not yet implemented.
- **Accepted:** Active architectural standard enforced across the codebase.
- **Superseded:** Replaced by a newer ADR (linked in header).

---

## ADR Index

| ID | Title | Status | Summary |
| :--- | :--- | :--- | :--- |
| [ADR-0001](0001-procedural-diorama-zero-external-assets.md) | Procedural 3D Diorama with Zero External Assets | Amended by 0005 | Generate all meshes, Canvas2D textures, and Web Audio SFX procedurally in code |
| [ADR-0002](0002-decoupled-fixed-step-simulation.md) | Decoupled Pure Simulation & Fixed `60Hz` Timestep | Accepted | Isolate pure TypeScript sim (`1/60 s`) from Three.js render interpolation and DOM UI |
| [ADR-0003](0003-dom-projected-editor-hud.md) | Projected HTML/CSS DOM Overlay for Editor HUD | Amended by 0004 | Project 3D bounds to HTML/CSS chrome instead of WebGL canvas UI |
| [ADR-0004](0004-react-three-fiber-stack.md) | React Three Fiber + Vite + TypeScript Stack | Accepted | R3F + drei + postprocessing render pipeline; imperative sim driven from one `useFrame` |
| [ADR-0005](0005-hybrid-procedural-and-cc0-textures.md) | Hybrid Procedural + CC0 PBR Textures | Accepted | Painted procedural look plus derived normals and small CC0 Poly Haven PBR sets |

---

## New ADR Template

Copy this structure when proposing `docs/adr/NNNN-short-kebab-title.md`:

```markdown
# ADR-NNNN: Short Title

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD

## Context
What problem, constraint, or technical tension triggered this decision?

## Decision
What concrete choice are we making?

## Alternatives Considered
What other options were evaluated and why were they rejected?

## Consequences & Trade-Offs
What becomes easier, harder, or constrained because of this choice?

## Revisit Triggers
Under what exact future condition should this decision be re-evaluated?
```
