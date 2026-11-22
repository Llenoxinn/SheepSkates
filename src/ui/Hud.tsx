import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PropKind } from '../game/props';
import { Sfx } from '../game/sfx';
import { useUI, type SheepState, type TrickType } from '../game/store';
import { overlay, world } from '../game/world';

const Icon = {
  undo: <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />,
  redo: <path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />,
  copy: <><rect width="13" height="13" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></>,
  trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />,
  plus: <path d="M5 12h14M12 5v14" />,
  build: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></>,
  move: <><path d="m5 9-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></>,
  rotL: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  rotR: <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
  save: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></>,
  load: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></>,
  share: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  reset: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>,
  sound: <><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z" /><path d="M16 9a5 5 0 0 1 0 6M19.4 18.4a9 9 0 0 0 0-12.8" /></>,
  mute: <><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z" /><path d="m22 9-6 6M16 9l6 6" /></>,
};

const PIECE_ICONS: Record<PropKind, React.ReactNode> = {
  ramp: <><path d="M4 18h16v-8h-5c-3 0-6 3-11 8Z" /><circle cx="15" cy="10" r="1.4" /></>,
  rail: <><line x1="3" x2="21" y1="10" y2="10" /><line x1="6" x2="6" y1="10" y2="18" /><line x1="18" x2="18" y1="10" y2="18" /><line x1="4" x2="8" y1="18" y2="18" /><line x1="16" x2="20" y1="18" y2="18" /></>,
  ledge: <><rect x="4" y="10" width="16" height="8" rx="2" /><line x1="4" x2="20" y1="12" y2="12" /></>,
  cone: <><path d="M12 4 7 18h10L12 4Z" /><line x1="5" x2="19" y1="18" y2="18" /><line x1="9.2" x2="14.8" y1="11.5" y2="11.5" /></>,
  bench: <><rect x="3" y="10" width="18" height="3" rx="1" /><line x1="7" x2="7" y1="13" y2="18" /><line x1="17" x2="17" y1="13" y2="18" /><line x1="7" x2="17" y1="15.5" y2="15.5" /></>,
  tree: <><path d="M12 19v-5" /><circle cx="12" cy="9" r="5" /><circle cx="8" cy="11" r="3" /><circle cx="16" cy="11" r="3" /></>,
};

const PALETTE_PIECES: { kind: PropKind; label: string }[] = [
  { kind: 'ramp', label: 'Ramp' },
  { kind: 'rail', label: 'Rail' },
  { kind: 'ledge', label: 'Ledge' },
  { kind: 'cone', label: 'Cone' },
  { kind: 'bench', label: 'Bench' },
  { kind: 'tree', label: 'Tree' },
];

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);

const STATES: { id: SheepState; label: string; tip: string }[] = [
  { id: 'idle', label: 'Idle', tip: 'Idle · 1' },
  { id: 'cruise', label: 'Cruise', tip: 'Cruise · 2' },
  { id: 'grind', label: 'Grind', tip: 'Grind the rail · 3' },
];
const TRICKS: { id: TrickType; label: string; tip: string }[] = [
  { id: 'ollie', label: 'Ollie', tip: 'Space' },
  { id: 'kickflip', label: 'Kickflip', tip: 'F' },
  { id: 'spin', label: '360', tip: 'E · or double-click' },
];

