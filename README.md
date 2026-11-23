# Sheep Skate

A 3D pastoral skatepark diorama, interactive flock toybox, and park editor in the browser — built with React Three Fiber, procedural Canvas2D textures, and synthesized Web Audio.

Select any skating sheep on the floating island to ride, pop flip tricks, grind rails, customize decks, build your own park layout, dial through seasons and weather, and share creations via JSON or URL.

---

## Requirements

- **Node.js** `^20.19.0` or `>=22.12.0` (required by Vite 8) and **npm**
- **WebGL2-capable browser** (click anywhere once to unlock Web Audio)
- **Google Chrome** *(optional)* — only needed to run the headless screenshot script (`scripts/shot.mjs`)

---

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite dev server on port `5173` (auto-opens browser) |
| `npm run typecheck` | Run strict TypeScript checking (`tsc --noEmit`) |
| `npm run build` | Typecheck and build the production bundle into `dist/` |
| `npm run preview` | Serve the production `dist/` build locally |
| `node scripts/shot.mjs [url] [out.png] [waitMs]` | Capture a `1400×850` screenshot in Chrome (defaults: `http://localhost:5173/`, `shot.png`, `6000`) |

### URL Parameters

- `?demo` — skip the title screen and auto-select the first sheep
- `?skipTitle=1` — jump straight past the title screen
- `?fx=0` — disable post-processing (useful on low-end GPUs or when debugging)
- `?fxlist=ao,tilt,bloom,smaa,vig` — enable a specific subset of post-processing passes
- `?park=<data>` — load a shared park layout directly from a link

---

## Features

- **Skating & Combos:** Select any sheep to send it rolling (`goto`), ride with `WASD`/Arrows, pop Ollies, Kickflips, 360s, rail Boardslides, and bonk cones — chaining tricks within `2.4 s` up to a `×5` multiplier.
- **Park Builder:** Toggle Build Mode (`B`) to place, glide-move, rotate in `45°` steps, `0.5 m` grid-snap, duplicate, or delete ramps, rails, ledges, cones, benches, and trees, backed by 100-step undo/redo.
- **Deck Studio:** Customize any sheep's skateboard across 4 pooled 3D shapes (`Street`, `Cruiser`, `Old School`, `Pintail`) and 8 procedural Canvas2D deck artworks.
- **Seasons & Weather:** Switch or auto-cycle Spring, Summer, Autumn, and Winter alongside Clear, Rain, Snow, and Fog — dynamically shifting lighting, foliage, snow cover, icy plaza slide, and wet riding drag.
- **Save & Share:** Auto-saves to `localStorage`, exports/imports validated `.json` park files, and copies compact `?park=...` share links.
- **Procedural Audio & Hybrid Art:** Synthesized Web Audio sound effects (no external audio files), 3K procedural Canvas2D pasture with derived normals, CC0 PBR concrete/plywood/dirt, PCSS soft shadows, and ACES post-processing.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Build & Language** | Vite 8, TypeScript 7 (`strict`), React 19 |
| **3D Engine** | Three.js, `@react-three/fiber` 9, `@react-three/drei` 10 |
| **Post-Processing** | `@react-three/postprocessing` 3 + `postprocessing` (N8AO, TiltShift2, Bloom, ACES Filmic, HueSaturation, SMAA, Vignette) |
| **State** | Zustand 5 (HUD & app lifecycle; simulation runs imperatively in a single `useFrame` loop) |
| **Audio & Textures** | Procedural Web Audio API (`src/game/sfx.ts`), Canvas2D procedural bakes + CC0 Poly Haven PBR maps |
| **Visual Checks** | `playwright-core` (`scripts/shot.mjs`) |

---

## Controls

### Camera & Selection

