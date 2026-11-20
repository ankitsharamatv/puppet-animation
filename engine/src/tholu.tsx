// THOLU PUPPETS template — Andhra leather shadow puppets on a lamp-lit screen, framed as a stage show.
// Format (from the reference): curtain opens → camera pushes through the proscenium → story on the screen with parallax
// (far silhouettes 0.2×, hanging props on threads 0.55×, puppets 1×) → spotlights, giant/tiny scale, looming shadows →
// pull back and the curtain closes. Voice only, no text. World units: 1080×1920 portrait world, 16:9 shows a window of it.
import React from 'react';
import { Block, Template, win, lerp, ioCub, oBack, rnd, list, cue } from './util';
import { Puppet, CAST, ScreenDefs, T, Holes, Pose, PuppetSpec, Animal, Elephant } from './puppets';

const FEET = 1430;
type Setting = 'palace' | 'lanka' | 'forest' | 'river' | 'mountain' | 'ashram' | 'battle' | 'night' | 'tulsivan' | 'home';
const SETTINGS: Setting[] = ['palace', 'lanka', 'forest', 'river', 'mountain', 'ashram', 'battle', 'night', 'tulsivan', 'home'];
const S = { stroke: T.line, strokeWidth: 4, strokeLinejoin: 'round' as const };

// ---- camera with parallax --------------------------------------------------------------------------------------------
type Cam = { cx: number; cy: number; z: number };
const View: React.FC<{ W: number; H: number; land: boolean; cam: Cam; children: React.ReactNode; x?: number; y?: number; w?: number; h?: number; fore?: Setting; t?: number }> = ({ W, H, land, cam, children, x, y, w, h, fore, t = 0 }) => {
  const vw = (land ? 1920 : 1080) / cam.z, vh = (land ? 1080 : 1920) / cam.z;
  return <svg x={x} y={y} width={w ?? W} height={h ?? H} viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice" style={x == null ? { position: 'absolute', inset: 0 } : undefined}><ScreenDefs />{children}{fore && <Fore kind={fore} cam={cam} t={t} />}</svg>;
};
// depth layer: f = 1 moves with the camera, f = 0 stays put on screen
const Depth: React.FC<{ cam: Cam; f: number; children: React.ReactNode }> = ({ cam, f, children }) => {
  const s = Math.pow(cam.z, f - 1);
  return <g transform={`translate(${cam.cx} ${cam.cy}) scale(${s}) translate(${-cam.cx + (cam.cx - 540) * (1 - f)} ${-cam.cy + (cam.cy - 1000) * (1 - f) * 0.6})`}>{children}</g>;
};

// ---- leather set pieces -----------------------------------------------------------------------------------------------
const Thread: React.FC<{ x: number; y: number }> = ({ x, y }) => <path d={`M${x},-800 L${x},${y}`} stroke={T.rod} strokeWidth={3} opacity={0.6} />;
const Sun: React.FC<{ x: number; y: number; t: number; moon?: boolean }> = ({ x, y, t, moon }) => { const yy = y + Math.sin(t * 1.3) * 8;
  return <g><Thread x={x} y={yy - 90} /><g transform={`translate(${x} ${yy}) rotate(${Math.sin(t) * 4})`} {...S}>
    {!moon && Array.from({ length: 16 }, (_, i) => <path key={i} transform={`rotate(${i * 22.5})`} d="M-14,-80 L0,-118 L14,-80 Z" fill={T.ochre} />)}
    <circle r={84} fill={moon ? '#f4ead0' : T.gold} /><circle r={56} fill={moon ? '#e6d8b0' : T.ochre} /><Holes a={[-40, 0]} b={[40, 0]} n={6} r={4} />
    {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={Math.cos(i / 12 * 6.28) * 70} cy={Math.sin(i / 12 * 6.28) * 70} r={4} fill={T.hole} />)}</g></g>; };
const Cloud: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => { const yy = y + Math.sin(t * 1.1 + x) * 6;
  return <g><Thread x={x - 60 * s} y={yy - 40 * s} /><Thread x={x + 60 * s} y={yy - 40 * s} /><g transform={`translate(${x} ${yy}) scale(${s})`} {...S}>
    <path d="M-150,30 C-170,-20 -110,-50 -80,-30 C-70,-80 0,-90 20,-50 C50,-80 120,-60 120,-20 C170,-20 170,30 140,40 Z" fill="#7d8aa6" />
    <Holes a={[-110, 10]} b={[120, 10]} n={12} r={4} /><Holes a={[-60, -30]} b={[60, -30]} n={6} r={3.4} /></g></g>; };
const LTree: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = T.green }) => <g transform={`translate(${x} ${y}) scale(${s})`} {...S}>
  <path d="M-22,0 L-14,-300 L14,-300 L22,0 Z" fill="#6b4422" />
  {[[-110, -360, 0.9], [100, -380, 0.9], [0, -470, 1.1], [-60, -560, 0.8], [70, -560, 0.8]].map(([dx, dy, k], i) => <g key={i} transform={`translate(${dx} ${dy}) scale(${k})`}>
    <path d="M0,-90 C70,-90 110,-30 100,20 C80,70 -80,70 -100,20 C-110,-30 -70,-90 0,-90 Z" fill={i % 2 ? c : T.greenD} />
    <Holes a={[-60, 0]} b={[60, 0]} n={7} r={4} /><Holes a={[-30, -45]} b={[30, -45]} n={4} r={4} />{i === 2 && <circle cx={0} cy={30} r={10} fill={T.red} />}</g>)}</g>;
const Towers: React.FC<{ x0: number; n: number; c: string; seed: number; tall?: number }> = ({ x0, n, c, seed, tall = 1 }) => <g {...S} strokeWidth={3}>{Array.from({ length: n }, (_, i) => {
  const x = x0 + i * 170, h = (220 + rnd(i, seed) * 260) * tall, w = 90 + rnd(i, seed + 1) * 50;
  return <g key={i}><path d={`M${x - w / 2},1000 L${x - w / 2},${1000 - h} L${x - w * 0.3},${1000 - h - 40} L${x},${1000 - h - 130} L${x + w * 0.3},${1000 - h - 40} L${x + w / 2},${1000 - h} L${x + w / 2},1000 Z`} fill={c} />
    <Holes a={[x, 1000 - h + 20]} b={[x, 960]} n={Math.round(h / 50)} r={4} /><circle cx={x} cy={1000 - h - 140} r={8} fill={T.red} /></g>; })}</g>;
const Peaks: React.FC<{ c: string; snow?: boolean }> = ({ c, snow }) => <g {...S}>
  <path d="M-900,1060 L-500,620 L-250,820 L100,420 L420,760 L760,300 L1100,700 L1400,480 L1800,900 L2100,700 L2100,1060 Z" fill={c} />
  {snow && <path d="M630,450 L760,300 L900,460 L840,430 L770,470 L700,430 Z M-20,560 L100,420 L220,560 L150,530 L100,560 L40,530 Z" fill="#fbf4e2" />}</g>;
const Ground: React.FC<{ c?: string }> = ({ c = '#7a4a1e' }) => <g>
  <path d={`M-1200,${FEET + 6} L2300,${FEET + 6} L2300,2600 L-1200,2600 Z`} fill={c} opacity={0.55} />
  <path d={`M-1200,${FEET + 6} L2300,${FEET + 6}`} stroke={T.line} strokeWidth={6} opacity={0.6} /></g>;
