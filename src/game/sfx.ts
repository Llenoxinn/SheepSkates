/** Tiny Web Audio synth — every sound is generated, no audio files. */
export type SurfaceType = 'concrete' | 'grass';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let hiss: { s: AudioBufferSourceNode; g: GainNode } | null = null;
let hissCount = 0;
let roll: { s: AudioBufferSourceNode; f: BiquadFilterNode; g: GainNode; concrete: boolean } | null = null;
let rainAmb: { s: AudioBufferSourceNode; g: GainNode } | null = null;
let windAmb: { s: AudioBufferSourceNode; g: GainNode } | null = null;
let nbuf: AudioBuffer | null = null;

function live(): AudioContext | null {
  return enabled && ctx && master ? ctx : null;
}
function env(g: GainNode, t: number, a: number, d: number, v: number): void {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function tone(f0: number, f1: number, dur: number, type: OscillatorType = 'sine', vol = 0.2, delay = 0): void {
  const c = live(); if (!c) return;
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, 0.006, dur, vol);
  o.connect(g).connect(master!);
  o.start(t); o.stop(t + dur + 0.05);
}
function noiseSrc(c: AudioContext): AudioBufferSourceNode {
  if (!nbuf) {
    nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = nbuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource(); s.buffer = nbuf; return s;
}
function noise(dur: number, type: BiquadFilterType, f0: number, f1: number, q: number, vol: number): void {
  const c = live(); if (!c) return;
  const t = c.currentTime, s = noiseSrc(c), f = c.createBiquadFilter(), g = c.createGain();
  f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, 0.01, dur, vol);
  s.connect(f).connect(g).connect(master!);
  s.start(t); s.stop(t + dur + 0.05);
}
function fadeOutHiss(): void {
  if (!hiss || !ctx) return;
  const h = hiss; hiss = null;
  const now = ctx.currentTime;
  h.g.gain.cancelScheduledValues(now);
  h.g.gain.setValueAtTime(h.g.gain.value, now);
  h.g.gain.linearRampToValueAtTime(0, now + 0.08);
  h.s.stop(now + 0.1);
}
function silenceRoll(): void {
  if (!roll || !ctx) return;
  roll.g.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
}
function silenceAmbience(): void {
  if (!ctx) return;
  const now = ctx.currentTime;
  if (rainAmb) rainAmb.g.gain.setTargetAtTime(0, now, 0.08);
  if (windAmb) windAmb.g.gain.setTargetAtTime(0, now, 0.08);
}