| Input | Action |
| :--- | :--- |
| **Left-click sheep / piece** | Select entity (re-click selected sheep to bounce & *baa*) |
| **Double-click sheep** | Trigger a `360` spin trick |
| **Left-click ground** *(sheep selected)* | Send sheep to clicked spot; click outside island to deselect |
| **Left-drag / Scroll** | Orbit camera and zoom (`12–70 m`) |

### Skating *(sheep selected)*

| Key | Action |
| :--- | :--- |
| `W A S D` / Arrow keys | Ride with camera-relative steering |
| `Space` / `F` / `E` | Ollie / Kickflip / 360 Spin |
| `1` / `2` / `3` | Switch behavior: Idle / Cruise / Grind rail |
| `C` | Cycle board shape |

### Park Builder *(Build Mode or piece selected)*

| Key / Input | Action |
| :--- | :--- |
| `B` | Toggle Build Mode |
| `1`–`6` *(Build Mode)* | Quick-arm Ramp, Rail, Ledge, Cone, Bench, or Tree |
| `Shift` + Click | Multi-place armed piece |
| `G` or Drag piece | Move selected piece |
| `Q` / `[` and `R` / `E` / `]` | Rotate piece `-45°` / `+45°` |
| `W A S D` / Arrows *(piece selected)* | Nudge piece by `0.5 m` |
| Hold `Alt` | Snap placement or movement to `0.5 m` grid |
| Right-click / `Esc` | Cancel placement or move |

### Global

| Key | Action |
| :--- | :--- |
| `N` | Drop a new sheep onto the island |
| `M` | Mute / unmute audio |
| `H` / `?` | Open or close the How to Play guide |
| `Ctrl/Cmd + D` | Duplicate selected sheep or piece |
| `Delete` / `Backspace` | Remove selected sheep or piece |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` / `Ctrl/Cmd + Y` | Redo |
| `Esc` | Cancel active tool, deselect, or close Build Mode |

---

## Project Structure

```text
src/
├── App.tsx           # Canvas setup, URL parameters, park auto-load, and phase wiring
├── game/             # Imperative sim, world orchestrator, sheep, boards, props, weather, SFX, stores
├── scene/            # React Three Fiber scene components (Island, Flock, Props, Sky, Stage, WeatherFX)
└── ui/               # React HUD, Build palette, Deck Studio popover, Season dial, Title & How-to-Play overlays
public/
├── art/              # Title screen artwork
└── textures/         # CC0 PBR textures (concrete, plywood, dirt)
scripts/
└── shot.mjs          # Headless Chrome screenshot utility
prototype/
└── index.html        # Archived original single-file Three.js prototype
docs/                 # Design specs, 3D architecture, art/audio direction, roadmap, and ADRs
```

---

## Documentation

| Document | Purpose |
| :--- | :--- |
| [`AGENTS.md`](AGENTS.md) | Engineering rules, coordinate contract, hot-loop guardrails, and commands |
| [`agentic.md`](agentic.md) | Atomic step-by-step commit protocol |
| [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) | Design pillars, core loops, sheep state machine, and trick/combo math |
| [`docs/3D_ARCHITECTURE.md`](docs/3D_ARCHITECTURE.md) | Scene graph, transform hierarchy, module boundaries, and perf budgets |
| [`docs/ART_AND_AUDIO_DIRECTION.md`](docs/ART_AND_AUDIO_DIRECTION.md) | Palette, shaders, procedural texture bakes, and Web Audio synthesis |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Bug/tech-debt ledger and phased roadmap |
| [`docs/AGENTIC_WORKFLOWS.md`](docs/AGENTIC_WORKFLOWS.md) | Development workflows, test pyramid, and pre-PR checklist |
| [`docs/adr/README.md`](docs/adr/README.md) | Architecture Decision Records (`ADR-0001`–`ADR-0005`) |

---

## Credits

PBR textures in [`public/textures/`](public/textures/) are CC0 from [Poly Haven](https://polyhaven.com): *Smooth Concrete Floor*, *Plywood*, and *Dirt*.
