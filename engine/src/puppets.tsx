// THOLU PUPPETS — Andhra leather shadow-puppet look (tholu bommalata), drawn as flat SVG.
// Rules of the look: profile heads facing right with one big frontal almond eye; tall gold kiritam crowns; flat dyed-leather
// colours (turmeric, vermilion, leaf green, indigo-black, blue-green skin for Rama); dark brown outline; rows of punched
// holes that let lamp-light through; visible joint pins at shoulder/elbow/hip/knee; thin bamboo control rods.
// Coordinates: feet at (0,0), puppet ≈ 800 units tall, facing +x. Scale/flip with a parent <g>.
import React from 'react';

export const T = {
  line: '#2a1608', hole: '#fff3cf',
  red: '#b8322a', redD: '#86201a', maroon: '#6e1c16', ochre: '#e2a32b', ochreD: '#b97d18', green: '#3f7f3a', greenD: '#2c5e28',
  black: '#1d1a18', indigo: '#2b3a6b', white: '#efe3c4', gold: '#e8b33a', goldD: '#b88316', saffron: '#e0731f',
  skinRama: '#3f8f8a', skinRamaD: '#2e6f6a', skinGold: '#e2a85a', skinGoldD: '#c08540', skinRed: '#a8432c', skinRedD: '#86321f',
  skinFair: '#ecb867', skinFairD: '#cf9748', skinMonkey: '#e9dcbc', skinMonkeyD: '#cbbb92', rod: '#4a2f17',
  screen: '#f6dcae', screenD: '#c88a3e',
};
const LW = 4;
const rad = (d: number) => (d * Math.PI) / 180;
type P = [number, number];
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const dirOf = (a: number, len: number): P => [Math.sin(rad(a)) * len, Math.cos(rad(a)) * len]; // a: 0 = down, +90 = forward (+x)

// rows of punched holes
export const Holes: React.FC<{ a: P; b: P; n: number; r?: number }> = ({ a, b, n, r = 3.4 }) => <g>{Array.from({ length: n }, (_, i) => {
  const k = n === 1 ? 0.5 : i / (n - 1); return <circle key={i} cx={a[0] + (b[0] - a[0]) * k} cy={a[1] + (b[1] - a[1]) * k} r={r} fill={T.hole} />; })}</g>;
const ArcHoles: React.FC<{ c: P; rx: number; ry: number; a0: number; a1: number; n: number; r?: number }> = ({ c, rx, ry, a0, a1, n, r = 3.4 }) => <g>{Array.from({ length: n }, (_, i) => {
  const a = rad(a0 + (a1 - a0) * (i / Math.max(1, n - 1))); return <circle key={i} cx={c[0] + Math.cos(a) * rx} cy={c[1] + Math.sin(a) * ry} r={r} fill={T.hole} />; })}</g>;
const Pin: React.FC<{ p: P }> = ({ p }) => <g><circle cx={p[0]} cy={p[1]} r={7} fill={T.black} /><circle cx={p[0]} cy={p[1]} r={2.6} fill={T.hole} /></g>;

// tapered leather limb between two points, with an armlet/anklet band
const Limb: React.FC<{ a: P; b: P; w1: number; w2: number; fill: string; band?: string; holes?: boolean }> = ({ a, b, w1, w2, fill, band, holes = true }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const pts: P[] = [[a[0] + nx * w1 / 2, a[1] + ny * w1 / 2], [b[0] + nx * w2 / 2, b[1] + ny * w2 / 2], [b[0] - nx * w2 / 2, b[1] - ny * w2 / 2], [a[0] - nx * w1 / 2, a[1] - ny * w1 / 2]];
  const m: P = [a[0] + dx * 0.22, a[1] + dy * 0.22], wm = w1 + (w2 - w1) * 0.22;
  return <g>
    <path d={`M${pts.map(p => p.join(',')).join(' L')} Z`} fill={fill} stroke={T.line} strokeWidth={LW} strokeLinejoin="round" />
    {band && <path d={`M${m[0] + nx * wm / 2},${m[1] + ny * wm / 2} L${m[0] - nx * wm / 2},${m[1] - ny * wm / 2}`} stroke={band} strokeWidth={12} />}
    {holes && <Holes a={[a[0] + dx * 0.35, a[1] + dy * 0.35]} b={[a[0] + dx * 0.8, a[1] + dy * 0.8]} n={Math.max(2, Math.round(L / 30))} r={2.6} />}
  </g>;
};

