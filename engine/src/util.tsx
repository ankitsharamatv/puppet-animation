// Animation Studio — shared types + helpers for every template.
import React from 'react';

export type Word = { w: string; s: number; e: number };
export type Scene = { start: number; end: number; block: string; params: Record<string, string>; cues?: number[] };
export type StudioProps = { template: string; aspect: '9:16' | '16:9'; audio: string; duration: number; scenes: Scene[]; words?: Word[] };
// what every block receives. t = seconds since the scene started, d = scene length, cues = local cue times (s)
export type BP = { p: Record<string, string>; t: number; d: number; cues: number[]; W: number; H: number; land: boolean; talking: (t: number) => boolean; seed: number };
export type Block = React.FC<BP>;
export type Template = { Bg?: React.FC<{ t: number; W: number; H: number; land: boolean }>; Over?: React.FC<{ t: number; W: number; H: number; land: boolean }>; blocks: Record<string, Block>; transition: 'flash' | 'whip' | 'fade' | 'flashfade'; bg: string };

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const win = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const oBack = (x: number) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;
export const oExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const oCub = (x: number) => 1 - (1 - x) ** 3;
export const ioCub = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
export const pop = (t: number, t0: number, d = 0.35) => (t < t0 ? 0 : oBack(win(t, t0, t0 + d)));
export const rnd = (i: number, s = 0) => { let h = Math.imul(i | 0, 0x27d4eb2d) ^ Math.imul((s | 0) + 0x165667b1, 0x85ebca6b); h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d); h = Math.imul(h ^ (h >>> 12), 0x297a2d39); return ((h ^ (h >>> 15)) >>> 0) / 4294967296; };

// params
export const list = (s?: string) => String(s ?? '').split('|').map(x => x.trim()).filter(Boolean);
export const pair = (s: string): [string, string] => { const i = s.indexOf(':'); return i < 0 ? ['', s.trim()] : [s.slice(0, i).trim(), s.slice(i + 1).trim()]; };
// cue i (local s) or a fallback
export const cue = (cues: number[], i: number, fb: number) => (cues[i] != null && isFinite(cues[i]) && cues[i] >= 0 ? cues[i] : fb);
// greedy word wrap to at most maxChars per line
export const wrap = (text: string, maxChars: number, maxLines = 4) => {
  const out: string[] = []; let line = '';
  for (const w of String(text).split(/\s+/).filter(Boolean)) {
    if (line && (line + ' ' + w).length > maxChars) { out.push(line); line = w; } else line = line ? line + ' ' + w : w;
  }
  if (line) out.push(line);
  if (out.length > maxLines) { const rest = out.splice(maxLines - 1).join(' '); out.push(rest); }
  return out;
};
// font size that fits the longest line in maxW (ratio ≈ average glyph width / size)
export const fit = (lines: string[], maxW: number, base: number, ratio = 0.56) => Math.min(base, maxW / (Math.max(1, ...lines.map(l => l.length)) * ratio));
export const chipW = (text: string, size: number, pad = 70, ratio = 0.52) => text.length * size * ratio + pad;

// world camera for illustrated templates: the world is drawn in 1080×1920 portrait units; landscape shows a
// 1920×1080 window of the same world. cx/cy = focus point, z = zoom. children get the visible rect.
export type View = { x: number; y: number; w: number; h: number };
export const Stage: React.FC<{ W: number; H: number; land: boolean; cx?: number; cy?: number; z?: number; children: (v: View) => React.ReactNode; defs?: React.ReactNode }> =
  ({ W, H, land, cx = 540, cy, z = 1, children, defs }) => {
  const vw = (land ? 1920 : 1080) / z, vh = (land ? 1080 : 1920) / z;
  const v = { x: cx - vw / 2, y: (cy ?? (land ? 980 : 960)) - vh / 2, w: vw, h: vh };
  return <svg width={W} height={H} viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid slice">
    {defs && <defs>{defs}</defs>}{children(v)}</svg>;
};
export const Grain: React.FC<{ W: number; H: number; id: string; a?: number; seed?: number }> = ({ W, H, id, a = 0.14, seed = 5 }) => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
    <filter id={id} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed={seed} /><feColorMatrix values={`0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 ${a} 0`} /></filter>
    <rect width={W} height={H} filter={`url(#${id})`} />
  </svg>
);
