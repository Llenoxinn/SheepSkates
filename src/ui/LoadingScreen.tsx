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
            <svg className="ss-loader-skater" viewBox="36 2 102 82" fill="none">
              {/* Trailing chalk & meadow dust puffs */}
              <g className="ss-dust-puff">
                <circle cx="48" cy="73" r="4" fill="#efe4cf" stroke="#2b2622" strokeWidth="1.5" />
                <circle cx="41.5" cy="70.5" r="2.7" fill="#fffdf8" stroke="#2b2622" strokeWidth="1.3" />
                <path d="M39 63h8.5M42 58.5h6" stroke="#b8ac99" strokeWidth="1.7" strokeLinecap="round" />
              </g>
              <g className="ss-skater-bob">
                {/* 3/4 Kicktail Coral Skateboard with grip top & aluminum trucks */}
                <g transform="rotate(-4 94 70)">
                  <path
                    d="M54 65.5c4 2.6 9.5 3.3 18 3.3h42c8.5 0 14-.7 18-3.3"
                    stroke="#ff6b8b"
                    strokeWidth="7.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M57.5 63.9c3.5 2.2 8.5 2.8 15.5 2.8h40c7 0 12-.6 15.5-2.8"
                    stroke="#35333e"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M54 65.5c4 2.6 9.5 3.3 18 3.3h42c8.5 0 14-.7 18-3.3"
                    stroke="#2b2622"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {/* Aluminum truck hangers */}
                  <path d="M69 71h7l-1.4 3.5h-4.2ZM111 71h7l-1.4 3.5h-4.2Z" fill="#cfd5df" stroke="#2b2622" strokeWidth="1.5" strokeLinejoin="round" />
                  <g className="ss-wheel" style={{ transformOrigin: '72.5px 77px' }}>
                    <circle cx="72.5" cy="77" r="5.4" fill="#fbf3e1" stroke="#2b2622" strokeWidth="2.1" />
                    <circle cx="72.5" cy="77" r="2" fill="#ff6b8b" stroke="#2b2622" strokeWidth="1" />
                    <circle cx="72.5" cy="73.6" r="0.85" fill="#2b2622" />
                    <circle cx="69.7" cy="78.6" r="0.85" fill="#2b2622" />
                    <circle cx="75.3" cy="78.6" r="0.85" fill="#2b2622" />
                  </g>
                  <g className="ss-wheel" style={{ transformOrigin: '114.5px 77px' }}>
                    <circle cx="114.5" cy="77" r="5.4" fill="#fbf3e1" stroke="#2b2622" strokeWidth="2.1" />
                    <circle cx="114.5" cy="77" r="2" fill="#ff6b8b" stroke="#2b2622" strokeWidth="1" />
                    <circle cx="114.5" cy="73.6" r="0.85" fill="#2b2622" />
                    <circle cx="111.7" cy="78.6" r="0.85" fill="#2b2622" />
                    <circle cx="117.3" cy="78.6" r="0.85" fill="#2b2622" />
                  </g>
                </g>

                {/* Four planted dark-cocoa legs in skate crouch */}
                <path d="M72 54.5 70 65.5M79 55 78 65.5M97 54 99.5 64M104 53 107.5 63.2" stroke="#2b221f" strokeWidth="6" strokeLinecap="round" />
                <path d="M72 54.5 70 65.5M79 55 78 65.5M97 54 99.5 64M104 53 107.5 63.2" stroke="#4a3b35" strokeWidth="3.2" strokeLinecap="round" />

                {/* Fluffy tail & cloud-scalloped wool coat */}
                <circle cx="55.5" cy="46.5" r="5.2" fill="#efe4cf" stroke="#2b2622" strokeWidth="2.1" />
                <path
                  d="M63.5 56.5c-5.6-.4-9.6-4.6-9.2-9.8.3-3.5 2.4-6.5 5.6-7.8-.4-6 4.2-11.1 10.4-11.4 2.5-.1 4.9.7 6.8 2.2 2.8-3.5 7.4-5.5 12.2-4.8 6.8.9 11.8 6.6 11.6 13.2 3.4 1.8 5.4 5.3 5 9.2-.6 5.3-5.2 9.2-10.8 9.2-3.1 2.3-7.5 3.2-11.5 1.8-3.5 2-8.2 2.2-11.9-.1-2.6 1.1-5.6 1.6-8.2 1.3Z"
                  fill="#fffdf8"
                  stroke="#2b2622"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <path d="M62.5 52.5c5 3.1 11.5 3.4 16.8.6 5 2.6 11.2 2.3 16.2-.9" stroke="#e2d2b8" strokeWidth="3.4" strokeLinecap="round" />
                <path d="M66 33.5c2.6-2.3 6.5-2.9 9.7-1.3M71.5 43c-1.5 2.3-.6 5.2 2 6.3M82 39.8c-1.5 2.3-.6 5.2 2 6.3" stroke="#e5d6be" strokeWidth="2.1" strokeLinecap="round" />

                {/* Fluttering mint knit scarf tails */}
                <path d="M88 46.5c-7-1.2-13.5.5-18.5 3.8l3.5 4.2c4.8-2.8 10.2-3.8 16.5-2.8Z" fill="#6fd0b4" stroke="#2b2622" strokeWidth="1.9" strokeLinejoin="round" />

                {/* Sculpted 3/4 Cocoa Sheep Head, Droopy Ears & Snout */}
                <g transform="rotate(-16 86 32.5)">
                  <ellipse cx="83" cy="33" rx="7.6" ry="3.4" fill="#3a2f2b" stroke="#2b2622" strokeWidth="2.1" />
                  <ellipse cx="83.4" cy="33.4" rx="4.6" ry="1.5" fill="#d98a8c" />
                </g>
                <g transform="rotate(18 117 32)">
                  <ellipse cx="119" cy="32.5" rx="7.2" ry="3.3" fill="#3a2f2b" stroke="#2b2622" strokeWidth="2.1" />
                  <ellipse cx="118.6" cy="32.9" rx="4.3" ry="1.45" fill="#d98a8c" />
                </g>
                <path
                  d="M90 34c.3-7.8 6-13 13.4-12.7 7.4.3 12.8 5.8 12.5 13.6-.3 7.5-4.9 15.3-12.8 15.3-7.9 0-13.4-8.4-13.1-16.2Z"
                  fill="#3a2f2b"
                  stroke="#2b2622"
                  strokeWidth="2.4"
                />
                <ellipse cx="104" cy="43.5" rx="6.8" ry="4.8" fill="#4e3f3a" />

                {/* Big glossy eyes & rosy cheeks */}
                <circle cx="97.5" cy="36.8" r="3.3" fill="#141010" stroke="#fffdf9" strokeWidth="1.1" />
                <circle cx="108.8" cy="37" r="3.3" fill="#141010" stroke="#fffdf9" strokeWidth="1.1" />
                <circle cx="96.6" cy="35.7" r="1.2" fill="#ffffff" />
                <circle cx="107.9" cy="35.9" r="1.2" fill="#ffffff" />
                <ellipse cx="93.4" cy="41.4" rx="3" ry="1.8" fill="#ff8fa3" />
                <ellipse cx="112.2" cy="41.6" rx="3" ry="1.8" fill="#ff8fa3" />
                <path d="M101.8 41.6l2 1.8 2-1.8M103.8 43.4v2.4" stroke="#f2bdbd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M101 45.8q2.8 2 5.6 0" stroke="#f2bdbd" strokeWidth="1.8" strokeLinecap="round" />

                {/* Wool forelock & Chunky Mustard-Gold Ribbed Beanie */}
                <path d="M91.5 28.4c2.1 2.2 5.8 2.5 8.2.4 2.3 2.1 6.1 2.1 8.4 0 2 1.8 5 1.7 6.8-.3" fill="#fffdf8" stroke="#2b2622" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <g transform="rotate(4 103.5 22)">
                  <circle cx="103.8" cy="9.2" r="5.2" fill="#fffdf8" stroke="#2b2622" strokeWidth="2.1" />
                  <path d="M90.2 25.2c.7-8.8 6.4-14 13.5-14s12.5 5.2 13 14Z" fill="#f4b938" stroke="#2b2622" strokeWidth="2.3" strokeLinejoin="round" />
                  <path d="M97.8 12.5c-1.1 3.6-1.5 7.4-1.4 11.4M109.2 12.5c1.1 3.6 1.5 7.4 1.4 11.4" stroke="#c98e1c" strokeWidth="1.7" strokeLinecap="round" />
                  <rect x="88.2" y="22" width="30.5" height="6.8" rx="3.4" fill="#ffd666" stroke="#2b2622" strokeWidth="2.15" />
                  <path d="M94.2 22.8v5.2M99.4 22.8v5.2M104.6 22.8v5.2M109.8 22.8v5.2M114.6 22.8v5.2" stroke="#cc921e" strokeWidth="1.6" strokeLinecap="round" />
                </g>
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
