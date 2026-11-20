// One composition that plays a Tholu Puppets scene list over the narrator's voice clips, at 9:16 or 16:9.
// Props come from scripts/render.mjs: aspect, duration, clips (voice files + start times), words (for lip-talk), scenes.
import React from 'react';
import { AbsoluteFill, Audio, CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Scene, Word, win } from './util';
import { tholu } from './tholu';

export type Clip = { src: string; at: number };
export type VideoProps = { aspect: '9:16' | '16:9'; duration: number; clips: Clip[]; words: Word[]; scenes: Scene[] };
const FPS = 30, FADE = 0.45;

export const videoDefaults: VideoProps = {
  aspect: '16:9', duration: 8, clips: [], words: [],
  scenes: [
    { start: 0, end: 5, block: 'opening', params: { setting: 'palace', cast: 'rama/stand|sita/talk' } },
    { start: 5, end: 8, block: 'closing', params: { setting: 'palace', cast: 'rama/bless|sita/pray' } },
  ],
};
export const videoMeta: CalculateMetadataFunction<VideoProps> = ({ props }) => {
  const land = props.aspect === '16:9';
  return { width: land ? 1920 : 1080, height: land ? 1080 : 1920, fps: FPS, durationInFrames: Math.max(FPS, Math.ceil((props.duration || 1) * FPS)) };
};

export const Video: React.FC<VideoProps> = (props) => {
  const T = useCurrentFrame() / FPS;
  const land = props.aspect === '16:9', W = land ? 1920 : 1080, H = land ? 1080 : 1920;
  const scenes = [...(props.scenes || [])].sort((a, b) => a.start - b.start);
  const words = props.words || [];
  const talking = (g: number) => words.some(w => g >= w.s - 0.03 && g <= w.e + 0.03);
  let i = scenes.findIndex((s, k) => T >= s.start && (k === scenes.length - 1 || T < scenes[k + 1].start));
  if (i < 0) i = 0;
  const cur = scenes[i], prev = i > 0 ? scenes[i - 1] : null, k = cur ? win(T - cur.start, 0, FADE) : 1;
  const render = (s: Scene, idx: number) => {
    const B = tholu.blocks[s.block] ?? tholu.blocks.scene;
    return <B p={s.params || {}} t={T - s.start} d={Math.max(0.5, s.end - s.start)} cues={(s.cues || []).map(c => c - s.start)} W={W} H={H} land={land} talking={lt => talking(lt + s.start)} seed={idx * 17 + 3} />;
  };
  const fadeIO = Math.max(1 - win(T, 0, 0.35), win(T, props.duration - 0.4, props.duration));
  return (
    <AbsoluteFill style={{ background: tholu.bg, overflow: 'hidden' }}>
      {cur && prev && k < 1 ? <><AbsoluteFill>{render(prev, i - 1)}</AbsoluteFill><AbsoluteFill style={{ opacity: k }}>{render(cur, i)}</AbsoluteFill></>
        : cur ? <AbsoluteFill>{render(cur, i)}</AbsoluteFill> : null}
      {tholu.Over && <tholu.Over t={T} W={W} H={H} land={land} />}
      <AbsoluteFill style={{ background: '#000', opacity: fadeIO }} />
      {(props.clips || []).map((c, n) => <Sequence key={n} from={Math.round(c.at * FPS)}><Audio src={staticFile(c.src)} /></Sequence>)}
    </AbsoluteFill>
  );
};
