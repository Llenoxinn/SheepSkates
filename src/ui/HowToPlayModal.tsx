import { useEffect, useRef, type ReactNode } from 'react';
import { useAppPhase } from '../game/appPhase';
import { Sfx } from '../game/sfx';
import { ArtIcon } from './ArtIcons';

type Row = { action: string; keys: ReactNode };
type Section = { title: string; rows: readonly Row[] };

const K = ({ children }: { children: ReactNode }) => <kbd>{children}</kbd>;

const SECTIONS: readonly Section[] = [
  {
    title: 'Move',
    rows: [
      { action: 'Select / cycle sheep', keys: <><span className="ss-guide-mouse">Click</span><span className="ss-guide-or">or</span><K>Tab</K></> },
      { action: 'Send it rolling', keys: <span className="ss-guide-mouse">Click grass</span> },
      { action: 'Steer', keys: <><K>W</K><K>A</K><K>S</K><K>D</K></> },
      { action: 'Orbit / zoom', keys: <span className="ss-guide-mouse">Drag sky · Scroll</span> },
    ],
  },
  {
    title: 'Tricks',
    rows: [
      { action: 'Ollie', keys: <K>Space</K> },
      { action: 'Kickflip', keys: <K>F</K> },
      { action: '360', keys: <><K>E</K><span className="ss-guide-or">or</span><span className="ss-guide-mouse">Double-click</span></> },
      { action: 'Boardslide', keys: <span className="ss-guide-mouse">Ollie onto the rail</span> },
    ],
  },
  {
    title: 'Flock',
    rows: [
      { action: 'Drop a sheep', keys: <K>N</K> },
      { action: 'Set mood', keys: <><K>1</K><span className="ss-guide-or">–</span><K>3</K></> },
      { action: 'Park props', keys: <K>B</K> },
      { action: 'Undo', keys: <><K>Ctrl</K><K>Z</K></> },
    ],
  },
];

/** Plain reference sheet of controls, accessible from title or HUD. */
export function HowToPlayModal() {
  const open = useAppPhase(s => s.howToPlayOpen);
  const close = useAppPhase(s => s.closeHowToPlay);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        Sfx.tick();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      returnFocusRef.current?.focus?.();
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="ss-guide-backdrop"
      role="presentation"
      onClick={e => {
        if (e.target === e.currentTarget) {
          Sfx.tick();
          close();
        }
      }}
    >
      <div className="ss-guide-card" role="dialog" aria-modal="true" aria-labelledby="howto-heading">
        <header className="ss-guide-head">
          <h2 id="howto-heading">How to play</h2>
          <button
            ref={closeRef}
            type="button"
            className="ss-guide-close"
            aria-label="Close"
            onClick={() => { Sfx.tick(); close(); }}
          >
            <ArtIcon name="close" size={16} />
          </button>
        </header>

        <div className="ss-guide-cols">
          {SECTIONS.map(sec => (
            <section key={sec.title} className="ss-guide-sec">
              <h3>{sec.title}</h3>
              <dl>
                {sec.rows.map(r => (
                  <div key={r.action} className="ss-guide-row">
                    <dt>{r.action}</dt>
                    <dd>{r.keys}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <footer className="ss-guide-foot">
          <p>Chain tricks within 2.4 s for up to ×5. Bonk cones for style.</p>
          <button type="button" className="ss-btn ss-btn-primary ss-btn-sm" onClick={() => { Sfx.pop(); close(); }}>
            Got it
          </button>
        </footer>
      </div>
    </div>
  );
}
