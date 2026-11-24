const INK = '#2b2622';

function StickerMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ss-crest-sky" x1="32" y1="5" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7ec4f2" />
          <stop offset="55%" stopColor="#bfe4fa" />
          <stop offset="100%" stopColor="#fff4d6" />
        </linearGradient>
        <linearGradient id="ss-crest-meadow" x1="32" y1="36" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9cd35e" />
          <stop offset="100%" stopColor="#5d9932" />
        </linearGradient>
        <linearGradient id="ss-crest-deck" x1="10" y1="44" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff9ebb" />
          <stop offset="50%" stopColor="#ff6b8b" />
          <stop offset="100%" stopColor="#e84d6e" />
        </linearGradient>
        <clipPath id="ss-crest-clip">
          <circle cx="32" cy="32" r="25.6" />
        </clipPath>
      </defs>

      {/* Die-cut vinyl sticker outer shadow & thick cream kiss-cut border */}
      <circle cx="32" cy="33.2" r="30" fill="rgba(43,38,34,0.18)" />
      <circle cx="32" cy="32" r="30" fill="#fffdf8" stroke={INK} strokeWidth="2.4" />
      {/* Golden enamel inner bezel ring */}
      <circle cx="32" cy="32" r="27.4" fill="#ffd166" stroke={INK} strokeWidth="1.6" />
      {/* Sky medallion core */}
      <circle cx="32" cy="32" r="25.6" fill="url(#ss-crest-sky)" />

      <g clipPath="url(#ss-crest-clip)">
        {/* Sunburst rays & golden morning sun */}
        <circle cx="15" cy="16" r="9.5" fill="#fff6d1" opacity="0.45" />
        <circle cx="15" cy="16" r="5.5" fill="#ffd166" stroke={INK} strokeWidth="1.4" />

        {/* Fluffy gouache horizon cloud */}
        <path
          d="M4 28.5h18c1.8 0 3.2-1.3 3.2-2.9 0-1.4-1-2.6-2.4-2.8-.5-1.9-2.2-3.3-4.2-3.3-1.8 0-3.3 1-4 2.5-1.4.2-2.5 1.4-2.5 2.9H4Z"
          fill="#fffdf9"
          opacity="0.92"
        />

        {/* Rolling pastoral hills + mint quarter-pipe launch ramp on left */}
        <path d="M2 41.5c11-5.2 25-5.5 39-1.2 8 2.4 15 2 21-1V60H2Z" fill="url(#ss-crest-meadow)" stroke={INK} strokeWidth="1.6" />
        <path d="M2 58V39.5c7.5 1.5 14.5 6.8 18.5 18.5Z" fill="#8fd4c1" stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
        <line x1="2" y1="39.5" x2="11" y2="43.8" stroke="#e2e7f0" strokeWidth="2.8" strokeLinecap="round" />
      </g>

      {/* Crisp inner medallion ink ring */}
      <circle cx="32" cy="32" r="25.6" fill="none" stroke={INK} strokeWidth="2.1" />

      {/* Dynamic air-pop motion arcs & four-point stars */}
      <path d="M6.5 34.5c3.2-2.4 7-3.4 11.2-3M8 38.2c2.5-1.6 5.4-2.2 8.4-1.9" stroke="#fffdf9" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M53.5 11.5l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3Z" fill="#ffd166" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M10.5 10.5l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8Z" fill="#ff8fa3" stroke={INK} strokeWidth="1" strokeLinejoin="round" />

      {/* 3/4 Perspective Airborne Skateboard (breaking out of the bottom frame) */}
      <g transform="rotate(-15 33 48)">
        {/* Drop shadow on medallion rim */}
        <ellipse cx="32.5" cy="55.5" rx="19" ry="3.2" fill="rgba(43,38,34,0.22)" />
        {/* Coral deck underside with curved kicktails & maple ply */}
        <path
          d="M10 46.2c0-2.1 3.2-3.7 7.8-3.7h29.4c4.6 0 7.8 1.6 7.8 3.7 0 2.3-3.2 4.1-7.8 4.1H17.8c-4.6 0-7.8-1.8-7.8-4.1Z"
          fill="url(#ss-crest-deck)"
          stroke={INK}
          strokeWidth="2.1"
        />
        {/* Golden deck graphic stripe */}
        <path d="M23 46.8h18" stroke="#ffd166" strokeWidth="2.2" strokeLinecap="round" />
        {/* Dark charcoal grip-tape top deck */}
        <path
          d="M12.2 44.5c2.2-1.2 5.2-1.7 9-1.7h21.6c3.8 0 6.8.5 9 1.7-2.2 1.1-5.2 1.6-9 1.6H21.2c-3.8 0-6.8-.5-9-1.6Z"
          fill="#35333e"
          stroke={INK}
          strokeWidth="1.5"
        />
        {/* Back-row wheels (far side) */}
        <circle cx="17.8" cy="51.8" r="3.4" fill="#d9cbb7" stroke={INK} strokeWidth="1.6" />
        <circle cx="41.8" cy="51.8" r="3.4" fill="#d9cbb7" stroke={INK} strokeWidth="1.6" />
        {/* Aluminum truck hangers & baseplates */}
        <path d="M18.5 48.8h5.2l-1 3.2h-3.2ZM42.5 48.8h5.2l-1 3.2h-3.2Z" fill="#cfd5df" stroke={INK} strokeWidth="1.35" strokeLinejoin="round" />
        {/* Front-row urethane wheels with coral cores & specular rim */}
        <circle cx="21.4" cy="53.2" r="4" fill="#fbf3e1" stroke={INK} strokeWidth="1.9" />
        <circle cx="45.4" cy="53.2" r="4" fill="#fbf3e1" stroke={INK} strokeWidth="1.9" />
        <circle cx="21.4" cy="53.2" r="1.55" fill="#ff6b8b" stroke={INK} strokeWidth="1" />
        <circle cx="45.4" cy="53.2" r="1.55" fill="#ff6b8b" stroke={INK} strokeWidth="1" />
      </g>

      {/* Four planted dark-cocoa legs & hooves in crouched skate stance */}
      <path d="M19.5 39.5 18 46.2M24.2 39.8 23.2 45.8M33.5 37.8 35.5 43.2M37.8 36.8 40.5 42" stroke="#2b221f" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M19.5 39.5 18 46.2M24.2 39.8 23.2 45.8M33.5 37.8 35.5 43.2M37.8 36.8 40.5 42" stroke="#4a3b35" strokeWidth="2.2" strokeLinecap="round" />

      {/* Plump cloud-scalloped wool body (positioned left-center so head sits cleanly on right) */}
      <circle cx="10.8" cy="33.8" r="3.8" fill="#efe4cf" stroke={INK} strokeWidth="1.9" />
      <path
        d="M15.4 40.2c-3.8-.3-6.4-3.2-6.1-6.7.2-2.4 1.6-4.4 3.7-5.3-.3-4.1 2.8-7.6 7-7.8 1.7-.1 3.3.5 4.6 1.5 1.9-2.4 5-3.8 8.3-3.3 4.6.6 8 4.5 7.9 9 2.3 1.2 3.7 3.6 3.4 6.3-.4 3.6-3.5 6.3-7.3 6.3-2.1 1.6-5.1 2.2-7.8 1.2-2.4 1.4-5.6 1.5-8.1-.1-1.8.8-3.8 1.1-5.6.9Z"
        fill="#fffdf8"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Warm gouache under-shadow & fluffy internal wool curls */}
      <path
        d="M14.8 37.5c3.4 2.1 7.8 2.3 11.4.4 3.4 1.8 7.6 1.6 11-.6"
        stroke="#e2d2b8"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path d="M16.8 24.4c1.8-1.6 4.4-2 6.6-.9M20.5 31c-1 1.6-.4 3.6 1.4 4.3M27.8 28.8c-1 1.6-.4 3.6 1.4 4.3" stroke="#e5d6be" strokeWidth="1.65" strokeLinecap="round" />

      {/* Sculpted 3/4 Sheep Head, Droopy Ears & Tapered Snout (Front-Right) */}
      {/* Back/Left droopy ear */}
      <g transform="rotate(-16 28.5 23.5)">
        <ellipse cx="26.5" cy="23.8" rx="5.4" ry="2.4" fill="#3a2f2b" stroke={INK} strokeWidth="1.8" />
        <ellipse cx="26.8" cy="24.1" rx="3.3" ry="1.1" fill="#d98a8c" />
      </g>
      {/* Front/Right droopy ear */}
      <g transform="rotate(18 49.5 23.2)">
        <ellipse cx="50.8" cy="23.5" rx="5.2" ry="2.35" fill="#3a2f2b" stroke={INK} strokeWidth="1.8" />
        <ellipse cx="50.5" cy="23.8" rx="3.1" ry="1.05" fill="#d98a8c" />
      </g>

      {/* Tapered pear-shaped cocoa sheep head/muzzle */}
      <path
        d="M31.2 24.5c.2-5.4 4.2-9 9.3-8.8 5.1.2 8.9 4 8.7 9.4-.2 5.2-3.4 10.6-8.9 10.6-5.5 0-9.3-5.8-9.1-11.2Z"
        fill="#3a2f2b"
        stroke={INK}
        strokeWidth="2.15"
        strokeLinejoin="round"
      />
      {/* Warm muzzle highlight */}
      <ellipse cx="40.8" cy="31.2" rx="4.8" ry="3.4" fill="#4e3f3a" />

      {/* Big glossy storybook eyes with double catchlights */}
      <circle cx="36.4" cy="26.4" r="2.35" fill="#141010" stroke="#fffdf9" strokeWidth="0.9" />
      <circle cx="44.2" cy="26.6" r="2.35" fill="#141010" stroke="#fffdf9" strokeWidth="0.9" />
      <circle cx="35.7" cy="25.6" r="0.85" fill="#ffffff" />
      <circle cx="43.5" cy="25.8" r="0.85" fill="#ffffff" />
      <circle cx="37.1" cy="27.2" r="0.4" fill="#ffffff" />
      <circle cx="44.9" cy="27.4" r="0.4" fill="#ffffff" />

      {/* Rosy pink blush cheeks & sweet Y-shaped sheep nose/grin */}
      <ellipse cx="33.5" cy="29.6" rx="2.1" ry="1.25" fill="#ff8fa3" opacity="0.9" />
      <ellipse cx="46.6" cy="29.8" rx="2.1" ry="1.25" fill="#ff8fa3" opacity="0.9" />
      <path d="M39.3 29.8l1.4 1.3 1.4-1.3M40.7 31.1v1.7" stroke="#f2bdbd" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38.8 32.8q2 1.4 4 0" stroke="#f2bdbd" strokeWidth="1.45" strokeLinecap="round" />

      {/* Fluffy cream wool forelock peeking under beanie cuff */}
      <path
        d="M32.2 20.6c1.5 1.6 4.1 1.8 5.8.3 1.6 1.5 4.3 1.5 5.9 0 1.4 1.3 3.5 1.2 4.8-.2"
        fill="#fffdf8"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Signature Chunky Mustard-Gold Ribbed Knit Beanie + Fluffy Pom-Pom */}
      <g transform="rotate(4 40.5 16)">
        {/* Pom-pom */}
        <circle cx="40.8" cy="7.2" r="3.7" fill="#fffdf8" stroke={INK} strokeWidth="1.8" />
        <path d="M39.3 6a1.8 1.8 0 0 1 2.5-.3" stroke="#e5d6be" strokeWidth="1.2" strokeLinecap="round" />
        {/* Slouched knit crown */}
        <path
          d="M31.2 18.4c.5-6.2 4.5-9.8 9.5-9.8s8.8 3.6 9.1 9.8Z"
          fill="#f4b938"
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M36.5 9.5c-.8 2.5-1.1 5.2-1 8M44.5 9.5c.8 2.5 1.1 5.2 1 8" stroke="#c98e1c" strokeWidth="1.35" strokeLinecap="round" />
        {/* Rolled ribbed cuff */}
        <rect x="29.8" y="16.2" width="21.4" height="4.8" rx="2.4" fill="#ffd666" stroke={INK} strokeWidth="1.85" />
        <path d="M34 16.8v3.6M37.6 16.8v3.6M41.2 16.8v3.6M44.8 16.8v3.6M48 16.8v3.6" stroke="#cc921e" strokeWidth="1.3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Custom storybook identity mark used both as compact HUD medallion and Title Screen lockup. */
