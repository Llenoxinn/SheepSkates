import * as THREE from 'three';
import { rng } from './math';
import { baked } from './textures';

export type BoardArt = 'daisy' | 'checker' | 'sunset' | 'baa' | 'sakura' | 'cloud' | 'flames' | 'gingham';

export const BOARD_ARTS = ['daisy', 'checker', 'sunset', 'baa', 'sakura', 'cloud', 'flames', 'gingham'] as const;

export interface BoardArtSpec {
  id: BoardArt;
  label: string;
  shortLabel: string;
  baseHex: string;
  accentHex: string;
  plyHex: string;
  boltHex: string;
  cruiserTruck: 'mint' | 'coral';
  wheelTint: string;
}

export const BOARD_ART_SPECS: Record<BoardArt, BoardArtSpec> = {
  daisy: {
    id: 'daisy', label: 'Meadow Daisy', shortLabel: 'Daisy',
    baseHex: '#8fd4a4', accentHex: '#ffd859', plyHex: '#5ea873', boltHex: '#ffd859',
    cruiserTruck: 'mint', wheelTint: '#fff4d6',
  },
  checker: {
    id: 'checker', label: 'Berry Checker', shortLabel: 'Checker',
    baseHex: '#ff8fa3', accentHex: '#fff3dc', plyHex: '#e55d7c', boltHex: '#ff8fa3',
    cruiserTruck: 'coral', wheelTint: '#ffd6df',
  },
  sunset: {
    id: 'sunset', label: '70s Sunset', shortLabel: 'Sunset',
    baseHex: '#ff9f68', accentHex: '#ffd166', plyHex: '#f06e5c', boltHex: '#ffd166',
    cruiserTruck: 'coral', wheelTint: '#ffe3b3',
  },
  baa: {
    id: 'baa', label: 'BAA! Stamp', shortLabel: 'BAA!',
    baseHex: '#ff947c', accentHex: '#ffd859', plyHex: '#d94f34', boltHex: '#ffd859',
    cruiserTruck: 'coral', wheelTint: '#ffd4c7',
  },
  sakura: {
    id: 'sakura', label: 'Sakura Breeze', shortLabel: 'Sakura',
    baseHex: '#f7b8cc', accentHex: '#9ed2f7', plyHex: '#e57fa4', boltHex: '#ffb5cf',
    cruiserTruck: 'mint', wheelTint: '#ffe6ef',
  },
  cloud: {
    id: 'cloud', label: 'Cloud & Star', shortLabel: 'Cloud',
    baseHex: '#989cf0', accentHex: '#ffe073', plyHex: '#6d72d6', boltHex: '#ffe073',
    cruiserTruck: 'mint', wheelTint: '#dce0ff',
  },
  flames: {
    id: 'flames', label: 'Toybox Flames', shortLabel: 'Flames',
    baseHex: '#ff7d66', accentHex: '#ffd659', plyHex: '#e04e39', boltHex: '#ff9a45',
    cruiserTruck: 'coral', wheelTint: '#ffe6ad',
  },
  gingham: {
    id: 'gingham', label: 'Picnic Gingham', shortLabel: 'Gingham',
    baseHex: '#8ecae6', accentHex: '#ff8fa3', plyHex: '#5aa2c9', boltHex: '#8ecae6',
    cruiserTruck: 'mint', wheelTint: '#d8f0fb',
  },
};

export function isBoardArt(v: unknown): v is BoardArt {
  return typeof v === 'string' && (BOARD_ARTS as readonly string[]).includes(v);
}

/* ------------------------------------------------------------------ */
/* Canvas2D primitives                                                */
/* ------------------------------------------------------------------ */

const W = 256, H = 512;
const INK = '#3a2f2b';

