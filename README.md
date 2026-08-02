# SPACE CAT

SPACE CAT is a live spaceflight terminal built around real launch data, a DOS-inspired
web experience, and standalone launch tracking for Wear OS and watchOS.

- Live site: [spacecat.watch](https://spacecat.watch)
- Wear OS: [Google Play](https://play.google.com/store/apps/details?id=com.spacecat.terminal)
- Web terminal: live launch countdowns, source-aware mission states, ISS and deep-space
  tools, ASCII simulations, hidden filesystem stories, and two flight-dynamics games
- Languages: English, Turkish, Spanish, French, and Japanese explanatory layers; terminal commands
  and mission-control vocabulary remain English

## Repository map

| Path | Purpose |
|---|---|
| `web/` | Cloudflare Pages terminal and Worker APIs |
| `wear/` | Wear OS application |
| `watchos/` | watchOS application |
| `bot/` | Cloudflare launch relay bot |
| `tools/` | Regression, deployment, analytics, and campaign utilities |
| `store/` | Store listings and approved marketing assets |
| `docs/` | Architecture, experience rules, roadmap, and operational state |

## Web validation

```bash
for test_file in tools/test_web_*.js tools/test_bot_security.js; do
  node "$test_file"
done
```

Local Cloudflare runtime:

```bash
npx wrangler pages dev web
```

Production secrets are never committed. Cloudflare tokens, API credentials, signing
keystores, local environment files, build products, and tool caches are excluded by
`.gitignore`.

## Product principles

The terminal is playful but its claims are strict: source data, planned events, modeled
views, and simulations are labeled separately. The system must remain mobile-first,
accessible, low-maintenance, and useful even when an upstream data source is degraded.

See [`docs/EXPERIENCE_BIBLE.md`](docs/EXPERIENCE_BIBLE.md) for the design contract and
[`docs/SON_DURUM.md`](docs/SON_DURUM.md) for the current operational state.
