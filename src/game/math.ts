export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <T,>(a: readonly T[]): T => a[(Math.random() * a.length) | 0]!;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const wrapA = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
/** Frame-rate independent exponential smoothing. */
export const damp = (a: number, b: number, l: number, dt: number) => a + (b - a) * (1 - Math.exp(-l * dt));
export const dampA = (a: number, b: number, l: number, dt: number) => a + wrapA(b - a) * (1 - Math.exp(-l * dt));
export const easeOutBack = (k: number) => { const c = 1.9; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
export const easeInBack = (k: number) => 2.7 * k * k * k - 1.7 * k * k;
export const easeIO = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

/** Seedable PRNG (mulberry32). */
export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