function Toolbar() {
  const selected = useUI(s => s.selected);
  const sheepSel = selected?.kind === 'sheep' ? selected : null;
  const propSel = selected?.kind === 'prop' ? selected : null;
  const moveMode = useUI(s => s.moveMode);
  const canUndo = useUI(s => s.canUndo), canRedo = useUI(s => s.canRedo);
  const fired = useUI(s => s.firedTrick);
  const segRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, w: 0, on: false });

  // slide the pill under the active state button
  useLayoutEffect(() => {
    const btn = segRef.current?.querySelector<HTMLButtonElement>(`[data-state="${sheepSel?.state}"]`);
    setPill(btn ? { x: btn.offsetLeft, w: btn.offsetWidth, on: true } : p => ({ ...p, on: false }));
  }, [sheepSel?.state, sheepSel?.id]);

  // replay the "fire" flash on the trick button that was triggered (keyboard or click)
  useEffect(() => {
    if (!fired) return;
    const b = document.querySelector<HTMLButtonElement>(`#bar [data-trick="${fired.type}"]`);
    if (!b) return;
    b.classList.remove('fire'); void b.offsetWidth; b.classList.add('fire');
  }, [fired]);

  return (
    <div
      id="bar" role="toolbar" aria-label={propSel ? 'Piece actions' : 'Sheep actions'} className={selected ? 'on' : ''}
      ref={el => { overlay.bar = el; }}
      onPointerEnter={() => { overlay.barHover = true; }} onPointerLeave={() => { overlay.barHover = false; }}
      onPointerDown={() => Sfx.unlock()}
    >
      {propSel ? (
        <>
          <button
            className={`ic-txt ${moveMode ? 'active' : ''}`}
            data-tip="Move · G or drag"
            aria-pressed={moveMode}
            onClick={() => world.toggleMoveMode()}
          >
            <Svg>{Icon.move}</Svg>Move
          </button>
          <button className="ic" data-tip="Rotate -45° · Q" aria-label="Rotate left 45 degrees" onClick={() => world.rotateProp(-Math.PI / 4)}>
            <Svg>{Icon.rotL}</Svg>
          </button>
          <button className="ic" data-tip="Rotate +45° · R" aria-label="Rotate right 45 degrees" onClick={() => world.rotateProp(Math.PI / 4)}>
            <Svg>{Icon.rotR}</Svg>
          </button>
        </>
      ) : (
        <>
          <div className="seg" ref={segRef}>
            <span className="pill" style={{ width: pill.w, transform: `translateX(${pill.x}px)`, opacity: pill.on ? 1 : 0 }} />
            {STATES.map(s => (
              <button key={s.id} data-state={s.id} data-tip={s.tip} className={sheepSel?.state === s.id ? 'active' : ''} onClick={() => world.setState(s.id)}>{s.label}</button>
            ))}
          </div>
          {sheepSel?.state === 'ride' && <span className="riding"><i />Riding</span>}
          <span className="sep" />
          {TRICKS.map(t => <button key={t.id} data-trick={t.id} data-tip={t.tip} onClick={() => world.trick(t.id)}>{t.label}</button>)}
        </>
      )}
      <span className="sep" />
      <button className="ic" data-tip="Undo · Ctrl Z" aria-label="Undo" disabled={!canUndo} onClick={() => world.undo()}><Svg>{Icon.undo}</Svg></button>
      <button className="ic" data-tip="Redo · Ctrl Shift Z" aria-label="Redo" disabled={!canRedo} onClick={() => world.redo()}><Svg>{Icon.redo}</Svg></button>
      <span className="sep" />
      <button className="ic" data-tip="Duplicate · Ctrl D" aria-label="Duplicate" onClick={() => world.duplicate()}><Svg>{Icon.copy}</Svg></button>
      <button className="ic del" data-tip="Delete · Del" aria-label="Delete" onClick={() => world.remove()}><Svg>{Icon.trash}</Svg></button>
    </div>
  );
}

function BuildPalette() {
  const buildMode = useUI(s => s.buildMode);
  const draggingPalette = useUI(s => s.draggingPalette);
  const canUndo = useUI(s => s.canUndo), canRedo = useUI(s => s.canRedo);
  return (
    <div className={`palette ${buildMode ? 'on' : ''}`} role="toolbar" aria-label="Park piece palette" aria-hidden={!buildMode}>
      {PALETTE_PIECES.map(p => (
        <button
          key={p.kind}
          className={`palette-item ${draggingPalette === p.kind ? 'dragging' : ''}`}
          title={`Drag onto island or click to place ${p.label}`}
          aria-label={`Place ${p.label}`}
          tabIndex={buildMode ? 0 : -1}
          onPointerDown={e => {
            if (e.button !== 0) return;
            e.preventDefault();
            Sfx.unlock();
            world.beginPaletteDrag(p.kind);
          }}
        >
          <Svg>{PIECE_ICONS[p.kind]}</Svg>
          <span>{p.label}</span>
        </button>
      ))}
      <span className="psep" />
      <button className="palette-act" title="Undo (Ctrl Z)" aria-label="Undo" disabled={!canUndo} tabIndex={buildMode ? 0 : -1} onClick={() => world.undo()}><Svg>{Icon.undo}</Svg></button>
      <button className="palette-act" title="Redo (Ctrl Shift Z)" aria-label="Redo" disabled={!canRedo} tabIndex={buildMode ? 0 : -1} onClick={() => world.redo()}><Svg>{Icon.redo}</Svg></button>
      <button className="palette-act" title="Reset to default park" aria-label="Reset park" tabIndex={buildMode ? 0 : -1} onClick={() => world.resetPark()}><Svg>{Icon.reset}</Svg></button>
    </div>
  );
}

