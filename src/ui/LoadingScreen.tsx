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
            <svg className="ss-loader-skater" viewBox="42 6 94 78" fill="none">
              {/* Trailing chalk & meadow dust puffs */}
              <g className="ss-dust-puff">
                <circle cx="49" cy="74" r="3.2" fill="#e8dfd0" stroke="#2b2622" strokeWidth="1.4" />
                <circle cx="44.5" cy="71.5" r="2.1" fill="#faf4e8" stroke="#2b2622" strokeWidth="1.2" />
                <path d="M43 65.5h6.5" stroke="#b8ac99" strokeWidth="1.6" strokeLinecap="round" />
              </g>
              <g className="ss-skater-bob">
                {/* Skateboard with kicked nose/tail, maple ply & aluminum trucks */}
                <g transform="rotate(-4 94 70)">
                  <path
                    d="M56 66.2c3.5 2.1 8 2.6 15 2.6h44c7 0 11.5-.5 15-2.6"
                    stroke="#ff8fa3"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M59 64.9c3 1.8 7 2.2 13 2.2h42c6 0 10-.4 13-2.2"
                    stroke="#373540"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M56 66.2c3.5 2.1 8 2.6 15 2.6h44c7 0 11.5-.5 15-2.6"
                    stroke="#2b2622"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  />
                  {/* Aluminum truck hangers */}
                  <path d="M70 71.5h6l-1.2 3.2h-3.6ZM112 71.5h6l-1.2 3.2h-3.6Z" fill="#c6cbd4" stroke="#2b2622" strokeWidth="1.4" strokeLinejoin="round" />
                  <g className="ss-wheel" style={{ transformOrigin: '73px 77px' }}>
                    <circle cx="73" cy="77" r="5.2" fill="#f5ecd6" stroke="#2b2622" strokeWidth="2" />
                    <circle cx="73" cy="77" r="1.9" fill="#ff8fa3" stroke="#2b2622" strokeWidth="1" />
                    <circle cx="73" cy="73.8" r="0.8" fill="#2b2622" />
                    <circle cx="70.3" cy="78.5" r="0.8" fill="#2b2622" />
                    <circle cx="75.7" cy="78.5" r="0.8" fill="#2b2622" />
                  </g>
                  <g className="ss-wheel" style={{ transformOrigin: '115px 77px' }}>
                    <circle cx="115" cy="77" r="5.2" fill="#f5ecd6" stroke="#2b2622" strokeWidth="2" />
                    <circle cx="115" cy="77" r="1.9" fill="#ff8fa3" stroke="#2b2622" strokeWidth="1" />
                    <circle cx="115" cy="73.8" r="0.8" fill="#2b2622" />
                    <circle cx="112.3" cy="78.5" r="0.8" fill="#2b2622" />
                    <circle cx="117.7" cy="78.5" r="0.8" fill="#2b2622" />
                  </g>
                </g>
                {/* Four chocolate hooves */}
                <ellipse cx="73" cy="64.5" rx="3.5" ry="2.9" fill="#3a2f2b" stroke="#2b2622" strokeWidth="1.6" />
                <ellipse cx="78.5" cy="64" rx="4" ry="3.4" fill="#4a3b35" stroke="#2b2622" strokeWidth="1.8" />
                <ellipse cx="100.5" cy="62.5" rx="3.5" ry="2.9" fill="#3a2f2b" stroke="#2b2622" strokeWidth="1.6" />
                <ellipse cx="106" cy="62" rx="4" ry="3.4" fill="#4a3b35" stroke="#2b2622" strokeWidth="1.8" />
                {/* Tail puff & multi-lobed wool body */}
                <circle cx="56.5" cy="46.2" r="4.8" fill="#efe5d2" stroke="#2b2622" strokeWidth="2" />
                <path
                  d="M66 56c-5.5 0-9.5-3.8-9.5-8.8 0-3.6 2-6.8 5.2-8.2-.2-5.6 4.4-10.2 10.3-10.2 2.2 0 4.2.7 5.8 1.8 2.4-3.5 6.4-5.7 11-5.7 7.2 0 13 5.4 13.4 12.4 4.2 1.2 7.2 4.9 7.2 9.4 0 5.4-4.5 9.3-10 9.3Z"
                  fill="#faf4e8"
                  stroke="#2b2622"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                {/* Gouache wool shading curls */}
                <path d="M67 33.5c2.4-2.2 5.8-2.8 8.8-1.4 2.2-2.8 5.8-4.4 9.5-3.8" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M66.5 52.5c5.2 2.2 11.4 2.4 16.5.3 5 1.9 10.8 1.8 15.6-.6" stroke="#e2d3bc" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M74.5 43.2c-1.2 2.2-.4 4.8 1.9 5.8M85 39.8c-1.4 2.4-.4 5 2 6" stroke="#e5d7c1" strokeWidth="1.9" strokeLinecap="round" />
                {/* Face & ears */}
                <g transform="rotate(-18 79 37)">
                  <ellipse cx="79" cy="37" rx="6.6" ry="3.3" fill="#4a3b35" stroke="#2b2622" strokeWidth="2" />
                  <ellipse cx="78.8" cy="37.2" rx="3.8" ry="1.4" fill="#70584f" />
                </g>
                <g transform="rotate(14 114 35)">
                  <ellipse cx="114" cy="35" rx="6.6" ry="3.3" fill="#4a3b35" stroke="#2b2622" strokeWidth="2" />
                  <ellipse cx="114.2" cy="35.2" rx="3.8" ry="1.4" fill="#70584f" />
                </g>
                <ellipse cx="97.5" cy="40.5" rx="13.5" ry="12.5" fill="#4a3b35" stroke="#2b2622" strokeWidth="2.3" />
                <path d="M87.5 31.2c2.2 2 5.6 2.2 7.8.3 2.2 1.9 5.6 1.9 7.8-.2 1.9 1.6 4.5 1.4 6.2-.3" fill="#faf4e8" stroke="#2b2622" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="93.6" cy="39.2" r="3.2" fill="#fffdf9" stroke="#2b2622" strokeWidth="0.9" />
                <circle cx="104.2" cy="39.2" r="3.2" fill="#fffdf9" stroke="#2b2622" strokeWidth="0.9" />
                <circle cx="94.3" cy="39.5" r="1.9" fill="#141010" />
                <circle cx="104.9" cy="39.5" r="1.9" fill="#141010" />
                <circle cx="93.2" cy="38.4" r="0.95" fill="#fff" />
                <circle cx="103.8" cy="38.4" r="0.95" fill="#fff" />
                <ellipse cx="88.8" cy="44.5" rx="3.2" ry="2" fill="#ff9fb4" />
                <ellipse cx="108" cy="44.5" rx="3.2" ry="2" fill="#ff9fb4" />
                <path d="M97.4 43.8l1.6 1.5 1.6-1.5M99 45.3v2.1" stroke="#d7a19e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M96.2 47.4q2.8 1.8 5.6 0" stroke="#f0bec0" strokeWidth="1.8" strokeLinecap="round" />
                {/* Ribbed mint knit beanie */}
                <path d="M84.5 31c.7-8.2 6.4-13.2 13-13.2s12.2 5 12.6 13Z" fill="#6fd0b4" stroke="#2b2622" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M92.2 18.8c-1.1 3.4-1.5 7-1.4 10.5M103.2 18.8c1.1 3.4 1.5 7 1.4 10.5" stroke="#52b397" strokeWidth="1.6" strokeLinecap="round" />
                <rect x="82.8" y="27.5" width="29.4" height="6.4" rx="3.2" fill="#9fd8c6" stroke="#2b2622" strokeWidth="2" />
                <path d="M89 28.3v4.8M94.8 28.3v4.8M100.6 28.3v4.8M106.4 28.3v4.8" stroke="#68b89f" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="97.5" cy="14.2" r="5.4" fill="#bff0df" stroke="#2b2622" strokeWidth="2" />
                <path d="M95.4 12.4a2.8 2.8 0 0 1 3.6-.4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>

        <p className="ss-loader-meta">
          <span>Setting up the meadow</span>
          <b>{String(pct).padStart(2, '0')}</b>
        </p>
      </div>
    </div>
  );
}
