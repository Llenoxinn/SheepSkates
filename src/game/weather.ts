import * as THREE from 'three';
import { clamp, damp } from './math';
import { useUI } from './store';

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherId = 'clear' | 'rain' | 'snow' | 'fog';
export type WeatherMode = 'auto' | WeatherId;

export const SEASONS: readonly SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];
export const WEATHERS: readonly WeatherId[] = ['clear', 'rain', 'snow', 'fog'];

export const SEASON_LABELS: Record<SeasonId, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

export const WEATHER_LABELS: Record<WeatherMode, string> = {
  auto: 'Auto',
  clear: 'Clear',
  rain: 'Rain',
  snow: 'Snow',
  fog: 'Fog',
};

type SeasonPalette = {
  zenith: THREE.Color;
  upperSky: THREE.Color;
  midSky: THREE.Color;
  horizon: THREE.Color;
  lowerMid: THREE.Color;
  nadir: THREE.Color;
  sunColor: THREE.Color;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  dirColor: THREE.Color;
  dirIntensity: number;
  cloudTint: THREE.Color;
  fogColor: THREE.Color;
  grassTint: THREE.Color;
  tuftTint: THREE.Color;
};

const C = (hex: string) => new THREE.Color(hex);

const PALETTES: Record<SeasonId, SeasonPalette> = {
  spring: {
    zenith: C('#78bfe8'),
    upperSky: C('#95cdf0'),
    midSky: C('#c4e4f7'),
    horizon: C('#fbf0e8'),
    lowerMid: C('#ecdcd3'),
    nadir: C('#e3d0c5'),
    sunColor: C('#fff1dc'),
    hemiSky: C('#fff3e6'),
    hemiGround: C('#6c964c'),
    hemiIntensity: 1.15,
    dirColor: C('#ffeed4'),
    dirIntensity: 3.25,
    cloudTint: C('#fff9f6'),
    fogColor: C('#f2e8e4'),
    grassTint: C('#a8df84'),
    tuftTint: C('#b8e68a'),
  },
  summer: {
    zenith: C('#7db8e6'),
    upperSky: C('#8fc3ea'),
    midSky: C('#b9dcf2'),
    horizon: C('#f5efe0'),
    lowerMid: C('#e7dcc8'),
    nadir: C('#dfd2bc'),
    sunColor: C('#fff1d6'),
    hemiSky: C('#fff3df'),
    hemiGround: C('#6b8a48'),
    hemiIntensity: 1.1,
    dirColor: C('#ffebcc'),
    dirIntensity: 3.4,
    cloudTint: C('#ffffff'),
    fogColor: C('#ebe4d6'),
    grassTint: C('#ffffff'),
    tuftTint: C('#ffffff'),
  },
  autumn: {
    zenith: C('#73a4d4'),
    upperSky: C('#8db7db'),
    midSky: C('#cad8e3'),
    horizon: C('#f5e2c6'),
    lowerMid: C('#e6cbb0'),
    nadir: C('#d8b89c'),
    sunColor: C('#ffe1b5'),
    hemiSky: C('#ffe8cc'),
    hemiGround: C('#8c6838'),
    hemiIntensity: 1.08,
    dirColor: C('#ffd8a6'),
    dirIntensity: 3.15,
    cloudTint: C('#fff1e0'),
    fogColor: C('#eadbc8'),
    grassTint: C('#d8a65a'),
    tuftTint: C('#d99b48'),
  },
  winter: {
    zenith: C('#86add3'),
    upperSky: C('#a2c4e2'),
    midSky: C('#cddfeb'),
    horizon: C('#edf2f7'),
    lowerMid: C('#dce4ed'),
    nadir: C('#ced8e4'),
    sunColor: C('#f6f8ff'),
    hemiSky: C('#e8f2ff'),
    hemiGround: C('#9eb6cc'),
    hemiIntensity: 1.22,
    dirColor: C('#f4f6ff'),
    dirIntensity: 2.75,
    cloudTint: C('#eef4fb'),
    fogColor: C('#dce6f0'),
    grassTint: C('#b8c9cf'),
    tuftTint: C('#cde0eb'),
  },
};

