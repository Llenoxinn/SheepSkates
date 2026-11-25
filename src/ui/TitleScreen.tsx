import { useEffect, useState } from 'react';
import { useAppPhase } from '../game/appPhase';
import { Sfx } from '../game/sfx';
import { useUI } from '../game/store';
import { ArtIcon } from './ArtIcons';
import { BrandLogo } from './BrandLogo';

function FallbackHeroSheep() {
  return (
    <svg viewBox="0 0 360 270" className="ss-hero-fallback" role="img" aria-label="Editorial gouache illustration of a sheep in a slouchy mustard beanie catching air off a mint quarter-pipe">
      <defs>
        <linearGradient id="ss-hero-sky" x1="180" y1="0" x2="180" y2="165" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#89c4eb" />
          <stop offset="65%" stopColor="#c2e2f6" />
          <stop offset="100%" stopColor="#e8f3fa" />
        </linearGradient>
        <linearGradient id="ss-hero-ramp" x1="80" y1="175" x2="290" y2="270" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a8dfcc" />
          <stop offset="100%" stopColor="#80c2ac" />
        </linearGradient>
      </defs>

      {/* Sunlit powder-blue sky & editorial flat-bottomed gouache clouds */}
      <rect width="360" height="270" fill="url(#ss-hero-sky)" />
      <path
        d="M-6 56h112c4.5 0 8-3.5 8-7.8 0-4-3.2-7.2-7.4-7.7-1.2-5.2-5.8-9-11.4-9-3 0-5.8 1.1-7.8 3-3-7.4-10.4-12.5-19-12.5-11 0-20 8.4-20.8 19-2.2-.8-4.6-1.3-7.2-1.3-9.2 0-17 6.8-18.4 15.6H-6Z"
        fill="#faf4e4"
      />
      <path
        d="M268 35h44c2.5 0 4.5-2 4.5-4.4 0-2.2-1.7-4-4-4.3-.8-3.5-4-6.1-7.8-6.1-3 0-5.6 1.5-7 3.9-1.2-.5-2.6-.8-4-.8-4.6 0-8.4 3.4-9 7.8h-16.7Z"
        fill="#faf4e4"
      />
      <path
        d="M289 96h76v-42c-3.5-.8-7.2-1.2-11-1.2-10.5 0-19.5 6.4-22.8 15.5-2-.6-4.2-.9-6.4-.9-9.5 0-17.5 6.4-19.4 15.2h-16.4Z"
        fill="#faf4e4"
      />

      {/* Patchwork Voronoi meadow hills (lineless gouache planes) */}
      <path d="M0 136 Q55 152 108 182 L0 198 Z" fill="#63983c" />
      <path d="M0 162 Q68 172 142 204 L0 212 Z" fill="#7eb249" />
      <path d="M0 182 Q52 174 115 204 L0 212 Z" fill="#6d9f3f" />
      <path d="M255 196 Q310 170 360 152 L360 210 Z" fill="#5b8e37" />
      <path d="M235 206 Q295 184 360 180 L360 216 Z" fill="#85b94e" />
      <path d="M275 194 Q320 192 360 202 L360 218 L255 212 Z" fill="#689b3d" />

      {/* Geometric blooming sakura tree on left grassy hill */}
      <g>
        <path
          d="M28 148 L18 134 L21 116 L33 108 L45 112 L56 109 L64 120 L65 135 L55 148 L39 151 Z"
          fill="#f6a7c1"
        />
        <path d="M28 148 L39 151 L55 148 L65 135 L52 138 L36 138 Z" fill="#e28ca8" />
        <path d="M33 162 L38 137 M37 146 L27 134 M37 148 L49 137 M38 141 L42 128" stroke="#53392b" strokeWidth="3.6" strokeLinecap="round" />
        <circle cx="34" cy="121" r="3" fill="#fffdf8" />
        <circle cx="49" cy="119" r="2.8" fill="#fffdf8" />
        <circle cx="57" cy="132" r="2.8" fill="#fffdf8" />
      </g>

      {/* Wildflowers along the meadow verge */}
      <circle cx="13" cy="186" r="3.2" fill="#f3b63f" />
      <circle cx="37" cy="188" r="2.8" fill="#988ee6" />
      <circle cx="66" cy="193" r="2.5" fill="#fffdf8" />
      <circle cx="326" cy="195" r="2.6" fill="#fffdf8" />
      <circle cx="346" cy="192" r="3.2" fill="#f3b63f" />

      {/* Sunlit cream-concrete skate plaza & coral flatbar grind rail */}
      <path d="M0 210 L132 203 L360 214 L360 270 L0 270 Z" fill="#f5ebd9" />
      <line x1="0" y1="226" x2="360" y2="244" stroke="#dfcfb8" strokeWidth="1.5" />
      <g>
        <polygon points="31,215 103,206 103,211 31,221" fill="#f37c66" />
        <polygon points="31,215 103,206 98,204 26,213" fill="#ff9480" />
        <path d="M41 219v11M94 210v9M34 229l13 2M88 218l12 2" stroke="#e06650" strokeWidth="3.2" strokeLinecap="round" />
      </g>

      {/* Tipped traffic cone on right plaza */}
      <g transform="translate(322 232) rotate(56)">
        <rect x="-11" y="10" width="22" height="5" rx="2" fill="#d9782e" />
        <path d="M0 -14 L-8.5 10 L8.5 10 Z" fill="#f08c3c" />
        <path d="M-4.8 -1 L4.8 -1 L6.4 4.2 L-6.4 4.2 Z" fill="#faf4e6" />
      </g>

      {/* Mint Quarter-Pipe Ramp with Brushed Steel Coping & Lip Shadow */}
      <path d="M48 270 Q158 228 232 181 L266 270 Z" fill="url(#ss-hero-ramp)" />
      <path d="M152 270 Q204 234 232 181 L266 270 Z" fill="#92d0bc" />
      <path d="M192 206 C198 222 208 224 218 216 L220 190 Z" fill="#77b5a1" />
      <line x1="44" y1="271" x2="233" y2="180" stroke="#9aa3b0" strokeWidth="10" strokeLinecap="round" />
      <line x1="44" y1="271" x2="233" y2="180" stroke="#dce2ea" strokeWidth="5" strokeLinecap="round" />

      {/* 3D Perspective Airborne Skateboard (Exact Editorial Match) */}
      <g transform="rotate(-21 202 138)">
        {/* Far-side wheels */}
        <ellipse cx="166" cy="153" rx="9" ry="9.5" fill="#cfc1a8" stroke="#362b26" strokeWidth="1.8" />
        <ellipse cx="250" cy="153" rx="9" ry="9.5" fill="#cfc1a8" stroke="#362b26" strokeWidth="1.8" />
        {/* Coral underside belly */}
        <path
          d="M114 139 C121 147 136 149 154 149 L246 149 C266 149 280 145 288 134 C280 138 266 140 246 140 L154 140 C136 140 121 139.5 114 139 Z"
          fill="#f26d5b"
          stroke="#362b26"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Charcoal grip-tape top */}
        <path
          d="M113 136.5 C121 132 136 131.5 154 131.5 L246 131.5 C264 131.5 278 129 288.5 132.5 C280 141 266 143 246 143 L154 143 C136 143 121 141.5 113 136.5 Z"
          fill="#35333c"
          stroke="#362b26"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M115 137 C123 142 137 143 154 143 L246 143 C265 143 279 140.5 287 133.5" stroke="#f3dfc0" strokeWidth="2.2" fill="none" />
        {/* Sculpted metallic trucks */}
        <path d="M150 147h18l-3 9h-12ZM234 147h18l-3 9h-12Z" fill="#9aa2b0" stroke="#362b26" strokeWidth="1.6" strokeLinejoin="round" />
        {/* Near-side 3D cylindrical wheels */}
        <ellipse cx="152" cy="160" rx="8.5" ry="9.5" fill="#f7efe0" stroke="#362b26" strokeWidth="1.8" />
        <ellipse cx="152" cy="160" rx="3.4" ry="4" fill="#4a423d" />
        <ellipse cx="236" cy="160" rx="8.5" ry="9.5" fill="#f7efe0" stroke="#362b26" strokeWidth="1.8" />
        <ellipse cx="236" cy="160" rx="3.4" ry="4" fill="#4a423d" />
      </g>

      {/* Four Tapered Polygon Sheep Legs */}
      <path d="M148 139 L156 137 L168 154 L159 157 Z" fill="#2c221e" />
      <path d="M191 124 L199 121 L212 137 L203 140 Z" fill="#3a2e29" />
      <path d="M164 134 L172 132 L185 148 L176 151 Z" fill="#3a2e29" />
      <path d="M219 106 L226 102 L242 117 L233 121 Z" fill="#2c221e" />

      {/* Volumetric 3-Layer Cloud Fleece (Lineless Editorial Gouache Style) */}
      <path
        d="M104 128c-6-1-9.5-6.5-8-12.2 1-4 4.5-7 8.5-7.5 2.5-3.2 7-4.2 10.5-2.5l2 19c-3.6 3.4-8.5 3.6-13 3.2Z"
        fill="#dfd1b8"
      />
      <path
        d="M119 139c-11-1.4-19-10.8-17.6-21.6.8-6.4 4.8-11.8 10.4-14.5-.6-10.8 6.5-20.6 17.2-22.8 3.8-9.2 12.8-15 23-14.5 6-7 15.5-10.5 24.6-8.4 11.5 2.5 19.6 12.5 20 24 8 4 12.8 12.6 11.5 22-1.2 8.4-7.4 15.2-15.5 17.2-4.2 8-13.2 12.8-22.4 11.5-6 6-15.4 8.2-23.5 5.2-6.4 4.4-14.8 4.8-21.8 1-1.8.8-3.8 1.1-5.9.9Z"
        fill="#faf4e4"
        stroke="#c9b99c"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M108 122c4 8 13.5 12 22.4 9.8 6 5.4 14.8 6.4 22 2.4 7.4 4.2 17.2 3 23.4-3 7.8 2 16.2-1.6 20-8.8-5.4 3.6-12.6 4.2-18.6 1.4-5.8 5.8-14.8 6.8-22 2.6-6.4 4.4-15.2 3.6-21-1.4-6.4 3.6-14.8 3-20.6-2-1.8-.3-3.6-.6-5.6-1Z"
        fill="#dfd1b7"
      />
      <path
        d="M148 111c-3 5.4-1 12.2 4.4 14.8M178 106c-3.4 6-.8 13.2 5.2 15.6M202 92c-2.5 5-.6 11.2 4.2 13.5"
        stroke="#d8c8ab"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Sculpted Editorial Sheep Head, Leaf-Shaped Ears & Slouchy Mustard Fisherman Beanie */}
      <path d="M210 62 C194 58 178 61 173 67.5 C178 74 196 76 211 69.5 Z" fill="#362b26" />
      <path d="M207 64.5 C195 62.5 184 64.5 180 67.5 C185 70.5 197 71 207.5 67.5 Z" fill="#231b17" />
      <path d="M249 58 C260 56 271 59 275 64 C271 69 259 71 248 66 Z" fill="#362b26" />
      <path
        d="M210 60 C209 47 220 39 233.5 39 C247 39 256 47.5 256 60 C256 71.5 253 92 242 94 C231 96 211 77 210 60 Z"
        fill="#3a2e29"
      />
      <ellipse cx="227.5" cy="69" rx="2.6" ry="2.8" fill="#140f0d" />
      <ellipse cx="247" cy="68" rx="2.5" ry="2.7" fill="#140f0d" />
      <path d="M238.5 83 L242.5 87 L246.5 83 M242.5 87 L242.5 91.5" stroke="#1d1512" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Slouchy Mustard Fisherman Beanie */}
      <path
        d="M198 48 C196 36 199 28 203.5 24.5 C201 19.5 203.5 13 211 12 C223 10.4 238 16 245 28 C249 34 251 41.5 250.5 47.5 Z"
        fill="#eab949"
        stroke="#8c6319"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M203.5 24.5 C209.5 23.2 216 25.5 220.5 29.5 C214.5 29 208 30.8 202.5 34.5 Z" fill="#c9952a" />
      <path
        d="M195.5 46.5 C207 40.5 237 39.8 252.5 45.5 C254.2 50 253.8 55 251.5 58 C237 52.8 208 53.2 196.2 59 C193.8 55.5 193.8 50.5 195.5 46.5 Z"
        fill="#f5c857"
        stroke="#8c6319"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M205 45 L204.5 55.8 M214.5 43.4 L214.2 54.4 M224.5 42.8 L224.5 53.8 M234.5 43.2 L234.8 54.2 M244 44.4 L244.5 55.4"
        stroke="#c48e20"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Cozy grainy gouache front door overlaid on the live aerial diorama before zooming in. */
