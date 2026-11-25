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
            <svg className="ss-loader-skater" viewBox="10 6 116 104" fill="none">
              {/* Trailing chalk & meadow dust puffs */}
              <g className="ss-dust-puff">
                <circle cx="20" cy="96" r="4.2" fill="#e6dac3" stroke="#2b2622" strokeWidth="1.8" />
                <circle cx="13.5" cy="93" r="2.8" fill="#faf4e6" stroke="#2b2622" strokeWidth="1.5" />
              </g>
              <g className="ss-skater-bob">
                {/* 3D Perspective Concave Skateboard with Maple Edge & Cylindrical Wheels */}
                <g transform="rotate(-4 70 90)">
                  <ellipse cx="46" cy="98" rx="5.8" ry="6.2" fill="#cfc1a8" stroke="#2b2622" strokeWidth="2.2" />
                  <ellipse cx="90" cy="98" rx="5.8" ry="6.2" fill="#cfc1a8" stroke="#2b2622" strokeWidth="2.2" />
                  <path
                    d="M24 89 C28 93.8 37 95 48 95 L90 95 C101 95 110 93.2 114 87.5 C110 89.8 101 90.8 90 90.8 L48 90.8 C37 90.8 28 90 24 89 Z"
                    fill="#f26d5b"
                    stroke="#2b2622"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M23.5 87.4 C28 84.8 37 84.4 48 84.4 L90 84.4 C100.5 84.4 108.5 83 114.5 85.2 C110 90.2 101 91.8 90 91.8 L48 91.8 C37 91.8 28 90.8 23.5 87.4 Z"
                    fill="#35333c"
                    stroke="#2b2622"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  <path d="M25 87.8 C29.5 91 38 91.8 48 91.8 L90 91.8 C101 91.8 109 90.2 113.5 85.8" stroke="#f3dfc0" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M43 93.5h10l-1.8 5.2h-6.4ZM87 93.5h10l-1.8 5.2h-6.4Z" fill="#9aa2b0" stroke="#2b2622" strokeWidth="2.1" strokeLinejoin="round" />
                  <g className="ss-wheel" style={{ transformOrigin: '43.5px 102px' }}>
                    <ellipse cx="43.5" cy="102" rx="5.5" ry="6" fill="#f7efe0" stroke="#2b2622" strokeWidth="2.3" />
                    <ellipse cx="43.5" cy="102" rx="2.1" ry="2.4" fill="#4a423d" />
                  </g>
                  <g className="ss-wheel" style={{ transformOrigin: '87.5px 102px' }}>
                    <ellipse cx="87.5" cy="102" rx="5.5" ry="6" fill="#f7efe0" stroke="#2b2622" strokeWidth="2.3" />
                    <ellipse cx="87.5" cy="102" rx="2.1" ry="2.4" fill="#4a423d" />
                  </g>
                </g>

                {/* Tapered Polygon Sheep Legs */}
                <path d="M44 73 L50 72 L54 87 L48.5 88 Z" fill="#2c221e" stroke="#2b2622" strokeWidth="2.3" strokeLinejoin="round" />
                <path d="M72 70 L78 69 L84 85 L78.5 86 Z" fill="#2c221e" stroke="#2b2622" strokeWidth="2.3" strokeLinejoin="round" />
                <path d="M52 73 L58 72 L62 86.5 L56.5 87.5 Z" fill="#3d302a" stroke="#2b2622" strokeWidth="2.3" strokeLinejoin="round" />
                <path d="M80 69 L86 68 L92 84.5 L86.5 85.5 Z" fill="#3d302a" stroke="#2b2622" strokeWidth="2.3" strokeLinejoin="round" />

                {/* Volumetric 3-Layer Cloud Fleece */}
                <path d="M27 69c-3.5-.5-5.8-3.8-5-7.2.6-2.5 2.7-4.3 5.2-4.6 1.5-2 4.2-2.6 6.4-1.5l1 11.5c-2.2 2.1-5 2.2-7.6 1.8Z" fill="#dfd1b8" stroke="#2b2622" strokeWidth="2.4" strokeLinejoin="round" />
                <path
                  d="M36 76.5c-6.5-.8-11.2-6.4-10.4-12.8.5-3.8 2.8-7 6.1-8.6-.4-6.4 3.8-12.2 10.2-13.5 2.2-5.4 7.6-8.9 13.6-8.6 3.5-4.2 9.2-6.2 14.6-5 6.8 1.5 11.6 7.4 11.8 14.2 4.8 2.4 7.6 7.5 6.8 13-.7 5-4.4 9-9.2 10.2-2.5 4.8-7.8 7.6-13.2 6.8-3.6 3.6-9.1 4.9-13.9 3.1-3.8 2.6-8.8 2.9-12.9.6-1.1.5-2.3.7-3.5.6Z"
                  fill="#f7f0e2"
                  stroke="#2b2622"
                  strokeWidth="2.7"
                  strokeLinejoin="round"
                />
                <path d="M29.5 66.5c2.5 4.8 8 7.2 13.2 5.8 3.5 3.2 8.8 3.8 13 1.4 4.4 2.5 10.2 1.8 13.8-1.8 4.6 1.2 9.6-1 11.8-5.2-3.2 2.2-7.5 2.5-11 .8-3.4 3.4-8.8 4-13 1.6-3.8 2.6-9 2.2-12.5-.8-3.8 2.2-8.8 1.8-12.2-1.2-1.1-.2-2.2-.4-3.1-.6Z" fill="#dfd1b7" />

                {/* Sculpted Head, Leaf Ears & Slouchy Mustard Fisherman Beanie */}
                <path d="M75 43.5 C67 41.5 59.5 43.5 57 47.2 C59.5 50.8 68.5 51.8 75.8 48.2 Z" fill="#362b26" stroke="#2b2622" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M99.5 40.8 C105.5 39.5 112 41.2 114 44.4 C112 47.6 105 48.5 99 45.5 Z" fill="#362b26" stroke="#2b2622" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M74.5 42.5 C74 35 80.5 30.5 88.5 30.5 C96.5 30.5 102 35.5 102 42.8 C102 49.5 99.5 59.2 92.2 60.5 C85 61.8 75.2 52.5 74.5 42.5 Z" fill="#3a2e29" stroke="#2b2622" strokeWidth="2.6" strokeLinejoin="round" />
                <ellipse cx="83.5" cy="47.2" rx="2" ry="2.2" fill="#140f0d" />
                <ellipse cx="95.2" cy="46.6" rx="1.9" ry="2.1" fill="#140f0d" />
                <path d="M89.2 53.2 L91.4 55.4 L93.6 53.2 M91.4 55.4 L91.4 58.2" stroke="#1d1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M72.5 37.5 C71.5 30.5 73.5 25.5 76 23.5 C74.5 20.5 76 16.8 80.5 16.2 C87.5 15.2 96 18.5 100.2 25.5 C102.5 29.2 103.5 33.5 103.2 37.2 Z" fill="#eab949" stroke="#2b2622" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M70.8 36.8 C77.5 33.2 95.5 32.8 104.4 36.2 C105.4 38.8 105.2 41.8 103.8 43.6 C95.2 40.5 78.2 40.8 71.2 44.2 C69.8 42.2 69.8 39.2 70.8 36.8 Z" fill="#f5c857" stroke="#2b2622" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M76.5 35.8 L76.2 42.2 M82.2 34.9 L82 41.4 M88 34.6 L88 41.1 M93.8 34.8 L94 41.3 M99.2 35.5 L99.5 42" stroke="#c48e20" strokeWidth="1.9" strokeLinecap="round" />
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
