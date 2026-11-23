import { isBoardStyle, type BoardStyle } from './boards';
import { BOARD_COLORS, BOUNDS } from './config';
import { clamp, wrapA } from './math';
import type { PropDef, PropKind } from './props';
import type { SheepState } from './store';

export type SerializedProp = PropDef;

export type SerializedSheep = {
  x: number;
  z: number;
  heading?: number;
  state?: SheepState;
  color?: number;
  hat?: boolean;
  name?: string;
  boardStyle?: BoardStyle;
};

export type ParkData = {
  version: 1;
  props: SerializedProp[];
  flock?: SerializedSheep[];
};

const VALID_KINDS = new Set<PropKind>(['ramp', 'rail', 'ledge', 'cone', 'bench', 'tree']);
const VALID_STATES = new Set<SheepState>(['idle', 'cruise', 'goto', 'ride', 'grind']);
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const STORAGE_KEY = 'sheep-skate-park-v1';
const MAX_PROPS = 120;
const MAX_FLOCK = 24;
const MAX_JSON_BYTES = 512 * 1024;
const MAX_PARAM_LEN = 32768;

const round2 = (n: number) => Math.round(n * 100) / 100;

function sanitizeName(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const cleaned = raw.replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 24);
  return cleaned.length > 0 ? cleaned : undefined;
}

function asFinite(raw: unknown, label: string): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    throw new Error(`Invalid number for ${label}`);
  }
  return raw;
}

export function validateParkData(raw: unknown): ParkData {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Park data must be a JSON object');
  }
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1) {
    throw new Error('Unsupported park version');
  }
  if (!Array.isArray(obj.props) || obj.props.length > MAX_PROPS) {
    throw new Error(`Park props must be an array of at most ${MAX_PROPS} items`);
  }

  const props: SerializedProp[] = obj.props.map((item, idx) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`Invalid prop at index ${idx}`);
    }
    const p = item as Record<string, unknown>;
    if (typeof p.kind !== 'string' || !VALID_KINDS.has(p.kind as PropKind)) {
      throw new Error(`Unsupported prop kind at index ${idx}`);
    }
    const kind = p.kind as PropKind;
    const x = round2(clamp(asFinite(p.x, `props[${idx}].x`), -BOUNDS.x, BOUNDS.x));
    const z = round2(clamp(asFinite(p.z, `props[${idx}].z`), -BOUNDS.z, BOUNDS.z));
    const out: SerializedProp = { kind, x, z };
    if (p.rotY !== undefined) out.rotY = round2(wrapA(asFinite(p.rotY, `props[${idx}].rotY`)));
    if (p.scale !== undefined) out.scale = round2(clamp(asFinite(p.scale, `props[${idx}].scale`), 0.4, 2.2));
    if (p.length !== undefined) out.length = round2(clamp(asFinite(p.length, `props[${idx}].length`), 1.5, 10));
    if (typeof p.color === 'string' && HEX_COLOR_RE.test(p.color)) out.color = p.color.toLowerCase();
    return out;
  });

  const result: ParkData = { version: 1, props };

  if (obj.flock !== undefined) {
    if (!Array.isArray(obj.flock) || obj.flock.length > MAX_FLOCK) {
      throw new Error(`Park flock must be an array of at most ${MAX_FLOCK} sheep`);
    }
    result.flock = obj.flock.map((item, idx) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        throw new Error(`Invalid sheep at index ${idx}`);
      }
      const s = item as Record<string, unknown>;
      const x = round2(clamp(asFinite(s.x, `flock[${idx}].x`), -BOUNDS.x, BOUNDS.x));
      const z = round2(clamp(asFinite(s.z, `flock[${idx}].z`), -BOUNDS.z, BOUNDS.z));
      const out: SerializedSheep = { x, z };
      if (s.heading !== undefined) out.heading = round2(wrapA(asFinite(s.heading, `flock[${idx}].heading`)));
      if (typeof s.state === 'string' && VALID_STATES.has(s.state as SheepState)) {
        const st = s.state as SheepState;
        out.state = st === 'goto' || st === 'ride' ? 'idle' : st;
      }
      if (s.color !== undefined) {
        const ci = Math.floor(asFinite(s.color, `flock[${idx}].color`));
        out.color = clamp(ci, 0, BOARD_COLORS.length - 1);
      }
      if (typeof s.hat === 'boolean') out.hat = s.hat;
      if (isBoardStyle(s.boardStyle)) out.boardStyle = s.boardStyle;
      const name = sanitizeName(s.name);
      if (name) out.name = name;
      return out;
    });
  }

  return result;
}