// ---- heads (profile, facing right; centre 0,0 ≈ cheek; head ≈ 120 tall) -----------------------------------------------
export type HeadKind = 'hero' | 'woman' | 'demon' | 'monkey' | 'rishi' | 'rakshasa';
const Face: React.FC<{ kind: HeadKind; skin: string; skinD: string; crown: 'kiritam' | 'small' | 'jata' | 'none' | 'pearl'; talk?: number; blink?: boolean; beard?: string }> = ({ beard, kind, skin, skinD, crown, talk = 0, blink }) => {
  const st = { stroke: T.line, strokeWidth: LW, strokeLinejoin: 'round' as const };
  const face = kind === 'monkey'
    ? `M-46,-50 C-20,-74 22,-66 38,-40 C52,-30 74,-20 78,0 C80,16 66,${26 + talk * 10} 46,${26 + talk * 10} L40,34 C36,48 16,58 -8,56 C-38,54 -54,30 -54,0 Z`
    : kind === 'woman'
      ? `M-44,-52 C-14,-70 26,-62 36,-36 L42,-12 L56,4 L42,10 L44,18 L38,${22 + talk * 6} L40,30 C30,46 10,52 -8,50 C-34,48 -50,28 -50,0 Z`
      : kind === 'rakshasa'
        ? `M-50,-58 C-16,-80 30,-72 44,-40 L50,-30 L48,-14 L66,6 L50,14 L60,22 L58,${30 + talk * 10} L46,${34 + talk * 10} L50,44 C38,62 12,68 -12,64 C-42,60 -58,34 -58,0 Z`
        : `M-46,-54 C-14,-74 28,-66 38,-38 L46,-12 L62,6 L46,12 L48,22 L40,${28 + talk * 8} L42,36 C30,52 10,58 -10,56 C-38,54 -54,30 -54,0 Z`;
  const rk = kind === 'rakshasa';
  const eye = rk ? (blink ? <path d="M2,-16 Q22,-6 42,-16" stroke={T.line} strokeWidth={5} fill="none" />
    : <g><path d="M0,-16 Q22,-36 46,-16 Q22,2 0,-16 Z" fill="#f3e2c0" stroke={T.line} strokeWidth={3} /><circle cx={24} cy={-16} r={9} fill="#c8221a" stroke={T.line} strokeWidth={2} /><circle cx={24} cy={-16} r={3.6} fill={T.black} />
      <path d="M46,-16 L60,-24" stroke={T.line} strokeWidth={3} /></g>)
    : blink ? <path d="M6,-14 Q22,-8 36,-14" stroke={T.line} strokeWidth={4} fill="none" />
    : <g><path d="M4,-14 Q20,-28 38,-14 Q20,-2 4,-14 Z" fill={T.white} stroke={T.line} strokeWidth={3} /><circle cx={22} cy={-14} r={5.5} fill={T.black} /><path d="M38,-14 L52,-20" stroke={T.line} strokeWidth={3} /><path d="M2,-24 Q22,-40 42,-26" stroke={T.black} strokeWidth={5} fill="none" strokeLinecap="round" /></g>;
  return <g>
    {/* hair falling behind */}
    {kind !== 'monkey' && crown !== 'jata' && <path d={kind === 'woman' ? 'M-40,-40 C-80,-10 -90,60 -70,120 C-50,140 -30,120 -30,90 C-36,40 -30,0 -20,-20 Z' : 'M-44,-40 C-80,-10 -84,50 -66,96 C-50,108 -36,90 -36,70 C-40,30 -34,0 -24,-20 Z'} fill={T.black} {...st} />}
    {kind === 'woman' && <g><circle cx={-64} cy={-40} r={26} fill={T.black} {...st} /><ArcHoles c={[-64, -40]} rx={18} ry={18} a0={0} a1={330} n={9} r={3} /><circle cx={-88} cy={-58} r={9} fill={T.white} stroke={T.line} strokeWidth={3} /></g>}
    <path d={face} fill={skin} {...st} />
    <path d="M-54,0 C-54,30 -38,54 -10,56 C-30,40 -40,20 -40,-10 Z" fill={skinD} opacity={0.6} />
    {eye}
    {/* ear + big earring disc */}
    <ellipse cx={-22} cy={4} rx={9} ry={14} fill={skinD} stroke={T.line} strokeWidth={3} />
    {kind !== 'monkey' && <g><circle cx={-22} cy={34} r={14} fill={T.gold} stroke={T.line} strokeWidth={3} /><circle cx={-22} cy={34} r={4} fill={T.hole} /></g>}
    {kind === 'hero' && <path d="M32,30 C22,24 10,26 2,34 C12,32 22,34 30,38 Z" fill={T.black} />}
    {rk && <g>
      <path d="M-4,-34 Q24,-52 52,-34 L50,-28 Q24,-42 -2,-28 Z" fill={T.black} />
      <path d="M8,-58 C24,-62 38,-56 44,-44" stroke="#8fb0d4" strokeWidth={5} fill="none" opacity={0.55} strokeLinecap="round" /><path d="M-40,8 C-38,24 -30,34 -20,40" stroke="#8fb0d4" strokeWidth={4} fill="none" opacity={0.4} strokeLinecap="round" />
      <path d={`M60,22 C46,${18 + talk * 4} 30,20 20,26 C30,${32 + talk * 8} 46,${34 + talk * 10} 58,${30 + talk * 10} Z`} fill="#7a1e16" stroke={T.line} strokeWidth={2.5} />
      <path d="M48,12 C30,4 8,8 -6,22 C10,16 24,18 34,24 C40,16 46,18 48,12 Z" fill={T.black} /><path d="M-6,22 C-16,30 -18,44 -10,52" stroke={T.black} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M52,24 L64,-12 L40,22 Z" fill="#f6efdc" stroke={T.line} strokeWidth={2.5} /><path d={`M46,${34 + talk * 10} L56,${70 + talk * 10} L36,${34 + talk * 10} Z`} fill="#f6efdc" stroke={T.line} strokeWidth={2.5} />
      <path d="M-10,58 C6,74 30,72 44,58" stroke={T.black} strokeWidth={5} fill="none" /></g>}
    {kind === 'demon' && <g><path d="M38,32 C24,22 0,22 -12,36 C-2,30 12,32 20,40 C28,34 34,38 38,32 Z" fill={T.black} /><path d="M40,34 L46,50 L36,40 Z" fill={T.white} stroke={T.line} strokeWidth={2} /><path d="M2,-28 L40,-34" stroke={T.black} strokeWidth={8} strokeLinecap="round" /></g>}
    {kind === 'woman' && <g><circle cx={50} cy={10} r={6} fill="none" stroke={T.gold} strokeWidth={3} /><circle cx={10} cy={-46} r={5} fill={T.red} /></g>}
    {kind === 'rishi' && <path d={`M40,30 C40,70 20,130 -6,150 C-20,120 -40,80 -46,30 C-30,48 0,52 40,30 Z`} fill={beard ?? T.white} {...st} />}
    {kind === 'monkey' && <g><path d="M30,-30 C50,-30 70,-14 76,0 C60,4 40,-6 30,-30 Z" fill={T.red} /><path d="M-30,-56 C-40,-90 -10,-96 0,-70" fill={skin} {...st} /></g>}
    {/* tilak */}
    {kind !== 'monkey' && kind !== 'woman' && !rk && <path d="M12,-58 L12,-38" stroke={kind === 'rishi' ? T.white : T.red} strokeWidth={6} strokeLinecap="round" />}
    {/* crowns */}
    {crown === 'kiritam' && <g {...st}>
      <path d="M-66,-60 C-90,-90 -84,-130 -60,-150 C-62,-120 -54,-96 -36,-78 Z" fill={T.red} />
      <path d="M-50,-50 L44,-50 L36,-84 L24,-120 L10,-170 L0,-230 L-12,-170 L-26,-120 L-38,-84 Z" fill={T.gold} />
      <path d="M-50,-50 L44,-50 L40,-68 L-46,-68 Z" fill={T.red} />
      <path d="M-38,-84 L36,-84 M-26,-120 L24,-120 M-12,-170 L10,-170" stroke={T.goldD} strokeWidth={6} />
      <Holes a={[-40, -59]} b={[36, -59]} n={9} r={3} /><Holes a={[-30, -100]} b={[26, -100]} n={6} r={3} /><Holes a={[-18, -145]} b={[14, -145]} n={4} r={3} />
      <circle cx={0} cy={-236} r={10} fill={T.green} /><circle cx={-4} cy={-100} r={7} fill={T.green} />
    </g>}
    {crown === 'pearl' && <g {...st}>
      <path d="M-70,-62 C-96,-96 -88,-140 -62,-160 C-64,-128 -56,-100 -38,-82 Z" fill={T.gold} />
      <path d="M-56,-52 L50,-52 L44,-90 L30,-130 L14,-182 L0,-246 L-14,-182 L-30,-130 L-44,-90 Z" fill={T.gold} />
      <path d="M-56,-52 L50,-52 L46,-72 L-52,-72 Z" fill={T.goldD} />
      {Array.from({ length: 7 }, (_, r) => { const y = -84 - r * 24, hw = 44 - r * 6.2; const n = Math.max(1, Math.round(hw / 9)); return Array.from({ length: n }, (_, i) => <circle key={`${r}${i}`} cx={-hw + (i + 0.5) * (2 * hw / n) + (r % 2) * 4} cy={y} r={4.2} fill="#fbf6ea" stroke={T.line} strokeWidth={1.5} />); })}
      {Array.from({ length: 6 }, (_, r) => <path key={`n${r}`} d={`M${-40 + r * 3},${-96 - r * 24} L${36 - r * 3},${-96 - r * 24}`} stroke="#fbf6ea" strokeWidth={1.5} opacity={0.7} />)}
      {[-48, -30, -12, 6, 24, 40].map((x, i) => <g key={i}><path d={`M${x},-52 L${x},${-44 + (i % 2) * 5}`} stroke="#fbf6ea" strokeWidth={2} /><circle cx={x} cy={-42 + (i % 2) * 5} r={4.5} fill="#fbf6ea" stroke={T.line} strokeWidth={1.5} /></g>)}
      <circle cx={0} cy={-252} r={11} fill="#3a6fb0" /><circle cx={-4} cy={-62} r={8} fill={T.red} /><circle cx={-30} cy={-62} r={6} fill="#3a6fb0" /><circle cx={22} cy={-62} r={6} fill="#3a6fb0" /></g>}
    {crown === 'small' && <g {...st}><path d="M-46,-50 L38,-50 L30,-80 L14,-96 L0,-130 L-14,-96 L-30,-80 Z" fill={T.gold} /><Holes a={[-34, -62]} b={[28, -62]} n={7} r={3} /><circle cx={0} cy={-104} r={6} fill={T.red} /></g>}
    {crown === 'jata' && <g {...st}><path d="M-50,-46 C-60,-96 -30,-120 -4,-118 C24,-116 44,-90 36,-46 C10,-60 -24,-60 -50,-46 Z" fill={T.black} /><ellipse cx={-8} cy={-142} rx={30} ry={32} fill={T.black} /><ArcHoles c={[-8, -142]} rx={20} ry={22} a0={0} a1={330} n={10} r={3} /></g>}
  </g>;
};

