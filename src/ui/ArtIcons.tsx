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
  | 'tree';

const INK = '#3a2f2b';

/** Shared SVG definitions mounted once at the app root to avoid duplicate DOM IDs. */
export function GouacheDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <filter id="ss-gouache-edge" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.65" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

const ICONS: Record<ArtIconName, ReactNode> = {
  idle: (
    <>
      <path d="M12 20v-7" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17c-2.8-.2-4.6-1.8-5-4.2 2.4-.3 4.3 1 5 4.2Z" fill="#8cc155" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="2.3" fill="#fffdf7" stroke={INK} strokeWidth="1.5" />
      <circle cx="15.4" cy="9.4" r="2.3" fill="#fffdf7" stroke={INK} strokeWidth="1.5" />
      <circle cx="14" cy="13" r="2.2" fill="#fffdf7" stroke={INK} strokeWidth="1.5" />
      <circle cx="10" cy="13" r="2.2" fill="#fffdf7" stroke={INK} strokeWidth="1.5" />
      <circle cx="8.6" cy="9.4" r="2.3" fill="#fffdf7" stroke={INK} strokeWidth="1.5" />
      <circle cx="12" cy="10.2" r="2.6" fill="#ffd166" stroke={INK} strokeWidth="1.6" />
    </>
  ),
  cruise: (
    <>
      <path d="M3 10.5h7M2.5 14h5.5" stroke="#7cc6fe" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M6.5 17.5h13c1.5 0 2.3-.8 2.8-1.8" stroke="#ff8fa3" strokeWidth="3" strokeLinecap="round" />
      <path d="M6.5 17.5h13c1.5 0 2.3-.8 2.8-1.8" stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="19.2" r="2.1" fill="#6fd0b4" stroke={INK} strokeWidth="1.6" />
      <circle cx="17.5" cy="19.2" r="2.1" fill="#6fd0b4" stroke={INK} strokeWidth="1.6" />
      <circle cx="14.2" cy="10.5" r="4.2" fill="#faf4e8" stroke={INK} strokeWidth="1.6" />
      <circle cx="14.2" cy="10.5" r="1.4" fill="#ffd166" />
    </>
  ),
  grind: (
    <>
      <path d="M6.5 15.5v4.5M17.5 15.5v4.5" stroke="#d9cfc0" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6.5 15.5v4.5M17.5 15.5v4.5" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      <rect x="2.8" y="13" width="18.4" height="3.2" rx="1.6" fill="#ff8c7a" stroke={INK} strokeWidth="1.6" />
      <path d="M7.5 10.6 15.8 8.2" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" />
      <path d="M7.5 10.6 15.8 8.2" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 4.5v2M15.8 5.2l1.2-1.4M9.2 6l-1.3-1.2" stroke="#ffb703" strokeWidth="1.9" strokeLinecap="round" />
    </>
  ),
  ollie: (
    <>
      <path d="M6.5 13.5c1.8-4.4 9.2-4.4 11 0" fill="none" stroke="#7cc6fe" strokeWidth="2.1" strokeLinecap="round" />
      <path d="m15.3 12.6 2.3 1.2.8-2.4" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="rotate(-14 12 16.5)">
        <rect x="4" y="15" width="16" height="3.2" rx="1.6" fill="#ff8fa3" stroke={INK} strokeWidth="1.6" />
        <circle cx="7.8" cy="19.3" r="1.5" fill="#f5ecd6" stroke={INK} strokeWidth="1.4" />
        <circle cx="16.2" cy="19.3" r="1.5" fill="#f5ecd6" stroke={INK} strokeWidth="1.4" />
      </g>
    </>
  ),
  kickflip: (
    <>
      <path d="M7 9.2a5.8 5.8 0 0 1 9.8-1.4" fill="none" stroke="#6fd0b4" strokeWidth="2.2" strokeLinecap="round" />
      <path d="m17 5 .4 3-3-.4" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="rotate(-22 12 14)">
        <rect x="4.5" y="12.2" width="15" height="3.4" rx="1.7" fill="#b8b0f2" stroke={INK} strokeWidth="1.6" />
        <line x1="7" y1="13.9" x2="17" y2="13.9" stroke="#faf4e8" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <circle cx="18.2" cy="17.8" r="1.3" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
    </>
  ),
  spin: (
    <>
      <path d="M18.5 11.8A6.5 6.5 0 1 1 15 6" fill="none" stroke="#ff9f68" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18.5 11.8A6.5 6.5 0 1 1 15 6" fill="none" stroke={INK} strokeWidth="1.35" strokeLinecap="round" />
      <path d="m13.5 3.6 2.8 2-2.2 2.4" fill="#ffd166" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12 9 .8 1.9 2 .8-2 .8L12 14.4l-.8-1.9-2-.8 2-.8Z" fill="#ffd166" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
    </>
  ),
  undo: (
    <>
      <path d="M8.5 8.5H15a4.8 4.8 0 1 1 0 9.6H10" fill="none" stroke="#7cc6fe" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M8.5 8.5H15a4.8 4.8 0 1 1 0 9.6H10" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.8 4.6 4.8 8.5l5 3.9Z" fill="#7cc6fe" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  redo: (
    <>
      <path d="M15.5 8.5H9a4.8 4.8 0 1 0 0 9.6h5" fill="none" stroke="#6fd0b4" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M15.5 8.5H9a4.8 4.8 0 1 0 0 9.6h5" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="m14.2 4.6 5 3.9-5 3.9Z" fill="#6fd0b4" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  duplicate: (
    <>
      <path d="M6.5 14.5c-1.8 0-3-1.2-3-2.9 0-1.4 1-2.5 2.2-2.7.5-1.5 1.8-2.4 3.4-2.4 1.8 0 3.2 1.2 3.4 2.9" fill="#ff8fa3" stroke={INK} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 18.2h6.8c2 0 3.2-1.3 3.2-3 0-1.4-.9-2.5-2.1-2.8-.4-1.6-1.8-2.8-3.6-2.8-1.6 0-3 .9-3.5 2.3-1.3.3-2.3 1.4-2.3 2.8 0 1.8 1.3 3.5 3.1 3.5Z" fill="#faf4e8" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <circle cx="15.8" cy="14.2" r="1.8" fill="#4a3b35" />
    </>
  ),
  delete: (
    <>
      <path d="M6.6 8.2h10.8l-1 10.6a1.8 1.8 0 0 1-1.8 1.6H9.4a1.8 1.8 0 0 1-1.8-1.6L6.6 8.2Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M4.8 7.6h14.4" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.4 7.5V5.6c0-.8.6-1.4 1.4-1.4h2.4c.8 0 1.4.6 1.4 1.4v1.9" fill="#ff8fa3" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10.2 11.4v5.4M13.8 11.4v5.4" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  dropSheep: (
    <>
      <path d="M5.5 14.5c-1.5-.3-2.5-1.5-2.5-3 0-1.4 1-2.6 2.3-2.9.6-1.7 2.2-2.9 4.2-2.9 1.9 0 3.5 1.1 4.1 2.7 1.3.3 2.2 1.5 2.2 2.9 0 1.7-1.2 3.1-2.9 3.2Z" fill="#faf4e8" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="9.6" cy="13.5" rx="3.4" ry="3.6" fill="#4a3b35" stroke={INK} strokeWidth="1.5" />
      <circle cx="8.3" cy="13" r="0.8" fill="#fff" />
      <circle cx="10.9" cy="13" r="0.8" fill="#fff" />
      <circle cx="7.4" cy="14.5" r="0.8" fill="#ff9fb4" />
      <circle cx="11.8" cy="14.5" r="0.8" fill="#ff9fb4" />
      <circle cx="18.2" cy="17.2" r="3.8" fill="#ffd166" stroke={INK} strokeWidth="1.5" />
      <path d="M18.2 15.4v3.6M16.4 17.2h3.6" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  howToPlay: (
    <>
      <path d="M3.5 6.4c2.8-1.2 5.8-.9 8.5.7 2.7-1.6 5.7-1.9 8.5-.7v11.8c-2.8-1.1-5.8-.8-8.5.7-2.7-1.5-5.7-1.8-8.5-.7V6.4Z" fill="#fff7df" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M12 7.1v11.8" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 10.2h3.6M6 13.4h3.2" stroke="#7cb547" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.2 6.2v6.6l1.5-1.1 1.5 1.1V6.2" fill="#ff8fa3" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
    </>
  ),
  soundOn: (
    <>
      <path d="M4.2 9.4h3.2l4.8-3.6v12.4l-4.8-3.6H4.2a1.2 1.2 0 0 1-1.2-1.2v-2.8a1.2 1.2 0 0 1 1.2-1.2Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M15.4 9.2a4.4 4.4 0 0 1 0 5.6" fill="none" stroke="#6fd0b4" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M18.2 6.8a7.8 7.8 0 0 1 0 10.4" fill="none" stroke="#ffd166" strokeWidth="2.1" strokeLinecap="round" />
    </>
  ),
  soundOff: (
    <>
      <path d="M4.2 9.4h3.2l4.8-3.6v12.4l-4.8-3.6H4.2a1.2 1.2 0 0 1-1.2-1.2v-2.8a1.2 1.2 0 0 1 1.2-1.2Z" fill="#dfd5c6" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" stroke="#d94f34" strokeWidth="2.1" strokeLinecap="round" />
    </>
  ),
  play: (
    <path
      d="M7.6 5.4c0-1 1.1-1.6 2-1.1l9.7 6.1c.8.5.8 1.7 0 2.2l-9.7 6.1c-.9.5-2-.1-2-1.1Z"
      fill="currentColor"
      stroke={INK}
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  ),
  close: (
    <path d="m7 7 10 10M17 7 7 17" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
  ),
  build: (
    <>
      <path d="M4.5 14.5 12 18.8l7.5-4.3-7.5-4.2Z" fill="#9fd8c6" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m6.5 9.8 5.5 3.1 5.5-3.1-5.5-3.1Z" fill="#ffd166" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  move: (
    <>
      <path d="M12 3.8v16.4M3.8 12h16.4" stroke="#7cc6fe" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M12 3.8v16.4M3.8 12h16.4" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      <path d="m9.4 6.2 2.6-2.8 2.6 2.8M9.4 17.8l2.6 2.8 2.6-2.8M6.2 9.4 3.4 12l2.8 2.6M17.8 9.4l2.8 2.6-2.8 2.6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.2" fill="#ffd166" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  rotL: (
    <>
      <path d="M7 9.4a6.5 6.5 0 1 1-1.2 6.8" fill="none" stroke="#b8b0f2" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M7 9.4a6.5 6.5 0 1 1-1.2 6.8" fill="none" stroke={INK} strokeWidth="1.55" strokeLinecap="round" />
      <path d="M5 4.8v4.8h4.8Z" fill="#b8b0f2" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  rotR: (
    <>
      <path d="M17 9.4a6.5 6.5 0 1 0 1.2 6.8" fill="none" stroke="#f6c9a0" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M17 9.4a6.5 6.5 0 1 0 1.2 6.8" fill="none" stroke={INK} strokeWidth="1.55" strokeLinecap="round" />
      <path d="M19 4.8v4.8h-4.8Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  save: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" fill="#faf4e8" stroke={INK} strokeWidth="1.6" />
      <rect x="7.5" y="4.5" width="9" height="4.8" rx="1.2" fill="#9fd8c6" stroke={INK} strokeWidth="1.4" />
      <path d="M12 11.4v4.8m-2.4-2.1 2.4 2.4 2.4-2.4" stroke="#d94f34" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  load: (
    <>
      <path d="M4 7.5c0-1 .8-1.8 1.8-1.8h4l1.6 1.8h6.8c1 0 1.8.8 1.8 1.8v8.4c0 1-.8 1.8-1.8 1.8H5.8c-1 0-1.8-.8-1.8-1.8Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 16v-4.8m-2.4 2.1L12 10.9l2.4 2.4" stroke="#3a7d44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  share: (
    <>
      <circle cx="17.2" cy="6.6" r="2.6" fill="#ff8fa3" stroke={INK} strokeWidth="1.5" />
      <circle cx="6.8" cy="12" r="2.6" fill="#ffd166" stroke={INK} strokeWidth="1.5" />
      <circle cx="17.2" cy="17.4" r="2.6" fill="#7cc6fe" stroke={INK} strokeWidth="1.5" />
      <path d="m9.2 10.8 5.6-3M9.2 13.2l5.6 3" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  reset: (
    <>
      <path d="M5.5 9.5a7.2 7.2 0 1 1-.6 6.2" fill="none" stroke="#ff9f68" strokeWidth="3" strokeLinecap="round" />
      <path d="M5.5 9.5a7.2 7.2 0 1 1-.6 6.2" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.4 5v4.6H9Z" fill="#ffd166" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
    </>
  ),
  ramp: (
    <>
      <path d="M4 18.5h16v-8.5h-4.5c-3 0-6.2 3.2-11.5 8.5Z" fill="#9fd8c6" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <circle cx="15.4" cy="10" r="1.6" fill="#d9dfe8" stroke={INK} strokeWidth="1.3" />
    </>
  ),
  rail: (
    <>
      <path d="M6.5 11.8V18M17.5 11.8V18M4.5 18h4M15.5 18h4" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
      <rect x="3" y="9" width="18" height="3.2" rx="1.6" fill="#ff8c7a" stroke={INK} strokeWidth="1.6" />
    </>
  ),
  ledge: (
    <>
      <rect x="4" y="10" width="16" height="8" rx="2.4" fill="#b8b0f2" stroke={INK} strokeWidth="1.65" />
      <line x1="6" y1="12.5" x2="18" y2="12.5" stroke="#e4e0fb" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  cone: (
    <>
      <rect x="5.2" y="17.2" width="13.6" height="2.4" rx="1.2" fill="#ff9a4d" stroke={INK} strokeWidth="1.4" />
      <path d="M12 4.5 7.4 17.2h9.2Z" fill="#ff9a4d" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.6 11.2h4.8l.9 2.6H8.7Z" fill="#fff7ea" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </>
  ),
  bench: (
    <>
      <path d="M7 13v5M17 13v5M7 15.5h10" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
      <rect x="3.5" y="9.5" width="17" height="3.6" rx="1.4" fill="#f6c9a0" stroke={INK} strokeWidth="1.6" />
    </>
  ),
  tree: (
    <>
      <path d="M12 19.5v-5.5" stroke="#7a5636" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M12 19.5v-5.5" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8.5" cy="11.2" r="3.4" fill="#7cb547" stroke={INK} strokeWidth="1.4" />
      <circle cx="15.5" cy="11.2" r="3.4" fill="#7cb547" stroke={INK} strokeWidth="1.4" />
      <circle cx="12" cy="8.2" r="4.4" fill="#9fd164" stroke={INK} strokeWidth="1.5" />
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
