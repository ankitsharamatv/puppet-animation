// Every puppet the format can draw, with its name — so creators can see the cast before writing a story.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Puppet, CAST, ScreenDefs, Animal, Elephant } from './puppets';

const NAMES = [...Object.keys(CAST), 'kamadhenu', 'nandi', 'airavata'];
const COLS = 8, CW = 300, RH = 560;
export const castSize = { w: COLS * CW + 80, h: Math.ceil(NAMES.length / COLS) * RH + 180 };

export const CastSheet: React.FC = () => (
  <AbsoluteFill style={{ background: '#24130a' }}>
    <svg width={castSize.w} height={castSize.h}><ScreenDefs />
      <rect width={castSize.w} height={castSize.h} fill="url(#th-screen)" />
      <text x={40} y={90} fontFamily="Avenir Next, Helvetica, Arial, sans-serif" fontWeight={800} fontSize={54} fill="#5a2a0e">Tholu Puppets · cast</text>
      {NAMES.map((n, i) => {
        const x = 40 + (i % COLS) * CW + CW / 2, y = 180 + Math.floor(i / COLS) * RH + RH - 90;
        const animal = !CAST[n];
        return <g key={n}>
          <g transform={`translate(${x} ${y}) scale(${animal ? 0.42 : 0.5})`} filter="url(#th-leather)">
            {n === 'airavata' ? <Elephant t={0} walk={0} rods={false} /> : animal ? <Animal kind={n as "kamadhenu" | "nandi"} t={0} walk={0} rods={false} /> : <Puppet spec={CAST[n]} pose={{ armF: [40, 50], armB: [-10, -10] }} rods={false} />}
          </g>
          <text x={x} y={y + 60} textAnchor="middle" fontFamily="Menlo, Consolas, monospace" fontWeight={700} fontSize={30} fill="#3a1a08">{n}</text>
        </g>;
      })}
    </svg>
  </AbsoluteFill>
);
