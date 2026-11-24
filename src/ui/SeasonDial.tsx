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

function SeasonGlyph({ id, active }: { id: SeasonId; active: boolean }) {
  switch (id) {
    case 'spring':
      return (
        <g stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="0" cy="-3.2" r="1.9" fill={active ? '#ffd6e6' : '#f5efe6'} />
          <circle cx="3.1" cy="-1" r="1.9" fill={active ? '#ffd6e6' : '#f5efe6'} />
          <circle cx="1.9" cy="2.7" r="1.9" fill={active ? '#ffd6e6' : '#f5efe6'} />
          <circle cx="-1.9" cy="2.7" r="1.9" fill={active ? '#ffd6e6' : '#f5efe6'} />
          <circle cx="-3.1" cy="-1" r="1.9" fill={active ? '#ffd6e6' : '#f5efe6'} />
          <circle cx="0" cy="0" r="1.35" fill={active ? '#ffd166' : 'currentColor'} />
        </g>
      );
    case 'summer':
      return (
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="0" cy="0" r="2.7" fill={active ? '#ffe285' : '#f5efe6'} />
          <path d="M0-5.4v1.3M0 4.1v1.3M-5.4 0h1.3M4.1 0h1.3M-3.8-3.8l.95.95M2.85 2.85l.95.95M3.8-3.8l-.95.95M-2.85 2.85l-.95.95" />
        </g>
      );
    case 'autumn':
      return (
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M0-5.2 L1.5-2.1 L4.7-2.4 L2.6 0.4 L4.1 2.8 L0.8 2.1 L0 5.1 L-0.8 2.1 L-4.1 2.8 L-2.6 0.4 L-4.7-2.4 L-1.5-2.1 Z"
            fill={active ? '#fbd0b0' : '#f5efe6'}
          />
          <path d="M0-2.6v5.2" strokeWidth="1.15" />
        </g>
      );
    case 'winter':
      return (
        <g stroke="currentColor" strokeWidth="1.45" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0-5.1v10.2M-4.4-2.55l8.8 5.1M4.4-2.55l-8.8 5.1" />
          <path d="M-1.3-3.9L0-2.6l1.3-1.3M-1.3 3.9L0 2.6l1.3 1.3" />
          <circle cx="0" cy="0" r="1.4" fill={active ? '#d8eeff' : '#f5efe6'} />
        </g>
      );
  }
}

function WeatherGlyph({ mode }: { mode: WeatherMode }) {
  switch (mode) {
    case 'auto':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20.5 11.5a8.5 8.5 0 0 0-14.8-5.7L3.5 8" />
          <path d="M3.5 3.5V8H8" />
          <path d="M3.5 12.5a8.5 8.5 0 0 0 14.8 5.7l2.2-2.2" />
          <path d="M16 16h4.5v4.5" />
          <circle cx="12" cy="12" r="2.2" fill="#ffd166" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'clear':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4.4" fill="#ffe073" />
          <path d="M12 2.2v2.3M12 19.5v2.3M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M2.2 12h2.3M19.5 12h2.3M6.7 17.3l-1.6 1.6M18.9 5.1l-1.6 1.6" />
        </svg>
      );
    case 'rain':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5.5 15.2a4.5 4.5 0 0 1-.8-8.9 6 6 0 0 1 11.6-1.3 4 4 0 0 1 1.7 7.6H5.5Z" fill="#d9eefb" />
          <path d="M8.5 17.5l-1 3.2M12.5 17.5l-1 3.2M16.5 17.5l-1 3.2" stroke="#3c89d0" strokeWidth="2" />
        </svg>
      );
    case 'snow':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 2.5v19M4 7.4l16 9.2M20 7.4 4 16.6" />
          <path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2" />
          <circle cx="12" cy="12" r="2.3" fill="#d9eefb" />
        </svg>
      );
    case 'fog':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5.5 13.8a4.2 4.2 0 0 1-.6-8.3 5.6 5.6 0 0 1 10.9-1.2 3.8 3.8 0 0 1 1.7 7.2H5.5Z" fill="#ebe5da" />
          <path d="M3.5 17.2h17M5.5 20.4h13" />
        </svg>
      );
  }
}

export function SeasonDial({ live = true }: { live?: boolean }) {
  const season = useUI(s => s.season);
  const autoSeason = useUI(s => s.autoSeason);
  const weatherMode = useUI(s => s.weatherMode);
  const icyPlaza = useUI(s => s.icyPlaza);
  const rainSlow = useUI(s => s.rainSlow);
  const tab = live ? 0 : -1;

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
                <SeasonGlyph id={id} active={active} />
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
            tabIndex={tab}
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
          tabIndex={tab}
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
            tabIndex={tab}
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
                tabIndex={tab}
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
