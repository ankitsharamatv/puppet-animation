# Tholu Puppets — scene reference

The whole video is a puppet show: `opening` (curtain opens, camera pushes through the stage frame) → story scenes on the
lamp-lit screen with parallax → `closing` (camera pulls back, curtains close). No text ever appears.

## Puppets (`who`)
| name | looks like |
|---|---|
| rama | hero, blue skin, tall crown, bow, ochre |
| lakshmana | hero, golden skin, crown, bow, green |
| sita | woman, small crown, green and red sari, lotus |
| ravana | demon king, 10 heads, 20 arms, black and gold, sword |
| ravanav / ravanas | Ravana as in Valmiki: dark blue-grey skin, scars, pearl crown, 10 heads, 20 arms (red / white robes) |
| ravana1 | the same Valmiki Ravana with one head and two arms |
| hanuman | white monkey, red clothes, tail, mace |
| vanara | white monkey, green clothes, no crown |
| rishi | sage, matted hair, saffron robe, water pot |
| jamadagni | sage in white |
| parashurama | warrior sage with an axe, beard |
| brahma | four-faced creator (side heads), red and ochre |
| vishnu | blue, four arms, chakra |
| indra | king of gods, white, vajra |
| god | generic deity, crown, lotus |
| king | crowned king, maroon and indigo, sword |
| queen | crowned woman, red and green sari |
| prince | young crowned man, sword |
| anaranya | an old king, white and green, sword |
| sahasrabahu | king with 24 arms |
| rakshasa | demon soldier, sword |
| shurpanakha | demon woman, dark sari |
| vedavati | woman ascetic, saffron sari |
| tulsi | woman in green with a tulsi sprig (the goddess Tulsi) |
| devotee | woman with a water pot |
| villager | ordinary man in white |
| kamadhenu | sacred cow |
| nandi | bull |
| airavata | white elephant |

Anyone else (Krishna, Shiva, Ganesha, Arjuna, animals like tigers or birds…) is **not available**. Say so before
recording. Honest stand-ins: king, queen, prince, rishi, god, villager, devotee, rakshasa, vanara.

## Actions (`who/action`)
stand · talk (mouth moves with the voice) · walk · attack · angry · bow · pray · bless · hold · grab · celebrate ·
bound (tied) · fall · chant · draw (draws a bow) · point · vanish · appear · offer · sleep

Cast strings: `rama/talk|sita/pray|ravana/angry` — up to 3 puppets, left to right. Puppets on the right face left.

## Settings
palace · lanka (golden demon city) · forest · river · mountain · ashram (hermitage) · battle · night · tulsivan (tulsi
grove) · home

## Blocks and their params
| block | params | use for |
|---|---|---|
| `opening` | setting, cast, prop | always first, 4–6 s: curtain opens on the first scene |
| `scene` | setting, cast (1–3), camera, prop, fx | most of the story |
| `journey` | setting, cast (walkers; `x/bound` is led on a rope) | travel, leaving, searching |
| `spotlight` | setting, who (one), tint warm/red | one character's big moment; red = rage, menace |
| `giant` | setting, who (the big one), small (1–3 tiny ones) | power, fear, a huge being over small people |
| `shadow` | setting, who (in front), form (the shadow) | disguise, true nature, a looming threat |
| `clash` | setting, a, b | a fight between two |
| `rank` | setting, a, b, c (weakest → strongest) | comparing three; give 3 cues (times each is lit) |
| `closing` | setting, cast, prop | always last, 2–4 s: pull back, curtains close |

- camera: wide · medium (default) · close · push (moves in to the first puppet) · pan
- prop: none · shivling · fire · throne · cage · hut · brokenbow · tulsi · thali · couch
- fx: none · flood (rises at cue 1) · petals · rain · embers · arms (severed arms fall from the last puppet) ·
  crowns (21 crowns pile up) · tej (divine light flows from first puppet to last) · water · sparkle · lightning · chakra
- `cues` (optional, absolute seconds in the video): used by `flood` and `rank` for timing.

## Planning rules
- Scenes 3–7 s. Change picture when the narration changes subject, at a sentence or clause start.
- Match the words: whoever is spoken about is on stage; a speaker "says"/"asks" → `talk`; prayer → `pray`/`bow`;
  battle words → `clash` or `attack`; travel → `journey`; a reveal → `shadow` or `appear`; blessing → `bless`.
- Vary: don't use the same block + camera twice in a row. Use `spotlight`, `giant`, `shadow` for dramatic peaks, not
  constantly. Keep the setting consistent within a part of the story.
- `opening` uses the first story setting and characters; `closing` usually the last scene's cast with `bless`/`pray`/
  `celebrate`.
- First scene starts at 0, last ends exactly at `duration` from voice.json, each scene starts where the previous ends.

## Example (9:16)
```json
{
  "name": "sita-swayamvar",
  "aspect": "9:16",
  "scenes": [
    { "start": 0, "end": 5.4, "block": "opening", "params": { "setting": "palace", "cast": "king/talk|sita/stand", "prop": "throne" } },
    { "start": 5.4, "end": 10.8, "block": "scene", "params": { "setting": "palace", "cast": "king/talk|prince/stand|prince/stand", "camera": "pan" } },
    { "start": 10.8, "end": 15.0, "block": "journey", "params": { "setting": "forest", "cast": "rishi/walk|rama/walk|lakshmana/walk" } },
    { "start": 15.0, "end": 19.6, "block": "scene", "params": { "setting": "palace", "cast": "rama/draw", "camera": "push", "prop": "brokenbow", "fx": "sparkle" } },
    { "start": 19.6, "end": 23.4, "block": "spotlight", "params": { "setting": "palace", "who": "sita/offer", "tint": "warm" } },
    { "start": 23.4, "end": 27.5, "block": "closing", "params": { "setting": "palace", "cast": "rama/bless|sita/pray", "prop": "none" } }
  ]
}
```
