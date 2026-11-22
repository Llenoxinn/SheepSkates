import { create } from 'zustand';
import type { SeasonId, WeatherId, WeatherMode } from './weather';

export type SheepState = 'idle' | 'cruise' | 'goto' | 'ride' | 'grind';
export type TrickType = 'ollie' | 'kickflip' | 'spin';

/** UI-facing state only. Per-frame values (positions, overlay boxes) never go through React. */
type UIState = {
  selected: { id: number; name: string; state: SheepState } | null;
  score: number;
  combo: number;
  canUndo: boolean;
  canRedo: boolean;
  sound: boolean;
  firedTrick: { type: TrickType; n: number } | null;
  season: SeasonId;
  autoSeason: boolean;
  weather: WeatherId;
  weatherMode: WeatherMode;
  icyPlaza: boolean;
  rainSlow: boolean;
};

export const useUI = create<UIState>(() => ({
  selected: null,
  score: 0,
  combo: 1,
  canUndo: false,
  canRedo: false,
  sound: true,
  firedTrick: null,
  season: 'spring',
  autoSeason: true,
  weather: 'clear',
  weatherMode: 'auto',
  icyPlaza: false,
  rainSlow: false,
}));
