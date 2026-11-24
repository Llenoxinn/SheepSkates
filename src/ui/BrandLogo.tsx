const INK = '#2b2622';

function StickerMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ss-logo-sky" x1="32" y1="4" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bce0f7" />
          <stop offset="65%" stopColor="#dff2fc" />
          <stop offset="100%" stopColor="#f7f2e4" />
        </linearGradient>
        <linearGradient id="ss-logo-hill" x1="32" y1="36" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9fd164" />
          <stop offset="100%" stopColor="#6ea83e" />
        </linearGradient>
        <clipPath id="ss-logo-clip">
          <circle cx="32" cy="32" r="26.8" />
        </clipPath>
      </defs>

      {/* Die-cut vinyl sticker outer paper rim */}
      <circle cx="32" cy="32" r="30.2" fill="#fbf7ee" stroke={INK} strokeWidth="2.2" />
      {/* Enamel medallion sky backdrop */}
      <circle cx="32" cy="32" r="26.8" fill="url(#ss-logo-sky)" />

      <g clipPath="url(#ss-logo-clip)">
        {/* Warm morning sun with gouache halo */}
        <circle cx="15.5" cy="17.5" r="7.2" fill="#fff3c4" opacity="0.55" />
        <circle cx="15.5" cy="17.5" r="4.6" fill="#ffd86b" stroke={INK} strokeWidth="1.4" />

        {/* Soft storybook cloud */}
        <path
          d="M9 27.5h13.5c1.6 0 2.8-1.1 2.8-2.5 0-1.2-.9-2.2-2.1-2.4-.4-1.5-1.7-2.6-3.4-2.6-1.5 0-2.8.8-3.3 2.1-1.2.2-2.1 1.2-2.1 2.4 0 .2 0 .4.1.6H9c-1.1 0-2 .8-2 1.7s.9 1.7 2 1.7Z"
          fill="#fffdf8"
           opacity="0.88"
        />

        {/* Distant sage meadow ridge */}
        <path d="M2 43.5c10-4.8 22.5-5.2 35-1.5 8.5 2.5 16.5 1.8 23-1.2V62H2Z" fill="#b4db7c" stroke={INK} strokeWidth="1.5" />
        {/* Foreground pastoral hill + concrete skate lip */}
        <path d="M2 46.5c11-4.6 24-5 36.5-1.2 8.2 2.5 15.2 2.2 22.5-.4V62H2Z" fill="url(#ss-logo-hill)" stroke={INK} strokeWidth="1.7" />
        <path d="M36 48.2c8.5-2.6 17.5-2.2 25 1.2V62H34Z" fill="#e8dfd0" stroke={INK} strokeWidth="1.5" />
        {/* Tiny meadow wildflowers */}
        <circle cx="12" cy="49.5" r="1.3" fill="#ffd166" />
        <circle cx="16.5" cy="52" r="1.1" fill="#fffdf7" />
        <circle cx="24" cy="48.5" r="1.2" fill="#ff9fb4" />
      </g>

      {/* Crisp medallion inner ring */}
      <circle cx="32" cy="32" r="26.8" fill="none" stroke={INK} strokeWidth="2.2" />

      {/* Motion air lines & four-point sparkle stars */}
      <path d="M7.5 35.5c2.5-1.2 5.2-1.6 8-1.2M8.8 39.2c2.1-.8 4.4-1 6.6-.7" stroke="#fffdf7" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M51 12.5l1.1 2.6 2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6-2.6-1.1 2.6-1.1Z" fill="#ffd166" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="45.5" cy="11" r="1.3" fill="#ff8fa3" stroke={INK} strokeWidth="0.9" />

      {/* 3/4 Airborne Skateboard with maple ply, grip top, trucks & dual-tone urethane wheels */}
      <g transform="rotate(-11 32 46.5)">
        {/* Maple ply + coral deck underside */}
        <rect x="11.5" y="44.2" width="41" height="5.8" rx="2.9" fill="#ff8fa3" stroke={INK} strokeWidth="2" />
        <path d="M14 46.2h36" stroke="#ffd8df" strokeWidth="1.1" strokeLinecap="round" />
        {/* Charcoal grip-tape top bevel */}
        <path d="M14.5 44.3h35" stroke="#373540" strokeWidth="2.1" strokeLinecap="round" />
        {/* Metallic trucks */}
        <path d="M19 49.8h4l-.8 2.4h-2.4ZM41 49.8h4l-.8 2.4h-2.4Z" fill="#c6cbd4" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
        {/* Rear & front wheels with depth shadow */}
        <circle cx="18.8" cy="52.8" r="3.3" fill="#d8cbb8" stroke={INK} strokeWidth="1.6" />
        <circle cx="40.8" cy="52.8" r="3.3" fill="#d8cbb8" stroke={INK} strokeWidth="1.6" />
        <circle cx="21.4" cy="53.1" r="3.6" fill="#f5ecd6" stroke={INK} strokeWidth="1.8" />
        <circle cx="43.4" cy="53.1" r="3.6" fill="#f5ecd6" stroke={INK} strokeWidth="1.8" />
        <circle cx="21.4" cy="53.1" r="1.35" fill="#ff8fa3" stroke={INK} strokeWidth="0.9" />
        <circle cx="43.4" cy="53.1" r="1.35" fill="#ff8fa3" stroke={INK} strokeWidth="0.9" />
      </g>

      {/* Four chocolate hooves planted in skate stance */}
      <ellipse cx="19.8" cy="44.2" rx="2.3" ry="1.9" transform="rotate(-10 19.8 44.2)" fill="#3a2f2b" stroke={INK} strokeWidth="1.4" />
      <ellipse cx="24.4" cy="43.9" rx="2.5" ry="2.1" transform="rotate(-8 24.4 43.9)" fill="#4a3b35" stroke={INK} strokeWidth="1.5" />
      <ellipse cx="35.6" cy="42.1" rx="2.3" ry="1.9" transform="rotate(-12 35.6 42.1)" fill="#3a2f2b" stroke={INK} strokeWidth="1.4" />
      <ellipse cx="39.8" cy="41.8" rx="2.6" ry="2.1" transform="rotate(-10 39.8 41.8)" fill="#4a3b35" stroke={INK} strokeWidth="1.5" />

      {/* Fluffy tail puff */}
      <circle cx="12.5" cy="34.2" r="3.4" fill="#efe5d2" stroke={INK} strokeWidth="1.8" />

      {/* Multi-lobed wool fleece body with warm cream top & shaded under-curls */}
      <path
        d="M17.2 39.2c-3.4 0-5.8-2.4-5.8-5.5 0-2.2 1.2-4.1 3.1-4.9-.2-3.6 2.6-6.5 6.3-6.5 1.3 0 2.5.4 3.5 1.1 1.5-2.2 4-3.6 6.9-3.6 4.4 0 7.9 3.3 8.2 7.6 2.6.7 4.5 3 4.5 5.8 0 3.4-2.7 6-6.1 6Z"
        fill="#faf4e8"
        stroke={INK}
        strokeWidth="2.15"
        strokeLinejoin="round"
      />
      {/* Top sunlit fleece highlight & lower gouache shadow curls */}
      <path d="M18.2 24.8c1.5-1.4 3.6-1.8 5.4-.9 1.3-1.8 3.6-2.8 5.9-2.4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17.6 36.8c3.2 1.4 7.2 1.5 10.4.2 3.1 1.2 6.8 1.1 9.8-.4" stroke="#e2d3bc" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M22.5 30.8c-.8 1.4-.3 3.1 1.2 3.7M29.2 28.5c-.9 1.5-.3 3.2 1.3 3.8" stroke="#e5d7c1" strokeWidth="1.5" strokeLinecap="round" />

      {/* Sculpted cocoa ears with inner blush shadow */}
      <g transform="rotate(-19 23.6 27.6)">
        <ellipse cx="23.6" cy="27.6" rx="4.5" ry="2.2" fill="#4a3b35" stroke={INK} strokeWidth="1.7" />
        <ellipse cx="23.4" cy="27.8" rx="2.6" ry="1" fill="#70584f" />
      </g>
      <g transform="rotate(15 44.4 26.2)">
        <ellipse cx="44.4" cy="26.2" rx="4.5" ry="2.2" fill="#4a3b35" stroke={INK} strokeWidth="1.7" />
        <ellipse cx="44.6" cy="26.4" rx="2.6" ry="1" fill="#70584f" />
      </g>

      {/* Cocoa head */}
      <ellipse cx="34.8" cy="29.6" rx="8.6" ry="8" fill="#4a3b35" stroke={INK} strokeWidth="2.05" />
      {/* Subtle brow wool tuft overlapping forehead */}
      <path d="M28.4 23.8c1.4 1.3 3.6 1.4 5 .2 1.4 1.2 3.6 1.2 5-.1 1.2 1 2.9.9 4-.2" fill="#faf4e8" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Expressive glossy eyes, rosy cheeks & calm Y-snout */}
      <circle cx="31.8" cy="28.7" r="2.2" fill="#fffdf9" stroke={INK} strokeWidth="0.8" />
      <circle cx="38.4" cy="28.7" r="2.2" fill="#fffdf9" stroke={INK} strokeWidth="0.8" />
      <circle cx="32.2" cy="28.9" r="1.3" fill="#141010" />
      <circle cx="38.8" cy="28.9" r="1.3" fill="#141010" />
      <circle cx="31.5" cy="28.1" r="0.65" fill="#ffffff" />
      <circle cx="38.1" cy="28.1" r="0.65" fill="#ffffff" />
      <ellipse cx="28.8" cy="32.1" rx="2.1" ry="1.3" fill="#ff9fb4" opacity="0.92" />
      <ellipse cx="41.1" cy="32.1" rx="2.1" ry="1.3" fill="#ff9fb4" opacity="0.92" />
      <path d="M34.2 31.8l1.1 1.1 1.1-1.1M35.3 32.9v1.5" stroke="#d7a19e" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33.5 34.4q1.8 1.3 3.6 0" stroke="#f0bec0" strokeWidth="1.4" strokeLinecap="round" />

      {/* Ribbed knit mint beanie + stitched cuff + fluffy pom-pom */}
      <path d="M26.3 23.2c.5-5.5 4.2-8.8 8.6-8.8s7.9 3.3 8.1 8.6Z" fill="#6fd0b4" stroke={INK} strokeWidth="1.95" strokeLinejoin="round" />
      <path d="M31.2 15.1c-.7 2.2-1 4.6-.9 7M38.4 15.1c.7 2.2 1 4.6.9 7" stroke="#52b397" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="25.2" y="21.1" width="19.2" height="4.3" rx="2.15" fill="#9fd8c6" stroke={INK} strokeWidth="1.75" />
      <path d="M29.2 21.6v3.3M33 21.6v3.3M36.8 21.6v3.3M40.6 21.6v3.3" stroke="#68b89f" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="34.9" cy="12.5" r="3.6" fill="#bff0df" stroke={INK} strokeWidth="1.75" />
      <path d="M33.5 11.4a1.8 1.8 0 0 1 2.4-.3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
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
        <StickerMark size={size ?? 88} />
      </div>
      <div className="ss-hero-wordmark">
        <span className="ss-hero-eyebrow">Pastoral 3D Skatepark</span>
        <h1 className="ss-hero-title" aria-label="Sheep Skate">
          <span className="ss-title-word" data-text="Sheep">Sheep</span>{' '}
          <span className="ss-title-word accent" data-text="Skate">Skate</span>
        </h1>
        <svg className="ss-title-flourish" viewBox="0 0 220 22" fill="none" aria-hidden="true">
          {/* Skateboard deck profile underline with kicked nose & tail */}
          <path
            d="M10 6.5c6 3.5 16 4.5 34 4.5h132c18 0 28-1 34-4.5"
            stroke="#ff8fa3"
            strokeWidth="6.4"
            strokeLinecap="round"
          />
          <path
            d="M14 5.2c6 3.1 15 4 30 4h132c15 0 24-.9 30-4"
            stroke="#373540"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M10 6.5c6 3.5 16 4.5 34 4.5h132c18 0 28-1 34-4.5"
            stroke={INK}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Aluminum truck hangers */}
          <path d="M41 12.2h8l-1.5 3.4h-5ZM171 12.2h8l-1.5 3.4h-5Z" fill="#c6cbd4" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
          {/* Cream urethane wheels with coral hubs */}
          <circle cx="45" cy="17.2" r="3.6" fill="#f5ecd6" stroke={INK} strokeWidth="1.7" />
          <circle cx="45" cy="17.2" r="1.2" fill="#ff8fa3" />
          <circle cx="175" cy="17.2" r="3.6" fill="#f5ecd6" stroke={INK} strokeWidth="1.7" />
          <circle cx="175" cy="17.2" r="1.2" fill="#ff8fa3" />
          {/* Sparkle accents */}
          <circle cx="110" cy="11" r="2.2" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}
