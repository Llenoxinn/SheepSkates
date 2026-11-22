import { create } from 'zustand';

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
};

export const useUI = create<UIState>(() => ({
  selected: null, score: 0, combo: 1, canUndo: false, canRedo: false, sound: true, firedTrick: null,
}));
