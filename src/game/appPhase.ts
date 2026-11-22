import { create } from 'zustand';

export type AppPhase = 'loading' | 'title' | 'entering' | 'playing';

type AppPhaseState = {
  phase: AppPhase;
  sceneReady: boolean;
  howToPlayOpen: boolean;
  setSceneReady: () => void;
  showTitle: () => void;
  startPlay: () => void;
  finishEntering: () => void;
  openHowToPlay: () => void;
  closeHowToPlay: () => void;
  toggleHowToPlay: () => void;
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Front-door lifecycle state, isolated from editor/weather UI state. */
export const useAppPhase = create<AppPhaseState>(set => ({
  phase: 'loading',
  sceneReady: false,
  howToPlayOpen: false,
  setSceneReady: () => set({ sceneReady: true }),
  showTitle: () => set(s => (s.phase === 'loading' ? { phase: 'title' } : s)),
  startPlay: () => set(s => (s.phase === 'title' ? { howToPlayOpen: false, phase: prefersReducedMotion() ? 'playing' : 'entering' } : s)),
  finishEntering: () => set({ phase: 'playing' }),
  openHowToPlay: () => set({ howToPlayOpen: true }),
  closeHowToPlay: () => set({ howToPlayOpen: false }),
  toggleHowToPlay: () => set(s => ({ howToPlayOpen: !s.howToPlayOpen })),
}));
