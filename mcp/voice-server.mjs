#!/usr/bin/env node
// Tholu Puppets voice server — a tiny MCP server (stdio, no dependencies) that records the narrator with ElevenLabs
// and gets word timings with ElevenLabs Scribe. The API key comes from the plugin's install prompt (stored in the
// system keychain by Claude Code) through the ELEVENLABS_API_KEY environment variable. It is never printed or written.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

const API = 'https://api.elevenlabs.io';
const MODEL = 'eleven_multilingual_v2';
const key = () => (process.env.ELEVENLABS_API_KEY || '').trim();
const VOICES = {
  kanika: { id: 'xccfcojYYGnqTTxwZEDU', name: 'Kanika', about: 'Indian female storyteller, warm and expressive. Default narrator; good for Hindi and Indian English.' },
};
const LEAD = 0.3, GAP = 0.25, TAIL = 1.4;

// ---------------------------------------------------------------- ElevenLabs
async function xi(path, opts = {}) {
  if (!key()) throw new Error('No ElevenLabs API key is set. In Claude Code run /plugin, open tholu-puppets, choose "Configure options" and paste your key, then restart Claude Code.');
  const r = await fetch(API + path, { ...opts, headers: { 'xi-api-key': key(), ...(opts.headers || {}) } });
  if (!r.ok) {
    let msg = r.statusText;
    try { const j = await r.json(); msg = j.detail?.message || j.detail?.status || (typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail || j)); } catch {}
    const e = new Error(`ElevenLabs ${r.status}: ${msg}`); e.status = r.status; throw e;
  }
  return r;
}
async function credits() {
  try { const s = await (await xi('/v1/user/subscription')).json(); return { plan: s.tier, left: s.character_limit - s.character_count, limit: s.character_limit }; }
  catch (e) { return { error: e.message }; }
}
const voiceId = v => VOICES[String(v || 'kanika').toLowerCase()]?.id || String(v);
const ready = new Set();
async function ensureVoice(id) {
  if (ready.has(id)) return;
  try { await xi(`/v1/voices/${id}`); ready.add(id); return; } catch (e) { if (e.status !== 404 && e.status !== 400) throw e; }
  // a library voice must be added to "My voices" before text-to-speech can use it
  const name = Object.values(VOICES).find(v => v.id === id)?.name || '';
  const found = (await searchVoices(name || id)).find(v => v.voice_id === id);
  if (!found) throw new Error(`Voice ${name || id} is not in your ElevenLabs voices and could not be found in the voice library.`);
  await xi(`/v1/voices/add/${found.owner}/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ new_name: name || found.name }) });
  ready.add(id);
}
async function searchVoices(q) {
  const j = await (await xi('/v1/shared-voices?' + new URLSearchParams({ search: q, page_size: '8' }))).json();
  return (j.voices || []).map(v => ({ voice_id: v.voice_id, owner: v.public_owner_id, name: v.name, about: [v.gender, v.age, v.accent, v.language, v.use_case, (v.description || '').slice(0, 140)].filter(Boolean).join(' · '), preview: v.preview_url }));
}
async function tts(text, voice, out, prev, next) {
  const r = await xi(`/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL, previous_text: prev || undefined, next_text: next || undefined }),
  });
  writeFileSync(out, Buffer.from(await r.arrayBuffer()));
}
let stt = 'scribe_v1';
async function scribe(file) {
  const send = async model => {
    const fd = new FormData();
    fd.append('model_id', model); fd.append('timestamps_granularity', 'word'); fd.append('tag_audio_events', 'false');
    fd.append('file', new Blob([readFileSync(file)], { type: 'audio/mpeg' }), 'clip.mp3');
    return (await xi('/v1/speech-to-text', { method: 'POST', body: fd })).json();
  };
  let j;
  try { j = await send(stt); } catch (e) { if (e.status !== 400 && e.status !== 422) throw e; stt = stt === 'scribe_v1' ? 'scribe_v2' : 'scribe_v1'; j = await send(stt); }
  return (j.words || []).filter(w => (w.type || 'word') === 'word' && String(w.text).trim()).map(w => ({ w: String(w.text).trim(), s: +(+w.start).toFixed(3), e: +(+w.end).toFixed(3) }));
}

