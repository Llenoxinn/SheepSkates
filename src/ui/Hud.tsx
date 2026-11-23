import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppPhase } from '../game/appPhase';
import { PROP_SPECS, type PropKind } from '../game/props';
import { Sfx } from '../game/sfx';
import { useUI, type SheepState, type TrickType } from '../game/store';
import { overlay, world } from '../game/world';
import { ArtIcon, type ArtIconName } from './ArtIcons';
import { BrandLogo } from './BrandLogo';
import { DeckPopover } from './DeckPopover';
import { SeasonDial } from './SeasonDial';

const PALETTE_PIECES: { kind: PropKind; label: string; icon: ArtIconName }[] = [
  { kind: 'ramp', label: 'Ramp', icon: 'ramp' },
  { kind: 'rail', label: 'Rail', icon: 'rail' },
  { kind: 'ledge', label: 'Ledge', icon: 'ledge' },
  { kind: 'cone', label: 'Cone', icon: 'cone' },
  { kind: 'bench', label: 'Bench', icon: 'bench' },
  { kind: 'tree', label: 'Tree', icon: 'tree' },
];

const STATES: { id: SheepState; label: string; tip: string; icon: ArtIconName }[] = [
  { id: 'idle', label: 'Idle', tip: 'Idle · 1', icon: 'idle' },
  { id: 'cruise', label: 'Cruise', tip: 'Cruise · 2', icon: 'cruise' },
  { id: 'grind', label: 'Grind', tip: 'Grind the rail · 3', icon: 'grind' },
];

const TRICKS: { id: TrickType; label: string; tip: string; icon: ArtIconName }[] = [
  { id: 'ollie', label: 'Ollie', tip: 'Space', icon: 'ollie' },
  { id: 'kickflip', label: 'Kickflip', tip: 'F', icon: 'kickflip' },
  { id: 'spin', label: '360', tip: 'E · or double-click', icon: 'spin' },
];