function makeCanvas(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, ctx: c.getContext('2d')! };
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, pts = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = rot + (i * Math.PI) / pts;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawDaisy(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, petals = 7, tilt = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  ctx.fillStyle = '#fffdf7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / petals);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.56, r * 0.27, r * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#ffd452';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSakura(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, tilt = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  ctx.fillStyle = '#fff4f8';
  ctx.strokeStyle = '#d46a8c';
  ctx.lineWidth = Math.max(1.2, r * 0.1);
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-r * 0.44, -r * 0.52, -r * 0.16, -r * 0.94);
    ctx.lineTo(0, -r * 0.78);
    ctx.lineTo(r * 0.16, -r * 0.94);
    ctx.quadraticCurveTo(r * 0.44, -r * 0.52, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#e8688f';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.fillStyle = '#fffdf8';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-40, 14);
  ctx.arc(-28, 2, 16, Math.PI * 0.65, Math.PI * 1.85);
  ctx.arc(-8, -10, 21, Math.PI * 1.05, Math.PI * 1.98);
  ctx.arc(18, -4, 17, Math.PI * 1.2, Math.PI * 2.15);
  ctx.arc(32, 6, 12, Math.PI * 1.4, Math.PI * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFlameShape(ctx: CanvasRenderingContext2D, w: number, yBase: number, peakY: number, lobes: number, fill: string, outline: boolean) {
  ctx.beginPath();
  ctx.moveTo(0, yBase);
  ctx.lineTo(0, peakY + 48);
  for (let i = 0; i < lobes; i++) {
    const x0 = (i / lobes) * w, x1 = ((i + 1) / lobes) * w, xm = (x0 + x1) * 0.5;
    const h = peakY + (i % 2 === 0 ? 0 : 46);
    const valley = peakY + 115 + (i % 2) * 20;
    ctx.quadraticCurveTo(x0 + (xm - x0) * 0.45, h, xm, h);
    if (i < lobes - 1) ctx.quadraticCurveTo(x1 - (x1 - xm) * 0.35, valley, x1, valley - 18);
  }
  ctx.lineTo(w, yBase);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (outline) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ */
/* Underside graphic painters (256 x 512, y=0 Nose -> y=512 Tail)     */
/* ------------------------------------------------------------------ */

function paintUnderside(art: BoardArt): HTMLCanvasElement {
  const { c, ctx } = makeCanvas();

  if (art === 'daisy') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#9ce0b2'); g.addColorStop(1, '#6bc088');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#539e6d'; ctx.lineWidth = 5; ctx.strokeRect(14, 14, W - 28, H - 28);
    // Leaf sprigs
    ctx.strokeStyle = INK; ctx.fillStyle = '#4e9658'; ctx.lineWidth = 2.2;
    for (const [lx, ly, ang] of [[68, 120, -0.5], [190, 175, 0.6], [70, 290, -0.7], [186, 360, 0.5], [96, 438, -0.4]] as const) {
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang);
      ctx.beginPath(); ctx.ellipse(0, 0, 10, 24, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.stroke();
      ctx.restore();
    }
    for (const [dx, dy, r, tilt] of [[128, 86, 28, 0.1], [76, 174, 24, 0.4], [176, 224, 30, -0.2], [110, 272, 26, 0.25], [170, 326, 22, -0.4], [84, 388, 28, 0.15], [140, 444, 25, -0.2]] as const) {
      drawDaisy(ctx, dx, dy, r, 8, tilt);
    }
  } else if (art === 'checker') {
    const sz = 32;
    for (let y = 0; y < H; y += sz) for (let x = 0; x < W; x += sz) {
      const even = ((x / sz + y / sz) | 0) % 2 === 0;
      ctx.fillStyle = even ? '#ff93a6' : '#fff4e0';
      ctx.fillRect(x, y, sz, sz);
    }
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.36);
    ctx.fillStyle = '#ffd166';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.fillRect(-180, -34, 360, 68);
    ctx.strokeRect(-180, -34, 360, 68);
    ctx.fillStyle = '#ff6b86';
    ctx.fillRect(-180, -14, 360, 28);
    ctx.restore();
    drawDaisy(ctx, W / 2, H / 2, 26, 6, 0.2);
  } else if (art === 'sunset') {
    ctx.fillStyle = '#97d4f7'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff5dc'; ctx.beginPath(); ctx.arc(128, 136, 48, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    const arcs = [
      { y: 170, r: 190, col: '#ffe066' },
      { y: 222, r: 210, col: '#ffbe4d' },
      { y: 280, r: 230, col: '#ff965a' },
      { y: 344, r: 250, col: '#ff7266' },
      { y: 412, r: 270, col: '#da6172' },
    ];
    for (const a of arcs) {
      ctx.fillStyle = a.col;
      ctx.beginPath();
      ctx.arc(128, a.y + a.r, a.r, Math.PI, 0);
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff5e4'; ctx.lineWidth = 3; ctx.stroke();
    }
  } else if (art === 'baa') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#ffa58d'); g.addColorStop(1, '#ff7f68');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Comic starburst rays
    ctx.save();
    ctx.translate(128, 256);
    for (let i = 0; i < 16; i++) {
      ctx.rotate(Math.PI / 8);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,226,104,0.42)' : 'rgba(255,250,235,0.22)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-22, -320); ctx.lineTo(22, -320); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // Comic burst badge
    ctx.save();
    ctx.translate(128, 256);
    drawStar(ctx, 0, 0, 108, 76, 12, 0.12);
    ctx.fillStyle = '#ffe066'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.rotate(-0.14);
    ctx.font = '900 58px Fredoka, "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.strokeText('BAA!', 0, 4);
    ctx.fillStyle = '#fffdf7'; ctx.fillText('BAA!', 0, 4);
    ctx.restore();
    for (const [sx, sy, r] of [[72, 92, 16], [186, 114, 13], [68, 412, 14], [184, 424, 17]] as const) {
      drawStar(ctx, sx, sy, r, r * 0.42, 4, 0);
      ctx.fillStyle = '#fffdf7'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    }
  } else if (art === 'sakura') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#fcd0df'); g.addColorStop(0.55, '#fce8ef'); g.addColorStop(1, '#b6defa');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Ink branches
    ctx.strokeStyle = '#4a3531'; ctx.lineCap = 'round';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-10, 175); ctx.quadraticCurveTo(110, 155, 178, 92); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(266, 330); ctx.quadraticCurveTo(145, 315, 78, 392); ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(92, 146); ctx.quadraticCurveTo(115, 100, 110, 62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(155, 326); ctx.quadraticCurveTo(175, 372, 185, 425); ctx.stroke();
    for (const [bx, by, r, t] of [[110, 72, 22, 0.2], [174, 100, 26, -0.3], [78, 158, 24, 0.5], [172, 232, 18, 0.1], [82, 384, 26, -0.2], [178, 416, 22, 0.4]] as const) {
      drawSakura(ctx, bx, by, r, t);
    }
    ctx.fillStyle = '#ffadc8';
    for (const [px, py, a] of [[135, 190, 0.5], [95, 265, -0.6], [150, 305, 0.8], [122, 452, -0.4]] as const) {
      ctx.save(); ctx.translate(px, py); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  } else if (art === 'cloud') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#727ce0'); g.addColorStop(1, '#b6b3f7');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Golden crescent moon
    ctx.save(); ctx.translate(148, 96); ctx.rotate(-0.35);
    ctx.fillStyle = '#ffe073'; ctx.strokeStyle = INK; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0.35 * Math.PI, 1.65 * Math.PI, false);
    ctx.arc(14, 0, 24, 1.52 * Math.PI, 0.48 * Math.PI, true); ctx.closePath();
    ctx.fill(); ctx.stroke(); ctx.restore();
    drawCloud(ctx, 96, 178, 1.05);
    drawCloud(ctx, 164, 294, 0.95);
    drawCloud(ctx, 108, 418, 1.0);
    for (const [sx, sy, r, pts] of [[78, 86, 14, 5], [182, 212, 12, 4], [76, 298, 15, 5], [176, 384, 13, 4], [152, 456, 11, 5]] as const) {
      drawStar(ctx, sx, sy, r, r * 0.45, pts);
      ctx.fillStyle = '#ffe073'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    }
  } else if (art === 'flames') {
    ctx.fillStyle = '#fff5d9'; ctx.fillRect(0, 0, W, H);
    drawFlameShape(ctx, W, H, 108, 4, '#f25849', true);
    drawFlameShape(ctx, W, H, 195, 3, '#ff9a45', true);
    drawFlameShape(ctx, W, H, 290, 4, '#ffe066', true);
    ctx.fillStyle = '#ff9a45'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    for (const [fx, fy, fr] of [[84, 82, 9], [166, 62, 11], [128, 118, 7]] as const) {
      ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  } else {
    // Picnic Gingham
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, W, H);
    const step = 32;
    ctx.fillStyle = 'rgba(130, 198, 232, 0.42)';
    for (let x = 0; x < W; x += step * 2) ctx.fillRect(x, 0, step, H);
    for (let y = 0; y < H; y += step * 2) ctx.fillRect(0, y, W, step);
    ctx.fillStyle = 'rgba(105, 178, 218, 0.28)';
    for (let x = 0; x < W; x += step * 2) for (let y = 0; y < H; y += step * 2) ctx.fillRect(x, y, step, step);
    // Stitched center berry crest
    ctx.save(); ctx.translate(128, 256);
    ctx.fillStyle = '#fffdf7'; ctx.strokeStyle = INK; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.ellipse(0, 0, 56, 74, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#ff8fa3'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 46, 64, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ff6d89'; ctx.strokeStyle = INK; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-30, 12, -26, -24, 0, -20); ctx.bezierCurveTo(26, -24, 30, 12, 0, 30); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6ec468';
    ctx.beginPath(); ctx.ellipse(-10, -24, 12, 6, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(10, -24, 12, 6, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  return c;
}

/* ------------------------------------------------------------------ */
/* Coordinated graphic grip-tape painters (256 x 512, y=0 Nose)       */
/* ------------------------------------------------------------------ */

function paintGripBase(ctx: CanvasRenderingContext2D, seed: number) {
  ctx.fillStyle = '#373540';
  ctx.fillRect(0, 0, W, H);
  const r = rng(seed);
  for (let i = 0; i < 2400; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(15,12,18,0.16)';
    ctx.fillRect(r() * W, r() * H, 2, 2);
  }
}

function paintHardwareBolts(ctx: CanvasRenderingContext2D, noseHex: string) {
  const drawBolt = (x: number, y: number, col: string) => {
    ctx.fillStyle = '#201e26';
    ctx.beginPath(); ctx.arc(x, y, 5.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#24212a';
    ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill();
  };
  for (const x of [98, 158]) {
    drawBolt(x, 114, noseHex);
    drawBolt(x, 154, '#cfd5df');
    drawBolt(x, 358, '#cfd5df');
    drawBolt(x, 398, '#cfd5df');
  }
}

function paintGripTop(art: BoardArt): HTMLCanvasElement {
  const { c, ctx } = makeCanvas();
  const spec = BOARD_ART_SPECS[art];
  paintGripBase(ctx, BOARD_ARTS.indexOf(art) * 19 + 7);

  if (art === 'daisy') {
    ctx.fillStyle = '#6ec48d'; ctx.fillRect(108, 0, 40, H);
    ctx.fillStyle = '#faf3e0'; ctx.fillRect(114, 0, 28, H);
    drawDaisy(ctx, 128, 66, 21, 7, 0.15);
    drawDaisy(ctx, 128, 446, 20, 7, -0.2);
  } else if (art === 'checker') {
    const drawBand = (y0: number, rows: number) => {
      const sz = 20;
      for (let r = 0; r < rows; r++) for (let x = 32; x < W - 32; x += sz) {
        const even = (((x / sz) | 0) + r) % 2 === 0;
        ctx.fillStyle = even ? '#ff8fa3' : '#fff4e0';
        ctx.fillRect(x, y0 + r * sz, sz, sz);
      }
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(32, y0, W - 64, rows * sz);
    };
    drawBand(28, 3);
    drawBand(424, 3);
  } else if (art === 'sunset') {
    ctx.fillStyle = '#fff5dc'; ctx.fillRect(109, 0, 38, H);
    ctx.fillStyle = '#ffd166'; ctx.fillRect(113, 0, 12, H);
    ctx.fillStyle = '#ff7b66'; ctx.fillRect(131, 0, 12, H);
    ctx.fillStyle = '#97d4f7'; ctx.beginPath(); ctx.arc(128, 86, 40, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(128, 86, 26, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ff7b66'; ctx.beginPath(); ctx.arc(128, 86, 13, Math.PI, 0); ctx.fill();
  } else if (art === 'baa') {
    const chevron = (y: number, dir: number, col: string) => {
      ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(64, y); ctx.lineTo(128, y + dir * 28); ctx.lineTo(192, y);
      ctx.lineTo(192, y - dir * 18); ctx.lineTo(128, y + dir * 10); ctx.lineTo(64, y - dir * 18);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    };
    chevron(62, -1, '#ff947c'); chevron(92, -1, '#ffe066');
    chevron(450, 1, '#ff947c'); chevron(420, 1, '#ffe066');
  } else if (art === 'sakura') {
    const g = ctx.createLinearGradient(0, 0, 0, 110);
    g.addColorStop(0, '#fcd0df'); g.addColorStop(1, '#b6defa');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(42, 18, W - 84, 78, 22); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    drawSakura(ctx, 96, 58, 17, 0.2);
    drawSakura(ctx, 156, 56, 18, -0.3);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(52, 418, W - 104, 68, 20); ctx.fill(); ctx.stroke();
    drawSakura(ctx, 128, 452, 19, 0.15);
  } else if (art === 'cloud') {
    ctx.fillStyle = '#7e87e3';
    ctx.beginPath(); ctx.arc(128, 62, 34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    drawStar(ctx, 128, 62, 24, 11, 5);
    ctx.fillStyle = '#ffe073'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9b9af0';
    ctx.beginPath(); ctx.arc(128, 450, 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    drawStar(ctx, 128, 450, 20, 9, 5, 0.2);
    ctx.fillStyle = '#ffe073'; ctx.fill(); ctx.stroke();
  } else if (art === 'flames') {
    // Flames licking across both tail and nose
    drawFlameShape(ctx, W, H, 405, 4, '#f25849', true);
    drawFlameShape(ctx, W, H, 442, 3, '#ffe066', true);
    ctx.save();
    ctx.translate(0, H); ctx.scale(1, -1);
    drawFlameShape(ctx, W, H, 408, 4, '#ff9a45', true);
    drawFlameShape(ctx, W, H, 446, 3, '#ffe066', true);
    ctx.restore();
  } else {
    // Picnic Gingham die-cut windows
    const drawGinghamPatch = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip();
      ctx.fillStyle = '#fffaf0'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = 'rgba(130, 198, 232, 0.52)';
      for (let gx = 0; gx < W; gx += 32) ctx.fillRect(gx, y, 16, h);
      for (let gy = 0; gy < H; gy += 32) ctx.fillRect(x, gy, w, 16);
      ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke();
    };
    drawGinghamPatch(66, 26, 124, 68, 18);
    drawGinghamPatch(66, 418, 124, 68, 18);
    drawGinghamPatch(16, 200, 32, 112, 10);
    drawGinghamPatch(W - 48, 200, 32, 112, 10);
  }

  paintHardwareBolts(ctx, spec.boltHex);
  return c;
}

function makeTex(canvas: HTMLCanvasElement, repeatS = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = repeatS ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 4;
  return t;
}

function paintPly(art: BoardArt): HTMLCanvasElement {
  const { c, ctx } = makeCanvas(128, 64);
  const s = BOARD_ART_SPECS[art];
  const bands = [
    { y: 0, h: 9, col: s.baseHex },
    { y: 9, h: 8, col: '#f4e1c4' },
    { y: 17, h: 9, col: '#d7b07e' },
    { y: 26, h: 12, col: s.plyHex },
    { y: 38, h: 9, col: '#d7b07e' },
    { y: 47, h: 8, col: '#f4e1c4' },
    { y: 55, h: 9, col: s.accentHex },
  ];
  for (const b of bands) { ctx.fillStyle = b.col; ctx.fillRect(0, b.y, 128, b.h); }
  ctx.fillStyle = 'rgba(68,44,24,0.28)';
  for (let i = 1; i < bands.length; i++) ctx.fillRect(0, bands[i]!.y, 128, 1);
  ctx.fillStyle = 'rgba(90,56,28,0.08)';
  for (let i = 0; i < 18; i++) ctx.fillRect((i * 23) % 128, (i * 11) % 64, 28, 1);
  return c;
}

/* ------------------------------------------------------------------ */
/* Cached GPU materials & miniature UI swatch previews                */
/* ------------------------------------------------------------------ */

export function getDeckArtMat(art: BoardArt): THREE.MeshPhysicalMaterial {
  return baked(`board-deck-mat-${art}`, () => new THREE.MeshPhysicalMaterial({
    map: makeTex(baked(`board-under-cv-${art}`, () => paintUnderside(art))),
    roughness: 0.42,
    clearcoat: 0.65,
    clearcoatRoughness: 0.28,
  }));
}

export function getGripArtMat(art: BoardArt): THREE.MeshStandardMaterial {
  return baked(`board-grip-mat-${art}`, () => new THREE.MeshStandardMaterial({
    map: makeTex(baked(`board-grip-cv-${art}`, () => paintGripTop(art))),
    roughness: 0.92,
  }));
}

export function getPlyArtMat(art: BoardArt): THREE.MeshPhysicalMaterial {
  return baked(`board-ply-mat-${art}`, () => new THREE.MeshPhysicalMaterial({
    map: makeTex(paintPly(art), true),
    roughness: 0.46,
    clearcoat: 0.45,
    clearcoatRoughness: 0.32,
  }));
}

export function getBoardArtPreview(art: BoardArt): string {
  return baked(`board-preview-${art}`, () => {
    const src = baked(`board-under-cv-${art}`, () => paintUnderside(art));
    const { c, ctx } = makeCanvas(64, 128);
    ctx.drawImage(src, 0, 0, 64, 128);
    return c.toDataURL('image/png');
  });
}
