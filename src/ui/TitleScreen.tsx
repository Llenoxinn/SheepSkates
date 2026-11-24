import { useEffect, useState } from 'react';
import { useAppPhase } from '../game/appPhase';
import { Sfx } from '../game/sfx';
import { useUI } from '../game/store';
import { ArtIcon } from './ArtIcons';
import { BrandLogo } from './BrandLogo';

function FallbackHeroSheep() {
  return (
    <svg viewBox="0 0 360 270" className="ss-hero-fallback" role="img" aria-label="Editorial gouache illustration of a sheep catching air off a mint quarter-pipe">
      <defs>
        <linearGradient id="ss-hero-sky" x1="180" y1="0" x2="180" y2="205" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#82bce8" />
          <stop offset="65%" stopColor="#b9dff7" />
          <stop offset="100%" stopColor="#e8f3fa" />
        </linearGradient>
        <linearGradient id="ss-hero-ramp" x1="110" y1="165" x2="290" y2="270" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#b0e6d5" />
          <stop offset="100%" stopColor="#7ec4ae" />
        </linearGradient>
      </defs>

      {/* Sunlit powder-blue sky & warm morning sun */}
      <rect width="360" height="270" fill="url(#ss-hero-sky)" />
      <circle cx="64" cy="48" r="24" fill="#fff3c4" opacity="0.55" />
      <circle cx="64" cy="48" r="15" fill="#ffe07d" />

      {/* Billowing flat-bottomed gouache clouds */}
      <path
        d="M-6 66h96c6 0 11-4.5 11-10 0-5-4-9-9-9.8-1-5.5-6-9.7-12-9.7-2.8 0-5.4 1-7.4 2.6-3-7.5-10.5-12.8-19.2-12.8-11 0-20 8.4-20.8 19-2.2-.8-4.6-1.3-7.2-1.3-9.5 0-17.4 7-18.8 16.2H-6Z"
        fill="#faf4e6"
      />
      <path
        d="M276 46h58c4 0 7-3 7-6.5 0-3.2-2.4-5.8-5.6-6.3-1.2-5.2-6-9-11.6-9-4.5 0-8.5 2.4-10.5 6-1.8-.8-3.8-1.2-6-1.2-6.8 0-12.4 5-13.3 11.5h-18c-3 0-5.5 2.5-5.5 5.5Z"
        fill="#faf4e6"
      />

      {/* Rolling Voronoi meadow hills */}
      <path d="M0 156 Q68 172 136 204 L0 214 Z" fill="#639a3b" />
      <path d="M0 174 Q82 184 152 212 L0 222 Z" fill="#7cb547" />
      <path d="M236 212 Q302 182 360 162 L360 222 Z" fill="#5e9438" />
      <path d="M224 216 Q292 192 360 184 L360 224 Z" fill="#88bf52" />

      {/* Blossoming pastoral sakura tree */}
      <g>
        <path d="M36 177l8-28M42 160l-10-12M41 163l12-11" stroke="#5a3e2e" strokeWidth="4.2" strokeLinecap="round" />
        <path
          d="M28 152c-7-3-11-11-8-18 2-5 6-8 11-9 3-6 10-9 17-7 6 1 11 6 12 12 5 3 7 10 4 16-3 6-10 9-16 8-6 2-14 1-20-2Z"
          fill="#f6a8c1"
          stroke="#2b2622"
          strokeWidth="2"
        />
        <circle cx="35" cy="134" r="2.5" fill="#fffdf7" />
        <circle cx="48" cy="132" r="2.2" fill="#fffdf7" />
        <circle cx="54" cy="144" r="2.4" fill="#fffdf7" />
      </g>

      {/* Wildflowers along the meadow verge */}
      <circle cx="18" cy="196" r="3" fill="#ffd166" />
      <circle cx="48" cy="202" r="2.5" fill="#fffdf7" />
      <circle cx="64" cy="198" r="2.8" fill="#ff8fa3" />
      <circle cx="318" cy="204" r="2.6" fill="#fffdf7" />
      <circle cx="338" cy="198" r="3.2" fill="#ffd166" />

      {/* Sunlit cream-concrete skate plaza with expansion joints & "BAA" stencil */}
      <path d="M0 208 Q180 202 360 212 L360 270 L0 270 Z" fill="#f1e8d8" stroke="#2b2622" strokeWidth="2" />
      <line x1="0" y1="234" x2="360" y2="242" stroke="#d5c8b4" strokeWidth="1.6" />
      <line x1="112" y1="206" x2="82" y2="270" stroke="#d5c8b4" strokeWidth="1.6" />
      <ellipse cx="78" cy="246" rx="28" ry="10" fill="#ff8fa3" opacity="0.28" />

      {/* Coral flatbar grind rail on left plaza */}
      <g>
        <ellipse cx="68" cy="236" rx="34" ry="7" fill="#d9ccb8" opacity="0.7" />
        <path d="M42 224v13M94 215v12M36 237h12M88 227h12" stroke="#d95f49" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M32 223 L102 211" stroke="#ff8c7a" strokeWidth="6.5" strokeLinecap="round" />
        <path d="M32 223 L102 211" stroke="#2b2622" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Tipped traffic cone on right plaza */}
      <g transform="translate(314 236) rotate(56)">
        <rect x="-11" y="10" width="22" height="5" rx="2" fill="#e07a2e" stroke="#2b2622" strokeWidth="1.8" />
        <path d="M0 -14 L-8 10 L8 10 Z" fill="#ff9a4d" stroke="#2b2622" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M-4.5 -1 L4.5 -1 L6 4 L-6 4 Z" fill="#fffdf7" />
      </g>

      {/* Mint Quarter-Pipe Ramp with brushed steel coping & shadow */}
      <path d="M52 270 Q168 232 232 174 L268 270 Z" fill="url(#ss-hero-ramp)" stroke="#2b2622" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M232 174 L268 270 L165 270 Q204 232 232 174 Z" fill="#74bca5" stroke="#2b2622" strokeWidth="2.2" strokeLinejoin="round" />
      <line x1="48" y1="270" x2="234" y2="174" stroke="#c9ced8" strokeWidth="8.5" strokeLinecap="round" />
      <line x1="48" y1="270" x2="234" y2="174" stroke="#2b2622" strokeWidth="2.2" strokeLinecap="round" />

      {/* Dynamic airborne coral skateboard with grip top, trucks & cream urethane wheels */}
      <g transform="rotate(-21 196 138)">
        <rect x="114" y="138" width="162" height="14" rx="7" fill="#ff846e" stroke="#2b2622" strokeWidth="2.6" />
        <path d="M122 139.5h146" stroke="#373540" strokeWidth="4.2" strokeLinecap="round" />
        {/* Trucks */}
        <path d="M144 152h14l-3 7h-8ZM226 152h14l-3 7h-8Z" fill="#c6cbd4" stroke="#2b2622" strokeWidth="2" strokeLinejoin="round" />
        {/* Back & front pairs of urethane wheels */}
        <circle cx="159" cy="161" r="10.5" fill="#d9cbb7" stroke="#2b2622" strokeWidth="2.2" />
        <circle cx="241" cy="161" r="10.5" fill="#d9cbb7" stroke="#2b2622" strokeWidth="2.2" />
        <circle cx="147" cy="163" r="11.5" fill="#f5ecd6" stroke="#2b2622" strokeWidth="2.4" />
        <circle cx="229" cy="163" r="11.5" fill="#f5ecd6" stroke="#2b2622" strokeWidth="2.4" />
        <circle cx="147" cy="163" r="3.8" fill="#4a3b35" />
        <circle cx="229" cy="163" r="3.8" fill="#4a3b35" />
      </g>

      {/* Four chocolate legs & hooves planted on the deck */}
      <path d="M150 135l11 16M166 131l11 15M194 119l11 16M216 106l14 15" stroke="#3a2f2b" strokeWidth="9.5" strokeLinecap="round" />
      <path d="M150 135l11 16M166 131l11 15M194 119l11 16M216 106l14 15" stroke="#2b2622" strokeWidth="2.2" strokeLinecap="round" />

      {/* Fluffy multi-lobed wool body with gouache under-shadow */}
      <circle cx="104" cy="117" r="11" fill="#efe4cf" stroke="#2b2622" strokeWidth="2.3" />
      <path
        d="M114 128c-10-4-15-16-11-26 2-6 7-11 13-13 0-12 9-22 21-23 5-10 16-16 28-14 6-7 16-11 26-8 12 3 20 14 19 26 9 5 14 15 11 25-2 9-10 16-19 17-4 9-14 15-24 13-6 7-17 10-26 6-7 5-17 4-24-2-5 2-10 1-14-1Z"
        fill="#faf4e8"
        stroke="#2b2622"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M118 125c8 7 20 8 29 2 8 6 20 6 28-1 9 4 21 2 28-6"
        stroke="#e2d3bc"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Sculpted cocoa head, ears, deadpan eyes & mustard ribbed knit beanie */}
      <ellipse cx="192" cy="64" rx="16" ry="7" transform="rotate(-12 192 64)" fill="#3a2f2b" stroke="#2b2622" strokeWidth="2.4" />
      <ellipse cx="254" cy="63" rx="14" ry="6.5" transform="rotate(12 254 63)" fill="#3a2f2b" stroke="#2b2622" strokeWidth="2.4" />
      <path
        d="M210 56c0-14 10-22 21-22s20 8 21 22c1 14-5 31-16 33-11 2-26-14-26-33Z"
        fill="#3a2f2b"
        stroke="#2b2622"
        strokeWidth="2.6"
      />
      <circle cx="225" cy="67" r="2.8" fill="#141010" />
      <circle cx="243" cy="67" r="2.8" fill="#141010" />
      <circle cx="224" cy="66" r="0.9" fill="#ffffff" />
      <circle cx="242" cy="66" r="0.9" fill="#ffffff" />
      <ellipse cx="218" cy="74" rx="3.8" ry="2.2" fill="#ff9fb4" opacity="0.55" />
      <ellipse cx="248" cy="74" rx="3.8" ry="2.2" fill="#ff9fb4" opacity="0.55" />
      <path d="M235 79l3 3 3-3M238 82v4" stroke="#221a17" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Chunky mustard-gold ribbed beanie */}
      <path
        d="M198 48c-1-16 9-30 25-31 15-1 28 10 30 27Z"
        fill="#eeb844"
        stroke="#2b2622"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <rect x="195" y="42" width="60" height="14" rx="6" fill="#f5c756" stroke="#2b2622" strokeWidth="2.4" />
      <path d="M206 44v10M216 44v10M226 44v10M236 44v10M246 44v10" stroke="#c89226" strokeWidth="2" strokeLinecap="round" />
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
          </div>
        </div>
      </div>
    </section>
  );
}