export function TitleScreen() {
  const phase = useAppPhase(s => s.phase);
  const howToPlayOpen = useAppPhase(s => s.howToPlayOpen);
  const startPlay = useAppPhase(s => s.startPlay);
  const openHowToPlay = useAppPhase(s => s.openHowToPlay);
  const sound = useUI(s => s.sound);
  const [imgFailed, setImgFailed] = useState(false);

  const visible = phase === 'title' || phase === 'entering';

  const handlePlay = () => {
    Sfx.unlock();
    Sfx.pop();
    Sfx.whoosh();
    Sfx.baa(1.06, 7.6, 0.44);
    startPlay();
  };

  useEffect(() => {
    if (phase !== 'title' || howToPlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input, textarea')) return;
      const k = e.key.toLowerCase();
      if (k === 'enter' || (e.key === ' ' && document.activeElement === document.body)) {
        e.preventDefault();
        Sfx.unlock();
        Sfx.pop();
        Sfx.whoosh();
        Sfx.baa(1.06, 7.6, 0.44);
        useAppPhase.getState().startPlay();
      } else if (e.key === '?' || k === 'h') {
        e.preventDefault();
        Sfx.unlock();
        Sfx.tick();
        useAppPhase.getState().openHowToPlay();
      } else if (k === 'm') {
        e.preventDefault();
        Sfx.unlock();
        useUI.setState({ sound: Sfx.toggle() });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, howToPlayOpen]);

  if (!visible) return null;
  const exiting = phase === 'entering';

  return (
    <section
      className={`ss-title ${exiting ? 'is-exiting' : ''}`}
      aria-label="Sheep Skate Title Screen"
      aria-hidden={exiting}
    >
      <div className="ss-title-top">
        <button
          type="button"
          className="chipbtn icon ss-title-sound"
          title="Sound (M)"
          aria-label={sound ? 'Mute sound' : 'Unmute sound'}
          aria-pressed={!sound}
          onClick={() => { Sfx.unlock(); useUI.setState({ sound: Sfx.toggle() }); }}
        >
          <ArtIcon name={sound ? 'soundOn' : 'soundOff'} size={20} />
        </button>
      </div>

      <div className="ss-title-stage">
        <div className="ss-title-copy">
          <div className="ss-stagger s1">
            <BrandLogo variant="hero" />
          </div>
          <p className="ss-title-tagline ss-stagger s2">
            Tend a sunlit floating skatepark full of wooly skaters. Pop kickflips, catch coral rails, and shape the meadow.
          </p>
          <div className="ss-title-actions ss-stagger s3">
            <button type="button" className="ss-btn ss-btn-primary" onClick={handlePlay}>
              <ArtIcon name="play" size={20} className="ss-play-ic" />
              <span>Play</span>
            </button>
            <button
              type="button"
              className="ss-btn ss-btn-secondary"
              aria-expanded={howToPlayOpen}
              onClick={() => { Sfx.unlock(); Sfx.tick(); openHowToPlay(); }}
            >
              <ArtIcon name="howToPlay" size={19} />
              <span>How to Play</span>
            </button>
          </div>
          <p className="ss-title-hint ss-stagger s4">
            <kbd>Enter</kbd> to drop in &nbsp;·&nbsp; <kbd>?</kbd> field guide
          </p>
        </div>

        <div className="ss-title-art ss-stagger s2">
          <div className="ss-hero-plate">
            <div className="ss-hero-matte">
              {imgFailed ? (
                <FallbackHeroSheep />
              ) : (
                <img
                  src={`${import.meta.env.BASE_URL}art/title-sheep.png`}
                  alt="Editorial gouache key art of a deadpan wooly sheep in a mustard beanie catching air off a mint quarter-pipe on a coral skateboard"
                  onError={() => setImgFailed(true)}
                />
              )}
            </div>
            <span className="ss-hero-stamp" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5 9.8 5.6l4.4.5-3.3 2.9.9 4.3L8 11.1l-3.8 2.2.9-4.3-3.3-2.9 4.4-.5Z" fill="#ffd166" stroke="#2b2622" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <span>MEADOW EDITION · NO. 01</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
