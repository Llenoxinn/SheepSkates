import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Sfx } from '../game/sfx';
import { useUI, type SheepState, type TrickType } from '../game/store';
import { overlay, world } from '../game/world';

const Icon = {
  undo: <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />,
  redo: <path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />,
  copy: <><rect width="13" height="13" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></>,
  trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />,
  plus: <path d="M5 12h14M12 5v14" />,
  sound: <><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z" /><path d="M16 9a5 5 0 0 1 0 6M19.4 18.4a9 9 0 0 0 0-12.8" /></>,
  mute: <><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z" /><path d="m22 9-6 6M16 9l6 6" /></>,
};
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
  const canUndo = useUI(s => s.canUndo), canRedo = useUI(s => s.canRedo);
  const fired = useUI(s => s.firedTrick);
  const segRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, w: 0, on: false });

  // slide the pill under the active state button
  useLayoutEffect(() => {
    const btn = segRef.current?.querySelector<HTMLButtonElement>(`[data-state="${selected?.state}"]`);
    setPill(btn ? { x: btn.offsetLeft, w: btn.offsetWidth, on: true } : p => ({ ...p, on: false }));
  }, [selected?.state, selected?.id]);

  // replay the "fire" flash on the trick button that was triggered (keyboard or click)
  useEffect(() => {
    if (!fired) return;
    const b = document.querySelector<HTMLButtonElement>(`#bar [data-trick="${fired.type}"]`);
    if (!b) return;
    b.classList.remove('fire'); void b.offsetWidth; b.classList.add('fire');
  }, [fired]);

  return (
    <div
      id="bar" role="toolbar" aria-label="Sheep actions" className={selected ? 'on' : ''}
      ref={el => { overlay.bar = el; }}
      onPointerEnter={() => { overlay.barHover = true; }} onPointerLeave={() => { overlay.barHover = false; }}
      onPointerDown={() => Sfx.unlock()}
    >
      <div className="seg" ref={segRef}>
        <span className="pill" style={{ width: pill.w, transform: `translateX(${pill.x}px)`, opacity: pill.on ? 1 : 0 }} />
        {STATES.map(s => (
          <button key={s.id} data-state={s.id} data-tip={s.tip} className={selected?.state === s.id ? 'active' : ''} onClick={() => world.setState(s.id)}>{s.label}</button>
        ))}
      </div>
      {selected?.state === 'ride' && <span className="riding"><i />Riding</span>}
      <span className="sep" />
      {TRICKS.map(t => <button key={t.id} data-trick={t.id} data-tip={t.tip} onClick={() => world.trick(t.id)}>{t.label}</button>)}
      <span className="sep" />
      <button className="ic" data-tip="Undo · Ctrl Z" aria-label="Undo" disabled={!canUndo} onClick={() => world.undo()}><Svg>{Icon.undo}</Svg></button>
      <button className="ic" data-tip="Redo · Ctrl Shift Z" aria-label="Redo" disabled={!canRedo} onClick={() => world.redo()}><Svg>{Icon.redo}</Svg></button>
      <span className="sep" />
      <button className="ic" data-tip="Duplicate · Ctrl D" aria-label="Duplicate" onClick={() => world.duplicate()}><Svg>{Icon.copy}</Svg></button>
      <button className="ic del" data-tip="Delete · Del" aria-label="Delete" onClick={() => world.remove()}><Svg>{Icon.trash}</Svg></button>
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
  const sound = useUI(s => s.sound);
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
          <button className="chipbtn" title="Drop a new sheep (N)" onClick={() => { Sfx.unlock(); world.spawn(); }}><Svg>{Icon.plus}</Svg>Sheep</button>
          <button className="chipbtn icon" title="Sound (M)" aria-label={sound ? 'Mute sound' : 'Unmute sound'} aria-pressed={!sound}
            onClick={() => { Sfx.unlock(); useUI.setState({ sound: Sfx.toggle() }); }}>
            <Svg>{sound ? Icon.sound : Icon.mute}</Svg>
          </button>
        </div>
      </div>

      <div id="sel" ref={el => { overlay.sel = el; }}><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
      <div id="tag" className={selected ? 'on' : ''} ref={el => { overlay.tag = el; }} />
      <Toolbar />
      <div className="layer" ref={el => { overlay.layer = el; }} />

      <div className="hint">
        {selected ? (
          <span className="swap" key="b"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ride</span><span><kbd>Space</kbd> ollie</span><span className="opt"><kbd>F</kbd> kickflip</span><span className="opt"><kbd>E</kbd> 360</span><span>Click grass to send</span><span className="opt"><kbd>Esc</kbd> deselect</span></span>
        ) : (
          <span className="swap" key="a"><span>Click a sheep to edit it</span><span className="opt">Drag to orbit</span><span className="opt">Scroll to zoom</span><span><kbd>N</kbd> new sheep</span></span>
        )}
      </div>
    </>
  );
}
