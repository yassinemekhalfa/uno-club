# UNO Club

A responsive React/TypeScript card-game application with a reusable game engine and an authoritative Node/Socket.IO server. Vite serves the frontend through the same server in development; production serves the built assets.

## Run locally

Use Node 22 LTS or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Guest bot games and multiplayer rooms work without a database. Open a separate browser or private window for each player. Browser tabs in the same session represent the same player.

```sh
npm test
npm run build
```

For the real WebSocket integration test, keep the server running and run `INTEGRATION=1 npm test` (PowerShell: `$env:INTEGRATION='1'; npm test`).

## Database and accounts

Create a PostgreSQL database, set `DATABASE_URL` from `.env.example`, then run `npm run db:migrate`. Environment variables must be supplied by your shell or deployment platform. The schema migration creates accounts, sessions, password resets, games, participants, friends, and achievements. Achievement definitions are real application data; there are no fabricated users, matches, or rankings.

Account passwords use salted scrypt. Session tokens are random, stored hashed in PostgreSQL, and delivered in HTTP-only SameSite cookies. Password reset delivery requires `MAIL_WEBHOOK_URL`: the private endpoint receives `{to, resetUrl}` and must deliver the email. Use HTTPS and `NODE_ENV=production` in deployment so cookies are secure. Set `APP_URL` to your canonical origin.

Production: build, then run `NODE_ENV=production npm start`. The server reads `PORT` (default 3000). WebSocket upgrades must be supported by the reverse proxy. Do not deploy this server on a platform that only supports short-lived serverless requests.

## Architecture and data flow

- `src/game/engine.ts`: deck, legality, actions, scoring, bots, and redacted player views. The UI never owns authoritative state.
- `server/index.ts`: room lifecycle, validated socket commands, identity, rate limits, turn timers, bots, chat, reconnect, and match persistence.
- `server/database.ts`: authentication, profile, leaderboard, match history, achievements, and friendship HTTP endpoints.
- `database/schema.sql`: idempotent initial PostgreSQL migration.
- `src/App.tsx`: lobby, table, settings, account, and community interfaces.
- `src/components/Card.tsx`: data-driven cards shared by the table and rules guide.
- `tests/`: rules tests, full bot simulations, and actual Socket.IO integration.

A client submits intent with the last game revision. The server validates the action against its own state, rejects stale requests, applies rules, and sends each player a view containing only their own hand. Deck contents and opposing hands never cross the wire. Guest reconnect tokens preserve identity across reloads. A disconnected player keeps their seat while the server makes bot moves; reconnect restores control.

## Implemented rules

108-card deck, 2–4 players, configurable starting hands and timers, matching color/value/action, wild color selection, legal-only draw four, skip, reverse including two-player behavior, draw penalties, matching draw-card stacking, draw-until-playable, forced drawn-card play, UNO declaration/catching with a four-second window, reshuffle, and single-round scoring. Classic, quick, and configurable house-rule presets share the engine. Bots choose moves using color counts and the next opponent’s hand size.

## Current scope and production gaps

This is an initial playable release, not the entire production platform described in the brief. Rooms and guest identities are held in memory and do not survive server restarts; horizontal scaling requires shared room storage and coordination. Accounts and completed matches persist in PostgreSQL when configured. Database startup and email delivery require external infrastructure.

Not yet implemented: teams, multi-round tournaments, advanced/custom cards, jump-in, 7–0, draw-four challenges, distinct hard-bot search/personality models, friend presence/invitations, time-filtered rankings, detailed card-level statistics, reports/admin moderation, music, and development account seeds. The UI exposes only supported game modes and rules. Practice matches contribute profile XP and account wins; the leaderboard counts only human-only matches. In-memory rate limits should be replaced with distributed limits for multi-instance deployments. Perform a security and load review before public production use.

## Verification

Verified locally: TypeScript, production build, 19 engine tests (including 20 complete bot-game simulations), real two-client WebSocket integration, and headless Chrome mobile smoke checks. The browser check verifies bot launch, seven starting cards, three opponents, leaving the table, and no horizontal page overflow at 390px. Database-backed account flows require PostgreSQL and have not been exercised in this environment. The installed machine has Node 19; checks passed, but use supported Node 22 LTS for deployment.

The visual design uses CSS cards, custom responsive styles, optional synthesized move sounds, theme tokens, focus indicators, and device reduced-motion preferences. This independent UNO-style project is not affiliated with Mattel.
