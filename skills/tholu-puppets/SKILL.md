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

Narration is recorded through the **ElevenLabs connector**: the creator signs in to their own ElevenLabs account, so
there is no API key anywhere. This plugin brings the connector with it (server `elevenlabs`, hosted at
`https://api.elevenlabs.io/v1/mcp`); a creator who already added ElevenLabs as a claude.ai connector can use that one
instead. The tools you need from it: `account_get_usage`, `creative_list_voices`, `creative_create_flow`,
`creative_generate_speech`, `creative_get_flow_run_status`, `creative_transcribe_audio`. If a name differs slightly
in their connector version, use the matching tool. Scene vocabulary and planning rules are in
[reference.md](reference.md): read it before planning.

## 1. Setup (first video, or if a render says the engine isn't set up)

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup.mjs" --data "${CLAUDE_PLUGIN_DATA}"
```
It checks Node, copies the engine, installs Remotion and the headless browser (first time 1–3 minutes). It is safe to
run again. If it fails, show the user the ✗ line and what to do. Then call `account_get_usage` to confirm ElevenLabs
is connected and see the credits left.
- If no ElevenLabs tools are available, or they say authentication is needed: tell the user to type `/mcp`, pick
  **plugin:tholu-puppets:elevenlabs** (or their ElevenLabs connector), choose **Authenticate**, and sign in to
  ElevenLabs in the browser page that opens. Then continue (restart Claude Code only if the tools still don't appear).
  In a terminal they can also run `claude mcp login plugin:tholu-puppets:elevenlabs`.
- **Never ask for an API key, password or sign-in code in chat.** Sign-in happens only in the browser.

## 2. Agree the brief (one short message, only what's missing)
- **Script**: the exact narration. **Aspect**: 9:16 (Reels/Shorts) or 16:9 (YouTube). **Voice**: Kanika (default,
  Indian female storyteller) unless they want another; then use `creative_list_voices` (pass `languages`, and
  filters like gender / `use_cases: ["narrative_story"]`) and let them pick. Share preview links if the result has them.
- Copy the script **exactly** (spelling, punctuation, । ॥). Leave out only headings/stage directions not meant to be
  spoken, and say what you left out.
- If they ask you to write the script, write it, show it, and wait for their OK.
- This format is story narration with one voice. Shloka/verse scenes and multiple voices are not part of it. If asked,
  say so plainly and offer to narrate the verse's meaning in the story voice instead.

## 3. Cast check (before spending anything)
Compare the story's characters, creatures and places with reference.md. If someone important can't be drawn (e.g.
Krishna, Shiva, a tiger), say so up front. Offer stand-ins only where it's honest (a generic king, queen, rishi,
villager, god, rakshasa, vanara) and let the user decide. Don't proceed with silent substitutions for named heroes.
Offer the cast picture if useful: `node "${CLAUDE_PLUGIN_ROOT}/scripts/render.mjs" --cast <abs path>.png --data "${CLAUDE_PLUGIN_DATA}"`.

## 4. Cost, then voice
1. Make the project folder `<current working directory>/tholu-videos/<short-slug>/` (absolute path) and save the
   narration there as `script.txt`. Split it into parts to record:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/voice.mjs" split "<project_dir>"
   ```
   It prints each part's id, text and the file names to fill (`voice/<id>.mp3`, `voice/<id>.words.json`). Parts that
   are already recorded are marked, so after a failure you only redo what's missing.
2. **Find the voice id.** For Kanika: `creative_list_voices` with `search: "Kanika"`, `languages: ["hi"]`; her id is
   `xccfcojYYGnqTTxwZEDU`, so use that id only once the search confirms it is available. For another voice, use the
   id the user picked.
3. **Cost.** Call `creative_generate_speech` with `estimate_only: true` for the parts (same arguments as below), and
   `account_get_usage` for the balance. Narration costs about 1 credit per character, and word timing (Scribe) costs
   a little more per minute of audio. Tell the user the total and what's left, then **wait for their OK**.
4. **Record.** `creative_create_flow` once, then for each part still to record call `creative_generate_speech` with
   that `flow_id`, `prompt` = the part's exact text, `model_id: "eleven_multilingual_v2"`, the `voice_id`, and
   **`generations_count: 1`**. Never call it a second time to retry: that charges again. If a call errors, check
   `creative_get_flow_run_status` first.
5. **Download.** Poll `creative_get_flow_run_status` (flow_id + session_ids) until `all_completed`. For each part,
   download its audio straight away (the links expire after about 2 hours):
   `curl -sfL -o "<project_dir>/voice/<id>.mp3" "<content_url>"`
6. **Word timings.** For each part, call `creative_transcribe_audio` with the same `flow_id`,
   `connect_from: [<that part's speech node_id>]`, `model_id: "eleven_scribe_v1"`. Poll
   `creative_get_flow_run_status` until done, then save the words: download `words_download_url` (or the transcript's
   `download_url`) with curl to `<project_dir>/voice/<id>.words.json`. If there is no link, write the result's
   `transcripts[0].words` array to that file as JSON.
7. **Build the voice-over:**
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/voice.mjs" build "<project_dir>"
   ```
   It writes `voice.json` (clips, word times, total duration) and prints the sentence timeline for planning. If it
   says something is missing or not playable, fetch that file again (from `creative_get_flow_run_status`, without
   generating it again).

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
- No API keys: ElevenLabs is reached only through the signed-in connector. Never ask for a key, password or code.
- Never spend credits without the user's OK on the number.
- Keep everything for a video inside its project folder.
