# Blobby Jelly — Multiplayer Jelly Jump Game

Web-based multiplayer platformer game built with Next.js 16.

- Game URL: `/game` (also `/bloby.html` for legacy links)
- Network config API: `/api/config`
- Main game engine (current): `public/bloby.html`
- Shared game assets: `public/game/`

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Notes

- Do not commit credentials; see `.env.example`.
- TURN/multiplayer config is served server-side via `/api/config`.
- See `AGENTS.md` and `.clinerules/project-rules.md` for project context.