// holy basil: a round bush of small paired leaves with purple manjari spikes
const TulsiBush: React.FC<{ x: number; y: number; s?: number; t: number; seed?: number }> = ({ x, y, s = 1, t, seed = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`} {...S} strokeWidth={3}>
  {[-40, -10, 22, 50].map((dx, i) => <path key={i} d={`M${dx * 0.3},0 C${dx * 0.5},-80 ${dx},-150 ${dx * 1.4},-${200 + (i % 2) * 40}`} fill="none" stroke="#4a3a1c" strokeWidth={8} />)}
  {Array.from({ length: 34 }, (_, i) => { const a = rnd(i, seed) * Math.PI, r = 40 + rnd(i, seed + 1) * 110, lx = Math.cos(a) * r * 1.1, ly = -120 - Math.sin(a) * r * 0.9, rot = rnd(i, seed + 2) * 360 + Math.sin(t * 1.5 + i) * 6;
    return <path key={i} transform={`translate(${lx} ${ly}) rotate(${rot})`} d="M0,-22 C17,-12 17,12 0,22 C-17,12 -17,-12 0,-22 Z" fill={i % 3 === 0 ? '#5a9a3a' : i % 3 === 1 ? T.green : T.greenD} />; })}
  {Array.from({ length: 7 }, (_, i) => { const lx = -110 + i * 37, ly = -200 - rnd(i, seed + 5) * 90; return <g key={`m${i}`} transform={`translate(${lx} ${ly}) rotate(${(i - 3) * 9 + Math.sin(t * 1.3 + i) * 4})`}>
    <path d="M0,0 L0,-62" stroke="#5a3a1c" strokeWidth={4} />{[0, 1, 2, 3].map(j => <ellipse key={j} cx={0} cy={-14 - j * 14} rx={8 - j} ry={6} fill="#8a3a6a" strokeWidth={2} />)}</g>; })}
  <Holes a={[-80, -130]} b={[80, -130]} n={7} r={3.4} /></g>;
const Prop2: React.FC<{ kind: string; x: number; t: number }> = ({ kind, x, t }) => {
  if (kind === 'tulsi') return <g transform={`translate(${x} ${FEET})`} {...S}>
    <ellipse cx={0} cy={-560} rx={300} ry={300} fill="#ffd46a" opacity={0.10 + 0.04 * Math.sin(t * 2)} stroke="none" />
    <path d="M-150,0 L-130,-330 L130,-330 L150,0 Z" fill="#c8662e" /><path d="M-170,-330 L170,-330 L160,-370 L-160,-370 Z" fill={T.gold} /><path d="M-180,0 L180,0 L170,-40 L-170,-40 Z" fill={T.gold} />
    <path d="M-40,-80 L-40,-190 C-40,-240 40,-240 40,-190 L40,-80 Z" fill={T.black} /><Diya2l x={0} y={-82} t={t} />
    {[-95, 95].map(dx => <g key={dx}><path d={`M${dx},-110 m-26,0 l26,-60 l26,60 Z`} fill={T.ochre} /><circle cx={dx} cy={-250} r={22} fill={T.red} /><Holes a={[dx - 14, -250]} b={[dx + 14, -250]} n={3} r={3} /></g>)}
    <Holes a={[-120, -300]} b={[120, -300]} n={11} r={4} /><Holes a={[-130, -60]} b={[130, -60]} n={11} r={4} />
    <TulsiBush x={0} y={-366} s={1.05} t={t} seed={4} /></g>;
  if (kind === 'couch') return <g transform={`translate(${x} ${FEET})`} {...S}><path d="M-420,0 L-400,-120 L420,-120 L440,0 Z" fill={T.maroon} /><path d="M-440,-120 L460,-120 L450,-170 L-430,-170 Z" fill="#cfd4da" />
    <path d="M-460,-170 C-480,-260 -400,-300 -380,-170 Z" fill={T.gold} /><Holes a={[-380, -60]} b={[400, -60]} n={20} r={5} />{[-360, 380].map(xx => <rect key={xx} x={xx - 20} y={-30} width={40} height={30} fill={T.gold} />)}</g>;
  if (kind === 'thali') return <g transform={`translate(${x} ${FEET})`} {...S}>
    <path d="M-60,0 L-40,-180 L40,-180 L60,0 Z" fill="#8a5a2e" /><Holes a={[0, -160]} b={[0, -20]} n={5} r={4} />
    <ellipse cx={0} cy={-190} rx={170} ry={34} fill={T.gold} /><ellipse cx={0} cy={-196} rx={140} ry={24} fill={T.goldD} />
    {[-90, -30, 30, 90].map((dx, i) => <circle key={i} cx={dx} cy={-212} r={26} fill={i % 2 ? T.white : '#e8c060'} />)}
    {[-60, 0, 60].map((dx, i) => <path key={i} transform={`translate(${dx} -240) rotate(${(i - 1) * 25})`} d="M0,-26 C20,-14 20,14 0,26 C-20,14 -20,-14 0,-26 Z" fill={T.green} />)}
    <path d="M0,-260 C2,-290 -2,-310 0,-330" stroke={T.greenD} strokeWidth={4} fill="none" /><ellipse cx={0} cy={-330} rx={9} ry={16} fill={T.green} /></g>;
  if (kind === 'shivling') return <g transform={`translate(${x} ${FEET})`} {...S}><path d="M-130,0 L-130,-40 L130,-40 L130,0 Z" fill="#5d5550" /><ellipse cx={0} cy={-46} rx={140} ry={26} fill="#7d746c" /><path d="M120,-50 L200,-44 L200,-30 L120,-32 Z" fill="#7d746c" />
    <path d="M-52,-56 L-52,-200 C-52,-250 52,-250 52,-200 L52,-56 Z" fill="#4a4440" /><path d="M-38,-190 L38,-190 M-40,-176 L40,-176 M-40,-162 L40,-162" stroke={T.white} strokeWidth={6} /><circle cx={0} cy={-176} r={7} fill={T.red} /></g>;
  if (kind === 'fire') return <g transform={`translate(${x} ${FEET})`} {...S}><path d="M-110,0 L-90,-60 L90,-60 L110,0 Z" fill="#8a5a2e" /><Holes a={[-80, -30]} b={[80, -30]} n={8} r={4} />
    {[-50, 0, 50].map((dx, i) => <path key={i} d={`M${dx - 34},-60 C${dx - 40},-120 ${dx - 10},-150 ${dx + 4 * Math.sin(t * 9 + i)},${-210 - 20 * Math.sin(t * 7 + i)} C${dx + 10},-150 ${dx + 40},-120 ${dx + 34},-60 Z`} fill={i === 1 ? T.ochre : T.red} />)}</g>;
  if (kind === 'throne') return <g transform={`translate(${x} ${FEET})`} {...S}><path d="M-130,0 L-130,-300 C-130,-420 130,-420 130,-300 L130,0 Z" fill={T.gold} /><path d="M-100,-180 L100,-180 L100,0 L-100,0 Z" fill={T.red} /><Holes a={[-90, -330]} b={[90, -330]} n={9} r={4} /></g>;
  if (kind === 'cage') return <g transform={`translate(${x} ${FEET})`} {...S}>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={-260 + i * 64} y={-980} width={18} height={980} fill="#3a2a1a" />)}<rect x={-280} y={-1000} width={560} height={30} fill="#3a2a1a" /><rect x={-280} y={-20} width={560} height={24} fill="#3a2a1a" /></g>;
  if (kind === 'brokenbow') return <g transform={`translate(${x} ${FEET})`} {...S}>
    <g transform="rotate(-14)"><path d="M-420,-40 C-330,-160 -170,-180 -40,-150" fill="none" stroke={T.line} strokeWidth={34} /><path d="M-420,-40 C-330,-160 -170,-180 -40,-150" fill="none" stroke={T.gold} strokeWidth={22} /><path d="M-40,-150 l20,-14 l6,22 l18,-6" fill="none" strokeWidth={6} /></g>
    <g transform="rotate(12)"><path d="M40,-130 C170,-170 330,-150 420,-40" fill="none" stroke={T.line} strokeWidth={34} /><path d="M40,-130 C170,-170 330,-150 420,-40" fill="none" stroke={T.gold} strokeWidth={22} /><path d="M40,-130 l-20,-12 l-4,20 l-18,-4" fill="none" strokeWidth={6} /></g>
    <Holes a={[-360, -90]} b={[-80, -150]} n={8} r={4} /><Holes a={[80, -140]} b={[360, -80]} n={8} r={4} />
    {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={-30 + i * 8} cy={-150 - (i % 3) * 20} r={6} fill="#ffcf5a" opacity={0.7} />)}</g>;
  if (kind === 'hut') return <g transform={`translate(${x} ${FEET})`} {...S}><path d="M-160,0 L-160,-220 L160,-220 L160,0 Z" fill="#a8783e" /><path d="M-210,-200 L0,-400 L210,-200 Z" fill="#c99a4a" /><Holes a={[-150, -230]} b={[150, -230]} n={12} r={4} /><path d="M-40,0 L-40,-130 C-40,-170 40,-170 40,-130 L40,0 Z" fill={T.black} /></g>;
  return null;
};

// ---- detailed leather backdrops (drawn full colour, then dimmed so the backlit puppets pop) -----------------------------
const Gopuram: React.FC<{ x: number; base: number; w: number; tiers: number; c: string; cD: string }> = ({ x, base, w, tiers, c, cD }) => <g {...S} strokeWidth={3}>
  {Array.from({ length: tiers }, (_, i) => { const ww = w * (1 - i * 0.14), h = 70, y = base - i * h; return <g key={i}>
    <path d={`M${x - ww / 2},${y} L${x - ww / 2 + 10},${y - h} L${x + ww / 2 - 10},${y - h} L${x + ww / 2},${y} Z`} fill={i % 2 ? c : cD} />
    <Holes a={[x - ww / 2 + 22, y - h / 2]} b={[x + ww / 2 - 22, y - h / 2]} n={Math.max(2, Math.round(ww / 26))} r={3.2} /></g>; })}
  <path d={`M${x - w * 0.22},${base - tiers * 70} C${x - w * 0.22},${base - tiers * 70 - 60} ${x + w * 0.22},${base - tiers * 70 - 60} ${x + w * 0.22},${base - tiers * 70} Z`} fill={c} />
  {[-0.14, 0, 0.14].map(k => <circle key={k} cx={x + w * k} cy={base - tiers * 70 - 54} r={7} fill={T.gold} />)}
  <path d={`M${x - 26},${base} L${x - 26},${base - 70} C${x - 26},${base - 104} ${x + 26},${base - 104} ${x + 26},${base - 70} L${x + 26},${base} Z`} fill={T.black} /></g>;
const Dome: React.FC<{ x: number; base: number; w: number; c: string }> = ({ x, base, w, c }) => <g {...S} strokeWidth={3}>
  <rect x={x - w / 2} y={base - w * 0.7} width={w} height={w * 0.7} fill={c} />
  {Array.from({ length: 3 }, (_, i) => <path key={i} d={`M${x - w / 2 + 18 + i * (w - 36) / 3},${base} l0,${-w * 0.35} c0,-24 ${(w - 36) / 3 - 14},-24 ${(w - 36) / 3 - 14},0 l0,${w * 0.35} Z`} fill={T.black} />)}
  <path d={`M${x - w * 0.42},${base - w * 0.7} C${x - w * 0.42},${base - w * 1.3} ${x + w * 0.42},${base - w * 1.3} ${x + w * 0.42},${base - w * 0.7} Z`} fill={c} />
  <Holes a={[x - w * 0.3, base - w * 0.85]} b={[x + w * 0.3, base - w * 0.85]} n={6} r={3.4} /><path d={`M${x},${base - w * 1.15} l0,-40`} stroke={T.line} strokeWidth={4} /><circle cx={x} cy={base - w * 1.15 - 44} r={7} fill={T.gold} /></g>;
const City: React.FC<{ base: number; c: string; cD: string; seed: number; lanka?: boolean; scale?: number }> = ({ base, c, cD, seed, lanka, scale = 1 }) => <g>
  {Array.from({ length: 14 }, (_, i) => { const x = -900 + i * 240 + rnd(i, seed) * 60, k = (0.75 + rnd(i, seed + 2) * 0.6) * scale;
    return i % 3 === 1 ? <Dome key={i} x={x} base={base} w={150 * k} c={c} /> : <Gopuram key={i} x={x} base={base} w={170 * k} tiers={Math.round((lanka ? 6 : 4) + rnd(i, seed + 3) * 3)} c={c} cD={cD} />; })}
  <path d={`M-1200,${base} L2300,${base} L2300,${base + 60} L-1200,${base + 60} Z`} fill={cD} stroke={T.line} strokeWidth={3} />
  <Holes a={[-1100, base + 30]} b={[2200, base + 30]} n={70} r={3.2} /></g>;
const Ridge: React.FC<{ base: number; amp: number; c: string; seed: number; snow?: boolean }> = ({ base, amp, c, seed, snow }) => {
  const pts = Array.from({ length: 16 }, (_, i) => [-1200 + i * 240, base - amp * (0.3 + rnd(i, seed))]);
  return <g {...S} strokeWidth={3}><path d={`M-1200,${base + 600} L${pts.map(p => p.join(',')).join(' L')} L2400,${base + 600} Z`} fill={c} />
    {snow && pts.filter((_, i) => rnd(i, seed + 4) > 0.45).map(([x, y], i) => <path key={i} d={`M${x - 50},${y + 56} L${x},${y} L${x + 50},${y + 56} L${x + 20},${y + 40} L${x},${y + 60} L${x - 20},${y + 40} Z`} fill="#f4ead0" />)}
    {pts.map(([x, y], i) => <Holes key={i} a={[x, y + 40]} b={[x + 60, base + 40]} n={4} r={3} />)}</g>;
};
const Palm: React.FC<{ x: number; base: number; h: number; c?: string }> = ({ x, base, h, c = T.greenD }) => <g {...S} strokeWidth={3}>
  <path d={`M${x - 10},${base} C${x - 4},${base - h * 0.5} ${x + 14},${base - h * 0.8} ${x + 10},${base - h} L${x + 22},${base - h} C${x + 26},${base - h * 0.8} ${x + 8},${base - h * 0.5} ${x + 12},${base} Z`} fill="#5a3a1c" />
  {[-70, -35, 0, 35, 70, 110, -110].map(a => <path key={a} transform={`translate(${x + 16} ${base - h}) rotate(${a})`} d="M0,0 C30,-20 90,-30 130,10 C90,-6 40,-2 0,0 Z" fill={c} />)}
  <Holes a={[x + 16, base - h + 20]} b={[x + 16, base - 20]} n={Math.round(h / 40)} r={3} /></g>;
const Toran: React.FC<{ x0: number; x1: number; y: number; t: number }> = ({ x0, x1, y, t }) => <g>
  <path d={`M${x0},${y} Q${(x0 + x1) / 2},${y + 120} ${x1},${y}`} fill="none" stroke={T.line} strokeWidth={5} />
  {Array.from({ length: 13 }, (_, i) => { const k = i / 12, x = x0 + (x1 - x0) * k, yy = y + 120 * 4 * k * (1 - k) * 0.5 + 10; return <g key={i} transform={`translate(${x} ${yy}) rotate(${Math.sin(t * 2 + i) * 6})`} {...S} strokeWidth={3}>
    <path d="M0,0 C18,20 14,52 0,70 C-14,52 -18,20 0,0 Z" fill={i % 2 ? T.green : T.ochre} /><circle cx={0} cy={30} r={4} fill={T.hole} /></g>; })}</g>;
const HangLamp: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => <g><Thread x={x} y={y - 40} /><g transform={`translate(${x} ${y}) rotate(${Math.sin(t * 1.4 + x) * 4})`} {...S} strokeWidth={3}>
  <path d="M-40,0 L40,0 L26,50 L-26,50 Z" fill={T.gold} /><Holes a={[-24, 24]} b={[24, 24]} n={5} r={3.4} /><path d="M0,50 C12,70 8,86 0,92 C-8,86 -12,70 0,50 Z" fill={T.ochre} />
  <circle cx={0} cy={74} r={60} fill="#ffcf5a" opacity={0.15} stroke="none" /></g></g>;
const Pillar: React.FC<{ x: number; top: number; w?: number; c?: string }> = ({ x, top, w = 110, c = T.red }) => <g {...S}>
  <rect x={x - w / 2} y={top} width={w} height={FEET - top + 10} fill={c} /><rect x={x - w / 2 - 20} y={top - 40} width={w + 40} height={46} fill={T.gold} />
  <rect x={x - w / 2 - 20} y={FEET - 60} width={w + 40} height={60} fill={T.gold} />
  {Array.from({ length: Math.floor((FEET - top) / 90) }, (_, i) => <g key={i}><path d={`M${x - w / 2},${top + 60 + i * 90} L${x + w / 2},${top + 60 + i * 90}`} stroke={T.goldD} strokeWidth={6} /><Holes a={[x - w / 3, top + 100 + i * 90]} b={[x + w / 3, top + 100 + i * 90]} n={4} r={4} /></g>)}</g>;

const DIM = <filter id="th-dim"><feColorMatrix type="matrix" values="0.36 0.10 0.03 0 0.01  0.08 0.27 0.03 0 0.005  0.03 0.05 0.16 0 0  0 0 0 1 0" /></filter>;
// light: world x of the lamp hotspot behind the screen (follows the main puppet)
const World: React.FC<{ kind: Setting; cam: Cam; t: number; light?: number; ly?: number; glow?: number }> = ({ kind, cam, t, light, ly, glow = 1 }) => {
  const night = kind === 'night', lx = light ?? cam.cx, cityC = kind === 'lanka' ? T.gold : '#e8cf98', cityD = kind === 'lanka' ? T.goldD : '#c9a66a';
  const flick = 1 + 0.04 * Math.sin(t * 7.3) * Math.sin(t * 2.9);
  return <g>
    <defs>{DIM}<radialGradient id="th-lamp"><stop offset="0" stopColor="#fff0c0" stopOpacity="0.9" /><stop offset="0.3" stopColor="#ffbe5c" stopOpacity="0.5" /><stop offset="0.65" stopColor="#e88a2a" stopOpacity="0.16" /><stop offset="1" stopColor="#c86a1a" stopOpacity="0" /></radialGradient></defs>
    <rect x={-4000} y={-3000} width={9000} height={8000} fill={night ? '#120c10' : '#24130a'} />
    <g filter="url(#th-dim)">
      <Depth cam={cam} f={0.1}>
        {(kind === 'palace' || kind === 'lanka') && <City base={1090} c={cityC} cD={cityD} seed={kind === 'lanka' ? 7 : 3} lanka={kind === 'lanka'} scale={0.8} />}
        {(kind === 'mountain' || kind === 'ashram' || kind === 'forest' || kind === 'river' || kind === 'night' || kind === 'battle' || kind === 'tulsivan' || kind === 'home') && <Ridge base={1000} amp={kind === 'mountain' ? 520 : 300} c={kind === 'mountain' ? '#d9cdb4' : '#b49162'} seed={2} snow={kind === 'mountain'} />}
        {night ? <Sun x={1300} y={300} t={t} moon /> : kind === 'mountain' ? null : <Sun x={kind === 'palace' || kind === 'lanka' ? 1350 : -250} y={300} t={t} />}
        <Cloud x={kind === 'palace' ? -200 : 500} y={230} t={t} /><Cloud x={1700} y={300} t={t} s={0.8} />
      </Depth>
      <Depth cam={cam} f={0.3}>
        {(kind === 'palace' || kind === 'lanka') && <City base={1180} c={cityD} cD={kind === 'lanka' ? '#9a6a14' : '#a8854e'} seed={kind === 'lanka' ? 11 : 5} lanka={kind === 'lanka'} scale={1.15} />}
        {kind === 'tulsivan' && Array.from({ length: 16 }, (_, i) => <TulsiBush key={i} x={-1000 + i * 210 + rnd(i, 8) * 60} y={1200} s={0.9 + rnd(i, 9) * 0.5} t={t} seed={i + 2} />)}
        {kind === 'home' && <>{Array.from({ length: 9 }, (_, i) => <g key={i} transform={`translate(${-900 + i * 380} 1190) scale(${0.62 + rnd(i, 5) * 0.2}) translate(0 ${-FEET})`}><Prop2 kind="hut" x={0} t={t} /></g>)}{[-700, 300, 1250, 2000].map((x, i) => <Palm key={i} x={x} base={1190} h={420 + i * 30} />)}</>}
        {(kind === 'forest' || kind === 'ashram' || kind === 'night' || kind === 'river') && <>{Array.from({ length: 12 }, (_, i) => <Palm key={i} x={-900 + i * 270 + rnd(i, 3) * 80} base={1190} h={360 + rnd(i, 4) * 220} c={i % 2 ? T.greenD : '#4f7a34'} />)}</>}
        {(kind === 'mountain' || kind === 'battle') && <Ridge base={1150} amp={220} c={kind === 'mountain' ? '#bfb196' : '#9b7a4a'} seed={6} snow={kind === 'mountain'} />}
        {kind === 'battle' && Array.from({ length: 14 }, (_, i) => <g key={i}><path d={`M${-800 + i * 230},1160 L${-800 + i * 230},${820 - (i % 3) * 40}`} stroke={T.line} strokeWidth={6} /><path d={`M${-800 + i * 230},${820 - (i % 3) * 40} l${100 + 10 * Math.sin(t * 4 + i)},30 l-100,30 Z`} fill={i % 2 ? T.red : T.ochre} stroke={T.line} strokeWidth={3} /></g>)}
        {kind === 'river' && <path d="M-1200,1180 L2400,1180 L2400,1260 L-1200,1260 Z" fill="#5b86a8" />}
      </Depth>
      <Depth cam={cam} f={0.6}>
        {(kind === 'palace' || kind === 'lanka') && <>{[-760, -300, 1380, 1840].map(x => <Pillar key={x} x={x} top={420} w={100} c={kind === 'lanka' ? '#6e1c16' : T.red} />)}<Toran x0={-760} x1={-300} y={420} t={t} /><Toran x0={1380} x1={1840} y={420} t={t} /><HangLamp x={-530} y={560} t={t} /><HangLamp x={1610} y={560} t={t} /></>}
        {(kind === 'forest' || kind === 'ashram' || kind === 'night') && <><LTree x={-560} y={FEET + 30} s={1.15} /><LTree x={1640} y={FEET + 30} s={1.2} /><LTree x={-40} y={FEET - 60} s={0.7} c="#4f8a3a" /><LTree x={1150} y={FEET - 50} s={0.75} c="#4f8a3a" /></>}
        {kind === 'ashram' && <Prop2 kind="hut" x={1320} t={t} />}
        {kind === 'tulsivan' && <><LTree x={-640} y={FEET + 30} s={1.15} /><LTree x={1720} y={FEET + 30} s={1.2} />{[-260, 60, 1020, 1340].map((x, i) => <TulsiBush key={i} x={x} y={FEET - 30} s={1.5 + (i % 2) * 0.3} t={t} seed={i + 20} />)}</>}
        {kind === 'home' && <><path d={`M-1200,${FEET - 300} L2300,${FEET - 300} L2300,${FEET} L-1200,${FEET} Z`} fill="#c99a5a" {...S} /><Holes a={[-1100, FEET - 270]} b={[2200, FEET - 270]} n={60} r={4} />{[-260, 1340].map(x => <path key={x} d={`M${x - 90},${FEET} L${x - 90},${FEET - 420} C${x - 90},${FEET - 540} ${x + 90},${FEET - 540} ${x + 90},${FEET - 420} L${x + 90},${FEET} Z`} fill={T.black} {...S} />)}<Toran x0={-420} x1={-100} y={FEET - 560} t={t} /><Toran x0={1180} x1={1500} y={FEET - 560} t={t} /></>}
        {kind === 'river' && <>{[0, 1, 2].map(r => <path key={r} d={`M-1400,${FEET - 140 + r * 55} ${Array.from({ length: 34 }, (_, i) => `q60,${(i % 2 ? 1 : -1) * 22} 120,0`).join(' ')}`} transform={`translate(${((t * (40 + r * 25)) % 240) - 120} 0)`} fill="none" stroke={r === 1 ? '#6f9cc0' : '#4f7ea6'} strokeWidth={14} />)}<LTree x={-640} y={FEET + 30} s={1.1} /><LTree x={1720} y={FEET + 30} s={1.1} /></>}
        {kind === 'battle' && [-500, 1600].map(x => <g key={x} transform={`translate(${x} ${FEET})`} {...S}><circle cx={-60} cy={-80} r={80} fill={T.ochreD} /><Holes a={[-120, -80]} b={[0, -80]} n={6} /><path d="M-160,-150 L160,-150 L130,-260 L-130,-260 Z" fill={T.red} /><Holes a={[-120, -205]} b={[120, -205]} n={10} /></g>)}
        {kind === 'mountain' && <Ridge base={1350} amp={160} c="#a08a66" seed={9} />}
      </Depth>
      <Ground c={night ? '#2a1c12' : '#5a3416'} />
    </g>
    <Depth cam={cam} f={0.05}><ellipse cx={lx} cy={ly ?? FEET - 560} rx={660 * flick * glow} ry={640 * flick * glow} fill="url(#th-lamp)" style={{ mixBlendMode: 'screen' }} /></Depth>
    {night && <rect x={-4000} y={-3000} width={9000} height={8000} fill="#141a33" opacity={0.3} />}
  </g>;
};
// foreground silhouettes: in front of the puppets, move fastest (strong parallax)
const Fore: React.FC<{ kind: Setting; cam: Cam; t: number }> = ({ kind, cam, t }) => <Depth cam={cam} f={1.45}><g opacity={0.92}>
  {(kind === 'palace' || kind === 'lanka') && [-980, 2080].map(x => <g key={x}><rect x={x - 90} y={0} width={180} height={2400} fill="#1a0c05" /><Holes a={[x, 200]} b={[x, 1800]} n={24} r={5} /><rect x={x - 120} y={FEET + 120} width={240} height={80} fill="#2a1508" /></g>)}
  {kind !== 'palace' && kind !== 'lanka' && <>{[[-900, 1], [2000, -1]].map(([x, s]) => <g key={x} transform={`translate(${x} ${FEET + 260}) scale(${s} 1)`}>
    {[-40, -15, 10, 35, 60].map((a, i) => <path key={i} transform={`rotate(${a + Math.sin(t * 1.2 + i) * 3})`} d="M0,0 C60,-120 70,-380 20,-560 C0,-380 -40,-200 0,0 Z" fill="#160b04" />)}</g>)}
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-1100 + i * 115},${FEET + 300} l${-20 + Math.sin(t + i) * 4},-${70 + (i % 4) * 30} l26,${70 + (i % 4) * 30}`} fill="#160b04" />)}</>}
</g></Depth>;

