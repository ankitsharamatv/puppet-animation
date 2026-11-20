#!/usr/bin/env node
// Checks a project's scenes.json against what the format can draw, then renders.
//   node render.mjs <project_dir> --data <folder>                 → checks and renders <project_dir>/<name>.mp4
//   node render.mjs <project_dir> --data <folder> --check         → only checks
//   node render.mjs <project_dir> --data <folder> --stills 3,12.5 → PNG frames at those seconds, for a quick look
//   node render.mjs --cast <out.png> --data <folder>              → picture of every puppet with its name
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const DATA = arg('--data', join(homedir(), '.tholu-puppets'));
const ENGINE = join(DATA, 'engine');
const fail = s => { console.log('✗ ' + s); process.exit(1); };
if (!existsSync(join(ENGINE, 'node_modules', '@remotion', 'cli'))) fail(`The engine isn't set up yet. Run setup.mjs --data "${DATA}" first.`);
const remotion = (args, cwd = ENGINE) => spawnSync('npx', ['remotion', ...args], { cwd, stdio: 'inherit', shell: process.platform === 'win32' });

if (argv.includes('--cast')) {
  const out = resolve(arg('--cast'));
  const r = remotion(['still', 'src/index.ts', 'Cast', out, '--log=error']);
  process.exit(r.status === 0 ? (console.log(`✓ Cast sheet: ${out}`), 0) : 1);
}

// ---- what the format can draw
const SETTINGS = ['palace', 'lanka', 'forest', 'river', 'mountain', 'ashram', 'battle', 'night', 'tulsivan', 'home'];
const WHO = ['rama', 'lakshmana', 'sita', 'ravana', 'hanuman', 'rishi', 'parashurama', 'jamadagni', 'brahma', 'vishnu', 'anaranya', 'prince', 'vedavati', 'tulsi', 'devotee', 'sahasrabahu', 'queen', 'rakshasa', 'vanara', 'villager', 'god', 'king', 'kamadhenu', 'nandi', 'ravanav', 'ravanas', 'ravana1', 'shurpanakha', 'indra', 'airavata'];
const ACTIONS = ['stand', 'talk', 'walk', 'attack', 'angry', 'bow', 'pray', 'bless', 'hold', 'grab', 'celebrate', 'bound', 'fall', 'chant', 'draw', 'point', 'vanish', 'appear', 'offer', 'sleep'];
const PROPS = ['none', 'shivling', 'fire', 'throne', 'cage', 'hut', 'brokenbow', 'tulsi', 'thali', 'couch'];
const FX = ['none', 'flood', 'petals', 'rain', 'embers', 'arms', 'crowns', 'tej', 'water', 'sparkle', 'lightning', 'chakra'];
const CAMS = ['wide', 'medium', 'close', 'push', 'pan'];
const BLOCKS = {
  opening: { cast: ['setting', 'cast', 'prop'] }, scene: { cast: ['setting', 'cast', 'camera', 'prop', 'fx'] }, journey: { cast: ['setting', 'cast'] },
  spotlight: { one: ['who'], other: ['setting', 'tint'] }, giant: { one: ['who'], cast: ['small'], other: ['setting'] }, shadow: { one: ['who', 'form'], other: ['setting'] },
  clash: { one: ['a', 'b'], other: ['setting'] }, closing: { cast: ['setting', 'cast', 'prop'] }, rank: { one: ['a', 'b', 'c'], other: ['setting'] },
};
const project = argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1]?.startsWith('--') !== true);
if (!project) fail('Give the project folder: node render.mjs <project_dir> --data <folder>');
const DIR = resolve(project);
const read = f => { const p = join(DIR, f); if (!existsSync(p)) fail(`${p} is missing`); try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { fail(`${f} is not valid JSON: ${e.message}`); } };
const voice = read('voice.json'), plan = read('scenes.json');
const scenes = plan.scenes || [], aspect = plan.aspect, errs = [];
if (!['9:16', '16:9'].includes(aspect)) errs.push('aspect must be "9:16" or "16:9"');
if (!scenes.length) errs.push('no scenes');
const castErr = (s, i, f, max) => {
  const items = String(s || '').split('|').map(x => x.trim()).filter(Boolean);
  if (!items.length) return errs.push(`scene ${i + 1}: ${f} is empty`);
  if (items.length > max) errs.push(`scene ${i + 1}: ${f} has ${items.length} puppets (max ${max})`);
  for (const it of items) { const [w, a] = it.split('/').map(x => x.trim().toLowerCase());
    if (!WHO.includes(w)) errs.push(`scene ${i + 1}: "${w}" is not a puppet in this format (${f})`);
    if (a && !ACTIONS.includes(a)) errs.push(`scene ${i + 1}: "${a}" is not an action (${f})`); }
};
scenes.forEach((s, i) => {
  const B = BLOCKS[s.block], p = s.params || {};
  if (!B) return errs.push(`scene ${i + 1}: unknown block "${s.block}"`);
  if (!(s.end > s.start)) errs.push(`scene ${i + 1}: end must be after start`);
  if (i > 0 && Math.abs(s.start - scenes[i - 1].end) > 0.05) errs.push(`scene ${i + 1}: starts at ${s.start} but scene ${i} ends at ${scenes[i - 1].end} (no gaps or overlaps)`);
  if (p.setting && !SETTINGS.includes(p.setting)) errs.push(`scene ${i + 1}: setting "${p.setting}" not available`);
  if (p.prop && !PROPS.includes(p.prop)) errs.push(`scene ${i + 1}: prop "${p.prop}" not available`);
  if (p.fx && !FX.includes(p.fx)) errs.push(`scene ${i + 1}: fx "${p.fx}" not available`);
  if (p.camera && !CAMS.includes(p.camera)) errs.push(`scene ${i + 1}: camera "${p.camera}" not available`);
  if (p.tint && !['warm', 'red'].includes(p.tint)) errs.push(`scene ${i + 1}: tint must be warm or red`);
  (B.cast || []).filter(f => f !== 'setting' && f !== 'prop' && f !== 'camera' && f !== 'fx').forEach(f => p[f] != null || f === 'cast' ? castErr(p[f], i, f, 3) : null);
  (B.one || []).forEach(f => castErr(p[f], i, f, 1));
});
if (scenes.length) {
  if (scenes[0].block !== 'opening') errs.push('the first scene must be "opening"');
  if (scenes[scenes.length - 1].block !== 'closing') errs.push('the last scene must be "closing"');
  if (Math.abs(scenes[0].start) > 0.01) errs.push('the first scene must start at 0');
  if (Math.abs(scenes[scenes.length - 1].end - voice.duration) > 0.1) errs.push(`the last scene must end at the voice-over's end (${voice.duration})`);
}
if (errs.length) { console.log('✗ scenes.json needs fixing:\n  - ' + errs.join('\n  - ')); process.exit(1); }
console.log(`✓ scenes.json OK: ${scenes.length} scenes, ${voice.duration.toFixed(1)} s, ${aspect}`);
if (argv.includes('--check')) process.exit(0);

