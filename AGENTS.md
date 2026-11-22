# AGENTS.md — Sheep Skate Engineering Rules

> **Scope:** Authoritative instructions for AI coding agents working on **Sheep Skate**. Keep this file concise (`< 2,500` tokens); deep specifications live in `docs/`.

---

## 1. Tech Stack & Project Status

- **Current Baseline:** Single-file HTML/CSS/ES module ([`index.html`](index.html), 1,164 lines, zero build step). Imports `three@0.164.1` (`OrbitControls`, `RoundedBoxGeometry`, `BufferGeometryUtils.mergeGeometries`, `RoomEnvironment`) via unpkg importmap, plus procedural Canvas2D textures, synthesized Web Audio (`Sfx`), and a projected DOM HUD.
- **Target Architecture (Phases 0–1):** Vite + TypeScript (`strict`, `exactOptionalPropertyTypes`), local `three` + `@types/three`, Vitest (`src/sim/` + `src/editor/`), Playwright (WebGL/UI smoke), ESLint + Prettier, Zod (park JSON import validation).

---

## 2. Tagged Core Principles

Reference these tags in reasoning and PR notes when trade-offs arise:

1. **`[CLARIFY]`**: Ask before changing physics feel, camera projection, or adding external dependencies/assets.
2. **`[SIMPLICITY]`**: Choose the smallest solution solving today's phase; never build speculative abstractions.
3. **`[DETERMINISM]`**: Simulation math must be pure, seedable, and independent of display refresh rate (`60Hz` vs `144Hz`).
4. **`[PERF-BUDGET]`**: Zero per-frame heap allocations in hot loops; bound draw calls, triangles, and GPU memory.
5. **`[SECURITY]`**: Treat custom names, imported park JSON, and URL params as untrusted; never interpolate into `innerHTML`.
6. **`[TEST-FIRST]`**: Write deterministic unit tests for `src/sim/` and command-stack logic before modifying rules or tricks.

---

## 3. Rule Hierarchy

### Critical Rules (Never Violate)
- **Zero Hot-Loop Allocations:** Never call `new THREE.Vector3()`, `new THREE.Quaternion()`, `.clone()`, or allocate arrays inside per-frame `update()`, `frame()`, `ride()`, `grindStep()`, or `placeBubble()`. Use module-scoped `_v3A`, `_v3B`, `_qA` scratch variables.
- **Explicit GPU Lifecycle:** Dispose every dynamically created `BufferGeometry`, `Material`, or `CanvasTexture` on permanent entity/prop deletion, and share pooled geometry/material registries (`GEO`, `MAT`) instead of cloning per instance.
- **XSS-Safe DOM Updates:** Never use `element.innerHTML = ...` with dynamic strings (`sheep.name`, park titles, trick labels). Use `textContent` or pre-built static `<span>`/`<b>` child nodes.
- **Simulation Isolation (Target `src/sim/`):** `src/sim/` **must never** import `three`, `window`, `document`, or Web Audio APIs. Communicate with `src/render/` and `src/audio/` via plain numeric snapshots and typed domain events.
- **Validate External Input:** Every imported park JSON file or URL state payload must be validated with a strict Zod schema (finite numbers, bounded array lengths, valid enum states) before touching scene state.
- **No Unpinned Production CDNs / No Secrets:** Bundle `three` locally once Vite is introduced; never commit API keys or secrets.

### Important Rules (Follow Unless Justified)
- **World Coordinate Contract:** Y-up, `1` world unit `= 1` m. Sheep heading `0` faces `+Z` (`dx = Math.sin(heading)`, `dz = Math.cos(heading)`). Island bounds are `IW = 26`, `IH = 18`, player clamp `|x| <= 12.1`, `|z| <= 8.1`.
- **State Machine & Undo Invariants:** Removing or resetting an entity **must** clear transient sub-states (`onRail`, `inAir`, `pending`, `grind`), and `Command.undo()` must restore both `state` and any required sub-struct (e.g., calling `startGrind()` or restoring saved snapshot—never leave `state === 'grind'` with `grind === null`).
- **Bounded Command History:** Cap `history` and `future` stacks (target `<= 100` entries) and store lightweight snapshots or dispose evicted entity GPU resources when dropped.
- **Ref-Counted Continuous Audio:** Continuous loops (`hiss`, wheel roll) must use an active-count or voice ID map and anchor gain ramps with `setValueAtTime` before `linearRampToValueAtTime` so multiple sheep grinding cannot cut each other off or click.
- **Module Size:** Keep source files under `300` lines; split cleanly across `sim`, `render`, `audio`, `ui`, `editor`, and `shared`.

