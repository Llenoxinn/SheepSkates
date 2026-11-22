import { useEffect, useState } from 'react';
import { useAppPhase } from '../game/appPhase';
import { Sfx } from '../game/sfx';
import { useUI } from '../game/store';
import { ArtIcon } from './ArtIcons';
import { BrandLogo } from './BrandLogo';

function FallbackHeroSheep() {
  return (
    <svg viewBox="0 0 280 280" className="ss-hero-fallback" role="img" aria-label="Illustrated wooly sheep on a coral skateboard">
      <rect width="280" height="280" fill="#f6f1e7" />
      <path d="M62 222 Q140 206 218 222" stroke="#7cb547" strokeWidth="14" strokeLinecap="round" fill="none" />
      <circle cx="96" cy="212" r="4" fill="#ffd166" />
      <circle cx="188" cy="213" r="4" fill="#ffd166" />
      <g transform="rotate(-14 146 184)">
        <rect x="74" y="176" width="144" height="16" rx="8" fill="#ff8fa3" stroke="#2b2622" strokeWidth="4" />
        <circle cx="104" cy="200" r="10" fill="#f5ecd6" stroke="#2b2622" strokeWidth="3.5" />
        <circle cx="188" cy="200" r="10" fill="#f5ecd6" stroke="#2b2622" strokeWidth="3.5" />
      </g>
      <circle cx="128" cy="126" r="46" fill="#faf4e8" stroke="#2b2622" strokeWidth="4" />
      <ellipse cx="164" cy="120" rx="28" ry="26" fill="#4a3b35" stroke="#2b2622" strokeWidth="4" />
      <circle cx="156" cy="116" r="5" fill="#fff" />
      <circle cx="174" cy="116" r="5" fill="#fff" />
      <circle cx="157" cy="117" r="2.6" fill="#141010" />
      <circle cx="175" cy="117" r="2.6" fill="#141010" />
      <ellipse cx="147" cy="128" rx="6" ry="3.8" fill="#ff9fb4" />
      <ellipse cx="180" cy="128" rx="6" ry="3.8" fill="#ff9fb4" />
      <path d="M138 98c2-18 14-28 28-28s25 10 26 28Z" fill="#6fd0b4" stroke="#2b2622" strokeWidth="4" />
      <circle cx="166" cy="64" r="10" fill="#bff0df" stroke="#2b2622" strokeWidth="3.5" />
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
            <span className="ss-tape tl" aria-hidden="true" />
            <span className="ss-tape br" aria-hidden="true" />
            <div className="ss-hero-matte">
              {imgFailed ? (
                <FallbackHeroSheep />
              ) : (
                <img
                  src={`${import.meta.env.BASE_URL}art/title-sheep.png`}
                  alt="Illustrated wooly sheep in a mint beanie doing an ollie on a pastel coral skateboard"
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