const props = { aspect, duration: voice.duration, clips: voice.clips, words: voice.words, scenes };
const propsFile = join(DIR, '.props.json'); writeFileSync(propsFile, JSON.stringify(props));
const common = ['src/index.ts', 'Tholu', `--props=${propsFile}`, `--public-dir=${DIR}`, '--log=error'];
if (argv.includes('--stills')) {
  mkdirSync(join(DIR, 'stills'), { recursive: true });
  for (const t of String(arg('--stills')).split(',').map(Number).filter(n => n >= 0)) {
    const out = join(DIR, 'stills', `t${t.toFixed(1)}.png`);
    if (remotion(['still', ...common.slice(0, 2), out, ...common.slice(2), `--frame=${Math.min(Math.round(t * 30), Math.ceil(voice.duration * 30) - 1)}`]).status !== 0) fail('still failed');
    console.log(`✓ ${out}`);
  }
  process.exit(0);
}
const name = (plan.name || basename(DIR)).replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-|-$/g, '') || 'video';
const out = join(DIR, `${name}.mp4`);
console.log(`… Rendering ${out} (a few minutes for a 1–3 minute video)`);
const r = remotion(['render', ...common.slice(0, 2), out, ...common.slice(2), '--crf=18', '--concurrency=50%']);
if (r.status !== 0) fail('render failed — see the error above');
console.log(`\nRENDER OK — ${out}`);
