import { useEffect, useRef } from 'react';
import { useAppPhase } from '../game/appPhase';
import { Sfx } from '../game/sfx';
import { ArtIcon } from './ArtIcons';

const INK = '#2b2622';

function SpotPickSend() {
  return (
    <svg viewBox="0 0 120 76" fill="none" aria-hidden="true">
      {/* Grass target ring */}
      <ellipse cx="90" cy="54" rx="16" ry="7" fill="#d9ecbe" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="90" cy="54" r="3" fill="#3b82f6" />
      {/* Selection frame */}
      <rect x="20" y="13" width="44" height="48" rx="3" stroke="#3b82f6" strokeWidth="1.8" fill="rgba(59,130,246,0.06)" />
      <rect x="17.5" y="10.5" width="5" height="5" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="61.5" y="10.5" width="5" height="5" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="17.5" y="58.5" width="5" height="5" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="61.5" y="58.5" width="5" height="5" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Mini sheep inside frame */}
      <rect x="27" y="49" width="30" height="5" rx="2.5" fill="#ff8fa3" stroke={INK} strokeWidth="1.7" />
      <circle cx="34" cy="56" r="2.6" fill="#f5ecd6" stroke={INK} strokeWidth="1.5" />
      <circle cx="50" cy="56" r="2.6" fill="#f5ecd6" stroke={INK} strokeWidth="1.5" />
      <path d="M29 45c-3 0-5-2-5-4.7 0-2 1.3-3.6 3-4.2.5-3 3-5 6-5 1.4 0 2.7.5 3.6 1.3 1.4-2 3.8-3.2 6.4-2.8 4.1.6 6.9 4 6.9 8 1.9.7 3.1 2.4 3.1 4.4 0 2.8-2.2 4.9-5 4.9Z" fill="#faf4e8" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <ellipse cx="47" cy="39" rx="6.5" ry="6" fill="#4a3b35" stroke={INK} strokeWidth="1.7" />
      <circle cx="45.5" cy="38" r="1.4" fill="#fff" />
      <circle cx="49.5" cy="38" r="1.4" fill="#fff" />
      <ellipse cx="50.5" cy="41.2" rx="1.5" ry="1" fill="#ff9fb4" />
      {/* Dashed path arrow */}
      <path d="M66 41 Q78 36 88 46" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
    </svg>
  );
}

function SpotRideFree() {
  return (
    <svg viewBox="0 0 120 76" fill="none" aria-hidden="true">
      {/* Keycap cluster */}
      <rect x="22" y="16" width="16" height="15" rx="4" fill="#fffdf9" stroke={INK} strokeWidth="1.7" />
      <text x="30" y="27" textAnchor="middle" fontSize="9" fontWeight="700" fill={INK}>W</text>
      <rect x="6" y="34" width="15" height="15" rx="4" fill="#fffdf9" stroke={INK} strokeWidth="1.7" />
      <text x="13.5" y="45" textAnchor="middle" fontSize="9" fontWeight="700" fill={INK}>A</text>
      <rect x="23" y="34" width="15" height="15" rx="4" fill="#fffdf9" stroke={INK} strokeWidth="1.7" />
      <text x="30.5" y="45" textAnchor="middle" fontSize="9" fontWeight="700" fill={INK}>S</text>
      <rect x="40" y="34" width="15" height="15" rx="4" fill="#fffdf9" stroke={INK} strokeWidth="1.7" />
      <text x="47.5" y="45" textAnchor="middle" fontSize="9" fontWeight="700" fill={INK}>D</text>
      {/* Breeze lines */}
      <path d="M62 28h11M60 36h8" stroke="#6fd0b4" strokeWidth="2.2" strokeLinecap="round" />
      {/* Zooming sheep */}
      <g transform="rotate(-6 88 46)">
        <rect x="70" y="51" width="38" height="6" rx="3" fill="#6fd0b4" stroke={INK} strokeWidth="1.8" />
        <circle cx="79" cy="59" r="3" fill="#f5ecd6" stroke={INK} strokeWidth="1.6" />
        <circle cx="99" cy="59" r="3" fill="#f5ecd6" stroke={INK} strokeWidth="1.6" />
        <path d="M73 46c-3.5 0-5.8-2.4-5.8-5.6 0-2.2 1.2-4.1 3.1-5 .3-3.5 3.1-6 6.8-6 1.5 0 2.9.5 4 1.3 1.7-2.2 4.6-3.3 7.4-2.7 4.4.8 7.5 4.4 7.5 8.8 2 .8 3.3 2.7 3.3 5 0 3.2-2.5 5.6-5.7 5.6Z" fill="#faf4e8" stroke={INK} strokeWidth="1.8" />
        <ellipse cx="94" cy="39.5" rx="7" ry="6.5" fill="#4a3b35" stroke={INK} strokeWidth="1.8" />
        <circle cx="92.5" cy="38.5" r="1.5" fill="#fff" />
        <circle cx="96.8" cy="38.5" r="1.5" fill="#fff" />
        <ellipse cx="97.5" cy="42" rx="1.6" ry="1" fill="#ff9fb4" />
      </g>
    </svg>
  );
}

