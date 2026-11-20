---
name: tholu-puppets
description: Make an animated story video in the Tholu Puppets style (Andhra leather shadow puppets on a lamp-lit stage) from the user's script — ElevenLabs narration, code-drawn puppet theatre, 9:16 or 16:9 MP4. Use when the user asks for a Tholu Puppets / shadow puppet / tholu bommalata video, or gives a story script and asks for a video in this format.
---

# Tholu Puppets video

You turn the creator's story script into a finished MP4: one narrator voice, puppets acting the story on a lamp-lit
cloth screen, curtain opening at the start and closing at the end. No text on screen, no captions.

Paths used below (Claude Code fills these in):
- Plugin: `${CLAUDE_PLUGIN_ROOT}`
- Engine + data: `${CLAUDE_PLUGIN_DATA}`

Voice tools come from this plugin's `tholu-voice` MCP server: `voice_status`, `estimate_voiceover`, `find_voices`,
`make_voiceover`. Scene vocabulary and planning rules are in [reference.md](reference.md) — read it before planning.

## 1. Setup (first video, or if a render says the engine isn't set up)

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup.mjs" --data "${CLAUDE_PLUGIN_DATA}"
```
It checks Node, copies the engine, installs Remotion and the headless browser (first time 1–3 minutes). It is safe to
run again. If it fails, show the user the ✗ line and what to do. Then call `voice_status`.
- If the voice tools are missing entirely, the plugin was just installed: ask the user to restart Claude Code.
- If it reports no key or a key problem: tell the user to run `/plugin`, open **tholu-puppets → Configure options**,
  paste their ElevenLabs API key, and restart Claude Code. **Never ask for the key in chat and never write it to a file.**

## 2. Agree the brief (one short message, only what's missing)
- **Script** — the exact narration. **Aspect** — 9:16 (Reels/Shorts) or 16:9 (YouTube). **Voice** — Kanika (default,
  Indian female storyteller) unless they want another; then use `find_voices` and let them pick (share preview links).
- Copy the script **exactly** (spelling, punctuation, । ॥). Leave out only headings/stage directions not meant to be
  spoken, and say what you left out.
- If they ask you to write the script, write it, show it, and wait for their OK.
- This format is story narration with one voice. Shloka/verse scenes and multiple voices are not part of it — if asked,
  say so plainly and offer to narrate the verse's meaning in the story voice instead.

## 3. Cast check — before spending anything
Compare the story's characters, creatures and places with reference.md. If someone important can't be drawn (e.g.
Krishna, Shiva, a tiger), say so up front. Offer stand-ins only where it's honest (a generic king, queen, rishi,
villager, god, rakshasa, vanara) and let the user decide. Don't proceed with silent substitutions for named heroes.
Offer the cast picture if useful: `node "${CLAUDE_PLUGIN_ROOT}/scripts/render.mjs" --cast <abs path>.png --data "${CLAUDE_PLUGIN_DATA}"`.

## 4. Cost, then voice
1. Make the project folder: `<current working directory>/tholu-videos/<short-slug>/` (absolute path). Save the
   narration as `script.txt` there.
2. `estimate_voiceover` with the exact text. Tell the user the credits it costs and what's left, and **wait for OK**.
3. `make_voiceover` with `text`, `project_dir`, and `voice` if not Kanika. It returns the sentence timeline.
   If it fails midway, fix the cause and call it again — finished clips are reused, not paid for twice.

## 5. Plan the scenes
Write `<project_dir>/scenes.json` following reference.md:
`{ "name": "...", "aspect": "9:16", "scenes": [ { "start": 0, "end": 5.2, "block": "opening", "params": {...} }, ... ] }`
- Times come from the sentence timeline. Change scenes at sentence or clause boundaries, just before the words that
  the new picture shows. First scene `opening` from 0, last `closing` ending exactly at the voice-over `duration`
  (in voice.json). No gaps or overlaps.
- Every scene should show what the narration is saying at that moment. Vary blocks and cameras; hold 3–7 s.

## 6. Check, look, render
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/render.mjs" "<project_dir>" --data "${CLAUDE_PLUGIN_DATA}" --check
node "${CLAUDE_PLUGIN_ROOT}/scripts/render.mjs" "<project_dir>" --data "${CLAUDE_PLUGIN_DATA}" --stills 3,<a few mid-scene times>
```
Fix every ✗ the check reports. Look at the stills (Read the PNGs): puppets fully in frame, the right characters, nothing
odd. Then render:
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/render.mjs" "<project_dir>" --data "${CLAUDE_PLUGIN_DATA}"
```
Rendering is slow (roughly 10–15 minutes per minute of video): run it in the background, tell the user the expected wait,
and wait for it to finish before handing over.

## 7. Hand over
Give the MP4 path, its length and aspect, and one line on how to ask for changes ("make scene 4 a spotlight on
Ravana", "16:9 version"). Changes to scenes only need a re-render, not new voice credits. A changed script needs a new
voice-over (show the cost again first).

## Rules
- Never show, log, or store the ElevenLabs key. Never put it in commands, files or chat.
- Never spend credits without the user's OK on the number.
- Keep everything for a video inside its project folder.