// ---- puppeteering: rod-puppet motion per action --------------------------------------------------------------------
type Member = { who: string; action: string };
const ANIMALS = ['kamadhenu', 'nandi', 'airavata'], WHO = [...Object.keys(CAST), ...ANIMALS];
const parse = (s?: string): Member[] => list(s).slice(0, 3).map(x => { const [w, a] = x.split('/').map(y => y.trim().toLowerCase()); return { who: WHO.includes(w) ? w : 'rama', action: a || 'stand' }; });
const PS = 0.82;
const act = (a: string, t: number, i: number, d: number): { pose: Pose; dx: number; dy: number; rot: number; talk: boolean; bound: number; shake: number; fade?: number; grow?: number } => {
  const sw = Math.sin(t * 1.7 + i * 2) * 1.6, bob = Math.sin(t * 2.2 + i) * 4;
  const base = { dx: 0, dy: bob, rot: sw, talk: false, bound: 0, shake: 0 };
  switch (a) {
    case 'talk': return { ...base, pose: { armF: [60 + 22 * Math.sin(t * 3.1 + i), 40 + 25 * Math.sin(t * 4.3 + i)], armB: [-15, -20] }, talk: true };
    case 'walk': { const ph = t * 6.5 + i; return { ...base, pose: { armF: [20 + 18 * Math.sin(ph), 30], armB: [-20 - 18 * Math.sin(ph), -20], legF: 22 * Math.sin(ph), legB: -22 * Math.sin(ph) }, dy: -Math.abs(Math.sin(ph)) * 18, rot: Math.sin(ph) * 3 }; }
    case 'attack': { const k = (t * 1.2 + i * 0.3) % 1, strike = k < 0.6 ? win(k, 0, 0.6) : 1 - win(k, 0.6, 1); return { ...base, pose: { armF: [lerp(70, 165, 1 - strike), lerp(10, 40, strike)], armB: [-40, -50], legF: 28, legB: -20 }, dx: strike * 40, rot: -4 + strike * 8 }; }
    case 'angry': return { ...base, pose: { armF: [150 + 6 * Math.sin(t * 9), 15], armB: [-40, -60], legF: 26, legB: -20 }, shake: 5, talk: true };
    case 'bow': case 'pray': return { ...base, pose: { armF: [85, 40], armB: [60, 60] }, rot: a === 'bow' ? 10 + sw : sw };
    case 'bless': return { ...base, pose: { armF: [115, -35], armB: [-15, -20] } };
    case 'hold': return { ...base, pose: { armF: [95 + 3 * Math.sin(t * 6), -5], armB: [-95, 5], legF: 30, legB: -30 }, shake: 2 };
    case 'grab': return { ...base, pose: { armF: [100, 10], armB: [70, 20], legF: 26, legB: -22 }, dx: 30 * Math.sin(t * 2), rot: 6 };
    case 'celebrate': return { ...base, pose: { armF: [160 + 10 * Math.sin(t * 7), 10], armB: [-160, -10] }, dy: -Math.abs(Math.sin(t * 5 + i)) * 26 };
    case 'bound': return { ...base, pose: { armF: [8, 4], armB: [-8, -4] }, rot: 6 + sw, bound: 1, shake: 1.5 };
    case 'fall': { const k = ioCub(win(t, 0, Math.min(1.6, d * 0.6))); return { ...base, pose: { armF: [120, 30], armB: [-120, -30] }, rot: 84 * k, dy: 260 * k }; }
    case 'sleep': return { ...base, pose: { armF: [20, 30], armB: [-10, -10], legF: 4, legB: -4 }, rot: -88, dy: 110 + 3 * Math.sin(t * 1.6), dx: 170 };
    case 'vanish': { const k = ioCub(win(t, d * 0.3, d * 0.85)); return { ...base, pose: { armF: [40, 60], armB: [-20, -30] }, rot: -4 + sw, fade: 1 - k, dy: bob - 120 * k }; }
    case 'appear': { const k = ioCub(win(t, 0.2, Math.min(2.4, d * 0.7))); return { ...base, pose: { armF: [lerp(30, 115, k), lerp(50, -35, k)], armB: [-15, -20] }, fade: k, dy: bob + 260 * (1 - k), grow: lerp(0.5, 1, k) }; }
    case 'offer': return { ...base, pose: { armF: [100 + 4 * Math.sin(t * 2), -30], armB: [70, 30] }, rot: 6 + sw * 0.5 };
    case 'draw': return { ...base, pose: { armF: [78 - 10 * Math.min(1, t / 1.2), -70 + 40 * Math.min(1, t / 1.2)], armB: [85, -5], legF: 24, legB: -20 } };
    case 'point': return { ...base, pose: { armF: [96, -6], armB: [-15, -20] }, talk: true };
    case 'chant': return { ...base, pose: { armF: [80, 50], armB: [-10, -10] }, talk: true };
    default: return { ...base, pose: { armF: [30 + 4 * Math.sin(t * 1.5 + i), 50], armB: [-15, -20] } };
  }
};
const PuppetAt: React.FC<{ m: Member; x: number; t: number; i: number; d: number; talking: boolean; face?: number; s?: number; y?: number; walkTo?: number; dim?: number }> = ({ m, x, t, i, d, talking, face = 1, s = PS, y = FEET, walkTo, dim = 0 }) => {
  if (m.action === 'sleep') face = 1;
  const a = act(m.action, t, i, d), xx = (walkTo != null ? lerp(x, walkTo, t / d) : x) + a.dx * face + (a.shake ? Math.sin(t * 31 + i) * a.shake : 0);
  if (ANIMALS.includes(m.who)) return <g transform={`translate(${xx} ${y + (m.action === 'walk' ? -Math.abs(Math.sin(t * 6)) * 8 : Math.sin(t * 2 + i) * 3)}) scale(${face * s} ${s})`} filter="url(#th-leather)">
    {m.who === 'airavata' ? <Elephant t={t} walk={m.action === 'walk' || m.action === 'attack' ? t * 5 : Math.sin(t) * 0.15} /> : <Animal kind={m.who as 'kamadhenu' | 'nandi'} t={t} walk={m.action === 'walk' ? t * 6 : Math.sin(t) * 0.2} />}</g>;
  const spec: PuppetSpec = CAST[m.who];
  const g = a.grow ?? 1, sleep = m.action === 'sleep';
  return <g transform={`translate(${xx} ${y + a.dy}) scale(${face * s * g} ${s * g}) rotate(${a.rot} 0 -300)`} filter="url(#th-leather)" opacity={(1 - dim * 0.6) * (a.fade ?? 1)}>
    <Puppet spec={spec} pose={a.pose} talk={a.talk && talking ? 0.4 + 0.6 * Math.abs(Math.sin(t * 13)) : 0} blink={sleep || ((t + i * 0.9) % 3.1) > 2.98} t={t} bound={a.bound} rods />
  </g>;
};
const slots = (n: number, land: boolean) => n <= 1 ? [540] : n === 2 ? (land ? [250, 830] : [330, 770]) : (land ? [40, 540, 1040] : [230, 540, 850]);
// every shot drifts: lateral glide + slow push + a breath of sway, direction alternates per scene (seed)
const camOf = (c: string, t: number, d: number, land: boolean, focusX: number, seed = 0): Cam => {
  const base = land ? 1.22 : 1.45, cy = land ? FEET - 420 : FEET - 440, dir = (seed % 2 ? 1 : -1) * (land ? 1 : 0.4), k = ioCub(win(t, 0, d)), sway = 6 * Math.sin(t * 0.9 + seed);
  if (c === 'wide') return { cx: 540 + dir * lerp(-150, 150, k) + sway, cy: cy - 40, z: base * lerp(0.86, 0.94, k) };
  if (c === 'close') return { cx: focusX + dir * lerp(-60, 60, k) + sway, cy: FEET - 560, z: base * lerp(1.45, 1.6, k) };
  if (c === 'pan') return { cx: lerp(540 - dir * 420, 540 + dir * 420, k) + sway, cy, z: base * 1.02 };
  if (c === 'push') return { cx: lerp(540 + dir * 160, focusX, k) + sway, cy: lerp(cy, FEET - 520, k), z: base * lerp(0.92, 1.4, k) };
  return { cx: lerp(540 + dir * 180, 540 - dir * 60, k) + sway, cy: cy + 4 * Math.sin(t * 0.7), z: base * lerp(1.0, 1.1, k) };
};
const Fx: React.FC<{ kind: string; t: number; k: number; xs?: number[] }> = ({ kind, t, k, xs = [540] }) => {
  const xa = xs[0], xb = xs[xs.length - 1];
  if (kind === 'arms') return <g>{Array.from({ length: 16 }, (_, i) => { const t0 = 0.2 + i * 0.09, q = Math.max(0, t - t0); if (q <= 0) return null;
    const vx = (rnd(i, 2) - 0.5) * 520, vy = -380 - rnd(i, 3) * 300, x = xb + vx * q, y = Math.min(FEET - 20, FEET - 520 + vy * q + 900 * q * q), rot = (rnd(i, 4) - 0.5) * 900 * Math.min(q, 1.2);
    return <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} {...S}><rect x={-70} y={-15} width={140} height={30} rx={14} fill={i % 2 ? T.skinGold : T.skinGoldD} /><circle cx={70} cy={0} r={16} fill={T.skinGold} /><path d="M-30,-15 L-30,15" stroke={T.gold} strokeWidth={10} /><Holes a={[-50, 0]} b={[40, 0]} n={4} r={3} /></g>; })}</g>;
  if (kind === 'crowns') return <g>{Array.from({ length: 21 }, (_, i) => { const t0 = 0.3 + i * 0.22, q = Math.max(0, t - t0); if (q <= 0) return null;
    const px = xb + 260 + ((i % 7) - 3) * 70, py = FEET - 30 - Math.floor(i / 7) * 58, fall = Math.min(1, q / 0.55), y = lerp(-300, py, fall * fall), r = (1 - fall) * 300 * (rnd(i, 1) - 0.5) + (rnd(i, 2) - 0.5) * 30;
    return <g key={i} transform={`translate(${px} ${y}) rotate(${r}) scale(0.7)`} {...S} strokeWidth={3}><path d="M-46,30 L46,30 L40,0 L24,-12 L14,-40 L0,-70 L-14,-40 L-24,-12 L-40,0 Z" fill={T.gold} /><rect x={-48} y={22} width={96} height={16} fill={T.red} /><Holes a={[-34, 30]} b={[34, 30]} n={6} r={3} /></g>; })}</g>;
  if (kind === 'tej') return <g>{Array.from({ length: 34 }, (_, i) => { const q = (t * 0.45 + i / 34) % 1, x = lerp(xa + 60, xb - 60, q), y = FEET - 560 - Math.sin(q * Math.PI) * 260 + Math.sin(t * 4 + i) * 14;
    return <g key={i}><circle cx={x} cy={y} r={22} fill="#ffd46a" opacity={0.18} /><circle cx={x} cy={y} r={7} fill="#fff2c0" opacity={0.95 * Math.sin(q * Math.PI)} /></g>; })}
    <circle cx={xb} cy={FEET - 520} r={260 + 30 * Math.sin(t * 3)} fill="#ffd46a" opacity={0.14 + 0.08 * Math.min(1, t / 3)} /></g>;
  if (kind === 'water') { const hx = xb - 150, tx = xa + 40; return <g>{Array.from({ length: 22 }, (_, i) => { const q = (t * 0.9 + i / 22) % 1, x = lerp(hx, tx, q), y = FEET - 620 + 200 * q * q - 60 * q;
    return <ellipse key={i} cx={x} cy={y} rx={9} ry={13} fill="#7fb4d8" stroke={T.line} strokeWidth={2} opacity={0.9} />; })}
    {Array.from({ length: 6 }, (_, i) => { const q = (t * 1.6 + i / 6) % 1; return <circle key={`s${i}`} cx={tx + (i - 2.5) * 22 * q} cy={FEET - 470 - 40 * q * (1 - q) * 4} r={5} fill="#a8d0ec" opacity={1 - q} />; })}</g>; }
  if (kind === 'lightning') { const ph = (t * 0.8) % 1, on = ph < 0.18; return <g>{on && <><path d={`M${xb - 60},-600 L${xb + 20},${FEET - 1100} L${xb - 40},${FEET - 1000} L${xb + 40},${FEET - 600}`} fill="none" stroke="#fff6c8" strokeWidth={22} strokeLinejoin="round" /><path d={`M${xb - 60},-600 L${xb + 20},${FEET - 1100} L${xb - 40},${FEET - 1000} L${xb + 40},${FEET - 600}`} fill="none" stroke="#7fb4ff" strokeWidth={8} strokeLinejoin="round" />
    <rect x={-3000} y={-2000} width={7000} height={6000} fill="#dfe8ff" opacity={0.12} /></>}</g>; }
  if (kind === 'chakra') { const q = (t * 0.6) % 1, x = lerp(xa - 400, xb, q), y = FEET - 560 - Math.sin(q * Math.PI) * 120; return <g transform={`translate(${x} ${y}) rotate(${t * 720})`} {...S}><circle r={60} fill={T.gold} /><circle r={36} fill={T.ochre} />{Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i * 30})`} d="M0,-60 L10,-80 L0,-98 L-10,-80 Z" fill={T.gold} />)}<circle r={10} fill={T.red} /><circle r={110} fill="#ffd46a" opacity={0.18} stroke="none" /></g>; }
  if (kind === 'sparkle') return <g>{Array.from({ length: 30 }, (_, i) => { const q = (t * 0.4 + rnd(i, 6)) % 1, x = xa + (rnd(i, 7) - 0.5) * 520 + Math.sin(t * 2 + i) * 20, y = FEET - 80 - q * 900;
    return <g key={i} transform={`translate(${x} ${y}) rotate(${t * 90 + i * 30})`} opacity={Math.sin(q * Math.PI)}><path d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" fill="#fff2c0" /></g>; })}
    <ellipse cx={xa} cy={FEET - 520} rx={300} ry={460} fill="#ffd46a" opacity={0.12 + 0.05 * Math.sin(t * 3)} /></g>;
  if (kind === 'flood' && k > 0) { const front = lerp(2400, -1400, k);
    return <g {...S}><path d={`M2400,${FEET - 220} L${front},${FEET - 220} ${Array.from({ length: 8 }, (_, i) => `q-30,${30 + 10 * Math.sin(t * 6 + i)} 0,60`).join(' ')} L${front},2600 L2400,2600 Z`} fill="#4f7ea6" opacity={0.85} />
      <Holes a={[front + 40, FEET - 180]} b={[2300, FEET - 180]} n={40} r={5} /></g>; }
  if (kind === 'petals' || kind === 'rain' || kind === 'embers') return <g>{Array.from({ length: 40 }, (_, i) => { const q = (t * (kind === 'rain' ? 1.4 : 0.35) + rnd(i, 3)) % 1, x = -700 + rnd(i, 4) * 2600 + Math.sin(t + i) * 30, y = kind === 'embers' ? 1600 - q * 1500 : -200 + q * 1800;
    return kind === 'rain' ? <path key={i} d={`M${x},${y} l-14,46`} stroke="#5b86a8" strokeWidth={5} /> : <circle key={i} cx={x} cy={y} r={kind === 'embers' ? 6 : 12} fill={kind === 'embers' ? '#ffb02e' : i % 2 ? T.red : T.ochre} opacity={kind === 'embers' ? 1 - q : 0.9} />; })}</g>;
  return null;
};

// ---- blocks ------------------------------------------------------------------------------------------------------------
const layout = (p: Record<string, string>, land: boolean) => {
  const cast = parse(p.cast || 'rama/stand'), solo = cast.length === 1 && (p.prop === 'tulsi' || p.prop === 'thali') && cast[0].action !== 'appear';
  const xs = (solo ? [land ? 780 : 760] : slots(cast.length, land)).map((x, i) => cast[i].action === 'appear' && p.prop === 'tulsi' ? (cast.length > 1 ? (land ? 540 : 660) : 120) : x);
  const appear = cast.length > 1 && p.prop === 'tulsi' && cast.some(m => m.action === 'appear');
  return { cast, solo, xs: appear && !land ? xs.map((x, i) => cast[i].action === 'appear' ? x : 290) : xs, propX: solo ? (land ? 330 : 360) : appear && !land ? 660 : 540 };
};
const SceneArt: React.FC<{ p: Record<string, string>; t: number; d: number; cam: Cam; talking: boolean; cues: number[]; land?: boolean }> = ({ p, t, d, cam, talking, cues, land = true }) => {
  const { cast, solo, xs } = layout(p, land), fx = p.fx || 'none', c0 = cue(cues, 0, 0.3), lx = cast.length === 1 ? (p.prop === 'shivling' ? 620 : solo ? 560 : 540) : 540;
  return <>
    <World kind={(p.setting || 'forest') as Setting} cam={cam} t={t} light={lx} glow={cast.length > 1 ? 1.25 : 1} />
    {p.prop && p.prop !== 'none' && <Prop2 kind={p.prop} x={p.prop === 'cage' ? xs[cast.length - 1] : p.prop === 'couch' ? xs[Math.max(0, cast.findIndex(m => m.action === 'sleep'))] + 170 : cast.length > 1 ? layout(p, land).propX : solo ? layout(p, land).propX : 120} t={t} />}
    {cast.map((m, i) => <PuppetAt key={i} m={m} x={p.prop === 'shivling' && cast.length === 1 ? 760 : xs[i]} t={t} i={i} d={d} talking={talking} face={cast.length === 1 ? (p.prop === 'shivling' || solo ? -1 : 1) : xs[i] > 540 || (cast.length === 3 && i === 2) ? -1 : 1} />)}
    <Fx kind={fx} t={t} k={fx === 'flood' ? ioCub(win(t, c0, c0 + Math.max(1.5, d - c0 - 0.5))) : 1} xs={solo && fx === 'water' ? [layout(p, land).propX, xs[0]] : solo ? [layout(p, land).propX] : cast.map((_, i) => xs[i])} />
  </>;
};
const SceneB: Block = ({ p, t, d, W, H, land, talking, cues, seed }) => { const { solo, xs, propX } = layout(p, land), cam = camOf(p.camera || 'medium', t, d, land, solo ? (propX + xs[0]) / 2 : xs[0], seed);
  return <View W={W} H={H} land={land} cam={cam} fore={(p.setting || 'forest') as Setting} t={t}><SceneArt p={p} t={t} d={d} cam={cam} talking={talking(t)} cues={cues} land={land} /></View>; };

// theatre: proscenium, curtains, diya footlights, audience heads (frame units)
const Theatre: React.FC<{ FW: number; FH: number; open: number; scr: { x: number; y: number; w: number; h: number }; t: number; children: React.ReactNode }> = ({ FW, FH, open, scr, t, children }) => {
  const half = scr.w / 2 + 70, cw = half * (1 - open * 0.86);
  return <g>
    <rect width={FW} height={FH} fill="#24130a" />
    {children}
    {[0, 1].map(side => <g key={side} transform={side ? `translate(${FW} 0) scale(-1 1)` : ''}>
      <path d={`M${scr.x - 20},${scr.y - 10} L${scr.x - 20 + cw},${scr.y - 10} C${scr.x - 40 + cw},${scr.y + scr.h * 0.4} ${scr.x - 10 + cw},${scr.y + scr.h * 0.7} ${scr.x - 50 + cw + 40 * open},${scr.y + scr.h + 10} L${scr.x - 20},${scr.y + scr.h + 10} Z`} fill="#8e1b26" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${scr.x - 20 + (i + 0.5) * cw / 8},${scr.y} L${scr.x - 28 + (i + 0.5) * cw / 8},${scr.y + scr.h}`} stroke="#68111a" strokeWidth={Math.max(4, cw / 30)} />)}</g>)}
    <path d={`M${scr.x - 30},${scr.y - 20} L${scr.x + scr.w + 30},${scr.y - 20} L${scr.x + scr.w + 30},${scr.y + 50} ${Array.from({ length: 8 }, (_, i) => `C${scr.x + scr.w + 30 - (i + 0.3) * (scr.w + 60) / 8},${scr.y + 120} ${scr.x + scr.w + 30 - (i + 0.7) * (scr.w + 60) / 8},${scr.y + 120} ${scr.x + scr.w + 30 - (i + 1) * (scr.w + 60) / 8},${scr.y + 50}`).join(' ')} Z`} fill="#7a1620" stroke="#d9a441" strokeWidth={4} />
    {[scr.x - 75, scr.x + scr.w + 75].map(x => <g key={x}><rect x={x - 42} y={scr.y - 70} width={84} height={scr.h + 140} fill="#eadfc6" /><rect x={x - 54} y={scr.y - 80} width={108} height={36} fill="#c9a24a" /><rect x={x - 54} y={scr.y + scr.h + 40} width={108} height={36} fill="#c9a24a" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${x - 28 + i * 11},${scr.y - 40} L${x - 28 + i * 11},${scr.y + scr.h + 40}`} stroke="#d2c4a4" strokeWidth={3} />)}</g>)}
    <rect x={0} y={scr.y + scr.h + 10} width={FW} height={40} fill="#5a3416" />
    {Array.from({ length: Math.round(scr.w / 110) }, (_, i) => { const x = scr.x + 40 + i * 110; return <g key={i}><ellipse cx={x} cy={scr.y + scr.h + 2} rx={10 + Math.sin(t * 9 + i) * 1.5} ry={17} fill="#ffcf5a" /><ellipse cx={x} cy={scr.y + scr.h} rx={34} ry={34} fill="#ffcf5a" opacity={0.12} /></g>; })}
    {Array.from({ length: Math.ceil(FW / 76) + 1 }, (_, i) => <circle key={i} cx={i * 76 + (i % 2) * 20} cy={FH + 20 - (i % 3) * 8} r={56} fill="#0e0704" />)}
  </g>;
};
const stageFrame = (land: boolean) => { const FW = land ? 1920 : 1080, FH = land ? 1080 : 1920; const scr = land ? { x: 230, y: 150, w: 1460, h: 780 } : { x: 150, y: 330, w: 780, h: 1300 }; return { FW, FH, scr }; };
const Opening: Block = ({ p, t, d, W, H, land, talking, cues }) => {
  const { FW, FH, scr } = stageFrame(land), open = ioCub(win(t, 0.7, 2.6)), push = ioCub(win(t, 2.4, Math.max(3.6, d - 0.2)));
  const zEnd = Math.max(FW / scr.w, FH / scr.h), z = lerp(1, zEnd * 1.02, push), ccx = lerp(FW / 2, scr.x + scr.w / 2, push), ccy = lerp(FH / 2, scr.y + scr.h / 2, push);
  const cam = camOf('wide', t, d, land, 540), inner: Cam = { ...cam, z: cam.z * (land ? scr.w / 1920 : scr.w / 1080) / (land ? scr.w / 1920 : scr.w / 1080) };
  return <svg width={W} height={H} viewBox={`0 0 ${FW} ${FH}`} style={{ position: 'absolute', inset: 0 }}><ScreenDefs />
    <g transform={`translate(${FW / 2} ${FH / 2}) scale(${z}) translate(${-ccx} ${-ccy})`}>
      <Theatre FW={FW} FH={FH} open={open} scr={scr} t={t}>
        <View W={scr.w} H={scr.h} land={land} cam={inner} x={scr.x} y={scr.y} w={scr.w} h={scr.h} fore={(p.setting || 'forest') as Setting} t={t}><SceneArt p={p} t={t} d={d} cam={inner} talking={talking(t)} cues={cues} land={land} /></View>
      </Theatre></g></svg>;
};
const Closing: Block = (props) => { const { t, d } = props; return <Opening {...props} t={Math.max(0, d - t) + 0.0001} d={Math.max(3.6, d)} />; };
const Journey: Block = ({ p, t, d, W, H, land, talking }) => {
  const cast = parse(p.cast || 'rama/walk'), x0 = land ? -500 : -150, x1 = land ? 1500 : 1200, lead = lerp(x0, x1, t / d);
  const cam: Cam = { cx: lead - 140, cy: FEET - 430, z: land ? 1.2 : 1.45 };
  return <View W={W} H={H} land={land} cam={cam} fore={(p.setting || 'forest') as Setting} t={t}><World kind={(p.setting || 'forest') as Setting} cam={cam} t={t} light={lead - 160} />
    {cast.map((m, i) => <PuppetAt key={i} m={{ ...m, action: m.action === 'bound' ? 'bound' : 'walk' }} x={lead - i * 360} t={t} i={i} d={d} talking={talking(t)} />)}
    {cast.some(m => m.action === 'bound') && <path d={`M${lead - 30},${FEET - 380} C${lead - 150},${FEET - 300} ${lead - 250},${FEET - 330} ${lead - 330},${FEET - 400}`} fill="none" stroke="#d9a85a" strokeWidth={10} strokeDasharray="9 6" />}</View>;
};
const Spotlight: Block = ({ p, t, d, W, H, land, talking }) => {
  const m = parse(p.who || 'ravana/angry')[0], tint = p.tint || 'warm', k = win(t, 0, 0.8);
  const cam: Cam = { cx: 540 + 70 * Math.sin(t * 0.35 + 1), cy: FEET - 500 + 20 * Math.sin(t * 0.5), z: (land ? 1.35 : 1.6) + 0.12 * ioCub(t / d) };
  return <View W={W} H={H} land={land} cam={cam} fore={(p.setting || 'palace') as Setting} t={t}><World kind={(p.setting || 'palace') as Setting} cam={cam} t={t} light={540} glow={0.85} />
    <rect x={-3000} y={-2000} width={7000} height={6000} fill={tint === 'red' ? '#3a0806' : '#1a0d05'} opacity={0.35 * k} />
    <path d={`M${540 - 120},-400 L${540 + 120},-400 L${540 + 520},${FEET + 60} L${540 - 520},${FEET + 60} Z`} fill={tint === 'red' ? '#ff8a5a' : '#fff1c8'} opacity={0.22 * k} />
    <ellipse cx={540} cy={FEET + 20} rx={420} ry={60} fill="#fff1c8" opacity={0.25 * k} />
    <PuppetAt m={m} x={540} t={t} i={0} d={d} talking={talking(t)} s={PS * 1.05} />
    {tint === 'red' && <Fx kind="embers" t={t} k={1} />}</View>;
};
const Giant: Block = ({ p, t, d, W, H, land, talking }) => {
  const big = parse(p.who || 'ravana/angry')[0], small = parse(p.small || 'king/pray');
  const k = ioCub(win(t, 0, d)), cam: Cam = { cx: lerp(820, 600, k), cy: lerp(FEET - 200, FEET - 700, k), z: (land ? 1.0 : 1.2) * lerp(1.15, 0.8, k) };
  return <View W={W} H={H} land={land} cam={cam} fore={(p.setting || 'night') as Setting} t={t}><World kind={(p.setting || 'night') as Setting} cam={cam} t={t} light={420} ly={FEET - 900} glow={1.3} />
    <PuppetAt m={big} x={420} t={t} i={0} d={d} talking={talking(t)} s={PS * 2.0} y={FEET + 120} />
    {small.map((m, i) => <g key={i} transform={`translate(${Math.sin(t * 28 + i) * 3} 0)`}><PuppetAt m={m} x={900 + i * 170} t={t} i={i + 1} d={d} talking={false} face={-1} s={PS * 0.42} /></g>)}</View>;
};
const Shadow: Block = ({ p, t, d, W, H, land, talking }) => {
  const m = parse(p.who || 'rishi/stand')[0], form = parse(p.form || 'ravana/angry')[0], k = ioCub(win(t, d * 0.25, d * 0.7));
  const cam: Cam = { cx: lerp(500, 700, ioCub(t / d)), cy: FEET - 540, z: (land ? 1.25 : 1.5) + 0.08 * (t / d) };
  return <View W={W} H={H} land={land} cam={cam} fore={(p.setting || 'forest') as Setting} t={t}><World kind={(p.setting || 'forest') as Setting} cam={cam} t={t} light={640} />
    <g opacity={0.75 * k} style={{ filter: 'blur(6px) brightness(0)' }}><PuppetAt m={form} x={720} t={t} i={1} d={d} talking={false} s={PS * lerp(1, 1.6, k)} y={FEET + 60} /></g>
    <PuppetAt m={m} x={520} t={t} i={0} d={d} talking={talking(t)} /></View>;
};
const Clash: Block = ({ p, t, d, W, H, land, talking }) => {
  const a = parse(p.a || 'rama/attack')[0], b = parse(p.b || 'ravana/attack')[0], hit = (t * 1.2) % 1 > 0.55 && (t * 1.2) % 1 < 0.7;
  const cam: Cam = { cx: 540 + 90 * Math.sin(t * 0.45), cy: FEET - 430, z: (land ? 1.2 : 1.45) + 0.04 * Math.sin(t * 3) + (hit ? 0.03 : 0) };
  return <View W={W} H={H} land={land} cam={cam} fore={(p.setting || 'battle') as Setting} t={t}><World kind={(p.setting || 'battle') as Setting} cam={cam} t={t} light={540} glow={1.2} />
    <PuppetAt m={{ ...a, action: 'attack' }} x={land ? 250 : 330} t={t} i={0} d={d} talking={talking(t)} />
    <PuppetAt m={{ ...b, action: 'attack' }} x={land ? 830 : 750} t={t + 0.4} i={1} d={d} talking={false} face={-1} />
    {hit && <g transform={`translate(540 ${FEET - 520})`}>{Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i * 30})`} d="M0,-30 L12,-150 L-12,-150 Z" fill={T.gold} stroke={T.line} strokeWidth={3} />)}<circle r={50} fill="#fff6d8" /></g>}
    <Fx kind="embers" t={t} k={1} /></View>;
};
const Rank: Block = ({ p, t, d, W, H, land, talking, cues, seed }) => {
  const ms = [parse(p.a || 'ravana/stand')[0], parse(p.b || 'sahasrabahu/stand')[0], parse(p.c || 'parashurama/stand')[0]];
  const xs = [80, 540, 1000], ys = [FEET, FEET - 170, FEET - 340], sc = [0.66, 0.74, 0.82], on = ms.map((_, i) => win(t, cue(cues, i, 0.4 + i * d * 0.25) - 0.2, cue(cues, i, 0.4 + i * d * 0.25) + 0.4));
  const cam: Cam = { cx: 540 + (seed % 2 ? 1 : -1) * lerp(-80, 80, ioCub(t / d)), cy: FEET - 560, z: (land ? 0.92 : 1.2) + 0.05 * (t / d) };
  return <View W={W} H={H} land={land} cam={cam} fore={(p.setting || 'palace') as Setting} t={t}>
    <World kind={(p.setting || 'palace') as Setting} cam={cam} t={t} light={lerp(80, 1000, Math.max(...on.map((o, i) => o * i)) / 2)} ly={FEET - 700} glow={1.1} />
    <rect x={-3000} y={-2000} width={7000} height={6000} fill="#120804" opacity={0.35} />
    {xs.map((x, i) => <g key={i} {...S}><rect x={x - 230} y={ys[i]} width={460} height={FEET + 400 - ys[i]} fill={i === 2 ? '#7a4a1e' : '#6b4422'} /><path d={`M${x - 230},${ys[i]} L${x + 230},${ys[i]}`} stroke={T.gold} strokeWidth={10} /><Holes a={[x - 200, ys[i] + 26]} b={[x + 200, ys[i] + 26]} n={12} r={4} /></g>)}
    {ms.map((m, i) => <g key={i} opacity={0.25 + 0.75 * on[i]}><ellipse cx={xs[i]} cy={ys[i] - 360} rx={260} ry={420} fill="#ffd46a" opacity={0.16 * on[i]} />
      <PuppetAt m={m} x={xs[i]} y={ys[i] - 4} t={t} i={i} d={d} talking={talking(t)} s={PS * sc[i]} face={i === 2 ? -1 : 1} /></g>)}
  </View>;
};
const Over: React.FC<{ t: number; W: number; H: number }> = ({ t, W, H }) => <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
  <defs><radialGradient id="th-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#1a0a02" stopOpacity="0.7" /></radialGradient>
    <filter id="th-grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed={Math.floor(t * 12) % 50} /><feColorMatrix values="0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .1 0" /></filter></defs>
  <rect width={W} height={H} fill="#ffb347" opacity={0.03 + 0.03 * Math.sin(t * 7.3) * Math.sin(t * 3.1)} />
  {Array.from({ length: 26 }, (_, i) => { const q = (t * 0.05 + rnd(i, 9)) % 1; return <circle key={i} cx={(rnd(i, 10) * W + Math.sin(t * 0.7 + i) * 30)} cy={H * (1 - q)} r={1.5 + rnd(i, 11) * 2.5} fill="#fff2cc" opacity={0.5 * Math.sin(q * Math.PI)} />; })}
  <rect width={W} height={H} fill="url(#th-vig)" /><rect width={W} height={H} filter="url(#th-grain)" />
</svg>;

export const tholu: Template = { Over, transition: 'fade', bg: '#24130a', blocks: { opening: Opening, scene: SceneB, journey: Journey, spotlight: Spotlight, giant: Giant, shadow: Shadow, clash: Clash, closing: Closing, rank: Rank } };
export const THOLU_SETTINGS = SETTINGS;
