import { useEffect, useState, type CSSProperties } from 'react';
import { useProgress } from '@react-three/drei';
import { useAppPhase } from '../game/appPhase';

/** Paper loading curtain: the sheep rides the pencil line as progress that holds until textures & 3D scene are mounted. */
export function LoadingScreen({ skipTitle }: { skipTitle: boolean }) {
  const { active, progress } = useProgress();
  const phase = useAppPhase(s => s.phase);
  const sceneReady = useAppPhase(s => s.sceneReady);
  const showTitle = useAppPhase(s => s.showTitle);
  const finishEntering = useAppPhase(s => s.finishEntering);

  const [pct, setPct] = useState(0);
  const [unmounted, setUnmounted] = useState(false);

  // Monotonic percentage display so Drei suspense batches never jump backward.
  useEffect(() => {
    const next = sceneReady && !active ? 100 : Math.min(96, Math.round(progress));
    setPct(prev => Math.max(prev, next));
  }, [active, progress, sceneReady]);

  // Advance only once R3F scene has mounted inside Suspense AND Drei loader is idle.
  useEffect(() => {
    if (phase !== 'loading' || !sceneReady || active) return;
    setPct(100);
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const delay = skipTitle || reduced ? 0 : 420;
    const t = window.setTimeout(() => {
      if (skipTitle) finishEntering();
      else showTitle();
    }, delay);
    return () => clearTimeout(t);
  }, [phase, sceneReady, active, skipTitle, showTitle, finishEntering]);

  // Unmount cleanly after the fade-out transition finishes.
  useEffect(() => {
    if (phase === 'loading') return;
    const t = window.setTimeout(() => setUnmounted(true), 460);
    return () => clearTimeout(t);
  }, [phase]);

  if (unmounted) return null;
  const done = phase !== 'loading';

  return (
    <div
      className={`ss-loader ${done ? 'is-done' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Sheep Skate"
      aria-hidden={done}
    >
      <div className="ss-loader-inner" style={{ '--p': pct } as CSSProperties}>
        <h1 className="ss-loader-word">Sheep Skate</h1>

        <div className="ss-loader-run" aria-hidden="true">
          <svg className="ss-loader-line" viewBox="0 0 400 12" preserveAspectRatio="none">
            <path d="M2 7 C60 4 110 9 170 6 S300 4 398 7" pathLength={100} className="ss-line-base" />
            <path d="M2 7 C60 4 110 9 170 6 S300 4 398 7" pathLength={100} className="ss-line-ink" />
          </svg>
          <div className="ss-loader-rider">
            <svg className="ss-loader-skater" viewBox="50 8 84 76" fill="none">
            <g className="ss-skater-bob">
              {/* Board */}
              <g transform="rotate(-4 94 70)">
                <rect x="58" y="67" width="72" height="7" rx="3.5" fill="#ff8fa3" stroke="#2b2622" strokeWidth="2.2" />
                <line x1="65" y1="67" x2="123" y2="67" stroke="#3f3d48" strokeWidth="2" strokeLinecap="round" />
                <g className="ss-wheel" style={{ transformOrigin: '73px 77px' }}>
                  <circle cx="73" cy="77" r="5" fill="#f5ecd6" stroke="#2b2622" strokeWidth="2" />
                  <circle cx="73" cy="77" r="1.7" fill="#bcc1cc" />
                  <line x1="73" y1="73.5" x2="73" y2="80.5" stroke="#2b2622" strokeWidth="1" />
                </g>
                <g className="ss-wheel" style={{ transformOrigin: '115px 77px' }}>
                  <circle cx="115" cy="77" r="5" fill="#f5ecd6" stroke="#2b2622" strokeWidth="2" />
                  <circle cx="115" cy="77" r="1.7" fill="#bcc1cc" />
                  <line x1="115" y1="73.5" x2="115" y2="80.5" stroke="#2b2622" strokeWidth="1" />
                </g>
              </g>
              {/* Hooves */}
              <ellipse cx="77" cy="64" rx="4" ry="3.4" fill="#4a3b35" stroke="#2b2622" strokeWidth="1.8" />
              <ellipse cx="104" cy="62" rx="4" ry="3.4" fill="#4a3b35" stroke="#2b2622" strokeWidth="1.8" />
              {/* Wool body */}
              <path
                d="M66 56c-5.5 0-9.5-3.8-9.5-8.8 0-3.6 2-6.8 5.2-8.2-.2-5.6 4.4-10.2 10.3-10.2 2.2 0 4.2.7 5.8 1.8 2.4-3.5 6.4-5.7 11-5.7 7.2 0 13 5.4 13.4 12.4 4.2 1.2 7.2 4.9 7.2 9.4 0 5.4-4.5 9.3-10 9.3Z"
                fill="#faf4e8"
                stroke="#2b2622"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <circle cx="57" cy="46" r="4.5" fill="#faf4e8" stroke="#2b2622" strokeWidth="2" />
              {/* Face & ears */}
              <ellipse cx="79" cy="37" rx="6.5" ry="3.2" transform="rotate(-18 79 37)" fill="#4a3b35" stroke="#2b2622" strokeWidth="2" />
              <ellipse cx="114" cy="35" rx="6.5" ry="3.2" transform="rotate(14 114 35)" fill="#4a3b35" stroke="#2b2622" strokeWidth="2" />
              <ellipse cx="97.5" cy="40.5" rx="13.5" ry="12.5" fill="#4a3b35" stroke="#2b2622" strokeWidth="2.3" />
              <circle cx="94" cy="39" r="3.1" fill="#fff" />
              <circle cx="104" cy="39" r="3.1" fill="#fff" />
              <circle cx="94.7" cy="39.3" r="1.8" fill="#141010" />
              <circle cx="104.7" cy="39.3" r="1.8" fill="#141010" />
              <circle cx="93.5" cy="38.2" r="0.9" fill="#fff" />
              <circle cx="103.5" cy="38.2" r="0.9" fill="#fff" />
              <ellipse cx="89" cy="44.5" rx="3.1" ry="2" fill="#ff9fb4" />
              <ellipse cx="107.5" cy="44.5" rx="3.1" ry="2" fill="#ff9fb4" />
              <path d="M96.2 45q2.6 2.2 5.2 0" stroke="#e8b4b8" strokeWidth="1.9" strokeLinecap="round" />
              {/* Mint knit beanie */}
              <path d="M84.5 31c.7-8.2 6.4-13.2 13-13.2s12.2 5 12.6 13Z" fill="#6fd0b4" stroke="#2b2622" strokeWidth="2.2" strokeLinejoin="round" />
              <rect x="82.8" y="27.5" width="28.6" height="6.2" rx="3.1" fill="#9fd8c6" stroke="#2b2622" strokeWidth="2" />
              <circle cx="97.5" cy="14.5" r="5.2" fill="#bff0df" stroke="#2b2622" strokeWidth="2" />
            </g>
            </svg>
          </div>
        </div>

        <p className="ss-loader-meta">
          <span>Setting up the meadow</span>
          <b>{String(pct).padStart(2, '0')}</b>
        </p>
      </div>    </div>
  );
}
