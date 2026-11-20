# Tholu Puppets: story videos by chatting with Claude

Give Claude a story script and get back an animated video in the style of **Tholu Bommalata**, Andhra Pradesh's
traditional leather shadow-puppet theatre. Painted leather puppets act out your story on a lamp-lit screen. The curtain
opens at the start and closes at the end, and an ElevenLabs voice narrates.

- **Input:** your story script, in Hindi, English or any language ElevenLabs speaks.
- **Output:** an MP4 at 9:16 (Reels / Shorts) or 16:9 (YouTube), up to a few minutes long.
- **Everything is drawn in code.** No AI image or video generation is used, so every video has the same hand-crafted look.

> This free plugin covers story narration with one voice. Sanskrit verse (shloka) scenes, multiple voices and the
> other studio formats are part of the full Studio.

---

## What you need

| | |
|---|---|
| **Claude Code** | Any paid Claude plan. Works in the Claude desktop app (Code tab) or the `claude` terminal app. |
| **ElevenLabs** | An ElevenLabs account. You just sign in, no API key needed. A paid plan (Starter or above) is recommended so you can use library voices such as the default narrator. |
| **Node.js 18+** | https://nodejs.org (LTS). Check with `node -v`. |
| **Disk / internet** | About 600 MB for the renderer (installed once) and an internet connection for the first setup. |
| **Computer** | macOS, Windows or Linux. Rendering runs on your computer and takes time: about 10–15 minutes per minute of video on a recent laptop. |

You don't need to install ffmpeg or anything else. The plugin sets up the rest.

---

## Install (one time, about 2 minutes)

### 1. Add the plugin to Claude Code
Paste this one line into Claude Code:

```
/plugin install tholu-puppets --marketplace ankitsharamatv/puppet-animation
```

If your Claude Code says it doesn't recognise `--marketplace`, update Claude Code or use the two-line form:

```
/plugin marketplace add ankitsharamatv/puppet-animation
/plugin install tholu-puppets@puppet-animation
```

Or from a terminal:

```bash
claude plugin marketplace add ankitsharamatv/puppet-animation
```

```bash
claude plugin install tholu-puppets@puppet-animation
```

> Pasted only the link https://github.com/ankitsharamatv/puppet-animation into Claude? Ask it to "install this
> plugin". Claude can't run `/plugin` commands itself, so it will give you the line above to paste.

### 2. Sign in to ElevenLabs
The plugin brings the official ElevenLabs connector with it. Connect it once:

1. Type `/mcp` in Claude Code.
2. Pick **plugin:tholu-puppets:elevenlabs** and choose **Authenticate**.
3. A browser page opens on elevenlabs.io. Sign in and click **Allow**.

That's it: there's no API key to create or paste. (From a terminal you can also run
`claude mcp login plugin:tholu-puppets:elevenlabs`.)

> Already added ElevenLabs as a connector in claude.ai (Settings → Connectors)? That works too, and you can skip this step.

### 3. Check it's ready
Restart Claude Code if you just installed it, then ask:

```
Is the Tholu Puppets plugin ready?
```

The first time, Claude runs the setup. It installs the renderer (Remotion and a headless browser) into the plugin's own
data folder, which takes about 1 minute, then checks that ElevenLabs is connected and shows your remaining credits.

---

## Make a video

Open Claude Code in the folder where you want your videos, and write something like:

```
Make a Tholu Puppets video, 9:16, from this script:

Long ago, in the kingdom of Mithila, King Janaka announced a great contest…
```

Claude then:

1. **Checks the cast.** If your story needs a character the puppet set doesn't have (for example Krishna or Shiva), it
   tells you before anything is spent and suggests honest stand-ins.
2. **Shows the cost.** It tells you how many ElevenLabs credits the narration will use (about 1 credit per character,
   plus a little for timing the words) and how many you have left, then **waits for your OK**.
3. **Records the narration** with the default narrator, *Kanika* (a warm Indian storyteller voice), or any ElevenLabs
   voice you ask for, and times every word.
