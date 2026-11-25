const INK = '#2b2622';

function StickerMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ss-logo-sky" x1="64" y1="10" x2="64" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#89c4eb" />
          <stop offset="62%" stopColor="#c5e3f6" />
          <stop offset="100%" stopColor="#f3ede0" />
        </linearGradient>
        <linearGradient id="ss-logo-hill" x1="64" y1="78" x2="64" y2="116" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8ec455" />
          <stop offset="100%" stopColor="#659b38" />
        </linearGradient>
        <linearGradient id="ss-logo-ramp" x1="20" y1="84" x2="88" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7decb" />
          <stop offset="100%" stopColor="#77baa4" />
        </linearGradient>
        <clipPath id="ss-logo-clip">
          <circle cx="64" cy="64" r="52.5" />
        </clipPath>
      </defs>

      {/* Die-cut outer paper badge & subtle drop shadow */}
      <circle cx="64" cy="66" r="59.5" fill="rgba(43,38,34,0.16)" />
      <circle cx="64" cy="64" r="59.5" fill="#fbf7ee" stroke={INK} strokeWidth="4" />
      <circle cx="64" cy="64" r="52.5" fill="url(#ss-logo-sky)" />

      <g clipPath="url(#ss-logo-clip)">
        {/* Editorial flat-bottomed gouache cloud */}
        <path
          d="M8 52h34c3.2 0 5.8-2.4 5.8-5.3 0-2.6-1.9-4.8-4.5-5.2-.9-3.6-4.1-6.2-8-6.2-3.4 0-6.3 1.8-7.6 4.6-2.7.3-4.8 2.5-4.8 5.3H8Z"
          fill="#faf4e6"
        />
        {/* Distant patchwork meadow hills */}
        <path d="M4 88c22-9 48-9.5 74-3 16 4 30 3.5 44-1.5V120H4Z" fill="#6fa642" />
        <path d="M4 92c24-8 50-8 76-1.5 16 4 28 3 42-1V120H4Z" fill="url(#ss-logo-hill)" stroke={INK} strokeWidth="2.8" />
        {/* Mint quarter-pipe ramp lip & brushed steel coping */}
        <path d="M18 120 Q56 104 86 84 L120 96 L120 120 Z" fill="url(#ss-logo-ramp)" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <line x1="16" y1="121" x2="87" y2="84" stroke="#9aa3b0" strokeWidth="7.5" strokeLinecap="round" />
        <line x1="16" y1="121" x2="87" y2="84" stroke="#dce2ea" strokeWidth="4" strokeLinecap="round" />
        <line x1="16" y1="121" x2="87" y2="84" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      </g>

      {/* Crisp inner medallion ink ring */}
      <circle cx="64" cy="64" r="52.5" fill="none" stroke={INK} strokeWidth="3.8" />

      {/* 3D Perspective Airborne Skateboard (curved concave deck, maple ply, trucks & cylindrical wheels) */}
      <g transform="rotate(-19 68 89)">
        {/* Far-side 3D wheels (partially occluded behind deck) */}
        <g>
          <ellipse cx="42" cy="96.5" rx="6.2" ry="6.6" fill="#cfc1a8" stroke={INK} strokeWidth="2.6" />
          <ellipse cx="87" cy="96.5" rx="6.2" ry="6.6" fill="#cfc1a8" stroke={INK} strokeWidth="2.6" />
        </g>

        {/* Coral-salmon deck underside belly */}
        <path
          d="M20 87.5 C24 92.5 33 93.8 44 93.8 L88 93.8 C100 93.8 109 91.8 113 85.8 C109 88.2 100 89.2 88 89.2 L44 89.2 C33 89.2 24 88.5 20 87.5 Z"
          fill="#f26d5b"
          stroke={INK}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Warm maple wood ply edge */}
        <path
          d="M19.5 85.8 C24 90.2 33 91.2 44 91.2 L88 91.2 C100 91.2 109 89.4 113.5 83.6 L112.5 85.8 C108 91.2 99.5 93 88 93 L44 93 C33 93 24 91.8 19.5 87.5 Z"
          fill="#efd8b4"
        />
        {/* Dark charcoal grip-tape concave top surface */}
        <path
          d="M19.5 85.8 C24 83.2 33 82.8 44 82.8 L88 82.8 C99 82.8 107.5 81.4 113.5 83.6 C109 88.8 100 90.4 88 90.4 L44 90.4 C33 90.4 24 89.4 19.5 85.8 Z"
          fill="#35333c"
          stroke={INK}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Maple ply highlight line along top rim */}
        <path
          d="M21 86.2 C25.5 89.5 34 90.4 44 90.4 L88 90.4 C99.5 90.4 108 88.8 112.5 84.2"
          stroke="#f3dfc0"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Sculpted 3D metallic silver truck baseplates & hangers */}
        <path d="M39 92.2h11l-2 5.8h-7ZM84 92.2h11l-2 5.8h-7Z" fill="#9aa2b0" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M41.5 93.2h6l-1 3.5h-4ZM86.5 93.2h6l-1 3.5h-4Z" fill="#d4dbe6" />

        {/* Near-side 3D Cylindrical Urethane Wheels (side barrel + front face + recessed bearing core) */}
        <g>
          {/* Rear wheel */}
          <path d="M39.5 95.2 h4.5 a5.8 6.4 0 0 1 0 12.8 h-4.5 Z" fill="#d8cab2" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
          <ellipse cx="39.5" cy="101.6" rx="5.6" ry="6.4" fill="#f7efe0" stroke={INK} strokeWidth="2.6" />
          <ellipse cx="39.5" cy="101.6" rx="2.3" ry="2.7" fill="#4a423d" />
          <circle cx="39.1" cy="101.2" r="0.9" fill="#cfd6e0" />
          {/* Front wheel */}
          <path d="M84.5 95.2 h4.5 a5.8 6.4 0 0 1 0 12.8 h-4.5 Z" fill="#d8cab2" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
          <ellipse cx="84.5" cy="101.6" rx="5.6" ry="6.4" fill="#f7efe0" stroke={INK} strokeWidth="2.6" />
          <ellipse cx="84.5" cy="101.6" rx="2.3" ry="2.7" fill="#4a423d" />
          <circle cx="84.1" cy="101.2" r="0.9" fill="#cfd6e0" />
        </g>
      </g>

      {/* Four Tapered Polygon Sheep Legs & Cloven Hooves planted on the grip tape */}
      {/* Far-side legs (deeper espresso) */}
      <path d="M41 72 L47 71 L53 84.5 L47.5 86 Z" fill="#2c221e" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M68 65 L74 63.5 L83 74.5 L77.5 76.5 Z" fill="#2c221e" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      {/* Near-side legs (warm espresso with highlight edge) */}
      <path d="M49 71.5 L55.5 70.5 L61.5 82.5 L55.5 84 Z" fill="#3d302a" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M76 62 L82.5 60 L92.5 70.5 L87 73 Z" fill="#3d302a" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />

      {/* 3-Layer Volumetric Cloud Fleece (matched to editorial gouache key art) */}
      {/* Cute scalloped tail puff */}
      <path
        d="M23 68c-3.5-.5-5.8-3.8-5-7.2.6-2.5 2.7-4.3 5.2-4.6 1.5-2 4.2-2.6 6.4-1.5l1 11.5c-2.2 2.1-5 2.2-7.6 1.8Z"
        fill="#dfd1b8"
        stroke={INK}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Main wool silhouette */}
      <path
        d="M32 75.5c-6.5-.8-11.2-6.4-10.4-12.8.5-3.8 2.8-7 6.1-8.6-.4-6.4 3.8-12.2 10.2-13.5 2.2-5.4 7.6-8.9 13.6-8.6 3.5-4.2 9.2-6.2 14.6-5 6.8 1.5 11.6 7.4 11.8 14.2 4.8 2.4 7.6 7.5 6.8 13-.7 5-4.4 9-9.2 10.2-2.5 4.8-7.8 7.6-13.2 6.8-3.6 3.6-9.1 4.9-13.9 3.1-3.8 2.6-8.8 2.9-12.9.6-1.1.5-2.3.7-3.5.6Z"
        fill="#f7f0e2"
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Sunlit upper wool highlights (lineless gouache plane) */}
      <path
        d="M37 41.5c2.2-4.6 7.1-7.4 12.2-7.1 3.2-3.8 8.3-5.6 13.2-4.5 5.4 1.2 9.4 5.6 10.2 11-4.2-2.2-9.5-1.5-13.2 1.5-4.5-2.4-10.2-1.8-14 1.5-3.2-1.2-6.2-1.2-8.4-2.4Z"
        fill="#fffdf9"
      />
      {/* Volumetric under-fleece shadow planes & internal scalloped curls */}
      <path
        d="M25.5 65.5c2.5 4.8 8 7.2 13.2 5.8 3.5 3.2 8.8 3.8 13 1.4 4.4 2.5 10.2 1.8 13.8-1.8 4.6 1.2 9.6-1 11.8-5.2-3.2 2.2-7.5 2.5-11 .8-3.4 3.4-8.8 4-13 1.6-3.8 2.6-9 2.2-12.5-.8-3.8 2.2-8.8 1.8-12.2-1.2-1.1-.2-2.2-.4-3.1-.6Z"
        fill="#dfd1b7"
      />
      <path
        d="M42 57.5c-1.8 3.2-.6 7.2 2.6 8.8M56 55c-2 3.5-.5 7.8 3.1 9.2M69.5 48.5c-1.5 3-.4 6.6 2.5 8"
        stroke="#d8c8ab"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Sculpted Editorial Sheep Head, Leaf-Shaped Ears & Slouchy Mustard Fisherman Beanie */}
      {/* Left leaf-shaped droopy ear */}
      <path
        d="M71 42.5 C63 40.5 55.5 42.5 53 46.2 C55.5 49.8 64.5 50.8 71.8 47.2 Z"
        fill="#362b26"
        stroke={INK}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M69.5 44.2 C63.5 43.2 58 44.5 56 46.2 C58.5 48 64.5 48.2 69.8 46.2 Z" fill="#231b17" />

      {/* Right leaf-shaped droopy ear */}
      <path
        d="M95.5 39.8 C101.5 38.5 108 40.2 110 43.4 C108 46.6 101 47.5 95 44.5 Z"
        fill="#362b26"
        stroke={INK}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M96.5 41.2 C101 40.5 105.5 41.5 107.2 43.2 C105.2 44.8 100.5 45 96.2 43.2 Z" fill="#231b17" />

      {/* Tapered Sculpted Cocoa-Espresso Head/Muzzle (wide cheekbones tapering to rounded snout) */}
      <path
        d="M70.5 41.5 C70 34 76.5 29.5 84.5 29.5 C92.5 29.5 98 34.5 98 41.8 C98 48.5 95.5 58.2 88.2 59.5 C81 60.8 71.2 51.5 70.5 41.5 Z"
        fill="#3a2e29"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Sunlit right muzzle plane for 3D sculptural depth */}
      <path
        d="M84.5 31 C91 31 96.2 35.5 96.2 42 C96.2 48.2 93.8 56.8 87.8 57.8 C84.5 58.3 81.2 56.2 79 53 C84 52 87.5 46.5 87.2 39.5 C87 35.5 85.8 32.8 84.5 31 Z"
        fill="#4c3d37"
      />

      {/* Calm, deadpan editorial dark bead eyes + subtle rosy cheeks + minimal Y-snout */}
      <ellipse cx="79.5" cy="46.2" rx="2.1" ry="2.3" fill="#140f0d" />
      <ellipse cx="91.2" cy="45.6" rx="2" ry="2.2" fill="#140f0d" />
      <circle cx="78.9" cy="45.4" r="0.65" fill="#fffdf8" opacity="0.85" />
      <circle cx="90.6" cy="44.8" r="0.65" fill="#fffdf8" opacity="0.85" />
      <ellipse cx="75.8" cy="50" rx="2.8" ry="1.6" fill="#ff8a9e" opacity="0.55" />
      <ellipse cx="94" cy="49.2" rx="2.5" ry="1.5" fill="#ff8a9e" opacity="0.55" />
      <path d="M85.2 52.2 L87.4 54.4 L89.6 52.2 M87.4 54.4 L87.4 57.2" stroke="#1d1512" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Slouchy Mustard-Gold Fisherman Knit Beanie (NO pom-pom, NO forehead teeth bar — pure editorial style!) */}
      <g>
        {/* Asymmetric slouched beanie crown with natural fabric fold */}
        <path
          d="M68.5 36.5 C67.5 29.5 69.5 24.5 72 22.5 C70.5 19.5 72 15.8 76.5 15.2 C83.5 14.2 92 17.5 96.2 24.5 C98.5 28.2 99.5 32.5 99.2 36.2 Z"
          fill="#eab949"
          stroke={INK}
          strokeWidth="2.9"
          strokeLinejoin="round"
        />
        {/* Shaded fold crease on upper left of beanie crown */}
        <path
          d="M72 22.5 C75.5 21.8 79.5 23.2 82.2 25.5 C78.5 25.2 74.5 26.2 71.2 28.5 Z"
          fill="#c9952a"
        />
        {/* Curved knit crown seam lines */}
        <path
          d="M78.5 16.5 C76.5 21.5 75.8 27.5 76.2 33.5 M86.5 17.5 C87.8 22.5 88.5 28 88.2 33.5"
          stroke="#c9952a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* 3D Curved Rolled Ribbed Beanie Cuff hugging the brow */}
        <path
          d="M66.8 35.8 C73.5 32.2 91.5 31.8 100.4 35.2 C101.4 37.8 101.2 40.8 99.8 42.6 C91.2 39.5 74.2 39.8 67.2 43.2 C65.8 41.2 65.8 38.2 66.8 35.8 Z"
          fill="#f5c857"
          stroke={INK}
          strokeWidth="2.9"
          strokeLinejoin="round"
        />
        {/* Curved vertical rib stitch lines on the turn-up cuff */}
        <path
          d="M72.5 34.8 L72.2 41.2 M78.2 33.9 L78 40.4 M84 33.6 L84 40.1 M89.8 33.8 L90 40.3 M95.2 34.5 L95.5 41"
          stroke="#c48e20"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
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
        <StickerMark size={size ?? 92} />
      </div>
      <div className="ss-hero-wordmark">
        <span className="ss-hero-eyebrow">Pastoral 3D Skatepark</span>
        <h1 className="ss-hero-title" aria-label="Sheep Skate">
          <span className="ss-title-word" data-text="Sheep">Sheep</span>{' '}
          <span className="ss-title-word accent" data-text="Skate">Skate</span>
        </h1>
        <svg className="ss-title-flourish" viewBox="0 0 220 22" fill="none" aria-hidden="true">
          <path d="M10 6.5c6 3.5 16 4.5 34 4.5h132c18 0 28-1 34-4.5" stroke="#f26d5b" strokeWidth="6.2" strokeLinecap="round" />
          <path d="M14 5.2c6 3.1 15 4 30 4h132c15 0 24-.9 30-4" stroke="#35333c" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M10 6.5c6 3.5 16 4.5 34 4.5h132c18 0 28-1 34-4.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M41 12.2h8l-1.5 3.4h-5ZM171 12.2h8l-1.5 3.4h-5Z" fill="#cfd5df" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
          <circle cx="45" cy="17.2" r="3.6" fill="#fbf3e1" stroke={INK} strokeWidth="1.7" />
          <circle cx="45" cy="17.2" r="1.2" fill="#4a423d" />
          <circle cx="175" cy="17.2" r="3.6" fill="#fbf3e1" stroke={INK} strokeWidth="1.7" />
          <circle cx="175" cy="17.2" r="1.2" fill="#4a423d" />
        </svg>
      </div>
    </div>
  );
}
