import { useEffect, useState } from 'react';
import { useAppPhase } from '../game/appPhase';
import { Sfx } from '../game/sfx';
import { useUI } from '../game/store';
import { ArtIcon } from './ArtIcons';
import { BrandLogo } from './BrandLogo';

function FallbackHeroSheep() {
  return (
    <svg viewBox="0 0 360 270" className="ss-hero-fallback" role="img" aria-label="Editorial gouache illustration of a sheep in a mustard pom-pom beanie catching air off a mint quarter-pipe">
      <defs>
        <linearGradient id="ss-hero-sky" x1="180" y1="0" x2="180" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#92c8ec" />
          <stop offset="65%" stopColor="#c5e4f7" />
          <stop offset="100%" stopColor="#f4EFE2" />
        </linearGradient>
        <linearGradient id="ss-hero-ramp" x1="120" y1="165" x2="340" y2="270" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bce8da" />
          <stop offset="100%" stopColor="#85c8b3" />
        </linearGradient>
      </defs>

      {/* Sunlit powder-blue sky & gouache clouds */}
      <rect width="360" height="270" fill="url(#ss-hero-sky)" />
      <path
        d="M-6 52h104c5 0 9-4 9-8.5 0-4.2-3.4-7.8-7.8-8.3-1.4-5.6-6.5-9.7-12.6-9.7-3.4 0-6.5 1.3-8.8 3.5-3.2-7.8-11-13.2-20-13.2-11.5 0-21 8.8-21.8 20-2.4-.9-5-1.4-7.8-1.4-9.8 0-18 7.2-19.4 16.6H-6Z"
        fill="#fbf6ea"
      />
      <path
        d="M242 42h98c4.5 0 8-3.2 8-7.2 0-3.6-2.8-6.6-6.4-7.1-1.5-5.8-6.8-10-13.2-10-5 0-9.4 2.6-11.8 6.6-2-.9-4.2-1.4-6.6-1.4-7.6 0-13.8 5.6-14.8 12.8H242Z"
        fill="#fbf6ea"
      />

      {/* Patchwork Voronoi meadow hills */}
      <path d="M0 78 Q92 68 188 94 T360 88 L360 175 L0 175 Z" fill="#88bc52" stroke="#2b2622" strokeWidth="1.5" />
      <path d="M48 76 Q128 84 176 112 L58 118 Z" fill="#a8d16c" stroke="#2b2622" strokeWidth="1.2" />
      <path d="M126 98 Q200 84 268 112 L140 124 Z" fill="#d0c25e" stroke="#2b2622" strokeWidth="1.2" />
      <path d="M0 105 Q110 112 220 132 L360 118 L360 190 L0 190 Z" fill="#6da640" />

      {/* Meadow pond with reeds on back-left */}
      <ellipse cx="72" cy="128" rx="42" ry="11" fill="#89bee6" stroke="#4f7c34" strokeWidth="1.8" />
      <path d="M38 126l-2-12M42 127l1-14M102 127l2-13M106 128l-1-11" stroke="#3f6928" strokeWidth="2" strokeLinecap="round" />

      {/* Blossoming pink sakura tree on right knoll */}
      <g>
        <path d="M318 118l-4-26M315 102l-12-10M316 100l11-11" stroke="#5a3e2e" strokeWidth="3.8" strokeLinecap="round" />
        <circle cx="302" cy="76" r="14" fill="#f9bfd0" stroke="#2b2622" strokeWidth="1.5" />
        <circle cx="324" cy="74" r="15" fill="#f9bfd0" stroke="#2b2622" strokeWidth="1.5" />
        <circle cx="313" cy="63" r="16" fill="#fcd1de" stroke="#2b2622" strokeWidth="1.5" />
      </g>

      {/* Sunlit cream-concrete skate plaza with expansion joints & pink "BAA" stencil */}
      <path d="M0 168 L175 136 L360 154 L360 270 L0 270 Z" fill="#f3eadb" stroke="#2b2622" strokeWidth="2" />
      <line x1="25" y1="164" x2="215" y2="270" stroke="#d5c8b4" strokeWidth="1.5" />
      <line x1="0" y1="226" x2="290" y2="148" stroke="#d5c8b4" strokeWidth="1.5" />
      <g transform="translate(94 212) rotate(-22) scale(1 0.62)">
        <circle cx="0" cy="0" r="36" fill="none" stroke="#f2b6bc" strokeWidth="4.5" strokeDasharray="34 10" />
        <text x="0" y="9" textAnchor="middle" fill="#f2b6bc" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="26">BAA</text>
      </g>

      {/* Coral flatbar grind rail on left plaza */}
      <g>
        <path d="M34 184v18M82 168v16M126 153v15M28 202h12M76 184h12M120 168h12" stroke="#d95f49" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M24 184 L132 148" stroke="#ff7c66" strokeWidth="7" strokeLinecap="round" />
        <path d="M24 184 L132 148" stroke="#2b2622" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Tipped traffic cone on right plaza */}
      <g transform="translate(318 168) rotate(56)">
        <rect x="-11" y="10" width="22" height="5" rx="2" fill="#e07a2e" stroke="#2b2622" strokeWidth="1.8" />
        <path d="M0 -14 L-8 10 L8 10 Z" fill="#ff9240" stroke="#2b2622" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M-4.5 -1 L4.5 -1 L6 4 L-6 4 Z" fill="#fffdf7" />
      </g>

      {/* Mint Quarter-Pipe Ramp with Maple Plywood Side & Brushed Steel Coping */}
      <path d="M98 260 L185 218 Q218 232 232 204 L360 150 L360 270 L98 270 Z" fill="url(#ss-hero-ramp)" stroke="#2b2622" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M198 270 Q222 246 232 204 L284 226 L284 270 Z" fill="#d9a66c" stroke="#2b2622" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M284 226 L360 192 L360 270 L284 270 Z" fill="#b8834a" stroke="#2b2622" strokeWidth="2.2" strokeLinejoin="round" />
      <line x1="232" y1="204" x2="360" y2="148" stroke="#cfd5df" strokeWidth="8" strokeLinecap="round" />
      <line x1="232" y1="204" x2="360" y2="148" stroke="#2b2622" strokeWidth="2.1" strokeLinecap="round" />

      {/* Airborne Coral Skateboard with Metallic Trucks & Cream Wheels */}
      <g transform="rotate(-34 244 176)">
        <rect x="192" y="168" width="104" height="16" rx="8" fill="#ff8fa3" stroke="#2b2622" strokeWidth="2.4" />
        <path d="M214 184h12l-2 6h-8ZM264 184h12l-2 6h-8Z" fill="#cfd5df" stroke="#2b2622" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="216" cy="192" r="7.5" fill="#fbf3e1" stroke="#2b2622" strokeWidth="2.1" />
        <circle cx="268" cy="192" r="7.5" fill="#fbf3e1" stroke="#2b2622" strokeWidth="2.1" />
      </g>

      {/* Golden Sparkles around the board */}
      <path d="m190 186 1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5Z" fill="#ffd166" stroke="#2b2622" strokeWidth="1.1" />
      <path d="m292 152 1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5Z" fill="#ffd166" stroke="#2b2622" strokeWidth="1.1" />

      {/* Sheep Legs, Fluffy Wool Body, Forelock & Mustard Pom-Pom Beanie */}
      <path d="M174 118 152 138M244 102 268 90M218 154 218 184M244 134 258 156" stroke="#3a2f2b" strokeWidth="9.5" strokeLinecap="round" />
      <path
        d="M178 156c-9-4-14-15-10-25 2-6 6-10 12-12 0-12 8-22 20-23 5-9 15-15 26-13 6-6 15-10 24-7 11 3 18 13 17 24 8 5 13 14 10 23-2 8-9 15-18 16-4 8-13 14-22 12-6 6-16 9-24 5-6 4-15 3-21-2-5 2-10 1-14 2Z"
        fill="#fffdf8"
        stroke="#2b2622"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <ellipse cx="192" cy="86" rx="14" ry="5.5" transform="rotate(-12 192 86)" fill="#3a2f2b" stroke="#2b2622" strokeWidth="2.2" />
      <ellipse cx="250" cy="72" rx="13" ry="5.2" transform="rotate(-18 250 72)" fill="#3a2f2b" stroke="#2b2622" strokeWidth="2.2" />
      <path d="M208 82c0-13 9-21 20-21s19 8 20 21c1 13-5 28-15 30s-25-12-25-30Z" fill="#3a2f2b" stroke="#2b2622" strokeWidth="2.4" />
      <circle cx="222" cy="88" r="2.6" fill="#141010" />
      <circle cx="241" cy="84" r="2.6" fill="#141010" />
      <ellipse cx="218" cy="95" rx="3.8" ry="2.2" fill="#ff8fa3" />
      <ellipse cx="245" cy="90" rx="3.2" ry="2" fill="#ff8fa3" />
      <path d="M206 76c3 2.5 8 2.5 11 0 3 2.2 8 2.2 11 0 3 2 7 1.8 10-.5" fill="#fffdf8" stroke="#2b2622" strokeWidth="2" strokeLinecap="round" />
      <g transform="rotate(-14 220 58)">
        <circle cx="218" cy="34" r="10.5" fill="#fffdf8" stroke="#2b2622" strokeWidth="2.2" />
        <path d="M194 68c1-16 11-26 25-26s24 10 25 26Z" fill="#f4b938" stroke="#2b2622" strokeWidth="2.4" />
        <rect x="192" y="61" width="54" height="12" rx="5.5" fill="#ffd666" stroke="#2b2622" strokeWidth="2.2" />
      </g>
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
                  alt="Editorial gouache key art of a deadpan wooly sheep in a mustard pom-pom beanie catching air off a mint quarter-pipe on a coral skateboard"
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
