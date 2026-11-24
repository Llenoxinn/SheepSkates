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

const INK = '#2b2622';

/** Shared SVG definitions mounted once at the app root to avoid duplicate DOM IDs. */
export function GouacheDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <filter id="ss-gouache-edge" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

const ICONS: Record<ArtIconName, ReactNode> = {
  idle: (
    <>
      {/* Ground meadow turf disc + blooming 8-petal golden daisy with two-tone leaves */}
      <ellipse cx="12" cy="19.8" rx="7.5" ry="2.2" fill="#8cc155" stroke={INK} strokeWidth="1.5" />
      <path d="M12 19.5v-8.2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 17.2c-3.2-.1-5.2-1.8-5.6-4.5 2.7-.4 4.8 1 5.6 4.5Z" fill="#7cb547" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 17.6c3-.2 4.8-1.6 5.2-4-2.5-.4-4.4.8-5.2 4Z" fill="#a8db6f" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="5.2" r="2.3" fill="#fffdf8" stroke={INK} strokeWidth="1.45" />
      <circle cx="15.8" cy="7.6" r="2.3" fill="#fffdf8" stroke={INK} strokeWidth="1.45" />
      <circle cx="15.4" cy="11.8" r="2.3" fill="#f5ead6" stroke={INK} strokeWidth="1.45" />
      <circle cx="12" cy="13.4" r="2.2" fill="#f5ead6" stroke={INK} strokeWidth="1.45" />
      <circle cx="8.6" cy="11.8" r="2.3" fill="#f5ead6" stroke={INK} strokeWidth="1.45" />
      <circle cx="8.2" cy="7.6" r="2.3" fill="#fffdf8" stroke={INK} strokeWidth="1.45" />
      <circle cx="12" cy="9.2" r="3" fill="#ffd166" stroke={INK} strokeWidth="1.6" />
      <circle cx="11.1" cy="8.3" r="0.8" fill="#fffdf8" />
    </>
  ),
  cruise: (
    <>
      {/* Crouched wooly sheep in mustard beanie cruising with turquoise wind streams */}
      <path d="M2 8.5h5.8M1.5 12.2h4.8M2.5 15.8h3.5" stroke="#5db7f8" strokeWidth="2" strokeLinecap="round" />
      <path d="M5.5 17.2c2.2 1 5.2 1.3 11.2 1.3 2.2 0 3.8-.7 4.8-2.2" stroke="#ff6b8b" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M5.5 17.2c2.2 1 5.2 1.3 11.2 1.3 2.2 0 3.8-.7 4.8-2.2" stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="9.2" cy="20" r="2.3" fill="#fbf3e1" stroke={INK} strokeWidth="1.6" />
      <circle cx="17.8" cy="20" r="2.3" fill="#fbf3e1" stroke={INK} strokeWidth="1.6" />
      <circle cx="9.2" cy="20" r="0.8" fill="#ff6b8b" />
      <circle cx="17.8" cy="20" r="0.8" fill="#ff6b8b" />
      <path d="M9.5 15.2c-1.8 0-3.1-1.3-3.1-2.9 0-1.4 1-2.5 2.3-2.8.6-1.8 2.2-3 4.2-3 2.1 0 3.9 1.4 4.3 3.4 1.2.4 2.1 1.5 2.1 2.8 0 1.5-1.2 2.5-2.8 2.5Z" fill="#fffdf8" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="17.8" cy="10.8" r="2.8" fill="#3a2f2b" stroke={INK} strokeWidth="1.45" />
      <path d="M15.4 9.2c.3-2.2 1.6-3.4 3.2-3.4s2.8 1.2 3 3.4Z" fill="#ffd166" stroke={INK} strokeWidth="1.35" />
    </>
  ),
  grind: (
    <>
      {/* Isometric 3D coral grind rail + locked gold skateboard + 4-point spark bursts */}
      <path d="M5.5 15.2v5.2M18.5 14v5.2M3.6 20.4h3.8M16.6 19.2h3.8" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2.5 14.2 21.5 12" stroke="#ff7c66" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M2.5 14.2 21.5 12" stroke={INK} strokeWidth="1.65" strokeLinecap="round" />
      <g transform="rotate(-18 12 9.4)">
        <rect x="4.8" y="7.4" width="14.4" height="3.6" rx="1.8" fill="#ffd166" stroke={INK} strokeWidth="1.6" />
        <circle cx="7.8" cy="11.8" r="1.5" fill="#fbf3e1" stroke={INK} strokeWidth="1.35" />
        <circle cx="16.2" cy="11.8" r="1.5" fill="#fbf3e1" stroke={INK} strokeWidth="1.35" />
      </g>
      <path d="m11.5 2.2.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7Z" fill="#ffd166" stroke={INK} strokeWidth="1.05" strokeLinejoin="round" />
      <path d="M17.5 4.8l1.6-1.4M6.8 5.6 5.2 4.2" stroke="#ff9f1c" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  ollie: (
    <>
      {/* Steep 28° popped coral deck + dotted sky-blue launch arc + golden tail snap star */}
      <path d="M4.5 15.8C6.8 7.6 14.5 5.8 19.5 10.2" fill="none" stroke="#5db7f8" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2.5 2.5" />
      <path d="m17.2 10.8 2.8-.2-.4-2.8" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m5.2 17.2.8 1.6 1.6.8-1.6.8-.8 1.6-.8-1.6-1.6-.8 1.6-.8Z" fill="#ffd166" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <g transform="rotate(-26 13.2 14.2)">
        <rect x="4.8" y="12.2" width="16.8" height="3.8" rx="1.9" fill="#ff6b8b" stroke={INK} strokeWidth="1.65" />
        <line x1="7.4" y1="13.3" x2="19" y2="13.3" stroke="#35333e" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="8.4" cy="17.2" r="1.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.45" />
        <circle cx="17.8" cy="17.2" r="1.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.45" />
      </g>
    </>
  ),
  kickflip: (
    <>
      {/* Helical 360° mint flip ribbon wrapping a mid-twist two-tone skateboard */}
      <path d="M5.2 11.2c1.2-5.4 9.2-7.2 12.8-2.4" fill="none" stroke="#56c7a6" strokeWidth="2.6" strokeLinecap="round" />
      <path d="m18.2 5.4.6 3.5-3.4-.5" fill="#56c7a6" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <g transform="rotate(-22 12 13.8)">
        <path d="M3.8 13.8c0-1.6 2-2.6 4.8-2.6h6.8c2.8 0 4.8 1 4.8 2.6 0 1.6-2 2.6-4.8 2.6H8.6c-2.8 0-4.8-1-4.8-2.6Z" fill="#a59cf5" stroke={INK} strokeWidth="1.65" />
        <path d="M5.5 13.8h13" stroke="#ffd166" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="7.6" cy="17.2" r="1.55" fill="#fbf3e1" stroke={INK} strokeWidth="1.35" />
        <circle cx="16.4" cy="17.2" r="1.55" fill="#fbf3e1" stroke={INK} strokeWidth="1.35" />
      </g>
      <path d="M18.8 15.2c-1.8 4.4-9.2 5.6-12.6 1.8" fill="none" stroke="#56c7a6" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2.5" />
      <path d="m19 15.8.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7Z" fill="#ffd166" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
    </>
  ),
  spin: (
    <>
      {/* Dual-ribbon 360° cyclone vortex with central golden star */}
      <path d="M19.2 12a7.2 7.2 0 1 1-3.8-6.4" fill="none" stroke="#ff8c5a" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M19.2 12a7.2 7.2 0 1 1-3.8-6.4" fill="none" stroke={INK} strokeWidth="1.55" strokeLinecap="round" />
      <path d="m14.2 2.6 3.8 2.6-3 3Z" fill="#ffd166" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="m12 7.8 1.2 2.7 2.7 1.2-2.7 1.2-1.2 2.7-1.2-2.7-2.7-1.2 2.7-1.2Z" fill="#ffd166" stroke={INK} strokeWidth="1.45" strokeLinejoin="round" />
    </>
  ),
  undo: (
    <>
      {/* Chunky 3D die-cut return arrow ribbon */}
      <path d="M9 8.4h5.8a4.8 4.8 0 1 1 0 9.6H9.5" fill="none" stroke="#5db7f8" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M9 8.4h5.8a4.8 4.8 0 1 1 0 9.6H9.5" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.2 3.8 4.2 8.4l6 4.6Z" fill="#7cc6fe" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
    </>
  ),
  redo: (
    <>
      {/* Chunky 3D die-cut forward arrow ribbon */}
      <path d="M15 8.4H9.2a4.8 4.8 0 1 0 0 9.6h5.3" fill="none" stroke="#56c7a6" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M15 8.4H9.2a4.8 4.8 0 1 0 0 9.6h5.3" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
      <path d="m13.8 3.8 6 4.6-6 4.6Z" fill="#6fd0b4" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
    </>
  ),
  duplicate: (
    <>
      {/* Twin mascot sheep heads (coral clone behind + full wooly sheep in front) */}
      <circle cx="8.2" cy="10.2" r="5.2" fill="#ff8fa3" stroke={INK} strokeWidth="1.55" />
      <path d="M9.8 19.2c-2.2 0-3.8-1.5-3.8-3.5 0-1.6 1-2.9 2.4-3.3.6-2 2.4-3.4 4.6-3.4s4 1.4 4.6 3.4c1.4.4 2.4 1.7 2.4 3.3 0 2-1.6 3.5-3.8 3.5Z" fill="#fffdf8" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <ellipse cx="9.6" cy="14" rx="2.1" ry="1" transform="rotate(-16 9.6 14)" fill="#3a2f2b" stroke={INK} strokeWidth="1.2" />
      <ellipse cx="19.6" cy="14" rx="2.1" ry="1" transform="rotate(16 19.6 14)" fill="#3a2f2b" stroke={INK} strokeWidth="1.2" />
      <ellipse cx="14.6" cy="15.2" rx="3.8" ry="3.6" fill="#3a2f2b" stroke={INK} strokeWidth="1.5" />
      <circle cx="13.3" cy="14.8" r="0.8" fill="#fff" />
      <circle cx="15.9" cy="14.8" r="0.8" fill="#fff" />
      <path d="M11.6 12.6c.3-2 1.5-3.1 3-3.1s2.7 1.1 3 3.1Z" fill="#ffd166" stroke={INK} strokeWidth="1.35" />
    </>
  ),
  delete: (
    <>
      {/* Workshop bin with popping coral lid & brass handle */}
      <path d="M6.2 9.2h11.6l-1.1 10.4a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.8L6.2 9.2Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.2 10.4v8.8" stroke="#fff5e6" strokeWidth="1.3" strokeLinecap="round" />
      <g transform="rotate(-8 12 6.4)">
        <path d="M9.4 6.6V4.8c0-.8.6-1.4 1.4-1.4h2.4c.8 0 1.4.6 1.4 1.4v1.8" fill="#ffd166" stroke={INK} strokeWidth="1.55" />
        <rect x="4.2" y="5.8" width="15.6" height="2.6" rx="1.3" fill="#ff6b8b" stroke={INK} strokeWidth="1.65" />
      </g>
      <path d="M10.2 12.2v5M13.8 12.2v5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  dropSheep: (
    <>
      {/* Cute portrait sheep in mustard beanie + golden '+' spawn coin */}
      <circle cx="10.2" cy="12.6" r="6.8" fill="#fffdf8" stroke={INK} strokeWidth="1.65" />
      <ellipse cx="4.8" cy="11.6" rx="2.4" ry="1.15" transform="rotate(-16 4.8 11.6)" fill="#3a2f2b" stroke={INK} strokeWidth="1.35" />
      <ellipse cx="15.6" cy="11.6" rx="2.4" ry="1.15" transform="rotate(16 15.6 11.6)" fill="#3a2f2b" stroke={INK} strokeWidth="1.35" />
      <path d="M6.2 12.5c0-2.6 1.8-4.4 4-4.4s4 1.8 4 4.4c0 2.5-1.6 5-4 5s-4-2.5-4-5Z" fill="#3a2f2b" stroke={INK} strokeWidth="1.55" />
      <circle cx="8.7" cy="13" r="0.9" fill="#fff" />
      <circle cx="11.7" cy="13" r="0.9" fill="#fff" />
      <ellipse cx="7.5" cy="14.5" rx="1" ry="0.6" fill="#ff8fa3" />
      <ellipse cx="12.9" cy="14.5" rx="1" ry="0.6" fill="#ff8fa3" />
      <path d="M6.4 9.5c.3-2.6 1.8-4.1 3.8-4.1s3.5 1.5 3.8 4.1Z" fill="#f4b938" stroke={INK} strokeWidth="1.45" />
      <rect x="5.8" y="8.4" width="8.8" height="2.2" rx="1.1" fill="#ffd666" stroke={INK} strokeWidth="1.35" />
      <circle cx="18.2" cy="17.4" r="4.2" fill="#6fd0b4" stroke={INK} strokeWidth="1.6" />
      <path d="M18.2 15.4v4M16.2 17.4h4" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  howToPlay: (
    <>
      {/* Open field guide book with coral cover edge, meadow lines & ribbon bookmark */}
      <path d="M2.6 7.4c3-1.1 6.3-.8 9.4.8 3.1-1.6 6.4-1.9 9.4-.8v12c-3-1.1-6.3-.8-9.4.8-3.1-1.6-6.4-1.9-9.4-.8V7.4Z" fill="#ff6b8b" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.4 6c2.9-1.2 5.9-.9 8.6.8 2.7-1.7 5.7-2 8.6-.8v11.6c-2.9-1.1-5.9-.8-8.6.8-2.7-1.6-5.7-1.9-8.6-.8V6Z" fill="#fff9e8" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M12 6.8v11.6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7.6" cy="11.2" r="2" fill="#8cc155" stroke={INK} strokeWidth="1.3" />
      <path d="M5.6 15h4" stroke="#7cb547" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.4 5.8v7.2l1.7-1.3 1.7 1.3V5.8" fill="#ffd166" stroke={INK} strokeWidth="1.45" strokeLinejoin="round" />
    </>
  ),
  soundOn: (
    <>
      {/* Vintage brass & timber horn speaker with duotone soundwave arcs */}
      <path d="M7.2 9.2 13 5.2v13.6l-5.8-4H4.2A1.4 1.4 0 0 1 2.8 13.4v-2.8A1.4 1.4 0 0 1 4.2 9.2h3Z" fill="#ffd166" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <rect x="2.8" y="9.2" width="4.2" height="5.6" rx="1.2" fill="#ff8fa3" stroke={INK} strokeWidth="1.6" />
      <path d="M15.8 9a4.5 4.5 0 0 1 0 6" fill="none" stroke="#56c7a6" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M18.8 6.4a8 8 0 0 1 0 11.2" fill="none" stroke="#5db7f8" strokeWidth="2.3" strokeLinecap="round" />
    </>
  ),
  soundOff: (
    <>
      <path d="M7.2 9.2 13 5.2v13.6l-5.8-4H4.2A1.4 1.4 0 0 1 2.8 13.4v-2.8A1.4 1.4 0 0 1 4.2 9.2h3Z" fill="#dfd5c6" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <rect x="2.8" y="9.2" width="4.2" height="5.6" rx="1.2" fill="#bfb3a2" stroke={INK} strokeWidth="1.6" />
      <circle cx="18.2" cy="12" r="3.8" fill="#ff6b8b" stroke={INK} strokeWidth="1.5" />
      <path d="m16.8 10.6 2.8 2.8M19.6 10.6l-2.8 2.8" stroke="#fffdf8" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  play: (
    <>
      <path
        d="M7.2 5c0-1.1 1.2-1.8 2.2-1.2l10.2 6.4c.9.5.9 1.9 0 2.4L9.4 19c-1 .6-2.2-.1-2.2-1.2Z"
        fill="currentColor"
        stroke={INK}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.6 7.4 16.4 11.6" stroke="#fffdf8" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
    </>
  ),
  close: (
    <>
      <circle cx="12" cy="12" r="8.8" fill="#fff4e0" stroke={INK} strokeWidth="1.6" />
      <path d="m8.6 8.6 6.8 6.8M15.4 8.6l-6.8 6.8" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  build: (
    <>
      {/* 3D Isometric Modular Skatepark Blocks (Mint Base + Golden Top Cube) */}
      <path d="M3.6 14.2 12 18.8l8.4-4.6L12 9.6Z" fill="#a8e6d3" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M3.6 14.2v3.6L12 22.2v-3.4Z" fill="#6fd0b4" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M20.4 14.2v3.6L12 22.2v-3.4Z" fill="#4eb396" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M6.4 7.6 12 10.8l5.6-3.2L12 4.4Z" fill="#ffe48f" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M6.4 7.6v3.6L12 14.4v-3.6Z" fill="#ffd166" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M17.6 7.6v3.6L12 14.4v-3.6Z" fill="#e6a82e" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
    </>
  ),
  move: (
    <>
      {/* 4-Way Tactile Compass Arrows + Golden Center Pivot */}
      <path d="M12 3.2v17.6M3.2 12h17.6" stroke="#5db7f8" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M12 3.2v17.6M3.2 12h17.6" stroke={INK} strokeWidth="1.55" strokeLinecap="round" />
      <path d="m9.2 5.8 2.8-3 2.8 3M9.2 18.2l2.8 3 2.8-3M5.8 9.2l-3 2.8 3 2.8M18.2 9.2l3 2.8-3 2.8" fill="#7cc6fe" stroke={INK} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.7" fill="#ffd166" stroke={INK} strokeWidth="1.55" />
    </>
  ),
  rotL: (
    <>
      <path d="M6.8 9.2a6.6 6.6 0 1 1-1 7.2" fill="none" stroke="#a59cf5" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M6.8 9.2a6.6 6.6 0 1 1-1 7.2" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.2 4.2v5.6h5.6Z" fill="#b8b0f2" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="1" transform="rotate(-25 12 12)" fill="#ffd166" stroke={INK} strokeWidth="1.35" />
    </>
  ),
  rotR: (
    <>
      <path d="M17.2 9.2a6.6 6.6 0 1 0 1 7.2" fill="none" stroke="#ff9f68" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M17.2 9.2a6.6 6.6 0 1 0 1 7.2" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19.8 4.2v5.6h-5.6Z" fill="#f6c9a0" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="1" transform="rotate(25 12 12)" fill="#ffd166" stroke={INK} strokeWidth="1.35" />
    </>
  ),
  save: (
    <>
      {/* Storybook Floppy/Park Cartridge with Coral Download Arrow Badge */}
      <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="3.5" fill="#fffdf8" stroke={INK} strokeWidth="1.7" />
      <rect x="7" y="3.8" width="10" height="5.4" rx="1.4" fill="#6fd0b4" stroke={INK} strokeWidth="1.5" />
      <rect x="6.6" y="11.4" width="10.8" height="8.8" rx="1.8" fill="#ffd166" stroke={INK} strokeWidth="1.45" />
      <path d="M12 12.8v4.6m-2.3-2 2.3 2.3 2.3-2.3" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  load: (
    <>
      {/* Tactile Field Case Folder with Rising Mint Document */}
      <path d="M3.5 7.2c0-1.1.9-2 2-2h4.2l1.8 2h7c1.1 0 2 .9 2 2v8.8c0 1.1-.9 2-2 2h-15c-1.1 0-2-.9-2-2Z" fill="#e5a970" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <rect x="6.5" y="6.2" width="11" height="6" rx="1.4" fill="#fffdf8" stroke={INK} strokeWidth="1.4" />
      <path d="M3.5 10.2h17v7.8c0 1.1-.9 2-2 2h-13c-1.1 0-2-.9-2-2Z" fill="#ffd166" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M12 17.6v-4.8m-2.4 2.1L12 12.5l2.4 2.4" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  share: (
    <>
      {/* Connected Tri-Color Enamel Constellation Nodes */}
      <path d="m8.6 10.6 6.8-3.6M8.6 13.4l6.8 3.6" stroke={INK} strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="17.2" cy="6.2" r="3.2" fill="#ff6b8b" stroke={INK} strokeWidth="1.6" />
      <circle cx="6.4" cy="12" r="3.2" fill="#ffd166" stroke={INK} strokeWidth="1.6" />
      <circle cx="17.2" cy="17.8" r="3.2" fill="#5db7f8" stroke={INK} strokeWidth="1.6" />
      <circle cx="16.4" cy="5.4" r="0.8" fill="#fffdf8" />
      <circle cx="5.6" cy="11.2" r="0.8" fill="#fffdf8" />
      <circle cx="16.4" cy="17" r="0.8" fill="#fffdf8" />
    </>
  ),
  reset: (
    <>
      <path d="M5.4 9.2a7.2 7.2 0 1 1-.6 6.4" fill="none" stroke="#ff8c5a" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M5.4 9.2a7.2 7.2 0 1 1-.6 6.4" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.8 4.4v5.4h5.4Z" fill="#ffd166" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="#6fd0b4" stroke={INK} strokeWidth="1.35" />
    </>
  ),
  ramp: (
    <>
      {/* 3D Isometric Mint Quarter-Pipe with Maple Plywood Side & Brushed Steel Coping */}
      <path d="M3 18.8h12.6V8.6h-3c-2.6 0-5.4 3.8-9.6 10.2Z" fill="#8fd4c1" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M15.6 8.6h4.8v10.2h-4.8Z" fill="#e5b880" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <line x1="15.6" y1="12" x2="20.4" y2="12" stroke="#c89658" strokeWidth="1.2" />
      <line x1="15.6" y1="15.4" x2="20.4" y2="15.4" stroke="#c89658" strokeWidth="1.2" />
      <circle cx="12.6" cy="8.6" r="1.8" fill="#e2e7f0" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  rail: (
    <>
      {/* 3D Isometric Coral Grind Rail with Welded Baseplates & Top Specular Tube */}
      <ellipse cx="6.5" cy="18.4" rx="2.6" ry="1" fill="#cfd5df" stroke={INK} strokeWidth="1.4" />
      <ellipse cx="17.5" cy="17.2" rx="2.6" ry="1" fill="#cfd5df" stroke={INK} strokeWidth="1.4" />
      <path d="M6.5 11.8v6.2M17.5 10.6v6.2" stroke={INK} strokeWidth="2.1" strokeLinecap="round" />
      <path d="M3.2 11.6 20.8 9.6" stroke="#ff7c66" strokeWidth="4.6" strokeLinecap="round" />
      <path d="M3.2 11.6 20.8 9.6" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4.6 10.9 19.4 9.2" stroke="#ffd2c9" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  ledge: (
    <>
      {/* 3D Isometric Lavender Funbox Ledge with Waxed Steel Grind Edge */}
      <path d="M3.2 11.4 7.2 7.8h13.6l-4 3.6Z" fill="#d8d2fc" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="3.2" y="11.4" width="13.6" height="7.4" rx="1.2" fill="#a89ef0" stroke={INK} strokeWidth="1.65" />
      <path d="M16.8 11.4 20.8 7.8v7.4l-4 3.6Z" fill="#8579d6" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <line x1="3.8" y1="11.4" x2="16.4" y2="11.4" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  cone: (
    <>
      {/* 3D Striped Safety Cone with Isometric Square Base Flange */}
      <path d="M4.2 18.2 7.5 16h9l3.3 2.2-3.3 1.8h-9Z" fill="#e07428" stroke={INK} strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M12 3.8 7.2 17.4h9.6Z" fill="#ff9240" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
      <path d="M9.3 10.2h5.4l1.1 3.2H8.2Z" fill="#fffdf8" stroke={INK} strokeWidth="1.35" strokeLinejoin="round" />
    </>
  ),
  bench: (
    <>
      {/* 3D Park Bench with Warm Timber Slats, Backrest & Cast-Iron Legs */}
      <path d="M6.4 13.6v5.4M17.6 13.6v5.4M6.4 16.4h11.2" stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
      <rect x="4" y="6.6" width="16" height="3.2" rx="1.2" fill="#e5a970" stroke={INK} strokeWidth="1.55" />
      <path d="M3 10.4h18l-1.4 3.4H4.4Z" fill="#ffd166" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  tree: (
    <>
      {/* Multi-Crown Pastoral Tree with Forked Bark Trunk, Blossoms & Sunlit Canopy */}
      <path d="M12 20.5v-6.8M12 16.2l-2.2-2M12 15.6l2.2-1.8" stroke="#6e4b2e" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M12 20.5v-6.8" stroke={INK} strokeWidth="1.45" strokeLinecap="round" />
      <circle cx="7.8" cy="11.6" r="3.8" fill="#6eb03d" stroke={INK} strokeWidth="1.5" />
      <circle cx="16.2" cy="11.6" r="3.8" fill="#6eb03d" stroke={INK} strokeWidth="1.5" />
      <circle cx="12" cy="7.8" r="4.8" fill="#9cd35e" stroke={INK} strokeWidth="1.6" />
      <circle cx="10.2" cy="6.4" r="1.3" fill="#ff9ebb" />
      <circle cx="14.2" cy="8.2" r="1.1" fill="#ffd166" />
    </>
  ),
  boardStreet: (
    <>
      <g transform="rotate(30 12 12)">
        <rect x="7" y="6.4" width="2.1" height="2.7" rx="0.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.15" />
        <rect x="14.9" y="6.4" width="2.1" height="2.7" rx="0.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.15" />
        <rect x="7" y="14.9" width="2.1" height="2.7" rx="0.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.15" />
        <rect x="14.9" y="14.9" width="2.1" height="2.7" rx="0.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.15" />
        <rect x="8.5" y="2.5" width="7" height="19" rx="3.5" fill="#ff6b8b" stroke={INK} strokeWidth="1.65" />
        <rect x="9.8" y="4.8" width="4.4" height="14.4" rx="2.2" fill="#35333e" />
        <circle cx="12" cy="12" r="1.5" fill="#ffd166" />
      </g>
    </>
  ),
  boardCruiser: (
    <>
      <g transform="rotate(30 12 12)">
        <rect x="6.9" y="6.7" width="2.1" height="2.7" rx="0.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.15" />
        <rect x="15" y="6.7" width="2.1" height="2.7" rx="0.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.15" />
        <rect x="7.2" y="14.8" width="2.1" height="2.7" rx="0.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.15" />
        <rect x="14.7" y="14.8" width="2.1" height="2.7" rx="0.8" fill="#fbf3e1" stroke={INK} strokeWidth="1.15" />
        <path
          d="M12 2.8c2.8 0 4 2.2 3.9 5.3-.1 3-.8 6.5-.4 12.3L12 17.6l-3.5 2.8c.4-5.8-.3-9.3-.4-12.3C8 5 9.2 2.8 12 2.8Z"
          fill="#56c7a6"
          stroke={INK}
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
        <path d="M12 5v10.5" stroke="#fffdf8" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </>
  ),
  boardOldschool: (
    <>
      <g transform="rotate(30 12 12)">
        <rect x="6.2" y="6.9" width="2.1" height="2.6" rx="0.7" fill="#35333e" stroke={INK} strokeWidth="1.15" />
        <rect x="15.7" y="6.9" width="2.1" height="2.6" rx="0.7" fill="#35333e" stroke={INK} strokeWidth="1.15" />
        <rect x="6.2" y="14.8" width="2.1" height="2.6" rx="0.7" fill="#35333e" stroke={INK} strokeWidth="1.15" />
        <rect x="15.7" y="14.8" width="2.1" height="2.6" rx="0.7" fill="#35333e" stroke={INK} strokeWidth="1.15" />
        <path
          d="M12 2.5c2.4 1.2 4.1 3.3 4.3 5.9.1 1.6-.9 2.8-.9 4.2 0 1.7 1.1 3.2.8 5.5l-1 2.3H8.8l-1-2.3c-.3-2.3.8-3.8.8-5.5 0-1.4-1-2.6-.9-4.2.2-2.6 1.9-4.7 4.3-5.9Z"
          fill="#ffd166"
          stroke={INK}
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
        <rect x="9.5" y="6.6" width="5" height="10.8" rx="1.6" fill="#35333e" />
        <line x1="9.5" y1="12" x2="14.5" y2="12" stroke="#ff6b8b" strokeWidth="1.5" />
      </g>
    </>
  ),
  boardPintail: (
    <>
      <g transform="rotate(30 12 12)">
        <rect x="7.5" y="5.9" width="2.1" height="2.9" rx="0.8" fill="#ffd166" stroke={INK} strokeWidth="1.15" />
        <rect x="14.4" y="5.9" width="2.1" height="2.9" rx="0.8" fill="#ffd166" stroke={INK} strokeWidth="1.15" />
        <rect x="7.5" y="15.2" width="2.1" height="2.9" rx="0.8" fill="#ffd166" stroke={INK} strokeWidth="1.15" />
        <rect x="14.4" y="15.2" width="2.1" height="2.9" rx="0.8" fill="#ffd166" stroke={INK} strokeWidth="1.15" />
        <path
          d="M12 1.6c2.7 2.6 3.6 5.7 3.5 9.6-.1 3.9-1 7.7-3.5 11.2-2.5-3.5-3.4-7.3-3.5-11.2C8.4 7.3 9.3 4.2 12 1.6Z"
          fill="#988ee6"
          stroke={INK}
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
        <path d="M12 4.2v15.4" stroke="#fffdf8" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </>
  ),
  deck: (
    <>
      {/* Deck Studio Icon: Angled Custom Graphic Skateboard + Golden Star Badge */}
      <g transform="rotate(26 12 12)">
        <rect x="6.5" y="6.2" width="2.3" height="2.8" rx="0.8" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
        <rect x="15.2" y="6.2" width="2.3" height="2.8" rx="0.8" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
        <rect x="6.5" y="15" width="2.3" height="2.8" rx="0.8" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
        <rect x="15.2" y="15" width="2.3" height="2.8" rx="0.8" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
        <rect x="8" y="2.2" width="8" height="19.6" rx="4" fill="#ff7c66" stroke={INK} strokeWidth="1.65" />
        <path d="M8.5 9.5h7v5h-7Z" fill="#ffd166" />
        <circle cx="12" cy="12" r="1.8" fill="#fffdf8" stroke={INK} strokeWidth="1.2" />
      </g>
    </>
  ),
  randomize: (
    <>
      {/* Tactile 3D Beveled Game Die with Colorful Gouache Pips */}
      <rect x="3.5" y="4.8" width="16.4" height="16.4" rx="3.8" fill="#e5d6be" stroke={INK} strokeWidth="1.6" />
      <rect x="3.8" y="3.5" width="16.4" height="16.4" rx="3.8" fill="#fffdf8" stroke={INK} strokeWidth="1.65" />
      <circle cx="8.2" cy="7.9" r="1.6" fill="#ff6b8b" stroke={INK} strokeWidth="0.7" />
      <circle cx="15.8" cy="7.9" r="1.6" fill="#56c7a6" stroke={INK} strokeWidth="0.7" />
      <circle cx="12" cy="11.7" r="1.75" fill="#ffd166" stroke={INK} strokeWidth="0.8" />
      <circle cx="8.2" cy="15.5" r="1.6" fill="#5db7f8" stroke={INK} strokeWidth="0.7" />
      <circle cx="15.8" cy="15.5" r="1.6" fill="#988ee6" stroke={INK} strokeWidth="0.7" />
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