function Toolbar({ live }: { live: boolean }) {
  const selected = useUI(s => s.selected);
  const sheepSel = selected?.kind === 'sheep' ? selected : null;
  const propSel = selected?.kind === 'prop' ? selected : null;
  const moveMode = useUI(s => s.moveMode);
  const canUndo = useUI(s => s.canUndo), canRedo = useUI(s => s.canRedo);
  const fired = useUI(s => s.firedTrick);
  const segRef = useRef<HTMLDivElement>(null);
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, w: 0, on: false });
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const [boardBelow, setBoardBelow] = useState(false);
  const [deckOffsetPx, setDeckOffsetPx] = useState(10);

  useEffect(() => { setBoardMenuOpen(false); }, [sheepSel?.id, live]);

  useEffect(() => {
    if (!boardMenuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!boardWrapRef.current?.contains(e.target as Node)) setBoardMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setBoardMenuOpen(false); }
    };
    addEventListener('pointerdown', onDown);
    addEventListener('keydown', onKey, true);
    return () => {
      removeEventListener('pointerdown', onDown);
      removeEventListener('keydown', onKey, true);
    };
  }, [boardMenuOpen]);

  useLayoutEffect(() => {
    const sync = () => {
      const btn = segRef.current?.querySelector<HTMLButtonElement>(`[data-state="${sheepSel?.state}"]`);
      setPill(btn ? { x: btn.offsetLeft, w: btn.offsetWidth, on: true } : p => ({ ...p, on: false }));
    };
    sync();
    let cancelled = false;
    document.fonts?.ready?.then(() => { if (!cancelled) sync(); });
    return () => { cancelled = true; };
  }, [sheepSel?.state, sheepSel?.id, live]);

  useEffect(() => {
    if (!fired) return;
    const b = document.querySelector<HTMLButtonElement>(`#bar [data-trick="${fired.type}"]`);
    if (!b) return;
    b.classList.remove('fire'); void b.offsetWidth; b.classList.add('fire');
  }, [fired]);

  return (
    <div
      id="bar" role="toolbar" aria-label={propSel ? 'Piece actions' : 'Sheep actions'} className={live && selected ? 'on' : ''}
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
            <ArtIcon name="move" size={16} className="btn-ic" />
            <span>Move</span>
          </button>
          <button className="ic" data-tip="Rotate -45° · Q" aria-label="Rotate left 45 degrees" onClick={() => world.rotatePlacement(-Math.PI / 4)}>
            <ArtIcon name="rotL" size={17} />
          </button>
          <button className="ic" data-tip="Rotate +45° · R" aria-label="Rotate right 45 degrees" onClick={() => world.rotatePlacement(Math.PI / 4)}>
            <ArtIcon name="rotR" size={17} />
          </button>
        </>
      ) : (
        <>
          <div className="seg" ref={segRef}>
            <span className="pill" style={{ width: pill.w, transform: `translateX(${pill.x}px)`, opacity: pill.on ? 1 : 0 }} />
            {STATES.map(s => (
              <button key={s.id} data-state={s.id} data-tip={s.tip} className={sheepSel?.state === s.id ? 'active' : ''} onClick={() => world.setState(s.id)}>
                <ArtIcon name={s.icon} size={15} className="btn-ic" />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          {sheepSel?.state === 'ride' && <span className="riding"><i />Riding</span>}
          <span className="sep" />
          {TRICKS.map(t => (
            <button key={t.id} data-trick={t.id} data-tip={t.tip} onClick={() => world.trick(t.id)}>
              <ArtIcon name={t.icon} size={15} className="btn-ic" />
              <span>{t.label}</span>
            </button>
          ))}
          <span className="sep" />
          <div className="board-wrap" ref={boardWrapRef}>
            <button
              className={boardMenuOpen ? 'active-pop' : ''}
              aria-haspopup="dialog"
              aria-expanded={boardMenuOpen}
              data-tip={boardMenuOpen ? undefined : 'Deck Studio · C shape'}
              onClick={() => {
                if (!boardMenuOpen) {
                  const barR = overlay.bar?.getBoundingClientRect();
                  const tagR = overlay.tag?.getBoundingClientRect();
                  const below = (barR?.top ?? 300) < 330;
                  setBoardBelow(below);
                  const tagAbove = !below && barR && tagR && tagR.height > 0 && barR.top > tagR.top;
                  setDeckOffsetPx(tagAbove ? Math.max(10, Math.round(barR.top - tagR.top + 8)) : 10);
                }
                setBoardMenuOpen(o => !o);
              }}
            >
              <ArtIcon name="deck" size={16} className="btn-ic" />
              <span>Deck</span>
            </button>
            {boardMenuOpen && (
              <DeckPopover
                boardStyle={sheepSel?.boardStyle ?? 'street'}
                boardArt={sheepSel?.boardArt ?? 'baa'}
                below={boardBelow}
                offsetPx={deckOffsetPx}
                onSelectStyle={s => world.setBoardStyle(s)}
                onSelectArt={a => world.setBoardArt(a)}
                onRandomize={() => world.randomizeBoard()}
                onTestKickflip={() => world.trick('kickflip')}
              />
            )}
          </div>
        </>
      )}
      <span className="sep" />
      <button className="ic" data-tip="Undo · Ctrl Z" aria-label="Undo" disabled={!canUndo} onClick={() => world.undo()}><ArtIcon name="undo" size={17} /></button>
      <button className="ic" data-tip="Redo · Ctrl Shift Z" aria-label="Redo" disabled={!canRedo} onClick={() => world.redo()}><ArtIcon name="redo" size={17} /></button>
      <span className="sep" />
      <button className="ic" data-tip="Duplicate · Ctrl D" aria-label="Duplicate" onClick={() => world.duplicate()}><ArtIcon name="duplicate" size={17} /></button>
      <button className="ic del" data-tip="Delete · Del" aria-label="Delete" onClick={() => world.remove()}><ArtIcon name="delete" size={17} /></button>
    </div>
  );
}