function SpotTricksRail() {
  return (
    <svg viewBox="0 0 120 76" fill="none" aria-hidden="true">
      {/* Coral steel rail */}
      <path d="M22 50v12M98 50v12" stroke="#d9cfc0" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 50v12M98 50v12" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="14" y="45" width="92" height="6" rx="3" fill="#ff8c7a" stroke={INK} strokeWidth="1.8" />
      {/* Sparks */}
      <path d="M40 42l-5-6M45 41l2-7M74 42l5-6" stroke="#ffb703" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="38" cy="31" r="2" fill="#ffd166" />
      <circle cx="80" cy="32" r="2.2" fill="#ffd166" />
      {/* Mid-air flipping pastel deck */}
      <g transform="rotate(-18 60 25)">
        <rect x="38" y="21" width="44" height="6.5" rx="3.2" fill="#b8b0f2" stroke={INK} strokeWidth="1.8" />
        <circle cx="48" cy="30" r="2.8" fill="#f5ecd6" stroke={INK} strokeWidth="1.5" />
        <circle cx="72" cy="30" r="2.8" fill="#f5ecd6" stroke={INK} strokeWidth="1.5" />
      </g>
      <path d="M28 24c4-7 12-10 19-8" stroke="#6fd0b4" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function SpotFlockTend() {
  return (
    <svg viewBox="0 0 120 76" fill="none" aria-hidden="true">
      {/* Meadow hill */}
      <path d="M12 64 Q60 50 108 64" stroke="#8cc155" strokeWidth="6" strokeLinecap="round" />
      {/* Parachuting / dropping sheep */}
      <path d="M36 22c0-7.5 16-7.5 16 0Z" fill="#ffd166" stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M37 22l5 12M51 22l-5 12" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="44" cy="40" r="7.5" fill="#faf4e8" stroke={INK} strokeWidth="1.7" />
      <ellipse cx="47.5" cy="40.5" rx="4" ry="3.8" fill="#4a3b35" stroke={INK} strokeWidth="1.4" />
      {/* Mini state pills */}
      <rect x="66" y="18" width="40" height="12" rx="6" fill="#eef6e5" stroke={INK} strokeWidth="1.5" />
      <circle cx="74" cy="24" r="2.6" fill="#7cb547" />
      <line x1="81" y1="24" x2="99" y2="24" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <rect x="66" y="34" width="40" height="12" rx="6" fill="#fff0ec" stroke={INK} strokeWidth="1.5" />
      <circle cx="74" cy="40" r="2.6" fill="#ff8fa3" />
      <line x1="81" y1="40" x2="99" y2="40" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const GUIDE_CARDS = [
  {
    id: 'pick',
    title: 'Pick & Send',
    tone: 'sage',
    vignette: <SpotPickSend />,
    body: <>Click any sheep to select it, click meadow grass to send it rolling, or drag the sky to orbit &amp; scroll to zoom.</>,
  },
  {
    id: 'ride',
    title: 'Ride Free',
    tone: 'butter',
    vignette: <SpotRideFree />,
    body: <>Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or Arrow keys with a selected sheep to steer directly across the park.</>,
  },
  {
    id: 'tricks',
    title: 'Tricks & Rail Grinds',
    tone: 'coral',
    vignette: <SpotTricksRail />,
    body: <><kbd>Space</kbd> Ollie, <kbd>F</kbd> Kickflip, <kbd>E</kbd> or double-click 360. Ollie onto the coral rail to Boardslide!</>,
  },
  {
    id: 'flock',
    title: 'Tend Your Flock',
    tone: 'sky',
    vignette: <SpotFlockTend />,
    body: <><kbd>N</kbd> drops a sheep, <kbd>1</kbd>–<kbd>3</kbd> set moods, <kbd>B</kbd> opens park props, and <kbd>Ctrl Z</kbd> undoes.</>,
  },
] as const;

/** Illustrated storybook "How to Play" field guide modal accessible from title or HUD. */
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
          <div className="ss-guide-title">
            <span className="ss-guide-badge" aria-hidden="true">
              <ArtIcon name="howToPlay" size={24} />
            </span>
            <div>
              <h2 id="howto-heading">Park Field Guide</h2>
              <p>Controls &amp; tricks for happy skating sheep</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="ss-guide-close"
            aria-label="Close field guide"
            onClick={() => { Sfx.tick(); close(); }}
          >
            <ArtIcon name="close" size={18} />
          </button>
        </header>

        <div className="ss-guide-grid">
          {GUIDE_CARDS.map(card => (
            <article key={card.id} className="ss-guide-item">
              <div className={`ss-guide-well tone-${card.tone}`}>{card.vignette}</div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>

        <div className="ss-guide-tip">
          <strong>Combo Tip</strong>
          <span>Chain tricks within 2.4 s to build multipliers up to ×5 — bonk orange cones while riding for bonus style points!</span>
        </div>

        <footer className="ss-guide-foot">
          <button type="button" className="ss-btn ss-btn-primary ss-btn-sm" onClick={() => { Sfx.pop(); close(); }}>
            Got it!
          </button>
        </footer>
      </div>
    </div>
  );
}
