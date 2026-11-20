#!/usr/bin/env node
// One-time setup (safe to run again): copies the Tholu Puppets engine into the plugin's data folder, installs Remotion,
// and downloads the headless browser Remotion renders with. Usage: node setup.mjs --data <folder>
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = arg('--data', join(homedir(), '.tholu-puppets'));
const ENGINE = join(DATA, 'engine');
const say = s => console.log(s);
const run = (cmd, args) => spawnSync(cmd, args, { cwd: ENGINE, stdio: 'inherit', shell: process.platform === 'win32' });

const major = +process.versions.node.split('.')[0];
if (major < 18) { say(`✗ Node ${process.versions.node} is too old. Install Node 18 or newer from https://nodejs.org and run setup again.`); process.exit(1); }
say(`✓ Node ${process.versions.node}`);

mkdirSync(ENGINE, { recursive: true });
rmSync(join(ENGINE, 'src'), { recursive: true, force: true });
cpSync(join(ROOT, 'engine', 'src'), join(ENGINE, 'src'), { recursive: true });
cpSync(join(ROOT, 'engine', 'tsconfig.json'), join(ENGINE, 'tsconfig.json'));
const pkg = readFileSync(join(ROOT, 'engine', 'package.json'), 'utf8');
const old = existsSync(join(ENGINE, 'package.json')) ? readFileSync(join(ENGINE, 'package.json'), 'utf8') : '';
writeFileSync(join(ENGINE, 'package.json'), pkg);
say(`✓ Engine copied to ${ENGINE}`);

if (pkg !== old || !existsSync(join(ENGINE, 'node_modules', '@remotion', 'cli'))) {
  say('… Installing Remotion (first time only, about 1–3 minutes)');
  const r = run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error']);
  if (r.status !== 0) { say('✗ npm install failed. Check your internet connection and run setup again.'); process.exit(1); }
}
say('✓ Remotion installed');

say('… Checking the headless browser used for rendering (downloads once, about 100 MB)');
const b = run('npx', ['remotion', 'browser', 'ensure']);
if (b.status !== 0) { say('✗ Could not download the headless browser. Check your internet connection and run setup again.'); process.exit(1); }
say('✓ Renderer ready');
say(`\nSETUP OK — engine at ${ENGINE}`);