function BuildPalette({ live }: { live: boolean }) {
  const buildMode = useUI(s => s.buildMode);
  const draggingPalette = useUI(s => s.draggingPalette);
  const placingKind = useUI(s => s.placingKind);
  const placingRotDeg = useUI(s => s.placingRotDeg);
  const placingValid = useUI(s => s.placingValid);
  const placingReason = useUI(s => s.placingReason);
  const gridSnap = useUI(s => s.gridSnap);
  const moveMode = useUI(s => s.moveMode);
  const selected = useUI(s => s.selected);
  const canUndo = useUI(s => s.canUndo), canRedo = useUI(s => s.canRedo);
  const open = live && buildMode;
  const propSel = selected?.kind === 'prop' ? selected : null;
  const showStrip = live && (placingKind !== null || (moveMode && propSel !== null));
  const statusText = !placingValid
    ? (placingReason === 'pond' ? 'Pond — choose dry land' : 'Outside island bounds')
    : placingKind
      ? `Placing ${PROP_SPECS[placingKind].label} · ${placingRotDeg}°`
      : propSel
        ? `Moving ${propSel.name} · ${propSel.rotDeg}°`
        : '';

  return (
    <>
      {showStrip && (
        <div
          className={`build-strip on ${open ? '' : 'low'}`}
          role="toolbar"
          aria-label="Placement controls"
          onPointerDown={() => Sfx.unlock()}
        >
          <span className={`build-status ${placingValid ? '' : 'invalid'}`}>{statusText}</span>
          <span className="psep" />
          <button
            type="button"
            className="strip-btn"
            title="Rotate -45° (Q)"
            aria-label="Rotate left 45 degrees"
            onClick={() => world.rotatePlacement(-Math.PI / 4)}
          >
            <ArtIcon name="rotL" size={14} />
            <span>-45°</span>
          </button>
          <button
            type="button"
            className="strip-btn"
            title="Rotate +45° (R)"
            aria-label="Rotate right 45 degrees"
            onClick={() => world.rotatePlacement(Math.PI / 4)}
          >
            <ArtIcon name="rotR" size={14} />
            <span>+45°</span>
          </button>
          <button
            type="button"
            className={`strip-btn ${gridSnap ? 'active' : ''}`}
            title="0.5 m Grid Snap (Hold Alt)"
            aria-pressed={gridSnap}
            onClick={() => { Sfx.tick(); world.toggleGridSnap(); }}
          >
            <span>0.5m Snap</span>
          </button>
          <button
            type="button"
            className="strip-btn cancel"
            title="Cancel (Esc / Right-Click)"
            aria-label="Cancel placement"
            onClick={() => {
              if (placingKind) {
                world.cancelPlacement();
                Sfx.tick();
              } else {
                world.cancelMoveMode();
              }
            }}
          >
            <ArtIcon name="close" size={13} />
            <span>Cancel</span>
          </button>
        </div>
      )}
      <div className={`palette ${open ? 'on' : ''}`} role="toolbar" aria-label="Park piece palette" aria-hidden={!open}>
        {PALETTE_PIECES.map((p, i) => {
          const armed = placingKind === p.kind;
          const dragging = draggingPalette === p.kind;
          return (
            <button
              key={p.kind}
              type="button"
              className={`palette-item ${armed ? 'armed' : ''} ${dragging ? 'dragging' : ''}`}
              title={`Click to arm or drag onto island (${i + 1})`}
              aria-label={`Place ${p.label}`}
              aria-pressed={armed}
              tabIndex={open ? 0 : -1}
              onPointerDown={e => {
                if (e.button !== 0 || !open) return;
                e.preventDefault();
                Sfx.unlock();
                world.beginPaletteInteraction(p.kind, e.clientX, e.clientY);
              }}
            >
              <kbd className="pkey" aria-hidden="true">{i + 1}</kbd>
              <ArtIcon name={p.icon} size={21} />
              <span>{p.label}</span>
            </button>
          );
        })}
        <span className="psep" />
        <button type="button" className="palette-act" title="Undo (Ctrl Z)" aria-label="Undo" disabled={!canUndo} tabIndex={open ? 0 : -1} onClick={() => world.undo()}><ArtIcon name="undo" size={16} /></button>
        <button type="button" className="palette-act" title="Redo (Ctrl Shift Z)" aria-label="Redo" disabled={!canRedo} tabIndex={open ? 0 : -1} onClick={() => world.redo()}><ArtIcon name="redo" size={16} /></button>
        <button type="button" className="palette-act" title="Reset to default park" aria-label="Reset park" tabIndex={open ? 0 : -1} onClick={() => world.resetPark()}><ArtIcon name="reset" size={16} /></button>
      </div>
    </>
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
  const phase = useAppPhase(s => s.phase);
  const howToPlayOpen = useAppPhase(s => s.howToPlayOpen);
  const selected = useUI(s => s.selected);
  const buildMode = useUI(s => s.buildMode);
  const placingKind = useUI(s => s.placingKind);
  const moveMode = useUI(s => s.moveMode);
  const toast = useUI(s => s.toast);
  const sound = useUI(s => s.sound);
  const fileRef = useRef<HTMLInputElement>(null);
  const live = phase === 'playing';

  return (
    <>
      <div className={`hud ${live ? 'hud-live' : 'hud-hidden'}`} aria-hidden={!live}>
        <div className="brand">
          <div className="logo" aria-hidden>
            <BrandLogo variant="badge" size={34} />
          </div>
          <div><h1>Sheep Skate</h1><small>Pastoral skatepark editor</small></div>
          <Score />
        </div>
        <div className="hud-right">
          <SeasonDial live={live} />
          <div className="actions">
            <button
              className={`chipbtn ${buildMode ? 'active' : ''}`}
              title="Build park (B)"
              aria-pressed={buildMode}
              tabIndex={live ? 0 : -1}
              onClick={() => { Sfx.unlock(); world.toggleBuildMode(); }}
            >
              <ArtIcon name="build" size={18} /><span className="lbl">Build</span>
            </button>
            <button className="chipbtn" title="Drop a new sheep (N)" tabIndex={live ? 0 : -1} onClick={() => { Sfx.unlock(); world.spawn(); }}>
              <ArtIcon name="dropSheep" size={18} /><span className="lbl">Sheep</span>
            </button>
            <button className="chipbtn icon" title="Save park (.json)" aria-label="Save park file" tabIndex={live ? 0 : -1} onClick={() => { Sfx.unlock(); world.exportPark(); }}>
              <ArtIcon name="save" size={18} />
            </button>
            <button className="chipbtn icon" title="Load park (.json)" aria-label="Load park file" tabIndex={live ? 0 : -1} onClick={() => { Sfx.unlock(); fileRef.current?.click(); }}>
              <ArtIcon name="load" size={18} />
            </button>
            <button className="chipbtn icon" title="Copy share link" aria-label="Share park link" tabIndex={live ? 0 : -1} onClick={() => { Sfx.unlock(); void world.shareParkLink(); }}>
              <ArtIcon name="share" size={18} />
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
            <button
              className="chipbtn icon"
              title="How to play (?)"
              aria-label="How to play"
              aria-expanded={howToPlayOpen}
              tabIndex={live ? 0 : -1}
              onClick={() => { Sfx.unlock(); Sfx.tick(); useAppPhase.getState().toggleHowToPlay(); }}
            >
              <ArtIcon name="howToPlay" size={18} />
            </button>
            <button
              className="chipbtn icon"
              title="Sound (M)"
              aria-label={sound ? 'Mute sound' : 'Unmute sound'}
              aria-pressed={!sound}
              tabIndex={live ? 0 : -1}
              onClick={() => { Sfx.unlock(); useUI.setState({ sound: Sfx.toggle() }); }}
            >
              <ArtIcon name={sound ? 'soundOn' : 'soundOff'} size={18} />
            </button>
          </div>
        </div>
      </div>

      {live && toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}

      <div id="sel" ref={el => { overlay.sel = el; }}><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
      <div id="tag" className={live && selected ? 'on' : ''} ref={el => { overlay.tag = el; }} />
      <Toolbar live={live} />
      <div className="layer" ref={el => { overlay.layer = el; }} />
      <BuildPalette live={live} />

      <div className={`hint ${live ? 'hud-live' : 'hud-hidden'}`} aria-hidden={!live}>
        {placingKind ? (
          <span className="swap" key="placing"><span>Click land to place</span><span><kbd>Shift</kbd>+Click multi-place</span><span><kbd>Q</kbd><kbd>R</kbd> rotate</span><span className="opt"><kbd>Alt</kbd> 0.5m snap</span><span><kbd>Esc</kbd> cancel</span></span>
        ) : moveMode && selected?.kind === 'prop' ? (
          <span className="swap" key="moving"><span>Glide &amp; click land to place</span><span><kbd>Q</kbd><kbd>R</kbd> rotate</span><span className="opt"><kbd>Alt</kbd> 0.5m snap</span><span><kbd>Esc</kbd> cancel</span></span>
        ) : selected?.kind === 'prop' ? (
          <span className="swap" key="prop"><span>Drag or <kbd>G</kbd> to move</span><span><kbd>Q</kbd><kbd>R</kbd> rotate</span><span className="opt"><kbd>Ctrl</kbd><kbd>D</kbd> duplicate</span><span className="opt"><kbd>Del</kbd> delete</span><span className="opt"><kbd>Esc</kbd> deselect</span></span>
        ) : selected?.kind === 'sheep' ? (
          <span className="swap" key="b"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ride</span><span><kbd>Space</kbd> ollie</span><span className="opt"><kbd>F</kbd> kickflip</span><span className="opt"><kbd>E</kbd> 360</span><span className="opt"><kbd>C</kbd> board</span><span>Click grass to send</span><span className="opt"><kbd>Esc</kbd> deselect</span></span>
        ) : buildMode ? (
          <span className="swap" key="build"><span>Click or drag piece to place</span><span className="opt"><kbd>1</kbd>–<kbd>6</kbd> quick arm</span><span className="opt"><kbd>Ctrl</kbd><kbd>Z</kbd> undo</span><span><kbd>B</kbd> close build</span></span>
        ) : (
          <span className="swap" key="a"><span>Click a sheep or piece to edit</span><span className="opt">Drag to orbit</span><span><kbd>B</kbd> build park</span><span><kbd>N</kbd> new sheep</span></span>
        )}
      </div>
    </>
  );
}
