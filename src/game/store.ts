import { create } from 'zustand';
import type { PropKind } from './props';
import type { SeasonId, WeatherId, WeatherMode } from './weather';

export type SheepState = 'idle' | 'cruise' | 'goto' | 'ride' | 'grind';
export type TrickType = 'ollie' | 'kickflip' | 'spin';
export type GamePhase = 'title' | 'playing';

export type SelectedEntity =
  | { kind: 'sheep'; id: number; name: string; state: SheepState }
  | { kind: 'prop'; id: number; propKind: PropKind; name: string; rotDeg: number };

/** UI-facing state only. Per-frame values (positions, overlay boxes) never go through React. */
type UIState = {
  phase: GamePhase;
  selected: SelectedEntity | null;
  buildMode: boolean;
  moveMode: boolean;
  draggingPalette: PropKind | null;
  toast: string | null;
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
  phase: 'playing',
  selected: null,
  buildMode: false,
  moveMode: false,
  draggingPalette: null,
  toast: null,
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