const RAIN_SKY_ZENITH = C('#6c849d');
const RAIN_SKY_UPPER = C('#8199b0');
const RAIN_SKY_MID = C('#a3b7c8');
const RAIN_SKY_HORIZON = C('#c7d2dc');
const RAIN_SKY_LOWER = C('#b7c2cd');
const RAIN_SKY_NADIR = C('#aab6c2');
const RAIN_CLOUD = C('#aebac7');
const RAIN_FOG = C('#bcc8d4');
const RAIN_DIR = C('#d6e4f2');

const SNOW_SKY_ZENITH = C('#8ca3be');
const SNOW_SKY_UPPER = C('#a5bbd4');
const SNOW_SKY_MID = C('#c8d7e6');
const SNOW_SKY_HORIZON = C('#e3ebf3');
const SNOW_CLOUD = C('#e4ecf5');
const SNOW_FOG = C('#dbe5f0');

/** Full cycle duration: 88s per year (22s per season). */
const AUTO_SEASON_RATE = 4 / 88;
const AUTO_WEATHER_INTERVAL = 14;

/** Season weights for automatic weather selection. */
const AUTO_WEATHER_SCHEDULE: Record<SeasonId, readonly WeatherId[]> = {
  spring: ['clear', 'rain', 'clear', 'fog'],
  summer: ['clear', 'clear', 'rain', 'clear'],
  autumn: ['clear', 'fog', 'rain', 'clear'],
  winter: ['snow', 'clear', 'snow', 'fog'],
};

function wrapPhase(p: number): number {
  return ((p % 4) + 4) % 4;
}

export function seasonPhaseToId(phase: number): SeasonId {
  const idx = Math.round(wrapPhase(phase)) % 4;
  return SEASONS[idx]!;
}

/** Shortest angular distance around the 4-season ring. */
function phaseDelta(from: number, to: number): number {
  let d = wrapPhase(to) - wrapPhase(from);
  if (d > 2) d -= 4;
  if (d < -2) d += 4;
  return d;
}

function readInitialParams(): { season: SeasonId; autoSeason: boolean; weatherMode: WeatherMode } {
  if (typeof window === 'undefined') return { season: 'spring', autoSeason: true, weatherMode: 'auto' };
  const q = new URLSearchParams(window.location.search);
  const sParam = q.get('season');
  const wParam = q.get('weather');
  const validSeason = SEASONS.includes(sParam as SeasonId) ? (sParam as SeasonId) : null;
  const validWeather = WEATHERS.includes(wParam as WeatherId) ? (wParam as WeatherId) : null;
  return {
    season: validSeason ?? 'spring',
    autoSeason: validSeason ? false : true,
    weatherMode: validWeather ?? 'auto',
  };
}

const init = readInitialParams();

/**
 * Shared imperative season & weather state read by R3F scene hooks and sim physics.
 * Mutated once per frame inside `stepEnvironment` with zero heap allocations.
 */
export const envState = {
  seasonPhase: SEASONS.indexOf(init.season),
  targetPhase: SEASONS.indexOf(init.season),
  autoSeason: init.autoSeason,
  season: init.season as SeasonId,

  weatherMode: init.weatherMode as WeatherMode,
  activeWeather: (init.weatherMode === 'auto' ? AUTO_WEATHER_SCHEDULE[init.season][0]! : init.weatherMode) as WeatherId,
  autoWeatherIdx: 0,
  autoWeatherTimer: AUTO_WEATHER_INTERVAL,

  // Continuous normalized factors [0..1]
  spring: init.season === 'spring' ? 1 : 0,
  summer: init.season === 'summer' ? 1 : 0,
  autumn: init.season === 'autumn' ? 1 : 0,
  winter: init.season === 'winter' ? 1 : 0,

  rain: 0,
  snow: 0,
  fog: 0,
  wetness: 0,
  ice: init.season === 'winter' ? 1 : 0,
  frost: init.season === 'winter' ? 1 : 0,
  wind: 0.25,
  fogDensity: 0.0004,
  fogSkyMix: 0,
  bloomSuppression: 0,

  // Interpolated colors & lighting values
  zenith: PALETTES[init.season].zenith.clone(),
  upperSky: PALETTES[init.season].upperSky.clone(),
  midSky: PALETTES[init.season].midSky.clone(),
  horizon: PALETTES[init.season].horizon.clone(),
  lowerMid: PALETTES[init.season].lowerMid.clone(),
  nadir: PALETTES[init.season].nadir.clone(),
  sunColor: PALETTES[init.season].sunColor.clone(),
  hemiSky: PALETTES[init.season].hemiSky.clone(),
  hemiGround: PALETTES[init.season].hemiGround.clone(),
  hemiIntensity: PALETTES[init.season].hemiIntensity,
  dirColor: PALETTES[init.season].dirColor.clone(),
  dirIntensity: PALETTES[init.season].dirIntensity,
  cloudTint: PALETTES[init.season].cloudTint.clone(),
  fogColor: PALETTES[init.season].fogColor.clone(),
  grassTint: PALETTES[init.season].grassTint.clone(),
  tuftTint: PALETTES[init.season].tuftTint.clone(),
};