// ---------------------------------------------------------------- audio helpers (no ffmpeg needed)
// exact MP3 length: walk the frame headers and add up samples
function mp3Seconds(file) {
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
function chunks(text, max = 2400) {
  const out = []; let cur = '';
  for (const s of text.split(/(?<=[।॥.!?])\s+/)) { if (cur && (cur + ' ' + s).length > max) { out.push(cur); cur = s; } else cur = cur ? cur + ' ' + s : s; }
  if (cur) out.push(cur);
  return out;
}
const hash = s => createHash('sha1').update(s).digest('hex').slice(0, 8);
// group words into sentences with times, for scene planning
function timeline(words) {
  const lines = []; let cur = [];
  for (const w of words) { cur.push(w); if (/[।॥.!?]["'”’]?$/.test(w.w) || cur.length >= 22) { lines.push(cur); cur = []; } }
  if (cur.length) lines.push(cur);
  return lines.map(l => `[${l[0].s.toFixed(2)}–${l[l.length - 1].e.toFixed(2)}] ${l.map(w => w.w).join(' ')}`).join('\n');
}

// ---------------------------------------------------------------- tools
const TOOLS = [
  { name: 'voice_status', description: 'Check that the ElevenLabs key works and how many credits (characters) are left. Call before estimating or recording.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'estimate_voiceover', description: 'Count the credits a narration will cost (1 credit per character on multilingual v2) and compare with what is left. Nothing is spent.',
    inputSchema: { type: 'object', properties: { text: { type: 'string', description: 'the exact narration text' } }, required: ['text'], additionalProperties: false } },
  { name: 'find_voices', description: 'Search the ElevenLabs voice library when the creator wants a narrator other than the default (Kanika). Returns voice_id, name, description and a preview link.',
    inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'e.g. "hindi male storyteller", "deep english narrator"' } }, required: ['query'], additionalProperties: false } },
  { name: 'make_voiceover', description: 'SPENDS CREDITS. Records the narration with one voice, gets word timings, and writes <project_dir>/voice.json (clips + word times + duration) and <project_dir>/voice/*.mp3. Only call after the creator has OK\'d the cost. Safe to call again after a failure: finished clips are reused and not paid for twice. Returns the sentence timeline for scene planning.',
    inputSchema: { type: 'object', properties: {
      text: { type: 'string', description: 'the exact narration, copied from the creator\'s script' },
      project_dir: { type: 'string', description: 'absolute path of the video\'s project folder' },
      voice: { type: 'string', description: '"kanika" (default) or an ElevenLabs voice_id the creator picked' },
    }, required: ['text', 'project_dir'], additionalProperties: false } },
];

async function call(name, a) {
  if (name === 'voice_status') {
    const c = await credits();
    if (c.error) return `Key problem: ${c.error}`;
    return `ElevenLabs key works. Plan: ${c.plan}. Credits left: ${c.left.toLocaleString()} of ${c.limit.toLocaleString()}.`;
  }
  if (name === 'estimate_voiceover') {
    const n = String(a.text || '').trim().length, c = await credits();
    return c.error ? `This narration costs about ${n.toLocaleString()} credits. (Could not read the balance: ${c.error})`
      : `This narration costs about ${n.toLocaleString()} credits. Credits left: ${c.left.toLocaleString()}. ${n > c.left ? 'NOT ENOUGH credits.' : 'Enough credits.'}`;
  }
  if (name === 'find_voices') return JSON.stringify(await searchVoices(String(a.query || '')), null, 1);
  if (name === 'make_voiceover') {
    const dir = String(a.project_dir || '');
    if (!isAbsolute(dir)) throw new Error('project_dir must be an absolute path');
    const text = String(a.text || '').trim(); if (!text) throw new Error('text is empty');
    const voice = voiceId(a.voice);
    mkdirSync(join(dir, 'voice'), { recursive: true });
    const parts = chunks(text).map((t, k) => ({ text: t, src: `voice/c${String(k).padStart(2, '0')}-${hash(voice + t)}.mp3` }));
    const todo = parts.filter(p => !existsSync(join(dir, p.src) + '.ok'));
    if (todo.length) await ensureVoice(voice);
    for (let k = 0; k < parts.length; k++) {
      const p = parts[k], f = join(dir, p.src);
      if (existsSync(f + '.ok')) continue;
      await tts(p.text, voice, f, parts[k - 1]?.text.slice(-300), parts[k + 1]?.text.slice(0, 300));
      writeFileSync(f + '.ok', '');
    }
    let t = LEAD; const clips = [], words = [];
    for (const p of parts) {
      const f = join(dir, p.src), wf = f.replace(/\.mp3$/, '.words.json');
      const ws = existsSync(wf) ? JSON.parse(readFileSync(wf, 'utf8')) : await scribe(f);
      writeFileSync(wf, JSON.stringify(ws));
      clips.push({ src: p.src, at: +t.toFixed(3) });
      ws.forEach(w => words.push({ w: w.w, s: +(w.s + t).toFixed(3), e: +(w.e + t).toFixed(3) }));
      t += mp3Seconds(f) + GAP;
    }
    const duration = +(t - GAP + TAIL).toFixed(3);
    writeFileSync(join(dir, 'voice.json'), JSON.stringify({ voice, duration, clips, words }, null, 1));
    return `Voice-over ready: ${duration.toFixed(1)} s, ${parts.length} clip(s), ${words.length} words. Saved ${join(dir, 'voice.json')}.\n\nSentence timeline (seconds):\n${timeline(words)}`;
  }
  throw new Error(`Unknown tool ${name}`);
}

// ---------------------------------------------------------------- MCP over stdio (newline-delimited JSON-RPC)
const send = m => process.stdout.write(JSON.stringify(m) + '\n');
let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => {
  buf += d; let n;
  while ((n = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, n).trim(); buf = buf.slice(n + 1); if (line) handle(line); }
});
async function handle(line) {
  let m; try { m = JSON.parse(line); } catch { return; }
  if (m.id === undefined) return; // notifications
  const reply = result => send({ jsonrpc: '2.0', id: m.id, result });
  try {
    if (m.method === 'initialize') return reply({ protocolVersion: m.params?.protocolVersion || '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'tholu-voice', version: '1.0.0' } });
    if (m.method === 'ping') return reply({});
    if (m.method === 'tools/list') return reply({ tools: TOOLS });
    if (m.method === 'tools/call') {
      try { return reply({ content: [{ type: 'text', text: await call(m.params.name, m.params.arguments || {}) }] }); }
      catch (e) { return reply({ content: [{ type: 'text', text: String(e.message || e) }], isError: true }); }
    }
    send({ jsonrpc: '2.0', id: m.id, error: { code: -32601, message: `Method not found: ${m.method}` } });
  } catch (e) { send({ jsonrpc: '2.0', id: m.id, error: { code: -32603, message: String(e.message || e) } }); }
}
