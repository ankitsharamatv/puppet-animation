// Shared voice-over helpers (no dependencies, no ffmpeg): MP3 length, script splitting, word normalising,
// and building voice.json from recorded clips + their word timings.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export const LEAD = 0.3, GAP = 0.25, TAIL = 1.4;
export const hash = s => createHash('sha1').update(s).digest('hex').slice(0, 8);

// exact MP3 length: walk the frame headers and add up samples
export function mp3Seconds(file) {
  const b = readFileSync(file); let i = 0, samples = 0, rate = 44100;
  if (b.slice(0, 3).toString() === 'ID3') i = 10 + ((b[6] & 127) << 21 | (b[7] & 127) << 14 | (b[8] & 127) << 7 | (b[9] & 127));
  let first = true;
  const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff || (b[i + 1] & 0xe0) !== 0xe0) { i++; continue; }
    const ver = (b[i + 1] >> 3) & 3, layer = (b[i + 1] >> 1) & 3, bri = b[i + 2] >> 4, sri = (b[i + 2] >> 2) & 3, pad = (b[i + 2] >> 1) & 1;
    if (ver === 1 || layer !== 1 || bri === 0 || bri === 15 || sri === 3) { i++; continue; }
    rate = SR[ver][sri]; const mpeg1 = ver === 3, br = (mpeg1 ? BR1 : BR2)[bri] * 1000;
    const len = Math.floor((mpeg1 ? 144 : 72) * br / rate) + pad; if (len < 4) { i++; continue; }
    const info = first && /Xing|Info/.test(b.slice(i + 4, i + 40).toString('latin1')); first = false;
    if (!info) samples += mpeg1 ? 1152 : 576; i += len;
  }
  return samples / rate;
}

// split long text at sentence ends so each recording stays well inside the model's limit
export function chunks(text, max = 2400) {
  const out = []; let cur = '';
  for (const s of text.split(/(?<=[।॥.!?])\s+/)) { if (cur && (cur + ' ' + s).length > max) { out.push(cur); cur = s; } else cur = cur ? cur + ' ' + s : s; }
  if (cur) out.push(cur);
  return out;
}

// accept Scribe words in any shape we meet: REST response, connector result, a bare array, or our own {w,s,e}
export function normWords(j) {
  if (typeof j === 'string') j = JSON.parse(j);
  const list = Array.isArray(j) ? j : j.words || j.transcripts?.[0]?.words || j.transcript?.words || [];
  return list
    .filter(w => (w.type || 'word') === 'word')
    .map(w => ({ w: String(w.w ?? w.text ?? w.word ?? '').trim(), s: +(+(w.s ?? w.start)).toFixed(3), e: +(+(w.e ?? w.end)).toFixed(3) }))
    .filter(w => w.w && Number.isFinite(w.s) && Number.isFinite(w.e));
}

// group words into sentences with times, for scene planning
export function timeline(words) {
  const lines = []; let cur = [];
  for (const w of words) { cur.push(w); if (/[।॥.!?]["'”’]?$/.test(w.w) || cur.length >= 22) { lines.push(cur); cur = []; } }
  if (cur.length) lines.push(cur);
  return lines.map(l => `[${l[0].s.toFixed(2)}–${l[l.length - 1].e.toFixed(2)}] ${l.map(w => w.w).join(' ')}`).join('\n');
}

// lay the clips end to end and write voice.json; parts = [{src, words: path of its words file}]
export function buildVoice(dir, parts, voice) {
  let t = LEAD; const clips = [], words = [];
  for (const p of parts) {
    const f = join(dir, p.src), wf = join(dir, p.words);
    if (!existsSync(f)) throw new Error(`missing audio ${p.src}`);
    if (!existsSync(wf)) throw new Error(`missing word timings ${p.words}`);
    const ws = normWords(readFileSync(wf, 'utf8'));
    if (!ws.length) throw new Error(`no words found in ${p.words}`);
    const len = mp3Seconds(f);
    if (len < 0.2) throw new Error(`${p.src} is not a playable MP3 (download it again)`);
    clips.push({ src: p.src, at: +t.toFixed(3) });
    ws.forEach(w => words.push({ w: w.w, s: +(w.s + t).toFixed(3), e: +(w.e + t).toFixed(3) }));
    t += len + GAP;
  }
  const duration = +(t - GAP + TAIL).toFixed(3);
  writeFileSync(join(dir, 'voice.json'), JSON.stringify({ voice, duration, clips, words }, null, 1));
  return { duration, clips, words };
}