let dialNeedleEl: HTMLElement | null = null;
export function registerDialNeedle(el: HTMLElement | null): void {
  dialNeedleEl = el;
  if (el) el.style.transform = `rotate(${(envState.seasonPhase / 4) * 360}deg)`;
}

function syncWeatherStore(force = false): void {
  const icyPlaza = envState.ice > 0.35;
  const rainSlow = envState.rain > 0.25;
  const cur = useUI.getState();
  if (
    force ||
    cur.season !== envState.season ||
    cur.autoSeason !== envState.autoSeason ||
    cur.weather !== envState.activeWeather ||
    cur.weatherMode !== envState.weatherMode ||
    cur.icyPlaza !== icyPlaza ||
    cur.rainSlow !== rainSlow
  ) {
    useUI.setState({
      season: envState.season,
      autoSeason: envState.autoSeason,
      weather: envState.activeWeather,
      weatherMode: envState.weatherMode,
      icyPlaza,
      rainSlow,
    });
  }
}

export function setSeasonPhase(phase: number, snap = false): void {
  envState.autoSeason = false;
  envState.targetPhase = wrapPhase(phase);
  if (snap) envState.seasonPhase = envState.targetPhase;
  const nextSeason = seasonPhaseToId(envState.targetPhase);
  if (nextSeason !== envState.season && envState.weatherMode === 'auto') {
    envState.autoWeatherIdx = 0;
    envState.autoWeatherTimer = AUTO_WEATHER_INTERVAL;
    envState.activeWeather = AUTO_WEATHER_SCHEDULE[nextSeason][0]!;
  }
  envState.season = nextSeason;
  syncWeatherStore();
}

export function selectSeason(season: SeasonId): void {
  setSeasonPhase(SEASONS.indexOf(season), false);
}

export function setAutoSeason(auto: boolean): void {
  envState.autoSeason = auto;
  if (auto) envState.targetPhase = envState.seasonPhase;
  syncWeatherStore();
}

export function toggleAutoSeason(): void {
  setAutoSeason(!envState.autoSeason);
}

export function setWeatherMode(mode: WeatherMode): void {
  envState.weatherMode = mode;
  if (mode === 'auto') {
    envState.autoWeatherIdx = 0;
    envState.autoWeatherTimer = AUTO_WEATHER_INTERVAL;
    envState.activeWeather = AUTO_WEATHER_SCHEDULE[envState.season][0]!;
  } else {
    envState.activeWeather = mode;
  }
  syncWeatherStore();
}

/** Immediate snap helper (used when URL query pins a specific state on boot). */
if (init.weatherMode !== 'auto') {
  envState.rain = init.weatherMode === 'rain' ? 1 : 0;
  envState.snow = init.weatherMode === 'snow' ? 1 : 0;
  envState.fog = init.weatherMode === 'fog' ? 1 : 0;
  envState.wetness = init.weatherMode === 'rain' ? 1 : 0;
} else if (envState.activeWeather === 'snow') {
  envState.snow = 1;
}
syncWeatherStore(true);

function blendPaletteColors(
  a: SeasonPalette,
  b: SeasonPalette,
  k: number,
  key: 'zenith' | 'upperSky' | 'midSky' | 'horizon' | 'lowerMid' | 'nadir' | 'sunColor' | 'hemiSky' | 'hemiGround' | 'dirColor' | 'cloudTint' | 'fogColor' | 'grassTint' | 'tuftTint',
  out: THREE.Color,
): void {
  out.copy(a[key]).lerp(b[key], k);
}

