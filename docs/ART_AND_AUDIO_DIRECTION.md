# Art, UI & Audio Direction — Sheep Skate

> **Aesthetic:** *Sunlit Storybook Diorama* meets *Crisp Design-Tool Toybox*.

---

## 1. Visual Identity & Artistic Pillars

1. **Painterly Pastel Warmth:** Daylight palette anchored in warm cream parchment (`#f6f1e7` → `#e5dccb`), mossy meadow greens, honey dirt paths, and soft matte pastel skateboards—never harsh neon or muddy brown shadows.
2. **Tactile Miniature Scale:** Beveled soil edges (`bevelThickness: 0.14`), floating diorama floor drop shadow (`y = -3.2`), grass blade fringes around the island perimeter, and physical wool sheen (`sheen: 1`, `#fff4e0`) evoke an illustrated tabletop model.
3. **Figma-Like Editor Precision:** Frosted translucent UI cards (`backdrop-filter: blur(14px)`), `1.5 px` cobalt selection frame (`#3b82f6`) with crisp square corner handles, live metric dimension tag (`0.72 × 1.02 m`), and spring-physics sliding pills.

---

## 2. Design Tokens & Material Palette

### CSS Design System Tokens (`index.html` `L11-L20`)

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--bg-1` / `--bg-2` | `#f6f1e7` / `#e5dccb` | Radial sky/tabletop canvas backdrop (`50% 38%`) |
| `--ink` / `--muted` | `#2b2622` / `#81776b` | Warm espresso primary text & taupe secondary hints |
| `--panel` / `--panel-line` | `rgba(255,253,249,.86)` / `rgba(60,45,30,.10)` | Translucent frosted HUD, brand chip, floating toolbar |
| `--pill` | `#ebe6dc` | Active state capsule inside `#bar` segmented control |
| `--accent` / `--accent-soft` | `#3b82f6` / `rgba(59,130,246,.16)` | Selection box `#sel`, `#tag`, ground click markers, `selRing` |
| **Combo / Riding Coral** | `#ff7a59` | `.combo` multiplier pill and active `.riding` badge |
| **Pop Gold / Danger** | `#ffd35c` / `#d9463b` | `.pop.big` combo text / delete hover state |
| `--spring` | `cubic-bezier(.34,1.56,.64,1)` | Overshoot springs on selection, score bump, toolbar, pill slide |
| `--out` | `cubic-bezier(.2,.8,.2,1)` | Smooth deceleration on button presses, pop rises, tooltips |

### 3D PBR Materials & Palette (`index.html` `L235-L647`)

| Element | Material / Hex Palette | Finish |
| :--- | :--- | :--- |
| **Sheep Wool** | `MeshPhysicalMaterial` (`#ffffff`, `vertexColors`, `roughness: 1`, `sheen: 1`, `sheenRoughness: .55`, `sheenColor: #fff4e0`) | Fluffy rim-lit matte fleece |
| **Sheep Face & Hooves** | `MeshStandardMaterial` (`#3a2f2b`, `roughness: .65`); Cheeks `#ff9fb4` | Warm chocolate skin with blush |
| **Skateboard Decks (`BOARD_COLORS`)** | `#ff8fa3`, `#6fd0b4`, `#ffd166`, `#a59cf5`, `#7cc6fe`, `#ff9f68`, `#c3e88d` (`roughness: .55`) | 7 pastel candy-coat decks (shared `deckMats`) |
| **Grip / Trucks / Wheels** | `#3f3d48` (`r: .95`) / `#bcc1cc` (`metalness: .7, r: .35`) / `#f5ecd6` (`r: .5`) | Charcoal tape, satin aluminum, urethane cream |
| **Concrete Plaza & Art** | `#e3dccd` slab, `"BAA"` circle `rgba(255,143,163,.30/.55)`, curb `#ffd166` | Sun-warmed cream concrete |
| **Coral Rail & Coping** | `#ff8c7a` (`r: .35, metalness: .25`) / `#c9ced8` (`metalness: .85, r: .3`) | Painted steel rail & brushed ramp coping |
| **Quarter Pipes & Funbox** | `#9fd8c6` (mint), `#f6c9a0` (apricot), `#b8b0f2` (lavender), `r: .7–.75` | Toy-block pastel ramps |
| **Pond Water & Lily Pads** | `MeshPhysicalMaterial` (`#7fb9ea`, `opacity: .35`, `roughness: .06`, `clearcoat: 1`) / `#6aa83f` | Glossy clearcoat over painted blue gradient |

---

## 3. Typography, Motion & HUD Chrome

- **Font Pairing:**
  - **Display (`Fredoka`, 500/600/700):** Brand title (`16 px`), score counter (`20 px`, `tabular-nums`), speech bubbles (`14 px`), floating trick pop text (`20 px` / `26 px` with `5 px` `#2b2622` outer stroke via `paint-order: stroke fill`), and painted `"BAA"` plaza stencil.
  - **UI Body & Shortcuts (`Inter`, 450/500/600):** Subtitles, `#tag` telemetry (`tabular-nums`), `#bar` buttons (`12.5 px`), tooltips (`11 px`), and `<kbd>` caps (`10.5 px` with `2 px` bottom bevel).
- **Overlays:** `.grain` (`feTurbulence` SVG noise at `0.07` opacity, `multiply`) and `.vig` (soft `rgba(90,60,30,.16)` radial corner vignette) unify the 3D WebGL render with the HTML backdrop.
- **Reduced Motion (`L98`):** `@media (prefers-reduced-motion:reduce)` collapses CSS transitions and animations to `0.01 ms`. Planned: also expose a `prefersReducedMotion` toggle to damp camera snap/shake effects.

---

## 4. Procedural Canvas2D Island Recipe (`paintIsland()` `L222-L319`)