type CompactWire = {
  v: 1;
  p: { k: PropKind; x: number; z: number; r?: number; s?: number; l?: number; c?: string }[];
  f?: { x: number; z: number; h?: number; s?: SheepState; c?: number; t?: boolean; n?: string; b?: BoardStyle }[];
};

function expandWire(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return raw;
  const w = raw as Partial<CompactWire>;
  if (w.v === 1 && Array.isArray(w.p)) {
    return {
      version: 1,
      props: w.p.map(p => ({
        kind: p.k,
        x: p.x,
        z: p.z,
        ...(p.r !== undefined ? { rotY: p.r } : {}),
        ...(p.s !== undefined ? { scale: p.s } : {}),
        ...(p.l !== undefined ? { length: p.l } : {}),
        ...(p.c !== undefined ? { color: p.c } : {}),
      })),
      ...(Array.isArray(w.f)
        ? {
            flock: w.f.map(s => ({
              x: s.x,
              z: s.z,
              ...(s.h !== undefined ? { heading: s.h } : {}),
              ...(s.s !== undefined ? { state: s.s } : {}),
              ...(s.c !== undefined ? { color: s.c } : {}),
              ...(s.t !== undefined ? { hat: s.t } : {}),
              ...(s.n !== undefined ? { name: s.n } : {}),
              ...(s.b !== undefined ? { boardStyle: s.b } : {}),
            })),
          }
        : {}),
    };
  }
  return raw;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64u: string): string {
  const b64 = b64u.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeParkToParam(data: ParkData): string {
  const wire: CompactWire = {
    v: 1,
    p: data.props.map(p => ({
      k: p.kind,
      x: round2(p.x),
      z: round2(p.z),
      ...(p.rotY ? { r: round2(wrapA(p.rotY)) } : {}),
      ...(p.scale !== undefined ? { s: round2(p.scale) } : {}),
      ...(p.length !== undefined ? { l: round2(p.length) } : {}),
      ...(p.color ? { c: p.color } : {}),
    })),
    ...(data.flock
      ? {
          f: data.flock.map(s => ({
            x: round2(s.x),
            z: round2(s.z),
            ...(s.heading !== undefined ? { h: round2(wrapA(s.heading)) } : {}),
            ...(s.state ? { s: s.state } : {}),
            ...(s.color !== undefined ? { c: s.color } : {}),
            ...(s.hat !== undefined ? { t: s.hat } : {}),
            ...(s.name ? { n: s.name } : {}),
            ...(s.boardStyle ? { b: s.boardStyle } : {}),
          })),
        }
      : {}),
  };
  return toBase64Url(JSON.stringify(wire));
}

export function decodeParkFromParam(param: string): ParkData | null {
  if (!param || param.length > MAX_PARAM_LEN) return null;
  try {
    const json = fromBase64Url(param);
    const parsed = JSON.parse(json) as unknown;
    return validateParkData(expandWire(parsed));
  } catch {
    return null;
  }
}

export function buildShareUrl(data: ParkData): string {
  return `${location.origin}${location.pathname}?park=${encodeParkToParam(data)}`;
}

export function downloadParkJson(data: ParkData, filename = 'sheep-skate-park.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function readParkJsonFile(file: File): Promise<ParkData> {
  if (file.size > MAX_JSON_BYTES) {
    throw new Error('Park file is too large');
  }
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;
  return validateParkData(parsed);
}

export function saveParkToStorage(data: ParkData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / private-mode storage errors
  }
}

export function loadParkFromStorage(): ParkData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return validateParkData(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function clearParkStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}