4. **Plans the scenes** to match what's being said: who's on stage, what they do, the setting, camera moves, and moments
   like a spotlight, a giant, a looming shadow or a fight.
5. **Previews a few frames,** fixes anything off, then **renders the MP4**.

Your video is saved in `tholu-videos/<name>/` inside the folder you started Claude Code in.

### Changing a video
Just ask in the same chat:
- "Make the scene where Ravana arrives a red spotlight."
- "Swap scene 5 to the forest."
- "Make a 16:9 version too."

Scene changes only need a re-render and don't use any ElevenLabs credits. Changing the script needs a new narration,
and Claude shows the cost again before recording.

### Want a different narrator?
Say "use a deep male Hindi voice" (or similar). Claude searches the ElevenLabs voices, shows a few options, and uses
the one you pick.

### See every puppet
Ask "Show me the Tholu Puppets cast" and Claude renders a picture of every available puppet with its name.

---

## What's in the puppet box

- **Characters:** Rama, Lakshmana, Sita, Ravana (classic, and Valmiki's dark-skinned version), Hanuman, vanaras,
  rishis, Parashurama, Jamadagni, Brahma, Vishnu, Indra, kings, queens, princes, rakshasas, Shurpanakha, Vedavati, Tulsi,
  devotees, villagers, a generic god, Kamadhenu, Nandi and Airavata.
- **Settings:** palace, Lanka, forest, river, mountain, ashram, battlefield, night, tulsi grove, home.
- **Scene types:** opening curtain, story scene, journey, spotlight, giant, shadow, clash, ranking, closing curtain.
- **Effects:** flood, petals, rain, embers, lightning, divine light, sparkles, a flying chakra, and more.

---

## Privacy

- There's no API key. You sign in to ElevenLabs in your browser, and Claude Code keeps the sign-in in your system
  keychain. You can sign out any time from `/mcp` (pick **plugin:tholu-puppets:elevenlabs**).
- Each narration also appears in your ElevenLabs account (under Flows), like anything you make on elevenlabs.io.
- Your scripts, audio and videos are saved on your computer, in your project folder.
- The plugin doesn't collect analytics. Apart from ElevenLabs, it only connects to npm and Google's download servers
  for the one-time renderer setup, and to ElevenLabs' storage to download your recordings.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Claude says ElevenLabs isn't connected / needs authentication | Type `/mcp`, pick **plugin:tholu-puppets:elevenlabs**, choose **Authenticate**, and sign in. |
| The ElevenLabs tools don't appear at all | Restart Claude Code after installing. Then check `/mcp` again. |
| Out of credits / quota | Top up or wait for your ElevenLabs plan to renew. |
| Voice can't be used / library voice error | Library voices need a paid ElevenLabs plan. Upgrade, or pick one of your own voices. |
| `Node … is too old` | Install Node 18 or newer from nodejs.org, then ask Claude to run the setup again. |
| Setup or render fails while downloading | Check your internet connection and ask Claude to run the setup again. It's safe to repeat. |
| Render is slow | Expect about 10–15 minutes per minute of video. Close heavy apps and keep the computer awake. Claude renders in the background. |

To remove everything: `/plugin uninstall tholu-puppets@puppet-animation` (this also removes the renderer it installed).
Your `tholu-videos` folders are left alone.

---

## Credits and licence

- **Tholu Bommalata** ("dance of leather puppets") is the shadow-puppet tradition of Andhra Pradesh, kept alive by
  generations of puppeteer families. This plugin is a tribute to that art. Please credit the tradition when you share
  your videos.
- Rendering uses [Remotion](https://www.remotion.dev). Remotion is free for individuals and companies of up to 3
  people. Larger companies need a [Remotion company licence](https://www.remotion.dev/license).
- Narration uses [ElevenLabs](https://elevenlabs.io) under your own account and its terms.
- See [LICENSE.md](LICENSE.md) for how you may use this plugin.