The entire `26 × 18 m` island texture (`2048 × 1418 px`) is painted synchronously on an offscreen `<canvas>` with deterministic RNG (`rng(11)` for Voronoi patches):
1. **Voronoi Field Patches (Half-Res `1024 × 709`):** 15 seeds warped by `sin`/`cos` domain distortion across 9 sage/meadow/golden tones (`seeds[2]` pinned golden bottom-right); edges `< 2.6 px` darken into `#3e762c` hedge borders.
2. **Painterly Grass Strokes:** 16,000 short angled strokes across 5 translucent green strokes (`lineWidth: 1.4–2.6`).
3. **Dirt Paths:** 3 cubic Bezier trails (`#d8bf8a` base + `#e8d6a8` highlight center + mossy edge).
4. **Wildflowers:** 1,400 tiny scattered dots (`#f6dc5e`, `#fff8e0`, `#f7b6c8`, `#ffffff`).
5. **Pond & Reeds:** Sandy bank (`#d9c58f`), radial blue water gradient, 18 highlight ripples, and 90 perimeter reed strokes.
6. **Concrete Plaza:** Rounded rectangle clipped with 9,000 subtle concrete speckles, `2.2 m` expansion joint gridlines, painted `"BAA"` emblem, and dashed yellow curb near the rail.
7. **Perimeter Grass Fringe:** Walks the rounded-rectangle boundary (`step = 2 px`) painting outward tufts so the top plane blends seamlessly over the extruded soil slab.

---

## 5. Procedural Web Audio Specification (`Sfx` `L521-L552`)

All sound effects are synthesized zero-asset via Web Audio API (`master` gain `0.55`, unlocked on first pointer/keyboard gesture):

| Voice | Method / Synthesis Recipe | Parameters / Pitch | Trigger |
| :--- | :--- | :--- | :--- |
| **`pop()`** | Sine sweep | `420 -> 980 Hz`, `0.09 s`, vol `0.2` | Select, duplicate, undo-add |
| **`tick()`** | Triangle blip | `1500 -> 1100 Hz`, `0.035 s`, vol `0.05` | Toolbar clicks, `goto` marker, undo/redo |
| **`whoosh()`** | Bandpass noise (`Q=1.2`) | `500 -> 2400 Hz`, `0.24 s`, vol `0.2` | Trick launch (`ollie`, `kickflip`, `spin`, `grindpop`) |
| **`land()`** | Low sine thump + lowpass noise | `150 -> 55 Hz` (`0.13 s`) + noise `1400 -> 400 Hz` | Ground touchdown |
| **`clank()`** | Square + triangle metallic ping | `1900 -> 1500 Hz` (`0.12 s`) + `2700 -> 2200 Hz` (`0.2 s`) | Locking onto rail (`landRail`) |
| **`bonk()`** | Triangle knock | `520 -> 260 Hz`, `0.12 s`, vol `0.14` | Knocking traffic cones |
| **`poof()`** | Lowpass noise + sine drop | `1600 -> 250 Hz` (`0.32 s`) + `320 -> 110 Hz` | Deleting a sheep |
| **`ding()`** | Dual harmonic triangle chime | `880 Hz` (`0.09 s`), then `1320 Hz` (`0.16 s`, `+0.07 s`) | `combo > 2` or `Boardslide` |
| **`baa(p)`** | Sawtooth + `7.5 Hz` LFO (`±7%`) through 3 bandpass formants | `f = (250..340) * p`, formants `800/1450/2600 Hz` (`Q=3/4/6`) | Select/re-click sheep, sky drop landing |
| **`startHiss()` / `stopHiss()`** | Looped white noise -> highpass `2600 Hz` | Target gain `0.06` (`0.05 s` fade in, `0.08 s` fade out) | Continuous metal grind slide |

### Planned Audio Engineering Upgrades (Phases 0–4)
1. **Fix Continuous Hiss Ref-Counting (`Phase 0`):** Track active grinding sheep count/IDs (`activeGrinders: Set<string>`). Only start one loop when `size: 0 -> 1` and stop when `size: 1 -> 0`; always call `gain.setValueAtTime(gain.value, now)` before `linearRampToValueAtTime` to prevent Web Audio clicks or stuck nodes.
2. **Surface-Aware Rolling Wheels (`Phase 4`):** Continuous bandpass-filtered noise modulated by `selected.speed` (crisp clack-roll on `PLAZA` concrete vs muffled rustle on grass).
3. **Stereo Panning (`Phase 4`):** Route spatial impacts (`clank`, `bonk`, `baa`) through `StereoPannerNode` derived from camera-space `ndc.x` (`clamp(ndcX, -0.8, 0.8)`).
4. **Pastoral Ambient Bed (`Phase 4`):** Ultra-subtle wind rustle + distant bird chirp generator toggleable via mute control.

---

## 6. Accessibility & Responsive Mobile UX

- **Current Responsive Breakpoint (`L97`):** Below `720 px` width, `.hint` hides secondary `.opt` hints and `.brand small` subtitle so the HUD remains unobstructed.
- **Planned Mobile Controls (`Phase 3`):**
  - Left-thumb floating virtual steering stick mapped into the same `InputFrame` (`moveX`, `moveY`) used by `WASD`.
  - Right-thumb compact arc for **Ollie**, **Flip**, **360**, and **Grind** so tricks work without keyboard shortcuts.
- **Accessibility Standards:**
  - Every icon button carries `aria-label` and `role="toolbar"`; add `aria-pressed` on mute/mode toggles and an `aria-live="polite"` region announcing trick scores (`"Boardslide 300 times 2"`) without spamming screen readers on rapid ticks.
  - Ensure `canvas` keeps `tabindex="0"` and clear `:focus-visible` outlines on interactive buttons.