// ---- the puppet --------------------------------------------------------------------------------------------------------
export type Pose = { armF?: [number, number]; armB?: [number, number]; legF?: number; legB?: number; tilt?: number };
export type PuppetSpec = {
  head: HeadKind; crown: 'kiritam' | 'small' | 'jata' | 'none' | 'pearl'; skin: string; skinD: string;
  top: string; bottom: string; border: string; sash?: string; skirt?: 'dhoti' | 'sari' | 'robe';
  heads?: number; arms?: number; prop?: 'bow' | 'mace' | 'sword' | 'kamandal' | 'lotus' | 'stylus' | 'axe' | 'chakra' | 'tulsidal' | 'lota' | 'vajra' | 'none'; beard?: string; sideHeads?: boolean; tail?: boolean; size?: number; scars?: boolean; crownKind?: 'pearl';
};
const Prop: React.FC<{ kind: PuppetSpec['prop']; at: P; a: number }> = ({ kind, at, a }) => {
  const st = { stroke: T.line, strokeWidth: LW, strokeLinejoin: 'round' as const };
  const r = `translate(${at[0]} ${at[1]}) rotate(${-a})`;
  if (kind === 'bow') return <g transform={`translate(${at[0]} ${at[1]})`} {...st}><path d="M14,-190 C80,-120 80,120 14,190" fill="none" stroke={T.ochreD} strokeWidth={14} /><path d="M14,-190 C80,-120 80,120 14,190" fill="none" stroke={T.ochre} strokeWidth={7} /><path d="M14,-190 L14,190" stroke={T.line} strokeWidth={2} /></g>;
  if (kind === 'mace') return <g transform={r} {...st}><rect x={-7} y={-10} width={14} height={170} fill={T.goldD} /><circle cx={0} cy={180} r={40} fill={T.gold} /><ArcHoles c={[0, 180]} rx={26} ry={26} a0={0} a1={330} n={10} r={3.4} /><circle cx={0} cy={226} r={8} fill={T.gold} /></g>;
  if (kind === 'sword') return <g transform={r} {...st}><rect x={-14} y={-8} width={28} height={14} fill={T.gold} /><path d="M-8,6 L-8,150 C-8,170 18,180 22,160 L8,6 Z" fill={T.white} /><Holes a={[0, 30]} b={[2, 130]} n={5} r={2.4} /></g>;
  if (kind === 'axe') return <g transform={r} {...st}><rect x={-8} y={-60} width={16} height={280} rx={6} fill="#8a5a2e" /><Holes a={[0, -40]} b={[0, 190]} n={7} r={3} />
    <path d="M6,150 C70,140 110,170 112,220 C80,206 40,214 6,236 Z" fill={T.white} /><path d="M6,150 C-20,160 -26,200 6,236" fill={T.goldD} /><Holes a={[40, 180]} b={[90, 205]} n={3} r={3.4} /></g>;
  if (kind === 'chakra') return <g transform={`translate(${at[0]} ${at[1] - 70}) rotate(${(at[0] * 7) % 360})`} {...st}><circle r={48} fill={T.gold} /><circle r={30} fill={T.ochre} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i * 30})`} d="M0,-48 L8,-62 L0,-76 L-8,-62 Z" fill={T.gold} />)}<circle r={9} fill={T.red} /><Holes a={[-36, 0]} b={[36, 0]} n={6} r={3} /></g>;
  if (kind === 'kamandal') return <g transform={`translate(${at[0]} ${at[1] + 30})`} {...st}><path d="M-34,0 C-46,60 46,60 34,0 Z" fill={T.red} /><path d="M-22,0 C-22,-40 22,-40 22,0" fill="none" strokeWidth={6} /><Holes a={[-24, 20]} b={[24, 20]} n={5} r={3} /></g>;
  if (kind === 'stylus') return <g transform={r}><path d="M0,-6 L0,96" stroke={T.line} strokeWidth={9} strokeLinecap="round" /><path d="M0,-6 L0,90" stroke={T.ochre} strokeWidth={4} strokeLinecap="round" /><path d="M-8,-6 L0,-40 L8,-6 Z" fill={T.green} stroke={T.line} strokeWidth={2} /></g>;
  if (kind === 'tulsidal') return <g transform={`translate(${at[0]} ${at[1]})`} {...st}><path d="M0,0 C4,-40 2,-80 -4,-110" fill="none" stroke={T.greenD} strokeWidth={6} />
    {[[-20, -40, -30], [18, -56, 30], [-18, -78, -35], [14, -96, 35], [0, -118, 0]].map(([x, y, r], i) => <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0,-18 C14,-10 14,10 0,18 C-14,10 -14,-10 0,-18 Z" fill={i % 2 ? T.green : '#5a9a3a'} strokeWidth={3} />)}
    <circle cx={-4} cy={-128} r={6} fill="#8a3a6a" strokeWidth={2} /></g>;
  if (kind === 'lota') return <g transform={`translate(${at[0]} ${at[1] + 16})`} {...st}><path d="M-16,-26 L16,-26 L12,-12 C44,-6 46,36 0,44 C-46,36 -44,-6 -12,-12 Z" fill={T.gold} /><path d="M-30,10 L30,10" stroke={T.goldD} strokeWidth={5} /><Holes a={[-22, 22]} b={[22, 22]} n={5} r={3} /></g>;
  if (kind === 'vajra') return <g transform={r} {...st}><rect x={-8} y={0} width={16} height={60} fill={T.goldD} /><path d="M0,60 C-30,80 -30,120 0,150 C30,120 30,80 0,60 Z" fill={T.gold} /><path d="M0,0 C-30,-20 -30,-60 0,-90 C30,-60 30,-20 0,0 Z" fill={T.gold} /><path d="M0,150 L0,170 M0,-90 L0,-110" strokeWidth={6} /><circle cx={0} cy={30} r={8} fill={T.red} /></g>;
  if (kind === 'lotus') return <g transform={`translate(${at[0]} ${at[1]})`} {...st}>{[-40, -15, 15, 40].map(d => <path key={d} transform={`rotate(${d})`} d="M0,0 C-14,-30 -10,-56 0,-70 C10,-56 14,-30 0,0 Z" fill="#e2557a" />)}</g>;
  return null;
};

export const Puppet: React.FC<{ spec: PuppetSpec; pose?: Pose; talk?: number; blink?: boolean; rods?: boolean; t?: number; bound?: number; sit?: boolean }> = ({ spec, pose = {}, talk = 0, blink, rods = true, t = 0, bound = 0, sit = false }) => {
  const s = spec, st = { stroke: T.line, strokeWidth: LW, strokeLinejoin: 'round' as const };
  const [aF, bF] = pose.armF ?? [30, 60], [aB, bB] = pose.armB ?? [-20, -30], legF = pose.legF ?? 16, legB = pose.legB ?? -10;
  const shF: P = [46, -520], shB: P = [-50, -526], hipF: P = [18, -250], hipB: P = [-22, -250];
  const elF = add(shF, dirOf(aF, 120)), haF = add(elF, dirOf(aF + bF, 110)), elB = add(shB, dirOf(aB, 120)), haB = add(elB, dirOf(aB + bB, 110));
  const knF = add(hipF, dirOf(legF, 130)), ftF = add(knF, dirOf(legF * 0.3, 120)), knB = add(hipB, dirOf(legB, 130)), ftB = add(knB, dirOf(legB * 0.3, 120));
  const skirt = s.skirt ?? 'dhoti', long = skirt !== 'dhoti';
  const extraArms = Math.max(0, (s.arms ?? 2) - 2);
  // seated (cross-legged): the whole figure drops so the hips rest on the ground, legs become a folded lap
  return <g transform={`translate(0 ${sit ? 240 : 0}) rotate(${pose.tilt ?? 0} 0 -300)`}>
    {rods && <g opacity={0.55}><path d={`M0,-1700 L-2,-640`} stroke={T.rod} strokeWidth={6} /><path d={`M${haF[0]},${haF[1]} L${haF[0] + 160},${haF[1] + 900}`} stroke={T.rod} strokeWidth={3} /><path d={`M${haB[0]},${haB[1]} L${haB[0] - 120},${haB[1] + 900}`} stroke={T.rod} strokeWidth={3} /></g>}
    {s.tail && <g {...st}><path d="M-40,-280 C-160,-260 -200,-420 -150,-560 C-120,-640 -60,-640 -70,-590 C-130,-560 -140,-420 -60,-330 Z" fill={s.skin} /><Holes a={[-140, -470]} b={[-80, -330]} n={6} /></g>}
    {/* the many arms fan out behind (Ravana) */}
    {extraArms > 0 && Array.from({ length: extraArms }, (_, i) => { const k = i / Math.max(1, extraArms - 1), a = -150 + k * 300 + 6 * Math.sin(t * 2 + i), o: P = [0, -500], e = add(o, dirOf(a, 150)), h = add(e, dirOf(a + 25, 120));
      return <g key={i}><Limb a={o} b={e} w1={34} w2={28} fill={i % 2 ? s.skin : s.skinD} band={T.gold} holes={false} /><Limb a={e} b={h} w1={28} w2={22} fill={s.skin} holes={false} />
        <circle cx={h[0]} cy={h[1]} r={14} fill={s.skin} stroke={T.line} strokeWidth={3} />
        {i % 4 === 0 && <path d={`M${h[0]},${h[1]} l${Math.sin(rad(a)) * 70},${Math.cos(rad(a)) * 70}`} stroke={T.white} strokeWidth={10} strokeLinecap="round" />}
        {i % 4 === 2 && <circle cx={h[0] + Math.sin(rad(a)) * 30} cy={h[1] + Math.cos(rad(a)) * 30} r={22} fill={T.gold} stroke={T.line} strokeWidth={3} />}</g>; })}
    {/* back arm */}
    <Limb a={shB} b={elB} w1={40} w2={32} fill={s.skinD} band={T.gold} /><Limb a={elB} b={haB} w1={32} w2={24} fill={s.skinD} />
    <circle cx={haB[0]} cy={haB[1]} r={16} fill={s.skinD} stroke={T.line} strokeWidth={3} /><Pin p={elB} />
    {s.prop === 'bow' && <Prop kind="bow" at={haB} a={0} />}
    {/* back leg */}
    {sit && <g {...st}><path d="M-86,-362 L58,-352 C150,-336 214,-300 222,-262 C226,-236 196,-232 160,-232 L-96,-232 C-118,-262 -108,-330 -86,-362 Z" fill={s.bottom} />
      <path d="M-96,-246 L196,-246" stroke={s.border} strokeWidth={12} /><Holes a={[-80, -246]} b={[180, -246]} n={11} /><Holes a={[-40, -320]} b={[140, -290]} n={6} />
      <path d="M150,-262 L236,-258 L232,-240 L150,-240 Z" fill={s.skin} /><Pin p={[20, -300]} /></g>}
    {!long && !sit && <g><Limb a={hipB} b={knB} w1={46} w2={36} fill={s.skinD} /><Limb a={knB} b={ftB} w1={36} w2={28} fill={s.skinD} band={T.gold} />
      <path d={`M${ftB[0] - 16},${ftB[1] - 6} L${ftB[0] + 46},${ftB[1] + 2} L${ftB[0] - 14},${ftB[1] + 12} Z`} fill={s.skinD} {...st} /><Pin p={knB} /></g>}
    {/* front leg */}
    {!long && !sit && <g><Limb a={hipF} b={knF} w1={48} w2={38} fill={s.skin} /><Limb a={knF} b={ftF} w1={38} w2={30} fill={s.skin} band={T.gold} />
      <path d={`M${ftF[0] - 16},${ftF[1] - 6} L${ftF[0] + 50},${ftF[1] + 2} L${ftF[0] - 14},${ftF[1] + 12} Z`} fill={s.skin} {...st} /><Pin p={knF} /></g>}
    {long && !sit && <g {...st}><path d="M-14,-6 L40,0 L-12,10 Z" fill={s.skin} /><path d="M24,-8 L74,0 L24,8 Z" fill={s.skinD} /></g>}
    {/* lower garment */}
    {skirt === 'dhoti' && !sit && <g {...st}><path d="M-64,-350 L52,-350 L80,-210 C40,-196 20,-214 0,-200 C-20,-214 -50,-196 -80,-212 Z" fill={s.bottom} />
      <path d="M-80,-212 C-50,-196 -20,-214 0,-200 C20,-214 40,-196 80,-210" fill="none" stroke={s.border} strokeWidth={12} />
      <path d="M10,-340 L30,-150 L10,-130 L0,-200 Z" fill={s.border} /><Holes a={[-50, -320]} b={[-60, -240]} n={4} /><Holes a={[40, -320]} b={[58, -240]} n={4} /></g>}
    {long && !sit && <g {...st}><path d={`M-62,-350 L54,-350 C70,-250 90,-110 96,-14 L-90,-14 C-80,-110 -74,-250 -62,-350 Z`} fill={s.bottom} />
      <path d="M-90,-30 L96,-30" stroke={s.border} strokeWidth={16} /><Holes a={[-80, -30]} b={[86, -30]} n={11} />
      <path d="M-20,-340 L-34,-30 M14,-340 L22,-30" stroke={s.border} strokeWidth={6} /><Holes a={[-50, -300]} b={[-80, -80]} n={6} /></g>}
    {/* torso: broad chest (3/4 view) */}
    <path d="M-72,-532 C-20,-546 30,-546 60,-530 L58,-440 L38,-350 L-44,-350 L-62,-440 Z" fill={skirt === 'sari' ? s.skin : s.skin} {...st} />
    <path d="M-72,-532 L-62,-440 L-44,-350 L-20,-350 C-34,-420 -40,-480 -40,-540 Z" fill={s.skinD} opacity={0.7} />
    {skirt === 'sari' && <g {...st}><path d="M-60,-530 L50,-534 L56,-470 L-58,-468 Z" fill={s.top} /><path d="M54,-350 L20,-350 L-70,-528 L-36,-540 Z" fill={s.bottom} /><path d="M40,-350 L-52,-534" stroke={s.border} strokeWidth={10} /></g>}
    {skirt === 'robe' && <g {...st}><path d="M-60,-530 L-20,-540 L58,-360 L38,-350 L-44,-350 Z" fill={s.top} /><Holes a={[-30, -500]} b={[30, -380]} n={6} /></g>}
    {/* sacred thread / necklaces / sash */}
    {skirt === 'dhoti' && <path d="M-60,-528 C-30,-460 10,-400 40,-352" stroke={T.white} strokeWidth={5} fill="none" />}
    <ArcHoles c={[-6, -536]} rx={44} ry={36} a0={20} a1={160} n={9} r={4} />
    <path d="M-50,-528 C-40,-490 30,-490 44,-528" stroke={T.gold} strokeWidth={8} fill="none" />
    <rect x={-50} y={-368} width={92} height={22} rx={6} fill={s.sash ?? T.gold} {...st} /><Holes a={[-40, -357]} b={[34, -357]} n={7} r={3} />
    {s.scars && <g fill="none" strokeLinecap="round">
      {[[-40, -510, 30, -420], [-24, -520, 44, -440], [-54, -470, 6, -392]].map(([x1, y1, x2, y2], i) => <g key={i}><path d={`M${x1},${y1} C${x1 + 30},${y1 + 30} ${x2 - 20},${y2 - 20} ${x2},${y2}`} stroke="#d9c7a2" strokeWidth={7} /><path d={`M${x1},${y1} C${x1 + 30},${y1 + 30} ${x2 - 20},${y2 - 20} ${x2},${y2}`} stroke="#7a2a1e" strokeWidth={2.5} />
        {[0.25, 0.5, 0.75].map(k => { const x = x1 + (x2 - x1) * k, y = y1 + (y2 - y1) * k; return <path key={k} d={`M${x - 8},${y + 6} L${x + 8},${y - 6}`} stroke="#d9c7a2" strokeWidth={3} />; })}</g>)}
      <path d="M8,-505 L22,-488 L12,-478 L28,-458 L18,-448 L34,-430" stroke="#e8e0c8" strokeWidth={6} /><path d="M8,-505 L22,-488 L12,-478 L28,-458 L18,-448 L34,-430" stroke="#5a7aa8" strokeWidth={2} /></g>}
    <Pin p={hipF} /><Pin p={hipB} />
    {/* heads (Ravana: a pyramid of heads) */}
    {(s.heads ?? 1) > 1 && (() => { const rows = [4, 3, 2], out: React.ReactNode[] = []; let n = (s.heads ?? 1) - 1;
      rows.forEach((cnt, r) => { const c = Math.min(cnt, n); n -= c; for (let i = 0; i < c; i++) { const x = (i - (c - 1) / 2) * 84 - 6, y = -735 - r * 82;
        out.push(<g key={`${r}${i}`} transform={`translate(${x} ${y}) scale(${0.8 - r * 0.06})`}><Face kind={s.head} skin={i % 2 ? s.skinD : s.skin} skinD={s.skinD} crown="small" talk={talk * 0.6} blink={blink} /></g>); } });
      return <g>{out.reverse()}</g>; })()}
    <path d="M-16,-546 L16,-546 L14,-580 L-14,-580 Z" fill={s.skinD} {...st} />
    {s.sideHeads && [-1, 1].map(sd => <g key={sd} transform={`translate(${sd * 74} -640) scale(${sd * 0.8} 0.8)`}><Face kind={s.head} skin={s.skinD} skinD={s.skinD} crown="small" talk={talk * 0.5} blink={blink} beard={s.beard} /></g>)}
    <g transform="translate(0 -620)"><Face kind={s.head} beard={s.beard} skin={s.skin} skinD={s.skinD} crown={(s.heads ?? 1) > 1 && s.crown !== 'pearl' ? 'small' : s.crown} talk={talk} blink={blink} /></g>
    {/* front arm */}
    <Limb a={shF} b={elF} w1={42} w2={34} fill={s.skin} band={T.gold} /><Limb a={elF} b={haF} w1={34} w2={26} fill={s.skin} />
    <g {...st}><ellipse cx={haF[0]} cy={haF[1]} rx={18} ry={22} fill={s.skin} /><path d={`M${haF[0] + 10},${haF[1] - 16} l18,-26`} stroke={T.line} strokeWidth={4} /></g>
    {s.scars && (() => { const m = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], c = m(shF, elF, 0.45), v = m(shF, elF, 0.2);
      return <g fill="none" strokeLinecap="round"><circle cx={c[0]} cy={c[1]} r={15} stroke="#e8e0c8" strokeWidth={5} strokeDasharray="5 4" /><circle cx={c[0]} cy={c[1]} r={7} stroke="#7a2a1e" strokeWidth={2} />
        <path d={`M${v[0] - 14},${v[1] - 10} l10,8 l-6,6 l12,10`} stroke="#e8e0c8" strokeWidth={5} /><path d={`M${m(shF, elF, 0.7)[0] - 12},${m(shF, elF, 0.7)[1] - 6} l24,12`} stroke="#d9c7a2" strokeWidth={6} /></g>; })()}
    <Pin p={shF} /><Pin p={elF} /><Pin p={shB} />
    {s.prop && s.prop !== 'bow' && bound <= 0 && <Prop kind={s.prop} at={haF} a={aF + bF} />}
    {bound > 0 && <g opacity={Math.min(1, bound * 1.5)}>{[-500, -455, -410, -365, -320].map((y, i) => i < Math.ceil(bound * 5) && <g key={y}>
      <path d={`M-92,${y + 10} C-30,${y - 12} 40,${y + 18} 88,${y - 6}`} fill="none" stroke={T.line} strokeWidth={20} strokeLinecap="round" />
      <path d={`M-92,${y + 10} C-30,${y - 12} 40,${y + 18} 88,${y - 6}`} fill="none" stroke="#d9a85a" strokeWidth={11} strokeLinecap="round" strokeDasharray="9 6" /></g>)}</g>}
  </g>;
};

// cast presets
export const CAST: Record<string, PuppetSpec> = {
  rama: { head: 'hero', crown: 'kiritam', skin: T.skinRama, skinD: T.skinRamaD, top: T.ochre, bottom: T.ochre, border: T.red, sash: T.red, prop: 'bow' },
  lakshmana: { head: 'hero', crown: 'kiritam', skin: T.skinGold, skinD: T.skinGoldD, top: T.green, bottom: T.green, border: T.ochre, prop: 'bow' },
  sita: { head: 'woman', crown: 'small', skin: T.skinFair, skinD: T.skinFairD, top: T.green, bottom: T.red, border: T.ochre, skirt: 'sari', prop: 'lotus' },
  ravana: { head: 'demon', crown: 'kiritam', skin: T.skinRed, skinD: T.skinRedD, top: T.black, bottom: T.black, border: T.gold, sash: T.green, heads: 10, arms: 20, prop: 'sword' },
  hanuman: { head: 'monkey', crown: 'small', skin: T.skinMonkey, skinD: T.skinMonkeyD, top: T.red, bottom: T.red, border: T.ochre, tail: true, prop: 'mace' },
  rishi: { head: 'rishi', crown: 'jata', skin: T.skinGold, skinD: T.skinGoldD, top: T.saffron, bottom: T.saffron, border: T.red, skirt: 'robe', prop: 'kamandal' },
  parashurama: { head: 'rishi', crown: 'jata', skin: T.skinGold, skinD: T.skinGoldD, top: '#c98a4a', bottom: T.saffron, border: T.red, skirt: 'dhoti', sash: T.red, prop: 'axe', beard: T.black },
  jamadagni: { head: 'rishi', crown: 'jata', skin: T.skinGold, skinD: T.skinGoldD, top: T.white, bottom: T.white, border: T.saffron, skirt: 'robe', prop: 'kamandal' },
  brahma: { head: 'rishi', crown: 'kiritam', skin: '#d9894a', skinD: '#b06a32', top: T.red, bottom: T.ochre, border: T.gold, sash: T.green, skirt: 'robe', prop: 'kamandal', sideHeads: true },
  vishnu: { head: 'hero', crown: 'kiritam', skin: '#3d5aa8', skinD: '#2c437f', top: T.ochre, bottom: T.ochre, border: T.red, sash: T.red, arms: 4, prop: 'chakra' },
  anaranya: { head: 'hero', crown: 'kiritam', skin: T.skinFair, skinD: T.skinFairD, top: T.white, bottom: T.green, border: T.gold, sash: T.red, prop: 'sword' },
  prince: { head: 'hero', crown: 'small', skin: T.skinGold, skinD: T.skinGoldD, top: T.maroon, bottom: T.red, border: T.gold, prop: 'sword' },
  vedavati: { head: 'woman', crown: 'none', skin: T.skinFair, skinD: T.skinFairD, top: T.saffron, bottom: T.saffron, border: T.red, skirt: 'sari', prop: 'lotus' },
  sahasrabahu: { head: 'hero', crown: 'kiritam', skin: T.skinGold, skinD: T.skinGoldD, top: T.maroon, bottom: T.red, border: T.gold, sash: T.green, arms: 24, prop: 'sword' },
  queen: { head: 'woman', crown: 'small', skin: T.skinFair, skinD: T.skinFairD, top: T.red, bottom: T.green, border: T.gold, skirt: 'sari', prop: 'none' },
  rakshasa: { head: 'demon', crown: 'small', skin: T.skinRed, skinD: T.skinRedD, top: T.black, bottom: T.black, border: T.red, prop: 'sword' },
  vanara: { head: 'monkey', crown: 'none', skin: T.skinMonkey, skinD: T.skinMonkeyD, top: T.green, bottom: T.green, border: T.ochre, tail: true, prop: 'none' },
  villager: { head: 'hero', crown: 'none', skin: T.skinGold, skinD: T.skinGoldD, top: T.white, bottom: T.white, border: T.red, prop: 'none' },
  god: { head: 'hero', crown: 'kiritam', skin: T.skinGold, skinD: T.skinGoldD, top: T.ochre, bottom: T.white, border: T.gold, sash: T.red, prop: 'lotus' },
  tulsi: { head: 'woman', crown: 'small', skin: T.skinFair, skinD: T.skinFairD, top: T.green, bottom: '#2f6a34', border: T.gold, sash: T.red, skirt: 'sari', prop: 'tulsidal' },
  devotee: { head: 'woman', crown: 'none', skin: T.skinGold, skinD: T.skinGoldD, top: T.red, bottom: T.saffron, border: T.red, skirt: 'sari', prop: 'lota' },
  ravanav: { head: 'rakshasa', crown: 'pearl', skin: '#34425e', skinD: '#232d44', top: T.red, bottom: T.red, border: T.gold, sash: T.gold, heads: 10, arms: 20, prop: 'sword', scars: true },
  ravanas: { head: 'rakshasa', crown: 'pearl', skin: '#34425e', skinD: '#232d44', top: '#cfd4da', bottom: '#cfd4da', border: T.gold, sash: T.red, heads: 10, arms: 20, prop: 'sword', scars: true },
  ravana1: { head: 'rakshasa', crown: 'pearl', skin: '#34425e', skinD: '#232d44', top: T.red, bottom: T.red, border: T.gold, sash: T.gold, prop: 'sword', scars: true },
  shurpanakha: { head: 'woman', crown: 'small', skin: '#5a4a6a', skinD: '#43364f', top: T.black, bottom: T.maroon, border: T.gold, skirt: 'sari', prop: 'none' },
  indra: { head: 'hero', crown: 'kiritam', skin: T.skinFair, skinD: T.skinFairD, top: T.white, bottom: T.ochre, border: T.red, sash: T.green, prop: 'vajra' },
  king: { head: 'hero', crown: 'kiritam', skin: T.skinGold, skinD: T.skinGoldD, top: T.maroon, bottom: T.indigo, border: T.gold, sash: T.red, prop: 'sword' },
};

// the lamp-lit cloth screen + leather filter
export const ScreenDefs: React.FC = () => <defs>
  <radialGradient id="th-screen" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stopColor="#fff0c8" /><stop offset="0.45" stopColor="#f3cf93" /><stop offset="0.8" stopColor="#dca45a" /><stop offset="1" stopColor="#b9772f" /></radialGradient>
  <filter id="th-leather" x="-30%" y="-30%" width="160%" height="160%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035 0.12" numOctaves="3" seed="7" result="n" />
    <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 -0.05" result="na" />
    <feComposite in="na" in2="SourceGraphic" operator="in" result="tex" />
    <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="gb" />
    <feColorMatrix in="gb" values="0 0 0 0 1  0 0 0 0 0.82  0 0 0 0 0.45  0 0 0 0.7 0" result="glow" />
    <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="sb" /><feOffset in="sb" dx="8" dy="10" result="so" />
    <feColorMatrix in="so" values="0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0 0.01  0 0 0 0.4 0" result="shadow" />
    <feMerge><feMergeNode in="glow" /><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /><feMergeNode in="tex" /></feMerge>
  </filter>
  <filter id="th-glow"><feGaussianBlur stdDeviation="2" /></filter>
</defs>;

// four-legged leather puppets: Kamadhenu (divine cow, crowned) and Nandi (bull). Feet at (0,0), facing +x, ~430 tall.
export const Animal: React.FC<{ kind: 'kamadhenu' | 'nandi'; t?: number; walk?: number; rods?: boolean }> = ({ kind, t = 0, walk, rods = true }) => {
  const st = { stroke: T.line, strokeWidth: LW, strokeLinejoin: 'round' as const }, cow = kind === 'kamadhenu';
  const body = cow ? T.white : '#ece6d6', bodyD = cow ? '#d9cdb0' : '#c9c0a8', w = walk ?? 0;
  const leg = (x: number, ph: number, back: boolean) => { const a = Math.sin(w + ph) * 16; const k: P = add([x, -180], dirOf(a, 95)), f: P = add(k, dirOf(a * 0.3, 90));
    return <g key={`${x}${ph}`}><Limb a={[x, -200]} b={k} w1={42} w2={30} fill={back ? bodyD : body} holes={false} /><Limb a={k} b={f} w1={28} w2={22} fill={back ? bodyD : body} band={T.gold} holes={false} />
      <path d={`M${f[0] - 14},${f[1] - 6} L${f[0] + 16},${f[1] - 6} L${f[0] + 12},${f[1] + 6} L${f[0] - 14},${f[1] + 6} Z`} fill={T.black} {...st} /></g>; };
  return <g>
    {rods && <g opacity={0.55}><path d="M0,-1600 L0,-300" stroke={T.rod} strokeWidth={6} /><path d="M220,-1400 L220,-420" stroke={T.rod} strokeWidth={3} /></g>}
    {cow && <g opacity={0.5}><ellipse cx={20} cy={-300} rx={330} ry={250} fill="#ffe7a6" /></g>}
    {leg(-150, Math.PI, true)}{leg(120, 0, true)}
    <path d="M-230,-330 C-260,-300 -270,-240 -250,-170 C-246,-150 -232,-146 -226,-170" fill="none" stroke={T.line} strokeWidth={12} /><path d="M-252,-178 C-270,-150 -246,-120 -236,-150 Z" fill={T.black} />
    <path d="M-230,-200 C-240,-300 -200,-350 -120,-352 L120,-352 C190,-352 220,-300 214,-220 C210,-180 160,-170 120,-176 L-150,-176 C-200,-176 -226,-186 -230,-200 Z" fill={body} {...st} />
    {!cow && <path d="M60,-350 C70,-420 140,-430 150,-352 Z" fill={body} {...st} />}
    <path d="M-170,-352 L120,-352 L110,-250 C40,-230 -100,-230 -170,-250 Z" fill={cow ? T.red : T.indigo} {...st} />
    <path d="M-170,-250 C-100,-230 40,-230 110,-250" fill="none" stroke={T.gold} strokeWidth={12} /><Holes a={[-150, -300]} b={[90, -300]} n={11} r={4} /><Holes a={[-150, -258]} b={[100, -258]} n={12} r={3.4} />
    {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-150 + i * 40} cy={-238 + (i % 2) * 8} r={7} fill={T.gold} stroke={T.line} strokeWidth={2} />)}
    {leg(-110, 0.4, false)}{leg(160, Math.PI + 0.4, false)}
    {/* neck + head */}
    <path d="M150,-340 C200,-380 250,-420 290,-420 L330,-330 C300,-300 240,-260 190,-250 Z" fill={body} {...st} />
    <path d="M150,-260 C190,-200 230,-200 250,-250" fill={bodyD} {...st} />
    <g transform="translate(320 -400)">
      <path d="M-50,-30 C-20,-60 40,-50 60,-10 C80,30 70,70 50,80 C20,90 -20,70 -40,40 C-56,10 -60,-10 -50,-30 Z" fill={body} {...st} />
      <path d="M44,40 C70,44 82,64 64,82 C46,90 30,78 34,60 Z" fill="#e8b6a0" {...st} />
      <path d="M-4,-8 Q12,-20 28,-8 Q12,4 -4,-8 Z" fill={T.white} stroke={T.line} strokeWidth={3} /><circle cx={12} cy={-8} r={5} fill={T.black} />
      <path d="M-30,-40 C-40,-80 -70,-100 -90,-96 C-70,-80 -60,-60 -50,-34 Z" fill={T.gold} {...st} /><path d="M-6,-50 C-6,-90 20,-110 40,-110 C26,-92 16,-74 14,-48 Z" fill={T.goldD} {...st} />
      <path d="M-50,-6 C-80,-10 -96,10 -90,24 C-74,18 -60,10 -46,10 Z" fill={bodyD} {...st} />
      {cow && <g {...st}><path d="M-26,-48 L28,-48 L20,-74 L8,-80 L0,-104 L-8,-80 L-20,-74 Z" fill={T.gold} /><Holes a={[-16, -58]} b={[18, -58]} n={4} r={3} /><circle cx={0} cy={-108} r={6} fill={T.red} /></g>}
      {!cow && <path d="M-40,30 C-20,50 20,52 40,40" fill="none" stroke={T.red} strokeWidth={8} />}
    </g>
    {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={190 + i * 14} cy={-300 + Math.sin(i * 0.7) * 24 + i * 6} r={9} fill={i % 2 ? T.ochre : T.red} stroke={T.line} strokeWidth={2} />)}
    {cow && [0, 1, 2].map(i => <path key={i} transform={`rotate(${-30 + i * 25 + 4 * Math.sin(t * 2 + i)} -170 -330)`} d="M-170,-330 C-260,-430 -330,-420 -360,-360 C-300,-380 -240,-370 -170,-330 Z" fill={i % 2 ? T.green : T.indigo} stroke={T.line} strokeWidth={3} />)}
  </g>;
};

// Airavata: Indra's white elephant with four tusks, red caparison. Feet at (0,0), facing +x, ~560 tall.
export const Elephant: React.FC<{ t?: number; walk?: number; rods?: boolean }> = ({ t = 0, walk = 0, rods = true }) => {
  const st = { stroke: T.line, strokeWidth: LW, strokeLinejoin: 'round' as const }, body = '#f1ead8', bodyD = '#d6ccb2';
  const leg = (x: number, ph: number, back: boolean) => { const a = Math.sin(walk + ph) * 10; return <g key={`${x}${ph}`} transform={`rotate(${a} ${x} -220)`}>
    <path d={`M${x - 42},-240 L${x + 42},-240 L${x + 38},-10 L${x - 38},-10 Z`} fill={back ? bodyD : body} {...st} /><path d={`M${x - 44},-12 L${x + 44},-12 L${x + 44},0 L${x - 44},0 Z`} fill={T.gold} {...st} /><Holes a={[x, -200]} b={[x, -60]} n={5} r={4} /></g>; };
  return <g>
    {rods && <g opacity={0.55}><path d="M0,-1700 L0,-480" stroke={T.rod} strokeWidth={6} /><path d="M300,-1500 L300,-520" stroke={T.rod} strokeWidth={3} /></g>}
    {leg(-170, Math.PI, true)}{leg(130, 0, true)}
    <path d="M-280,-300 C-300,-260 -300,-210 -286,-180" fill="none" stroke={T.line} strokeWidth={10} />
    <path d="M-270,-260 C-290,-420 -170,-500 0,-500 C170,-500 260,-430 250,-290 C240,-210 170,-196 120,-200 L-200,-200 C-250,-200 -266,-220 -270,-260 Z" fill={body} {...st} />
    <path d="M-200,-470 L150,-470 L140,-290 C60,-266 -120,-266 -210,-290 Z" fill={T.red} {...st} /><path d="M-210,-290 C-120,-266 60,-266 140,-290" fill="none" stroke={T.gold} strokeWidth={14} />
    <Holes a={[-180, -420]} b={[120, -420]} n={13} r={4} /><Holes a={[-170, -330]} b={[110, -330]} n={12} r={4} />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-180 + i * 42} cy={-270 + (i % 2) * 8} r={8} fill={T.gold} stroke={T.line} strokeWidth={2} />)}
    <path d="M-150,-500 L110,-500 L90,-560 L-130,-560 Z" fill={T.gold} {...st} /><Holes a={[-110, -530]} b={[80, -530]} n={8} r={4} />
    {leg(-110, 0.4, false)}{leg(190, Math.PI + 0.4, false)}
    {/* head, ear, trunk, four tusks */}
    <path d="M190,-470 C260,-540 380,-530 410,-440 C430,-380 420,-320 400,-280 L330,-260 C280,-300 230,-330 190,-360 Z" fill={body} {...st} />
    <path d={`M400,-290 C430,-230 440,-150 420,-80 C412,-50 ${440 + 10 * Math.sin(t * 1.4)},-30 ${452 + 12 * Math.sin(t * 1.4)},-46 C430,-90 452,-200 430,-300 Z`} fill={body} {...st} />
    {[0, 1].map(k => <path key={k} d={`M${376 + k * 18},${-300 + k * 18} C${440 + k * 20},${-290 + k * 30} ${490 + k * 20},${-320 + k * 40} ${520 + k * 16},${-380 + k * 50}`} fill="none" stroke={T.line} strokeWidth={22} strokeLinecap="round" />)}
    {[0, 1].map(k => <path key={`w${k}`} d={`M${376 + k * 18},${-300 + k * 18} C${440 + k * 20},${-290 + k * 30} ${490 + k * 20},${-320 + k * 40} ${520 + k * 16},${-380 + k * 50}`} fill="none" stroke="#fbf6ea" strokeWidth={14} strokeLinecap="round" />)}
    <path d="M220,-470 C170,-470 140,-400 150,-330 C170,-290 230,-300 250,-340 C260,-390 250,-450 220,-470 Z" fill={bodyD} {...st} /><Holes a={[180, -440]} b={[200, -330]} n={5} r={4} />
    <path d="M356,-420 Q372,-436 388,-420 Q372,-408 356,-420 Z" fill={T.white} stroke={T.line} strokeWidth={3} /><circle cx={372} cy={-420} r={4} fill={T.black} />
    <path d="M300,-520 L420,-520 L404,-470 L316,-470 Z" fill={T.gold} {...st} /><circle cx={360} cy={-540} r={14} fill={T.red} {...st} />
  </g>;
};
