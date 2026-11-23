import { useEffect, useState } from 'react';
import { useAppPhase } from '../game/appPhase';
import { Sfx } from '../game/sfx';
import { useUI } from '../game/store';
import { ArtIcon } from './ArtIcons';
import { BrandLogo } from './BrandLogo';

function FallbackHeroSheep() {
  return (
    <svg viewBox="0 0 360 270" className="ss-hero-fallback" role="img" aria-label="Editorial gouache illustration of a sheep catching air off a mint quarter-pipe">
      <rect width="360" height="270" fill="#8fc3ea" />
      <path d="M0 198 Q110 176 220 194 T360 184 L360 270 L0 270 Z" fill="#7cb547" />
      <rect x="0" y="210" width="360" height="60" fill="#e8dfd0" />
      <path d="M90 270 Q195 245 258 174 L268 178 L280 270 Z" fill="#9fd8c6" stroke="#2b2622" strokeWidth="3" strokeLinejoin="round" />
      <line x1="86" y1="268" x2="262" y2="174" stroke="#c9ced8" strokeWidth="7" strokeLinecap="round" />
      <g transform="rotate(-18 190 132)">
        <rect x="116" y="138" width="146" height="14" rx="7" fill="#ff8c7a" stroke="#2b2622" strokeWidth="3.5" />
        <circle cx="146" cy="158" r="9" fill="#f5ecd6" stroke="#2b2622" strokeWidth="3" />
        <circle cx="232" cy="158" r="9" fill="#f5ecd6" stroke="#2b2622" strokeWidth="3" />
      </g>
      <circle cx="176" cy="96" r="42" fill="#faf4e8" stroke="#2b2622" strokeWidth="3.5" />
      <ellipse cx="220" cy="86" rx="22" ry="20" fill="#3a2f2b" stroke="#2b2622" strokeWidth="3.5" />
      <circle cx="218" cy="82" r="2.6" fill="#fffdf9" opacity="0.2" />
      <circle cx="215" cy="83" r="2.2" fill="#141010" />
      <circle cx="230" cy="83" r="2.2" fill="#141010" />
      <path d="M196 68c2-15 12-24 24-24s22 9 23 24Z" fill="#ffd166" stroke="#2b2622" strokeWidth="3.5" />
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
