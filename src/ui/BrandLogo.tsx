const INK = '#2b2622';

function StickerMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* Sunlit storybook circular medallion backdrop */}
      <circle cx="32" cy="32" r="29" fill="#d9eefb" stroke={INK} strokeWidth="2.4" />
      <path d="M7.5 43.5c9-5.2 21-6.2 31.5-2.8 7.5 2.4 13.8 2.2 18.5.4A29 29 0 0 1 7.5 43.5Z" fill="#8cc155" />
      <circle cx="15" cy="17" r="4.5" fill="#ffe18c" />
      {/* Sparkles */}
      <path d="M50 14l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" fill="#ffd166" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
      {/* Skateboard */}
      <g transform="rotate(-8 32 47)">
        <rect x="13" y="45" width="38" height="5.2" rx="2.6" fill="#ff8fa3" stroke={INK} strokeWidth="2" />
        <line x1="17" y1="45" x2="47" y2="45" stroke="#3f3d48" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="21" cy="52.4" r="3.4" fill="#f5ecd6" stroke={INK} strokeWidth="1.8" />
        <circle cx="43" cy="52.4" r="3.4" fill="#f5ecd6" stroke={INK} strokeWidth="1.8" />
        <circle cx="21" cy="52.4" r="1.1" fill="#bcc1cc" />
        <circle cx="43" cy="52.4" r="1.1" fill="#bcc1cc" />
      </g>
      {/* Hooves */}
      <ellipse cx="22.5" cy="43.8" rx="2.6" ry="2.2" fill="#4a3b35" stroke={INK} strokeWidth="1.5" />
      <ellipse cx="38" cy="42.4" rx="2.6" ry="2.2" fill="#4a3b35" stroke={INK} strokeWidth="1.5" />
      {/* Fluffy wool body */}
      <path
        d="M17.5 38.5c-3.2 0-5.5-2.3-5.5-5.3 0-2.1 1.1-3.9 2.9-4.7-.1-3.4 2.5-6.2 6-6.2 1.2 0 2.3.4 3.3 1 1.4-2.1 3.8-3.4 6.5-3.4 4.2 0 7.6 3.2 7.8 7.3 2.5.7 4.3 2.9 4.3 5.6 0 3.2-2.6 5.7-5.8 5.7Z"
        fill="#faf4e8"
        stroke={INK}
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M19 36.5c4.5 1.2 12 1.2 16.5-.2" stroke="#e4d7c1" strokeWidth="2.4" strokeLinecap="round" />
      {/* Cocoa head & ears */}
      <ellipse cx="23.8" cy="27.8" rx="4.2" ry="2.1" transform="rotate(-18 23.8 27.8)" fill="#4a3b35" stroke={INK} strokeWidth="1.7" />
      <ellipse cx="44" cy="26.5" rx="4.2" ry="2.1" transform="rotate(14 44 26.5)" fill="#4a3b35" stroke={INK} strokeWidth="1.7" />
      <ellipse cx="34.6" cy="29.6" rx="8.4" ry="7.8" fill="#4a3b35" stroke={INK} strokeWidth="2" />
      {/* Face */}
      <circle cx="32.4" cy="28.6" r="2.1" fill="#fff" />
      <circle cx="38.2" cy="28.6" r="2.1" fill="#fff" />
      <circle cx="32.8" cy="28.8" r="1.2" fill="#141010" />
      <circle cx="38.6" cy="28.8" r="1.2" fill="#141010" />
      <circle cx="32" cy="28" r="0.6" fill="#fff" />
      <circle cx="37.8" cy="28" r="0.6" fill="#fff" />
      <ellipse cx="29.5" cy="32.2" rx="2" ry="1.3" fill="#ff9fb4" />
      <ellipse cx="40.5" cy="32.2" rx="2" ry="1.3" fill="#ff9fb4" />
      <path d="M33.6 32.5q1.8 1.6 3.5 0" stroke="#e8b4b8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Knit mint beanie + pom-pom */}
      <path d="M26.5 23.6c.4-5.2 4-8.4 8.2-8.4s7.6 3.2 7.8 8.2Z" fill="#6fd0b4" stroke={INK} strokeWidth="1.9" strokeLinejoin="round" />
      <rect x="25.5" y="21.4" width="17.8" height="4" rx="2" fill="#9fd8c6" stroke={INK} strokeWidth="1.7" />
      <circle cx="34.6" cy="13.2" r="3.4" fill="#bff0df" stroke={INK} strokeWidth="1.7" />
    </svg>
  );
}

/** Custom storybook identity mark used both as compact HUD medallion and Title Screen lockup. */
export function BrandLogo({ variant, size }: { variant: 'badge' | 'hero'; size?: number }) {
  if (variant === 'badge') {
    return (
      <span className="ss-logo-badge" aria-hidden="true">
        <StickerMark size={size ?? 34} />
      </span>
    );
  }

  return (
    <div className="ss-hero-lockup">
      <div className="ss-hero-crest" aria-hidden="true">
        <StickerMark size={size ?? 84} />
      </div>
      <div className="ss-hero-wordmark">
        <span className="ss-hero-eyebrow">Pastoral 3D Skatepark</span>
        <h1 className="ss-hero-title" aria-label="Sheep Skate">
          <span className="ss-title-word" data-text="Sheep">Sheep</span>{' '}
          <span className="ss-title-word accent" data-text="Skate">Skate</span>
        </h1>
        <svg className="ss-title-flourish" viewBox="0 0 210 18" fill="none" aria-hidden="true">
          <path d="M12 9.5C58 4 146 4 196 10.5" stroke="#ff8fa3" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M12 9.5C58 4 146 4 196 10.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="36" cy="14" r="3" fill="#f5ecd6" stroke={INK} strokeWidth="1.6" />
          <circle cx="172" cy="14" r="3" fill="#f5ecd6" stroke={INK} strokeWidth="1.6" />
        </svg>
      </div>
    </div>
  );
}