export function BrandLogo({ variant, size }: { variant: 'badge' | 'hero'; size?: number }) {
  if (variant === 'badge') {
    return (
      <span className="ss-logo-badge" aria-hidden="true">
        <StickerMark size={size ?? 36} />
      </span>
    );
  }

  return (
    <div className="ss-hero-lockup">
      <div className="ss-hero-crest" aria-hidden="true">
        <StickerMark size={size ?? 96} />
      </div>
      <div className="ss-hero-wordmark">
        <span className="ss-hero-eyebrow">Pastoral 3D Skatepark</span>
        <h1 className="ss-hero-title" aria-label="Sheep Skate">
          <span className="ss-title-word" data-text="Sheep">Sheep</span>{' '}
          <span className="ss-title-word accent" data-text="Skate">Skate</span>
        </h1>
        <svg className="ss-title-flourish" viewBox="0 0 228 24" fill="none" aria-hidden="true">
          {/* 3/4 Kicktail Skateboard Deck Underline */}
          <path
            d="M8 7c7 4.2 18 5.2 38 5.2h136c20 0 31-1 38-5.2"
            stroke="#ff6b8b"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M12 5.4c7 3.6 17 4.6 34 4.6h136c17 0 27-1 34-4.6"
            stroke="#35333e"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M8 7c7 4.2 18 5.2 38 5.2h136c20 0 31-1 38-5.2"
            stroke={INK}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          {/* Metallic truck hangers */}
          <path d="M42 13.2h9l-1.6 3.8h-5.8ZM177 13.2h9l-1.6 3.8h-5.8Z" fill="#cfd5df" stroke={INK} strokeWidth="1.35" strokeLinejoin="round" />
          {/* Cream urethane wheels with coral hubs */}
          <circle cx="46.5" cy="18.6" r="4" fill="#fbf3e1" stroke={INK} strokeWidth="1.8" />
          <circle cx="46.5" cy="18.6" r="1.4" fill="#ff6b8b" />
          <circle cx="181.5" cy="18.6" r="4" fill="#fbf3e1" stroke={INK} strokeWidth="1.8" />
          <circle cx="181.5" cy="18.6" r="1.4" fill="#ff6b8b" />
          {/* Center die-cut golden star */}
          <path d="M114 6.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5Z" fill="#ffd166" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
