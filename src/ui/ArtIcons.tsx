import type { ReactNode } from 'react';

export type ArtIconName =
  | 'idle'
  | 'cruise'
  | 'grind'
  | 'ollie'
  | 'kickflip'
  | 'spin'
  | 'undo'
  | 'redo'
  | 'duplicate'
  | 'delete'
  | 'dropSheep'
  | 'howToPlay'
  | 'soundOn'
  | 'soundOff'
  | 'play'
  | 'close'
  | 'build'
  | 'move'
  | 'rotL'
  | 'rotR'
  | 'save'
  | 'load'
  | 'share'
  | 'reset'
  | 'ramp'
  | 'rail'
  | 'ledge'
  | 'cone'
  | 'bench'
  | 'tree'
  | 'boardStreet'
  | 'boardCruiser'
  | 'boardOldschool'
  | 'boardPintail'
  | 'deck'
  | 'randomize';

const INK = '#3a2f2b';

/** Shared SVG definitions mounted once at the app root to avoid duplicate DOM IDs. */
export function GouacheDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <filter id="ss-gouache-edge" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.45" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

const ICONS: Record<ArtIconName, ReactNode> = {
  idle: (
    <>
      {/* Meadow daisy with double leaf sprigs & shaded golden button */}
      <path d="M12 20.5v-8" stroke="#538d32" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 20.5v-8" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 17.6c-3-.2-4.8-1.8-5.2-4.3 2.5-.3 4.5 1 5.2 4.3Z" fill="#8cc155" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 18.2c2.6-.2 4.2-1.5 4.6-3.7-2.2-.3-3.9.9-4.6 3.7Z" fill="#a5d66c" stroke={INK} strokeWidth="1.45" strokeLinejoin="round" />
      <circle cx="12" cy="6.4" r="2.4" fill="#fffdf7" stroke={INK} strokeWidth="1.5" />
      <circle cx="15.7" cy="9" r="2.4" fill="#fffdf7" stroke={INK} strokeWidth="1.5" />
      <circle cx="14.3" cy="13" r="2.3" fill="#f7efe0" stroke={INK} strokeWidth="1.5" />
      <circle cx="9.7" cy="13" r="2.3" fill="#f7efe0" stroke={INK} strokeWidth="1.5" />
      <circle cx="8.3" cy="9" r="2.4" fill="#fffdf7" stroke={INK} strokeWidth="1.5" />
      <circle cx="12" cy="9.9" r="2.7" fill="#ffd166" stroke={INK} strokeWidth="1.55" />
      <path d="M11 8.9a1.4 1.4 0 0 1 1.8-.2" stroke="#fffdf7" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  cruise: (
    <>
      {/* Rolling cruiser board with wind ribbons, fluffy wool rider & wheel hubs */}
      <path d="M2.5 9.8h6.2M2 13.2h5.2M3.2 16.4h3.2" stroke="#7cc6fe" strokeWidth="1.85" strokeLinecap="round" />
      <path d="M11 14c-1.8 0-3.1-1.3-3.1-2.9 0-1.3.9-2.4 2.1-2.7.5-1.6 2-2.7 3.8-2.7 2.1 0 3.8 1.5 4 3.5 1.2.4 2 1.4 2 2.7 0 1.6-1.3 2.8-2.9 2.8H11Z" fill="#faf4e8" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M11.6 12.6c2.1.7 5 .7 7-.1" stroke="#e2d3bc" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.2 17.2h13.4c1.5 0 2.4-.7 3-1.8" stroke="#ff8fa3" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M6.2 17.2h13.4c1.5 0 2.4-.7 3-1.8" stroke={INK} strokeWidth="1.55" strokeLinecap="round" fill="none" />
      <circle cx="9.6" cy="19.4" r="2.25" fill="#f5ecd6" stroke={INK} strokeWidth="1.55" />
      <circle cx="17.8" cy="19.4" r="2.25" fill="#f5ecd6" stroke={INK} strokeWidth="1.55" />
      <circle cx="9.6" cy="19.4" r="0.8" fill="#6fd0b4" />
      <circle cx="17.8" cy="19.4" r="0.8" fill="#6fd0b4" />
    </>
  ),
  grind: (
    <>
      {/* Coral flatbar rail with baseplates, locked tilted deck & golden grind sparks */}
      <path d="M6.5 15.8v4.4M17.5 15.8v4.4M4.6 20.2h3.8M15.6 20.2h3.8" stroke="#c9bfb0" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6.5 15.8v4.4M17.5 15.8v4.4M4.6 20.2h3.8M15.6 20.2h3.8" stroke={INK} strokeWidth="1.45" strokeLinecap="round" />
      <rect x="2.6" y="12.8" width="18.8" height="3.4" rx="1.7" fill="#ff8c7a" stroke={INK} strokeWidth="1.6" />
      <path d="M5 13.9h14" stroke="#ffb8ad" strokeWidth="1" strokeLinecap="round" />
      <g transform="rotate(-14 11.8 9.6)">
        <rect x="5.8" y="8" width="12.4" height="3.1" rx="1.55" fill="#ffd166" stroke={INK} strokeWidth="1.55" />
        <circle cx="8.5" cy="12" r="1.35" fill="#f5ecd6" stroke={INK} strokeWidth="1.25" />
        <circle cx="15.5" cy="12" r="1.35" fill="#f5ecd6" stroke={INK} strokeWidth="1.25" />
      </g>
      <path d="M12.2 3.6v2.2M16.2 4.6l1.4-1.4M8.4 5.4 7 4" stroke="#ffb703" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="18.6" cy="7.8" r="1.1" fill="#ffd166" />
    </>
  ),
  ollie: (
    <>
      {/* High-arcing trajectory ribbon, popped coral board & tail pop burst */}
      <path d="M5.5 13.2c2-4.8 9.6-5.2 12.2-.6" fill="none" stroke="#7cc6fe" strokeWidth="2.3" strokeLinecap="round" />
      <path d="m15.4 11.8 2.6 1.4.8-2.7" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.2 19.8l1.6-1.4M3.2 17.5l2-.3" stroke="#ffb703" strokeWidth="1.7" strokeLinecap="round" />
      <g transform="rotate(-18 12.4 16.2)">
        <rect x="4.2" y="14.4" width="16.4" height="3.4" rx="1.7" fill="#ff8fa3" stroke={INK} strokeWidth="1.6" />
        <line x1="6.8" y1="15.4" x2="18" y2="15.4" stroke="#ffd6df" strokeWidth="1" strokeLinecap="round" />
        <circle cx="8" cy="19" r="1.65" fill="#f5ecd6" stroke={INK} strokeWidth="1.4" />
        <circle cx="16.8" cy="19" r="1.65" fill="#f5ecd6" stroke={INK} strokeWidth="1.4" />
      </g>
    </>
  ),
  kickflip: (
    <>
      {/* Helical flip arc, mid-rotation lavender deck & golden star */}
      <path d="M6.4 9.4a6.2 6.2 0 0 1 10.6-1.6" fill="none" stroke="#6fd0b4" strokeWidth="2.4" strokeLinecap="round" />
      <path d="m17.2 4.8.5 3.2-3.2-.4" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="rotate(-24 12 14.2)">
        <rect x="4.2" y="12.1" width="15.6" height="3.8" rx="1.9" fill="#b8b0f2" stroke={INK} strokeWidth="1.6" />
        <path d="M6.6 13.5h10.8" stroke="#faf4e8" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="7.8" cy="16.8" r="1.35" fill="#f5ecd6" stroke={INK} strokeWidth="1.25" />
        <circle cx="16.2" cy="16.8" r="1.35" fill="#f5ecd6" stroke={INK} strokeWidth="1.25" />
      </g>
      <path d="m18.5 16.2.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6Z" fill="#ffd166" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
    </>
  ),
  spin: (
    <>
      {/* 360 vortex ribbon with double stroke, arrowhead & 4-point star core */}
      <path d="M18.6 12A6.6 6.6 0 1 1 15 6.1" fill="none" stroke="#ff9f68" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M18.6 12A6.6 6.6 0 1 1 15 6.1" fill="none" stroke={INK} strokeWidth="1.45" strokeLinecap="round" />
      <path d="m13.6 3.4 3.2 2.2-2.4 2.6Z" fill="#ffd166" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m12 8.6.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9Z" fill="#ffd166" stroke={INK} strokeWidth="1.35" strokeLinejoin="round" />
    </>
  ),
  undo: (
    <>
      <path d="M8.5 8.5H15a4.8 4.8 0 1 1 0 9.6H9.8" fill="none" stroke="#7cc6fe" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M8.5 8.5H15a4.8 4.8 0 1 1 0 9.6H9.8" fill="none" stroke={INK} strokeWidth="1.65" strokeLinecap="round" />
      <path d="M9.8 4.4 4.5 8.5l5.3 4.1Z" fill="#7cc6fe" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  redo: (
    <>
      <path d="M15.5 8.5H9a4.8 4.8 0 1 0 0 9.6h5.2" fill="none" stroke="#6fd0b4" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M15.5 8.5H9a4.8 4.8 0 1 0 0 9.6h5.2" fill="none" stroke={INK} strokeWidth="1.65" strokeLinecap="round" />
      <path d="m14.2 4.4 5.3 4.1-5.3 4.1Z" fill="#6fd0b4" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  duplicate: (
    <>
      {/* Back coral clone sheep + front cream wooly sheep with face & ears */}
      <path d="M6.2 14.4c-1.9 0-3.2-1.3-3.2-3 0-1.4 1-2.5 2.3-2.8.5-1.6 1.9-2.6 3.6-2.6 1.9 0 3.4 1.3 3.6 3.1" fill="#ff8fa3" stroke={INK} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.4 18.6h6.9c2 0 3.3-1.3 3.3-3.1 0-1.4-.9-2.6-2.1-2.9-.4-1.7-1.9-2.9-3.7-2.9-1.6 0-3.1.9-3.6 2.4-1.3.3-2.3 1.4-2.3 2.9 0 1.9 1.4 3.6 3.5 3.6Z" fill="#faf4e8" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <ellipse cx="16.2" cy="14.5" rx="2.5" ry="2.4" fill="#4a3b35" stroke={INK} strokeWidth="1.3" />
      <circle cx="15.4" cy="14.2" r="0.55" fill="#fff" />
      <circle cx="17.1" cy="14.2" r="0.55" fill="#fff" />
    </>
  ),
  delete: (
    <>
      {/* Gouache bin with coral lid, brass handle & vertical ribs */}
      <path d="M6.4 8.2h11.2l-1 10.8a1.9 1.9 0 0 1-1.9 1.7H9.3a1.9 1.9 0 0 1-1.9-1.7L6.4 8.2Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M8.2 9.4v9.4" stroke="#fff4e4" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9.4 7.6V5.5c0-.8.6-1.4 1.4-1.4h2.4c.8 0 1.4.6 1.4 1.4v2.1" fill="#ffd166" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <rect x="4.5" y="6.6" width="15" height="2.4" rx="1.2" fill="#ff8fa3" stroke={INK} strokeWidth="1.6" />
      <path d="M10.3 11.4v5.4M13.7 11.4v5.4" stroke={INK} strokeWidth="1.55" strokeLinecap="round" />
    </>
  ),
  dropSheep: (
    <>
      {/* Fluffy sheep with ears, eyes, rosy cheeks & golden + spawn coin */}
      <path d="M5.4 14.8c-1.6-.3-2.6-1.6-2.6-3.1 0-1.5 1-2.7 2.4-3 .6-1.8 2.3-3 4.3-3 2 0 3.6 1.1 4.2 2.8 1.4.3 2.3 1.5 2.3 3 0 1.8-1.3 3.2-3 3.3Z" fill="#faf4e8" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="6.2" cy="12.2" rx="1.6" ry="0.9" transform="rotate(-18 6.2 12.2)" fill="#4a3b35" stroke={INK} strokeWidth="1.2" />
      <ellipse cx="13" cy="12.2" rx="1.6" ry="0.9" transform="rotate(18 13 12.2)" fill="#4a3b35" stroke={INK} strokeWidth="1.2" />
      <ellipse cx="9.6" cy="13.5" rx="3.4" ry="3.5" fill="#4a3b35" stroke={INK} strokeWidth="1.5" />
      <circle cx="8.3" cy="13" r="0.8" fill="#fff" />
      <circle cx="10.9" cy="13" r="0.8" fill="#fff" />
      <circle cx="7.4" cy="14.5" r="0.75" fill="#ff9fb4" />
      <circle cx="11.8" cy="14.5" r="0.75" fill="#ff9fb4" />
      <circle cx="18.2" cy="17.2" r="4" fill="#ffd166" stroke={INK} strokeWidth="1.55" />
      <path d="M18.2 15.3v3.8M16.3 17.2h3.8" stroke={INK} strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  howToPlay: (
    <>
      {/* Open field guide hardcover with meadow lines & coral bookmark */}
      <path d="M3.2 6.4c2.9-1.2 6-.9 8.8.8 2.8-1.7 5.9-2 8.8-.8v12c-2.9-1.1-6-.8-8.8.8-2.8-1.6-5.9-1.9-8.8-.8V6.4Z" fill="#fff7df" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M12 7.2v12" stroke={INK} strokeWidth="1.55" strokeLinecap="round" />
      <path d="M5.8 10.2h3.8M5.8 13.2h3.4M5.8 16h2.4" stroke="#7cb547" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.2 6.1v7l1.6-1.2 1.6 1.2v-7" fill="#ff8fa3" stroke={INK} strokeWidth="1.45" strokeLinejoin="round" />
    </>
  ),
  soundOn: (
    <>
      <path d="M4.2 9.4h3.2l4.8-3.6v12.4l-4.8-3.6H4.2a1.2 1.2 0 0 1-1.2-1.2v-2.8a1.2 1.2 0 0 1 1.2-1.2Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M7.4 9.6v4.8" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M15.4 9.2a4.4 4.4 0 0 1 0 5.6" fill="none" stroke="#6fd0b4" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M18.3 6.7a7.8 7.8 0 0 1 0 10.6" fill="none" stroke="#ffd166" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  soundOff: (
    <>
      <path d="M4.2 9.4h3.2l4.8-3.6v12.4l-4.8-3.6H4.2a1.2 1.2 0 0 1-1.2-1.2v-2.8a1.2 1.2 0 0 1 1.2-1.2Z" fill="#dfd5c6" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M7.4 9.6v4.8" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <path d="m15.8 9.4 5.2 5.2M21 9.4l-5.2 5.2" stroke="#d94f34" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  play: (
    <>
      <path
        d="M7.4 5.2c0-1.1 1.2-1.7 2.1-1.1l9.9 6.2c.8.5.8 1.8 0 2.3l-9.9 6.2c-.9.6-2.1 0-2.1-1.1Z"
        fill="currentColor"
        stroke={INK}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9.6 7.5 16.2 11.6" stroke="#fffdf7" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
    </>
  ),
  close: (
    <>
      <path d="m6.8 6.8 10.4 10.4M17.2 6.8 6.8 17.2" stroke="#ff8fa3" strokeWidth="3.4" strokeLinecap="round" />
      <path d="m6.8 6.8 10.4 10.4M17.2 6.8 6.8 17.2" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  build: (
    <>
      {/* Stacked isometric diorama blocks with gouache faces */}
      <path d="M4.2 14.4 12 18.8l7.8-4.4L12 10Z" fill="#9fd8c6" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4.2 14.4v3.2L12 22l7.8-4.4v-3.2L12 18.8Z" fill="#6fd0b4" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="m6.4 8.6 5.6 3.2 5.6-3.2L12 5.4Z" fill="#ffe07d" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.4 8.6v2.8L12 14.6l5.6-3.2V8.6L12 11.8Z" fill="#ffd166" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
    </>
  ),
  move: (
    <>
      <path d="M12 3.8v16.4M3.8 12h16.4" stroke="#7cc6fe" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M12 3.8v16.4M3.8 12h16.4" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      <path d="m9.4 6.2 2.6-2.8 2.6 2.8M9.4 17.8l2.6 2.8 2.6-2.8M6.2 9.4 3.4 12l2.8 2.6M17.8 9.4l2.8 2.6-2.8 2.6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.4" fill="#ffd166" stroke={INK} strokeWidth="1.45" />
    </>
  ),
  rotL: (
    <>
      <path d="M7 9.4a6.5 6.5 0 1 1-1.2 6.8" fill="none" stroke="#b8b0f2" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M7 9.4a6.5 6.5 0 1 1-1.2 6.8" fill="none" stroke={INK} strokeWidth="1.55" strokeLinecap="round" />
      <path d="M4.8 4.6v5h5Z" fill="#b8b0f2" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.6" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
    </>
  ),
  rotR: (
    <>
      <path d="M17 9.4a6.5 6.5 0 1 0 1.2 6.8" fill="none" stroke="#f6c9a0" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M17 9.4a6.5 6.5 0 1 0 1.2 6.8" fill="none" stroke={INK} strokeWidth="1.55" strokeLinecap="round" />
      <path d="M19.2 4.6v5h-5Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.6" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
    </>
  ),
  save: (
    <>
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="3.2" fill="#faf4e8" stroke={INK} strokeWidth="1.65" />
      <rect x="7.4" y="4.2" width="9.2" height="5" rx="1.3" fill="#9fd8c6" stroke={INK} strokeWidth="1.45" />
      <path d="M12 11.2v5m-2.5-2.2 2.5 2.5 2.5-2.5" stroke="#d94f34" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  load: (
    <>
      <path d="M3.8 7.5c0-1 .8-1.8 1.8-1.8h4.2l1.6 1.8h7c1 0 1.8.8 1.8 1.8v8.6c0 1-.8 1.8-1.8 1.8H5.6c-1 0-1.8-.8-1.8-1.8Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M4.2 10.2h15.6" stroke="#e4b082" strokeWidth="1.2" />
      <path d="M12 16.4v-5m-2.5 2.2 2.5-2.5 2.5 2.5" stroke="#3a7d44" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  share: (
    <>
      <path d="m9 10.8 6-3.2M9 13.2l6 3.2" stroke={INK} strokeWidth="1.85" strokeLinecap="round" />
      <circle cx="17.2" cy="6.5" r="2.8" fill="#ff8fa3" stroke={INK} strokeWidth="1.55" />
      <circle cx="6.6" cy="12" r="2.8" fill="#ffd166" stroke={INK} strokeWidth="1.55" />
      <circle cx="17.2" cy="17.5" r="2.8" fill="#7cc6fe" stroke={INK} strokeWidth="1.55" />
    </>
  ),
  reset: (
    <>
      <path d="M5.5 9.5a7.2 7.2 0 1 1-.6 6.2" fill="none" stroke="#ff9f68" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M5.5 9.5a7.2 7.2 0 1 1-.6 6.2" fill="none" stroke={INK} strokeWidth="1.55" strokeLinecap="round" />
      <path d="M4.2 4.8v4.8H9Z" fill="#ffd166" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  ramp: (
    <>
      {/* 3D Isometric Mint Quarter-Pipe with maple plywood side & steel coping */}
      <path d="M3.5 18.8h12.8V9.6h-3.2c-2.6 0-5.4 3.4-9.6 9.2Z" fill="#9fd8c6" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16.3 9.6h3.8v9.2h-3.8Z" fill="#e5c496" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="13.2" cy="9.6" r="1.65" fill="#d9dfe8" stroke={INK} strokeWidth="1.35" />
    </>
  ),
  rail: (
    <>
      {/* 3D Coral Grind Rail with vertical posts & baseplates */}
      <path d="M6.5 12v6.2M17.5 12v6.2M4.4 18.2h4.2M15.4 18.2h4.2" stroke={INK} strokeWidth="1.75" strokeLinecap="round" />
      <rect x="2.8" y="8.8" width="18.4" height="3.4" rx="1.7" fill="#ff8c7a" stroke={INK} strokeWidth="1.65" />
      <path d="M5.2 10h13.6" stroke="#ffc2b8" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  ledge: (
    <>
      {/* 3D Lavender Funbox Ledge with top deck & steel grind coping */}
      <path d="M3.8 11.4 7 8.4h13.2l-3.2 3Z" fill="#d3cdf9" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <rect x="3.8" y="11.4" width="13.2" height="7" rx="1.4" fill="#b8b0f2" stroke={INK} strokeWidth="1.65" />
      <path d="M17 11.4 20.2 8.4v7l-3.2 3Z" fill="#988ee6" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <line x1="4.5" y1="11.4" x2="16.4" y2="11.4" stroke="#eef2f8" strokeWidth="1.9" strokeLinecap="round" />
    </>
  ),
  cone: (
    <>
      {/* Striped traffic cone with 3D base flange */}
      <rect x="4.8" y="17.2" width="14.4" height="2.6" rx="1.3" fill="#ff9a4d" stroke={INK} strokeWidth="1.5" />
      <path d="M12 4.2 7.2 17.2h9.6Z" fill="#ff9a4d" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M9.4 10.6h5.2l1 2.8H8.4Z" fill="#fff7ea" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
    </>
  ),
  bench: (
    <>
      {/* Warm timber park bench with backrest, seat & wrought-iron legs */}
      <path d="M6.8 13.4v5.2M17.2 13.4v5.2M6.8 16h10.4" stroke={INK} strokeWidth="1.75" strokeLinecap="round" />
      <rect x="4.2" y="7.2" width="15.6" height="2.8" rx="1.1" fill="#e5b586" stroke={INK} strokeWidth="1.5" />
      <rect x="3.2" y="10.4" width="17.6" height="3.2" rx="1.3" fill="#f6c9a0" stroke={INK} strokeWidth="1.6" />
    </>
  ),
  tree: (
    <>
      {/* Multi-sphere pastoral tree with forked trunk & sun highlights */}
      <path d="M12 20v-6.2M12 16l-2-1.8M12 15.5l2-1.5" stroke="#7a5636" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12 20v-6.2" stroke={INK} strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="8.3" cy="11.4" r="3.5" fill="#7cb547" stroke={INK} strokeWidth="1.45" />
      <circle cx="15.7" cy="11.4" r="3.5" fill="#7cb547" stroke={INK} strokeWidth="1.45" />
      <circle cx="12" cy="8" r="4.5" fill="#9fd164" stroke={INK} strokeWidth="1.55" />
      <circle cx="10.6" cy="6.6" r="1.1" fill="#d7f2a7" />
    </>
  ),
  boardStreet: (
    <>
      <g transform="rotate(30 12 12)">
        <rect x="7.3" y="6.6" width="1.9" height="2.5" rx="0.7" fill="#f5ecd6" stroke={INK} strokeWidth="1.1" />
        <rect x="14.8" y="6.6" width="1.9" height="2.5" rx="0.7" fill="#f5ecd6" stroke={INK} strokeWidth="1.1" />
        <rect x="7.3" y="14.9" width="1.9" height="2.5" rx="0.7" fill="#f5ecd6" stroke={INK} strokeWidth="1.1" />
        <rect x="14.8" y="14.9" width="1.9" height="2.5" rx="0.7" fill="#f5ecd6" stroke={INK} strokeWidth="1.1" />
        <rect x="8.7" y="2.8" width="6.6" height="18.4" rx="3.3" fill="#ff8fa3" stroke={INK} strokeWidth="1.6" />
        <rect x="9.9" y="5" width="4.2" height="14" rx="2.1" fill="#3b3944" />
        <circle cx="12" cy="12" r="1.2" fill="#ffd166" />
      </g>
    </>
  ),
  boardCruiser: (
    <>
      <g transform="rotate(30 12 12)">
        <rect x="7.1" y="6.8" width="2" height="2.6" rx="0.8" fill="#faf4e8" stroke={INK} strokeWidth="1.1" />
        <rect x="14.9" y="6.8" width="2" height="2.6" rx="0.8" fill="#faf4e8" stroke={INK} strokeWidth="1.1" />
        <rect x="7.4" y="14.8" width="2" height="2.6" rx="0.8" fill="#faf4e8" stroke={INK} strokeWidth="1.1" />
        <rect x="14.6" y="14.8" width="2" height="2.6" rx="0.8" fill="#faf4e8" stroke={INK} strokeWidth="1.1" />
        <path
          d="M12 3c2.7 0 3.8 2.2 3.7 5.2-.1 2.9-.8 6.4-.4 12.2L12 17.6 8.7 20.4c.4-5.8-.3-9.3-.4-12.2C8.2 5.2 9.3 3 12 3Z"
          fill="#6fd0b4"
          stroke={INK}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M12 5.2v10.4" stroke="#faf4e8" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </>
  ),
  boardOldschool: (
    <>
      <g transform="rotate(30 12 12)">
        <rect x="6.4" y="7" width="2" height="2.5" rx="0.7" fill="#2f2c35" stroke={INK} strokeWidth="1.1" />
        <rect x="15.6" y="7" width="2" height="2.5" rx="0.7" fill="#2f2c35" stroke={INK} strokeWidth="1.1" />
        <rect x="6.4" y="14.9" width="2" height="2.5" rx="0.7" fill="#2f2c35" stroke={INK} strokeWidth="1.1" />
        <rect x="15.6" y="14.9" width="2" height="2.5" rx="0.7" fill="#2f2c35" stroke={INK} strokeWidth="1.1" />
        <path
          d="M12 2.6c2.3 1.2 4 3.2 4.2 5.8.1 1.6-.9 2.8-.9 4.2 0 1.7 1.1 3.2.8 5.5l-.9 2.3H8.8l-.9-2.3c-.3-2.3.8-3.8.8-5.5 0-1.4-1-2.6-.9-4.2.2-2.6 1.9-4.6 4.2-5.8Z"
          fill="#ffd166"
          stroke={INK}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <rect x="9.6" y="6.8" width="4.8" height="10.6" rx="1.6" fill="#3b3944" />
        <line x1="9.6" y1="12" x2="14.4" y2="12" stroke="#ff8fa3" strokeWidth="1.3" />
      </g>
    </>
  ),
  boardPintail: (
    <>
      <g transform="rotate(30 12 12)">
        <rect x="7.7" y="6" width="2" height="2.8" rx="0.8" fill="#f4cf86" stroke={INK} strokeWidth="1.1" />
        <rect x="14.3" y="6" width="2" height="2.8" rx="0.8" fill="#f4cf86" stroke={INK} strokeWidth="1.1" />
        <rect x="7.7" y="15.2" width="2" height="2.8" rx="0.8" fill="#f4cf86" stroke={INK} strokeWidth="1.1" />
        <rect x="14.3" y="15.2" width="2" height="2.8" rx="0.8" fill="#f4cf86" stroke={INK} strokeWidth="1.1" />
        <path
          d="M12 1.8c2.6 2.5 3.5 5.6 3.4 9.4-.1 3.8-1 7.6-3.4 11-2.4-3.4-3.3-7.2-3.4-11-.1-3.8.8-6.9 3.4-9.4Z"
          fill="#a59cf5"
          stroke={INK}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M12 4.5v15" stroke="#f7efe0" strokeWidth="1.35" strokeLinecap="round" />
      </g>
    </>
  ),
  deck: (
    <g transform="rotate(28 12 12)">
      <rect x="6.8" y="6.5" width="2.2" height="2.7" rx="0.8" fill="#ffe066" stroke={INK} strokeWidth="1.15" />
      <rect x="15" y="6.5" width="2.2" height="2.7" rx="0.8" fill="#ffe066" stroke={INK} strokeWidth="1.15" />
      <rect x="6.8" y="14.8" width="2.2" height="2.7" rx="0.8" fill="#ffe066" stroke={INK} strokeWidth="1.15" />
      <rect x="15" y="14.8" width="2.2" height="2.7" rx="0.8" fill="#ffe066" stroke={INK} strokeWidth="1.15" />
      <rect x="8.2" y="2.5" width="7.6" height="19" rx="3.8" fill="#ff947c" stroke={INK} strokeWidth="1.6" />
      <rect x="9.7" y="5.1" width="4.6" height="13.8" rx="2.3" fill="#373540" />
      <path d="M12 6.8v10.4" stroke="#fff4e0" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.4" fill="#ffd166" />
    </g>
  ),
  randomize: (
    <>
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="3.6" fill="#fff7df" stroke={INK} strokeWidth="1.65" />
      <path d="M6.5 6h11" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="8.6" cy="8.6" r="1.45" fill="#ff8fa3" stroke={INK} strokeWidth="0.6" />
      <circle cx="15.4" cy="8.6" r="1.45" fill="#6fd0b4" stroke={INK} strokeWidth="0.6" />
      <circle cx="12" cy="12" r="1.55" fill="#ffd166" stroke={INK} strokeWidth="0.7" />
      <circle cx="8.6" cy="15.4" r="1.45" fill="#7cc6fe" stroke={INK} strokeWidth="0.6" />
      <circle cx="15.4" cy="15.4" r="1.45" fill="#a59cf5" stroke={INK} strokeWidth="0.6" />
    </>
  ),
};

export function ArtIcon({ name, size = 18, className }: { name: ArtIconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
