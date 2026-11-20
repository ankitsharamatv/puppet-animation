#!/usr/bin/env node
// Voice-over bookkeeping for recordings made through the ElevenLabs connector (no API key involved).
//   node voice.mjs split <project_dir>   → reads script.txt, writes voice/parts.json, prints the parts to record
//   node voice.mjs build <project_dir>   → checks every part has voice/<id>.mp3 + voice/<id>.words.json,
//                                          writes voice.json and prints the sentence timeline
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chunks, hash, buildVoice, timeline } from './voicelib.mjs';

const [cmd, project, ...rest] = process.argv.slice(2);
const fail = s => { console.log('✗ ' + s); process.exit(1); };
if (!['split', 'build'].includes(cmd) || !project) fail('usage: node voice.mjs split|build <project_dir> [--voice <name or id>]');
const DIR = resolve(project), VDIR = join(DIR, 'voice'), PARTS = join(VDIR, 'parts.json');
const vi = rest.indexOf('--voice'), voiceName = vi >= 0 ? rest[vi + 1] : undefined;

if (cmd === 'split') {
  if (!existsSync(join(DIR, 'script.txt'))) fail(`no script.txt in ${DIR}`);
  const text = readFileSync(join(DIR, 'script.txt'), 'utf8').trim();
  if (!text) fail('script.txt is empty');
  mkdirSync(VDIR, { recursive: true });
  const old = existsSync(PARTS) ? JSON.parse(readFileSync(PARTS, 'utf8')) : null;
  const parts = chunks(text).map((t, k) => {
    const id = `c${String(k).padStart(2, '0')}-${hash(t)}`;
    return { id, src: `voice/${id}.mp3`, words: `voice/${id}.words.json`, chars: t.length, text: t };
  });
  writeFileSync(PARTS, JSON.stringify({ voice: voiceName || old?.voice || 'kanika', parts }, null, 1));
  const total = parts.reduce((a, p) => a + p.chars, 0);
  console.log(`✓ ${parts.length} part(s), ${total.toLocaleString()} characters in all.`);
  for (const p of parts) {
    const have = existsSync(join(DIR, p.src)), words = existsSync(join(DIR, p.words));
    console.log(`\n── ${p.id}  (${p.chars} chars)  audio: ${have ? 'already recorded' : 'TO RECORD → ' + p.src}  words: ${words ? 'done' : 'TO TIME → ' + p.words}\n${p.text}`);
  }
  process.exit(0);
}

// build
if (!existsSync(PARTS)) fail('run "voice.mjs split" first');
const { voice, parts } = JSON.parse(readFileSync(PARTS, 'utf8'));
const missing = parts.flatMap(p => [!existsSync(join(DIR, p.src)) && p.src, !existsSync(join(DIR, p.words)) && p.words].filter(Boolean));
if (missing.length) fail('still missing:\n  ' + missing.join('\n  '));
try {
  const v = buildVoice(DIR, parts, voiceName || voice);
  console.log(`✓ Voice-over ready: ${v.duration.toFixed(1)} s, ${v.clips.length} clip(s), ${v.words.length} words. Saved ${join(DIR, 'voice.json')}.\n\nSentence timeline (seconds):\n${timeline(v.words)}`);
} catch (e) { fail(e.message); }