/** Advances seasonal cycle, weather smoothing, and palette interpolation once per frame. */
export function stepEnvironment(dt: number): void {
  if (envState.autoSeason) {
    envState.seasonPhase = wrapPhase(envState.seasonPhase + AUTO_SEASON_RATE * dt);
    envState.targetPhase = envState.seasonPhase;
  } else {
    const d = phaseDelta(envState.seasonPhase, envState.targetPhase);
    envState.seasonPhase = wrapPhase(envState.seasonPhase + d * (1 - Math.exp(-7 * dt)));
  }

  const nextSeason = seasonPhaseToId(envState.seasonPhase);
  if (nextSeason !== envState.season) {
    envState.season = nextSeason;
    if (envState.weatherMode === 'auto') {
      envState.autoWeatherIdx = 0;
      envState.autoWeatherTimer = AUTO_WEATHER_INTERVAL;
      envState.activeWeather = AUTO_WEATHER_SCHEDULE[nextSeason][0]!;
    }
  }

  if (envState.weatherMode === 'auto') {
    envState.autoWeatherTimer -= dt;
    if (envState.autoWeatherTimer <= 0) {
      const list = AUTO_WEATHER_SCHEDULE[envState.season];
      envState.autoWeatherIdx = (envState.autoWeatherIdx + 1) % list.length;
      envState.activeWeather = list[envState.autoWeatherIdx]!;
      envState.autoWeatherTimer = AUTO_WEATHER_INTERVAL;
    }
  } else {
    envState.activeWeather = envState.weatherMode;
  }

  // Smooth season weights
  const p = envState.seasonPhase;
  const i0 = Math.floor(p) % 4;
  const i1 = (i0 + 1) % 4;
  const f = p - Math.floor(p);
  const k = f * f * (3 - 2 * f);

  envState.spring = (i0 === 0 ? 1 - k : 0) + (i1 === 0 ? k : 0);
  envState.summer = (i0 === 1 ? 1 - k : 0) + (i1 === 1 ? k : 0);
  envState.autumn = (i0 === 2 ? 1 - k : 0) + (i1 === 2 ? k : 0);
  envState.winter = (i0 === 3 ? 1 - k : 0) + (i1 === 3 ? k : 0);

  // Smooth weather intensities
  const wRate = 2.1;
  const tRain = envState.activeWeather === 'rain' ? 1 : 0;
  const tSnow = envState.activeWeather === 'snow' ? 1 : 0;
  const tFog = envState.activeWeather === 'fog' ? 1 : 0;

  envState.rain = damp(envState.rain, tRain, wRate, dt);
  envState.snow = damp(envState.snow, tSnow, wRate, dt);
  envState.fog = damp(envState.fog, tFog, wRate, dt);

  // Puddles form rapidly in rain and evaporate gently afterwards
  if (envState.rain > 0.15) envState.wetness = damp(envState.wetness, 1, 2.2, dt);
  else envState.wetness = damp(envState.wetness, 0, 0.35, dt);

  // Winter freezes the plaza & frosts wool; snow weather adds mild extra frost sheen
  envState.ice = clamp(envState.winter * (1 - envState.rain * 0.25), 0, 1);
  envState.frost = clamp(envState.winter + envState.snow * 0.25, 0, 1);
  envState.wind = 0.22 + envState.autumn * 0.35 + envState.rain * 0.48 + envState.snow * 0.18;

  // Blend seasonal palettes
  const pa = PALETTES[SEASONS[i0]!];
  const pb = PALETTES[SEASONS[i1]!];

  blendPaletteColors(pa, pb, k, 'zenith', envState.zenith);
  blendPaletteColors(pa, pb, k, 'upperSky', envState.upperSky);
  blendPaletteColors(pa, pb, k, 'midSky', envState.midSky);
  blendPaletteColors(pa, pb, k, 'horizon', envState.horizon);
  blendPaletteColors(pa, pb, k, 'lowerMid', envState.lowerMid);
  blendPaletteColors(pa, pb, k, 'nadir', envState.nadir);
  blendPaletteColors(pa, pb, k, 'sunColor', envState.sunColor);
  blendPaletteColors(pa, pb, k, 'hemiSky', envState.hemiSky);
  blendPaletteColors(pa, pb, k, 'hemiGround', envState.hemiGround);
  blendPaletteColors(pa, pb, k, 'dirColor', envState.dirColor);
  blendPaletteColors(pa, pb, k, 'cloudTint', envState.cloudTint);
  blendPaletteColors(pa, pb, k, 'fogColor', envState.fogColor);
  blendPaletteColors(pa, pb, k, 'grassTint', envState.grassTint);
  blendPaletteColors(pa, pb, k, 'tuftTint', envState.tuftTint);

  envState.hemiIntensity = pa.hemiIntensity + (pb.hemiIntensity - pa.hemiIntensity) * k;
  envState.dirIntensity = pa.dirIntensity + (pb.dirIntensity - pa.dirIntensity) * k;

  // Apply weather atmospheric overrides (rain -> cool slate overcast, snow -> soft bright mist, fog -> creamy veil)
  const rAmt = envState.rain;
  if (rAmt > 0.002) {
    const skyMix = rAmt * 0.78;
    envState.zenith.lerp(RAIN_SKY_ZENITH, skyMix);
    envState.upperSky.lerp(RAIN_SKY_UPPER, skyMix);
    envState.midSky.lerp(RAIN_SKY_MID, skyMix);
    envState.horizon.lerp(RAIN_SKY_HORIZON, skyMix);
    envState.lowerMid.lerp(RAIN_SKY_LOWER, skyMix);
    envState.nadir.lerp(RAIN_SKY_NADIR, skyMix);
    envState.cloudTint.lerp(RAIN_CLOUD, rAmt * 0.82);
    envState.fogColor.lerp(RAIN_FOG, rAmt * 0.75);
    envState.dirColor.lerp(RAIN_DIR, rAmt * 0.65);
    envState.dirIntensity *= 1 - rAmt * 0.44;
    envState.hemiIntensity += rAmt * 0.12;
  }

  const sAmt = envState.snow;
  if (sAmt > 0.002) {
    const skyMix = sAmt * 0.55;
    envState.zenith.lerp(SNOW_SKY_ZENITH, skyMix);
    envState.upperSky.lerp(SNOW_SKY_UPPER, skyMix);
    envState.midSky.lerp(SNOW_SKY_MID, skyMix);
    envState.horizon.lerp(SNOW_SKY_HORIZON, skyMix);
    envState.cloudTint.lerp(SNOW_CLOUD, sAmt * 0.6);
    envState.fogColor.lerp(SNOW_FOG, sAmt * 0.65);
    envState.dirIntensity *= 1 - sAmt * 0.22;
    envState.hemiIntensity += sAmt * 0.14;
  }

  const fAmt = envState.fog;
  if (fAmt > 0.002) {
    envState.zenith.lerp(envState.fogColor, fAmt * 0.52);
    envState.upperSky.lerp(envState.fogColor, fAmt * 0.58);
    envState.midSky.lerp(envState.fogColor, fAmt * 0.68);
    envState.horizon.lerp(envState.fogColor, fAmt * 0.82);
    envState.lowerMid.lerp(envState.fogColor, fAmt * 0.72);
    envState.nadir.lerp(envState.fogColor, fAmt * 0.6);
    envState.cloudTint.lerp(envState.fogColor, fAmt * 0.45);
    envState.dirIntensity *= 1 - fAmt * 0.42;
    envState.hemiIntensity += fAmt * 0.18;
  }

  envState.fogDensity = clamp(0.0004 + fAmt * 0.0175 + rAmt * 0.0072 + sAmt * 0.0068, 0.0004, 0.024);
  envState.fogSkyMix = clamp(fAmt * 0.58 + rAmt * 0.2 + sAmt * 0.22, 0, 0.68);

  // Rotate dial needle imperatively without React re-renders
  if (dialNeedleEl) {
    dialNeedleEl.style.transform = `rotate(${(envState.seasonPhase / 4) * 360}deg)`;
  }

  syncWeatherStore();
}
