# Sheep Skate

A cozy-tactile 3D pastoral skatepark diorama, interactive toybox, and skatepark editor built with procedural Three.js geometry, Canvas2D painterly textures, and synthesized Web Audio.

---

## Project Vision

**Sheep Skate** fuses a storybook watercolor pasture with responsive street-skate physics and Figma-style direct manipulation. Select any skating sheep on the floating island to inspect, direct, ride via keyboard, pop flip tricks, grind the rail, knock over traffic cones, or populate the park with new pastel-decked flockmates.

Today's repository hosts a self-contained single-file ES module prototype ([`index.html`](index.html), 1,164 lines, zero build step, zero external texture/model/audio assets). This documentation suite establishes the architecture, game design, art/audio direction, engineering standards, and phased roadmap to evolve the prototype into a modular TypeScript + Three.js interactive skatepark game and editor.

---

## Quick Start

Because `index.html` uses browser-native `<script type="importmap">` loading `three@0.164.1`, serve the project root over HTTP rather than opening via `file://`:

```bash
# Option 1: Node.js static server
npx serve .

# Option 2: Python built-in HTTP server
python -m http.server 8000
```

Then open `http://localhost:3000` (for `serve`) or `http://localhost:8000` (for Python) in any modern WebGL2-capable browser. Click or press any key once inside the viewport to unlock the Web Audio API synthesizer.

> **Target Tooling (Planned in Phase 0):** Once TypeScript + Vite are initialized per [the Implementation Plan](docs/IMPLEMENTATION_PLAN.md), development will run via `npm run dev`, `npm test`, and `npm run build`.

---

## Controls & Keyboard Shortcuts

| Input | Context | Action |
| :--- | :--- | :--- |
| **Left-click sheep** | Any | Select sheep (re-click selected sheep to bounce & *baa*) |
| **Double-click sheep** | Any | Trigger a `360` spin trick |
| **Left-click ground** | Sheep selected | Send selected sheep (`goto`) to clicked point; clicking outside island deselects |
| **Left-drag / Scroll** | Canvas | Orbit camera (`OrbitControls`, pan disabled) and zoom (`12–70` m) |
| **`W A S D` / Arrow keys** | Sheep selected | Enter `ride` mode with camera-relative steering |
| **`Space`** | Sheep selected | **Ollie** (`+50` base pts) |
| **`F`** | Sheep selected | **Kickflip** (`+150` base pts) |
| **`E`** | Sheep selected | **360 Spin** (`+200` base pts) |
| **`1` / `2` / `3`** | Sheep selected | Switch behavior state: **Idle** / **Cruise** / **Grind the rail** |
| **`N`** | Global | Drop a new sheep from the sky onto a clear spot |
| **`M`** | Global | Mute / unmute procedural Web Audio (`Sfx`) |
| **`Ctrl/Cmd + D`** | Sheep selected | Duplicate selected sheep (`dupSel`) |
| **`Delete` / `Backspace`** | Sheep selected | Remove selected sheep with puff effect (`delSel`) |
| **`Ctrl/Cmd + Z`** | Global | Undo last add, delete, duplicate, or state command |
| **`Ctrl/Cmd + Shift + Z` / `Ctrl/Cmd + Y`** | Global | Redo last undone command |
| **`Esc`** | Sheep selected | Deselect active sheep |

---

## Current Prototype vs. Planned Roadmap

| Capability | Prototype (`index.html`) | Planned Expansion |
| :--- | :--- | :--- |
| **World & Art** | Floating `26 × 18 m` procedural painterly island, concrete `"BAA"` plaza, glossy pond, 11 trees, 900 grass tufts, 3 clouds | Rideable quarter pipes & funbox, destructible/placeable pastoral props (hay bales, barn kicker, benches), LOD/instancing |
| **Sheep & Physics** | 9 initial sheep, 7 board colors, 16 names, `idle`/`cruise`/`goto`/`ride`/`grind` states, variable `dt` Euler physics | Fixed `1/60 s` physics accumulator + render interpolation, surface heightfield ramps, manuals, lip airs, flock interactions |
| **Tricks & Scoring** | Ollie, Kickflip, 360, Boardslide, Cone Bonk; `2.4 s` combo timer up to `×5` | Grabs, 50-50 / 5-0 ledge grinds, gap bonuses, trick variety decay, 2-minute **Style Jam** mode |
| **Editor & Persistence** | Select/move/state/trick toolbar, add/duplicate/delete, unbounded undo/redo | Full park obstacle placement, flock customizer, Zod-validated JSON save/load, bounded command history (`<= 100`) |
| **Audio** | 10 procedural Web Audio synth voices (`baa` formant filter, `clank`, `hiss`, `whoosh`, etc.) | Ref-counted multi-sheep rail hiss, surface-aware wheel rolling audio, stereo panning, ambient pastoral bed |

---

## Documentation Map

| Document | Purpose |
| :--- | :--- |
| [`AGENTS.md`](AGENTS.md) | Concise AI-agent constitution: rules, coordinate conventions, hot-loop guardrails, commands, and context links |
| [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) | Design pillars, core loops, sheep state machine, trick/combo math, park zones, and game modes |
| [`docs/3D_ARCHITECTURE.md`](docs/3D_ARCHITECTURE.md) | Three.js scene graph, sheep transform hierarchy, target `src/` module boundaries, physics engine, and perf budgets |
| [`docs/ART_AND_AUDIO_DIRECTION.md`](docs/ART_AND_AUDIO_DIRECTION.md) | Visual tokens, typography, procedural texture & Web Audio synthesis specs, UI motion, and mobile accessibility |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Verified `index.html` bug/tech-debt ledger and phased roadmap (Phase 0 through Phase 4) |
| [`docs/AGENTIC_WORKFLOWS.md`](docs/AGENTIC_WORKFLOWS.md) | Trust spectrum, feature/bug/refactor workflows, prompt templates, test pyramid, and pre-PR review checklist |
| [`docs/adr/README.md`](docs/adr/README.md) | Index and template for Architecture Decision Records (`0001` procedural assets, `0002` fixed-step sim, `0003` DOM HUD) |