function Score() {
  const score = useUI(s => s.score), combo = useUI(s => s.combo);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || score === 0) return;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    const t = setTimeout(() => el.classList.remove('bump'), 180);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <div className="score">
      <b ref={ref}>{score.toLocaleString()}</b><span>style</span>
      <span className={`combo ${combo > 1 ? 'on' : ''}`}>×{combo}</span>
    </div>
  );
}

export function Hud() {
  const selected = useUI(s => s.selected);
  const buildMode = useUI(s => s.buildMode);
  const toast = useUI(s => s.toast);
  const sound = useUI(s => s.sound);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="hud">
        <div className="brand">
          <div className="logo" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="9" cy="11" r="4.2" fill="#f4efe6" stroke="#2b2622" strokeWidth="1.4" /><circle cx="14" cy="10" r="4.6" fill="#f4efe6" stroke="#2b2622" strokeWidth="1.4" /><ellipse cx="17.6" cy="11.6" rx="2.2" ry="2.6" fill="#3b302c" /><rect x="4" y="16.2" width="16" height="2" rx="1" fill="#ff8fa3" /><circle cx="7" cy="19.6" r="1.2" fill="#2b2622" /><circle cx="17" cy="19.6" r="1.2" fill="#2b2622" /></svg>
          </div>
          <div><h1>Sheep Skate</h1><small>Pastoral skatepark editor</small></div>
          <Score />
        </div>
        <div className="actions">
          <button
            className={`chipbtn ${buildMode ? 'active' : ''}`}
            title="Build park (B)"
            aria-pressed={buildMode}
            onClick={() => { Sfx.unlock(); world.toggleBuildMode(); }}
          >
            <Svg>{Icon.build}</Svg><span className="lbl">Build</span>
          </button>
          <button className="chipbtn" title="Drop a new sheep (N)" onClick={() => { Sfx.unlock(); world.spawn(); }}>
            <Svg>{Icon.plus}</Svg><span className="lbl">Sheep</span>
          </button>
          <button className="chipbtn icon" title="Save park (.json)" aria-label="Save park file" onClick={() => { Sfx.unlock(); world.exportPark(); }}>
            <Svg>{Icon.save}</Svg>
          </button>
          <button className="chipbtn icon" title="Load park (.json)" aria-label="Load park file" onClick={() => { Sfx.unlock(); fileRef.current?.click(); }}>
            <Svg>{Icon.load}</Svg>
          </button>
          <button className="chipbtn icon" title="Copy share link" aria-label="Share park link" onClick={() => { Sfx.unlock(); void world.shareParkLink(); }}>
            <Svg>{Icon.share}</Svg>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) void world.importPark(f);
            }}
          />
          <button className="chipbtn icon" title="Sound (M)" aria-label={sound ? 'Mute sound' : 'Unmute sound'} aria-pressed={!sound}
            onClick={() => { Sfx.unlock(); useUI.setState({ sound: Sfx.toggle() }); }}>
            <Svg>{sound ? Icon.sound : Icon.mute}</Svg>
          </button>
        </div>
      </div>

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}

      <div id="sel" ref={el => { overlay.sel = el; }}><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
      <div id="tag" className={selected ? 'on' : ''} ref={el => { overlay.tag = el; }} />
      <Toolbar />
      <div className="layer" ref={el => { overlay.layer = el; }} />
      <BuildPalette />

      <div className="hint">
        {selected?.kind === 'prop' ? (
          <span className="swap" key="prop"><span>Drag piece to move</span><span><kbd>Q</kbd><kbd>R</kbd> rotate</span><span className="opt"><kbd>Ctrl</kbd><kbd>D</kbd> duplicate</span><span className="opt"><kbd>Del</kbd> delete</span><span className="opt"><kbd>Esc</kbd> deselect</span></span>
        ) : selected?.kind === 'sheep' ? (
          <span className="swap" key="b"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ride</span><span><kbd>Space</kbd> ollie</span><span className="opt"><kbd>F</kbd> kickflip</span><span className="opt"><kbd>E</kbd> 360</span><span>Click grass to send</span><span className="opt"><kbd>Esc</kbd> deselect</span></span>
        ) : buildMode ? (
          <span className="swap" key="build"><span>Drag pieces onto the island</span><span className="opt">Click any piece to edit</span><span className="opt"><kbd>Ctrl</kbd><kbd>Z</kbd> undo</span><span><kbd>B</kbd> close build</span></span>
        ) : (
          <span className="swap" key="a"><span>Click a sheep or piece to edit</span><span className="opt">Drag to orbit</span><span><kbd>B</kbd> build park</span><span><kbd>N</kbd> new sheep</span></span>
        )}
      </div>
    </>
  );
}
