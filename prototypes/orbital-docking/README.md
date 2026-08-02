# SPACE CAT — Orbital Rendezvous source prototype

Standalone local source prototype. It remains outside `web/` so physics and experience
changes can be reviewed in isolation. The user-approved production copy is served at
`https://spacecat.watch/games/docking`; its game script must remain identical to this source.

## Contract

- Pure ASCII / DOS presentation; no images, network calls or accounts. Voice is optional,
  default-off and loaded only from bundled local clips.
- Four-axis relative translation with a simplified deterministic orbital-drift model and
  a presentation scale tuned so each burn produces promptly visible ASCII motion.
- A successful capture requires corridor alignment and safe relative velocity.
- Hold Point 25 and Hold Point 12 require stable relative motion for 2.5 seconds; crossing
  an uncleared gate aborts the approach. Final clearance also requires Fine RCS.
- Three camera regimes move from orbital overview to corridor tracking and a close port view.
- Nominal, Cross Drift and Low Fuel profiles provide bounded replay variation.
- Keyboard and press-and-hold touch controls share the same control path.
- The screen explicitly identifies itself as a training model, not telemetry or flight software.
- Device-local best score only. No clearance or leaderboard integration.
- Optional, default-off `SC STATION CONTROL` voice channel. Eleven local radio-filtered
  system-voice calls announce only meaningful procedural, safety and capture events. They are
  fictional Space Cat calls, not NASA/ISS recordings.
- Scoring does not reward rushing. Fuel, stability, RCS pulse discipline and completed
  hold points produce an S–F grade and a technical post-flight debrief.

## Production promotion — CODEX — 1 August 2026

- User experience and visual approval received.
- Hidden discovery: `/usr/games/README.TXT → DOCKING.COM → docking`; absent from main help.
- Production route uses `noindex,follow` and a visible return link to the terminal.
- 320×800 and 390×844 mobile QA passed with 48 px controls and no horizontal overflow.
- Eleven local voice files remain default-off; no API, polling service or monthly cost added.
- Production deployment: `df0a5fb7`; production regression package: 44 checks.
