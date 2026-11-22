/** Tiny Web Audio synth — every sound is generated, no audio files. */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let hiss: { s: AudioBufferSourceNode; g: GainNode } | null = null;
let nbuf: AudioBuffer | null = null;

function live(): AudioContext | null {
  return enabled && ctx && master ? ctx : null;
}
function env(g: GainNode, t: number, a: number, d: number, v: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function tone(f0: number, f1: number, dur: number, type: OscillatorType = 'sine', vol = 0.2, delay = 0) {
  const c = live(); if (!c) return;
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, 0.006, dur, vol);
  o.connect(g).connect(master!);
  o.start(t); o.stop(t + dur + 0.05);
}
function noiseSrc(c: AudioContext) {
  if (!nbuf) {
    nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = nbuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource(); s.buffer = nbuf; return s;
}
function noise(dur: number, type: BiquadFilterType, f0: number, f1: number, q: number, vol: number) {
  const c = live(); if (!c) return;
  const t = c.currentTime, s = noiseSrc(c), f = c.createBiquadFilter(), g = c.createGain();
  f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, 0.01, dur, vol);
  s.connect(f).connect(g).connect(master!);
  s.start(t); s.stop(t + dur + 0.05);
}

export const Sfx = {
  unlock() {
    if (!ctx) {
      try {
        ctx = new AudioContext();
        master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      } catch { return; }
    }
    if (ctx.state === 'suspended') void ctx.resume();
  },
  get enabled() { return enabled; },
  toggle() { enabled = !enabled; if (!enabled) Sfx.stopHiss(); return enabled; },
  pop() { tone(420, 980, 0.09, 'sine', 0.2); },
  tick() { tone(1500, 1100, 0.035, 'triangle', 0.05); },
  whoosh() { noise(0.24, 'bandpass', 500, 2400, 1.2, 0.2); },
  land() { tone(150, 55, 0.13, 'sine', 0.35); noise(0.07, 'lowpass', 1400, 400, 0.7, 0.12); },
  clank() { tone(1900, 1500, 0.12, 'square', 0.035); tone(2700, 2200, 0.2, 'triangle', 0.06); },
  bonk() { tone(520, 260, 0.12, 'triangle', 0.14); },
  poof() { noise(0.32, 'lowpass', 1600, 250, 0.6, 0.25); tone(320, 110, 0.2, 'sine', 0.14); },
  ding() { tone(880, 880, 0.09, 'triangle', 0.08); tone(1320, 1320, 0.16, 'triangle', 0.08, 0.07); },
  baa(p = 1) {
    const c = live(); if (!c) return;
    const t = c.currentTime, f = (250 + Math.random() * 90) * p, o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 1.18, t);
    o.frequency.linearRampToValueAtTime(f, t + 0.07);
    o.frequency.linearRampToValueAtTime(f * 0.88, t + 0.5);
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = 7.5; lg.gain.value = f * 0.07; lfo.connect(lg).connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.05);
    g.gain.setValueAtTime(0.7, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    for (const [fr, q] of [[800, 3], [1450, 4], [2600, 6]] as const) {
      const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = fr * p; b.Q.value = q;
      o.connect(b).connect(g);
    }
    g.connect(master!);
    o.start(t); lfo.start(t); o.stop(t + 0.6); lfo.stop(t + 0.6);
  },
  startHiss() {
    const c = live(); if (!c || hiss) return;
    const s = noiseSrc(c); s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2600;
    const g = c.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.06, c.currentTime + 0.05);
    s.connect(f).connect(g).connect(master!); s.start();
    hiss = { s, g };
  },
  stopHiss() {
    if (!hiss || !ctx) return;
    const h = hiss; hiss = null;
    h.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
    h.s.stop(ctx.currentTime + 0.1);
  },
};