export const Sfx = {
  unlock(): void {
    if (!ctx) {
      try {
        ctx = new AudioContext();
        master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      } catch { return; }
    }
    if (ctx.state === 'suspended') void ctx.resume();
  },
  get enabled(): boolean { return enabled; },
  toggle(): boolean {
    enabled = !enabled;
    if (!enabled) {
      hissCount = 0;
      fadeOutHiss();
      silenceRoll();
      silenceAmbience();
    }
    return enabled;
  },
  pop(): void { tone(420, 980, 0.09, 'sine', 0.2); },
  tick(): void { tone(1500, 1100, 0.035, 'triangle', 0.05); },
  whoosh(): void { noise(0.24, 'bandpass', 500, 2400, 1.2, 0.2); },
  land(surface: SurfaceType = 'concrete', impact = 1): void {
    const imp = Math.max(0.5, Math.min(1.6, impact));
    if (surface === 'grass') {
      tone(110, 42, 0.14, 'sine', 0.26 * imp);
      noise(0.11, 'lowpass', 720, 220, 0.6, 0.16 * imp);
      return;
    }
    tone(175, 58, 0.11, 'sine', 0.3 * imp);
    noise(0.06, 'bandpass', 2200, 850, 1.4, 0.2 * imp);
    tone(680, 290, 0.035, 'triangle', 0.12 * imp);
  },
  clank(): void { tone(1900, 1500, 0.12, 'square', 0.035); tone(2700, 2200, 0.2, 'triangle', 0.06); },
  bonk(): void { tone(520, 260, 0.12, 'triangle', 0.14); },
  poof(): void { noise(0.32, 'lowpass', 1600, 250, 0.6, 0.25); tone(320, 110, 0.2, 'sine', 0.14); },
  ding(): void { tone(880, 880, 0.09, 'triangle', 0.08); tone(1320, 1320, 0.16, 'triangle', 0.08, 0.07); },
  baa(pitch = 1, vibrato = 7.5, dur = 0.52): void {
    const c = live(); if (!c) return;
    const t = c.currentTime;
    const p = pitch * (0.95 + Math.random() * 0.1);
    const vib = vibrato * (0.9 + Math.random() * 0.2);
    const d = Math.max(0.2, dur * (0.9 + Math.random() * 0.2));
    const f = (250 + Math.random() * 60) * p;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 1.18, t);
    o.frequency.linearRampToValueAtTime(f, t + Math.min(0.07, d * 0.14));
    o.frequency.linearRampToValueAtTime(f * 0.88, t + d);
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = vib; lg.gain.value = f * 0.07; lfo.connect(lg).connect(o.frequency);
    const g = c.createGain();
    const atk = Math.min(0.05, d * 0.12);
    const sus = d * 0.56;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + atk);
    g.gain.setValueAtTime(0.7, t + sus);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    const formantScale = 0.65 + 0.35 * p;
    for (const [fr, q] of [[800, 3], [1450, 4], [2600, 6]] as const) {
      const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = fr * formantScale; b.Q.value = q;
      o.connect(b).connect(g);
    }
    g.connect(master!);
    o.start(t); lfo.start(t); o.stop(t + d + 0.05); lfo.stop(t + d + 0.05);
  },
  setRoll(speed: number, onConcrete: boolean, active: boolean, icy = false, wet = false): void {
    if (!active || speed <= 0.15 || !enabled) {
      silenceRoll();
      return;
    }
    const c = live(); if (!c) return;
    const now = c.currentTime;
    if (!roll) {
      const s = noiseSrc(c); s.loop = true;
      const f = c.createBiquadFilter();
      f.type = onConcrete ? 'bandpass' : 'lowpass';
      f.frequency.setValueAtTime(onConcrete ? 320 : 180, now);
      f.Q.setValueAtTime(onConcrete ? 1.1 : 0.7, now);
      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      s.connect(f).connect(g).connect(master!);
      s.start(now);
      roll = { s, f, g, concrete: onConcrete };
    } else if (roll.concrete !== onConcrete) {
      roll.f.type = onConcrete ? 'bandpass' : 'lowpass';
      roll.concrete = onConcrete;
    }
    const normSpeed = Math.max(0, Math.min(1, (speed - 0.15) / 5.5));
    const gainCurve = Math.pow(normSpeed, 0.85);
    const targetFreq = onConcrete
      ? (icy ? 480 + normSpeed * 1020 : wet ? 410 + normSpeed * 880 : 320 + normSpeed * 820)
      : 180 + normSpeed * 300;
    const targetQ = onConcrete ? (icy ? 1.65 : wet ? 0.9 : 1.1) : 0.7;
    const targetGain = onConcrete
      ? gainCurve * (icy ? 0.056 : wet ? 0.082 : 0.075)
      : gainCurve * 0.045;
    roll.f.frequency.setTargetAtTime(targetFreq, now, 0.045);
    roll.f.Q.setTargetAtTime(targetQ, now, 0.045);
    roll.g.gain.setTargetAtTime(targetGain, now, 0.045);
  },
  setAmbience(rain: number, wind: number): void {
    if (!enabled) {
      silenceAmbience();
      return;
    }
    const c = live(); if (!c) return;
    const now = c.currentTime;
    if (rain > 0.02) {
      if (!rainAmb) {
        const s = noiseSrc(c); s.loop = true;
        const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(1050, now); f.Q.setValueAtTime(0.55, now);
        const g = c.createGain(); g.gain.setValueAtTime(0, now);
        s.connect(f).connect(g).connect(master!); s.start(now);
        rainAmb = { s, g };
      }
      rainAmb.g.gain.setTargetAtTime(rain * 0.042, now, 0.25);
    } else if (rainAmb) {
      rainAmb.g.gain.setTargetAtTime(0, now, 0.25);
    }
    if (wind > 0.02) {
      if (!windAmb) {
        const s = noiseSrc(c); s.loop = true;
        const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(340, now);
        const g = c.createGain(); g.gain.setValueAtTime(0, now);
        s.connect(f).connect(g).connect(master!); s.start(now);
        windAmb = { s, g };
      }
      windAmb.g.gain.setTargetAtTime(wind * 0.026, now, 0.35);
    } else if (windAmb) {
      windAmb.g.gain.setTargetAtTime(0, now, 0.35);
    }
  },
  startHiss(): void {
    const c = live(); if (!c) return;
    hissCount++;
    if (hiss) return;
    const now = c.currentTime;
    const s = noiseSrc(c); s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2600;
    const g = c.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.06, now + 0.05);
    s.connect(f).connect(g).connect(master!); s.start(now);
    hiss = { s, g };
  },
  stopHiss(): void {
    if (hissCount > 0) hissCount--;
    if (hissCount > 0) return;
    fadeOutHiss();
  },
};
