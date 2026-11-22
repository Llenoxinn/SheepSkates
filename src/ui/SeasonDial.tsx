import { useEffect, useRef, useState } from 'react';
import { Sfx } from '../game/sfx';
import { useUI } from '../game/store';
import {
  registerDialNeedle,
  SEASON_LABELS,
  SEASONS,
  selectSeason,
  setSeasonPhase,
  setWeatherMode,
  toggleAutoSeason,
  WEATHER_LABELS,
  type SeasonId,
  type WeatherMode,
} from '../game/weather';

const SEASON_POS: Record<SeasonId, { cx: number; cy: number; accent: string }> = {
  spring: { cx: 30, cy: 11, accent: '#e56f9b' },
  summer: { cx: 49, cy: 30, accent: '#d9961a' },
  autumn: { cx: 30, cy: 49, accent: '#d96226' },
  winter: { cx: 11, cy: 30, accent: '#3c89d0' },
};

const WEATHER_OPTIONS: readonly WeatherMode[] = ['auto', 'clear', 'rain', 'snow', 'fog'];

function SeasonGlyph({ id }: { id: SeasonId }) {
  switch (id) {
    case 'spring':
      return (
        <g stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <circle cx="0" cy="-3.2" r="1.7" />
          <circle cx="3" cy="-1" r="1.7" />
          <circle cx="1.9" cy="2.6" r="1.7" />
          <circle cx="-1.9" cy="2.6" r="1.7" />
          <circle cx="-3" cy="-1" r="1.7" />
          <circle cx="0" cy="0" r="1" fill="currentColor" stroke="none" />
        </g>
      );
    case 'summer':
      return (
        <g stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <circle cx="0" cy="0" r="2.6" />
          <path d="M0-5.2v1.2M0 4v1.2M-5.2 0h1.2M4 0h1.2M-3.7-3.7l.9.9M2.8 2.8l.9.9M3.7-3.7l-.9.9M-2.8 2.8l-.9.9" />
        </g>
      );
    case 'autumn':
      return (
        <path
          d="M0-5 L1.5-2 L4.5-2.3 L2.6 0.4 L4 2.8 L0.8 2.1 L0 5 L-0.8 2.1 L-4 2.8 L-2.6 0.4 L-4.5-2.3 L-1.5-2 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinejoin="round"
        />
      );
    case 'winter':
      return (
        <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M0-5v10M-4.3-2.5l8.6 5M4.3-2.5l-8.6 5" />
          <path d="M-1.3-3.8L0-2.5l1.3-1.3M-1.3 3.8L0 2.5l1.3 1.3" />
        </g>
      );
  }
}

function WeatherGlyph({ mode }: { mode: WeatherMode }) {
  switch (mode) {
    case 'auto':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      );
    case 'clear':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    case 'rain':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M16 14v6M8 14v6M12 16v6" />
        </svg>
      );
    case 'snow':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4" />
        </svg>
      );
    case 'fog':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
          <path d="M3 18h18M5 21h14" />
        </svg>
      );
  }
}

export function SeasonDial() {
  const season = useUI(s => s.season);
  const autoSeason = useUI(s => s.autoSeason);
  const weatherMode = useUI(s => s.weatherMode);
  const icyPlaza = useUI(s => s.icyPlaza);
  const rainSlow = useUI(s => s.rainSlow);

  const dialRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => registerDialNeedle(null), []);

  const steerFromPointer = (clientX: number, clientY: number) => {
    const el = dialRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    if (Math.hypot(dx, dy) < 8) return;
    // 0° at top (Spring), clockwise: Summer (90°), Autumn (180°), Winter (270°)
    const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    setSeasonPhase((deg / 360) * 4, true);
  };

  return (
    <div className={`season-card ${dragging ? 'dragging' : ''}`} role="region" aria-label="Seasons and weather">
      <div
        ref={dialRef}
        className="dial"
        title="Drag dial or click a season"
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('button')) return;
          Sfx.unlock();
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          steerFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={e => {
          if (!dragging) return;
          steerFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={e => {
          if (!dragging) return;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          setDragging(false);
          Sfx.tick();
        }}
        onPointerCancel={() => setDragging(false)}
      >
        <svg viewBox="0 0 60 60" className="dial-face" aria-hidden>
          <circle cx="30" cy="30" r="27.5" className="dial-ring" />
          <circle cx="30" cy="30" r="14" className="dial-inner" />
          {SEASONS.map(id => {
            const p = SEASON_POS[id];
            const active = season === id;
            return (
              <g
                key={id}
                transform={`translate(${p.cx}, ${p.cy})`}
                style={{ color: active ? p.accent : '#8b8175', opacity: active ? 1 : 0.72 }}
              >
                <SeasonGlyph id={id} />
              </g>
            );
          })}
        </svg>

        <div className="dial-needle-wrap" ref={registerDialNeedle} aria-hidden>
          <span className="dial-needle" style={{ background: SEASON_POS[season].accent }} />
        </div>

        {/* Invisible accessible hit targets for each season quadrant */}
        {SEASONS.map(id => (
          <button
            key={id}
            type="button"
            className={`dial-q dial-q-${id}`}
            aria-label={`Select ${SEASON_LABELS[id]}`}
            aria-pressed={season === id && !autoSeason}
            title={SEASON_LABELS[id]}
            onClick={() => {
              Sfx.unlock();
              Sfx.tick();
              selectSeason(id);
            }}
          />
        ))}

        <button
          type="button"
          className={`dial-hub ${autoSeason ? 'on' : ''}`}
          aria-label={autoSeason ? 'Pause automatic season cycle' : 'Auto-cycle seasons'}
          aria-pressed={autoSeason}
          title={autoSeason ? 'Auto cycle: On' : 'Auto cycle: Off'}
          onClick={() => {
            Sfx.unlock();
            Sfx.tick();
            toggleAutoSeason();
          }}
        >
          {autoSeason ? (
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <rect x="4.5" y="4" width="2.4" height="8" rx="1" />
              <rect x="9.1" y="4" width="2.4" height="8" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M5.5 3.8v8.4l6.5-4.2z" />
            </svg>
          )}
        </button>
      </div>

      <div className="season-meta">
        <div className="season-top">
          <span className="season-name" style={{ color: SEASON_POS[season].accent }}>
            {SEASON_LABELS[season]}
          </span>
          <button
            type="button"
            className={`auto-pill ${autoSeason ? 'on' : ''}`}
            aria-pressed={autoSeason}
            onClick={() => {
              Sfx.unlock();
              Sfx.tick();
              toggleAutoSeason();
            }}
          >
            {autoSeason ? 'Auto' : 'Manual'}
          </button>
          {icyPlaza && <span className="fx-badge ice" title="Icy plaza: sheep slide further">Icy · Slide+</span>}
          {rainSlow && <span className="fx-badge rain" title="Rain: slower riding">Rain · Slow</span>}
        </div>

        <div className="weather-seg" role="group" aria-label="Weather">
          {WEATHER_OPTIONS.map(mode => {
            const active = weatherMode === mode;
            return (
              <button
                key={mode}
                type="button"
                className={active ? 'active' : ''}
                aria-label={`Weather: ${WEATHER_LABELS[mode]}`}
                aria-pressed={active}
                title={`Weather: ${WEATHER_LABELS[mode]}`}
                onClick={() => {
                  Sfx.unlock();
                  Sfx.tick();
                  setWeatherMode(mode);
                }}
              >
                <WeatherGlyph mode={mode} />
                <span>{WEATHER_LABELS[mode]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