### Preferences (Default Behavior)
- Use explicit return types on exported functions, `named exports` over `default`, and `@/` path alias once `tsconfig.json` is added.
- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `perf:`).

---

## 4. Concrete Code Examples

### Scratch Vectors in Hot Loops (`index.html` `L885-L886`, `L963`)

**DO: Reuse module-scoped scratch vectors**
```typescript
const _fw = new THREE.Vector3();
const _rt = new THREE.Vector3();

function steerRelativeToCamera(camera: THREE.Camera, f: number, r: number): [number, number] {
  camera.getWorldDirection(_fw);
  _fw.y = 0;
  _fw.normalize();
  _rt.set(-_fw.z, 0, _fw.x);
  return [_fw.x * f + _rt.x * r, _fw.z * f + _rt.z * r];
}
```

**DON'T: Allocate `Vector3` or `.clone()` every animation frame**
```typescript
// BAD: Triggers GC spikes every frame during ride() or placeBubble()
const fw = new THREE.Vector3();
camera.getWorldDirection(fw);
const [x, y] = toScreen(b.s.pos.clone().setY(b.s.y + 1.35));
```

### Safe DOM Tag Updates (`index.html` `L1053`)

**DO: Update static child nodes via `textContent`**
```typescript
// Pre-build <b></b><span></span> inside #tag once at init
tagNameEl.textContent = sheep.name;
tagMetaEl.textContent = ` · 0.72 × 1.02 m · ${dist.toFixed(0)} m away`;
```

**DON'T: Interpolate dynamic names into `innerHTML`**
```typescript
// BAD: XSS vector if sheep.name becomes user-editable or loaded from JSON
tagEl.innerHTML = `<b>${s.name}</b> · 0.72 × 1.02 m · ${dist.toFixed(0)} m away`;
```

### Undo/Redo Grind State Invariant (`index.html` `L909`, `L1017`)

**DO: Restore complete valid state on `undo()`**
```typescript
// If removing a grinding sheep, either restore its state to 'cruise'/'idle'
// or re-initialize grind pathing in undo() via addSheep(s) + s.startGrind().
undo: () => {
  addSheep(s);
  if (wasGrinding) s.setState('grind');
}
```

**DON'T: Leave `state === 'grind'` with `grind === null`**
```typescript
// BAD: removeSheep() calls exitGrind() (setting grind = null) but keeps state = 'grind',
// causing grindStep() to throw TypeError on undo.
removeSheep(s); // s.grind is now null, s.state is still 'grind'
```

---

## 5. Commands

### Current Prototype (`index.html` only)
```bash
# Serve locally for ES modules + importmap (fast)
npx serve .
# Syntax check inline <script type="module"> after edits (Windows PowerShell)
node -e "const fs=require('fs'),h=fs.readFileSync('index.html','utf8');new (require('vm').Script)(h.match(/<script type=\"module\">([\s\S]*?)<\/script>/)[1]);"
```

### Target Tooling (Once Phase 0 Initializes Vite/TS)

**File-Scoped Commands (Preferred — Fast)**
```bash
npx tsc --noEmit                         # Fast project typecheck
npx eslint src/sim/sheepSim.ts           # Lint single edited file
npx vitest run tests/sim/tricks.test.ts  # Run single unit test file
```

**Project-Wide Commands (Expensive — Run Before PR or Ask First)**
```bash
npm run build                            # Full Vite production bundle
npm test                                 # Full Vitest suite
npm run test:e2e                         # Headless Playwright WebGL smoke suite
```

---

## 6. Context Map

- **Gameplay & Mechanics:** [Game Design](docs/GAME_DESIGN.md)
- **Scene Graph, Physics & Perf:** [3D Architecture](docs/3D_ARCHITECTURE.md)
- **Palette, Shaders, UI & Web Audio:** [Art & Audio Direction](docs/ART_AND_AUDIO_DIRECTION.md)
- **Known Bugs & Phased Roadmap:** [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- **AI Workflows, Prompts & QA:** [Agentic Workflows](docs/AGENTIC_WORKFLOWS.md)
- **Architecture Decisions:** [ADR Index](docs/adr/README.md)

---

## 7. When Stuck

Stop and ask before: altering physics constants (`G`, `vy`, rail capture thresholds), splitting `index.html` in a way that breaks live visual parity, introducing runtime libraries beyond `three` and `zod`, or changing the world coordinate frame.
