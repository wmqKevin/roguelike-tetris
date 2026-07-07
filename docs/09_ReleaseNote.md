# Neon Breach Tetris v0.1.0 Release Note

Release date: 2026-07-07
Platform: Web
Deployment URL: https://wmqkevin.github.io/roguelike-tetris/

## Release Scope

This MVP release delivers the first playable web version of the roguelike Tetris project:

- Core Tetris loop: falling pieces, movement, rotation, line clear, scoring, gravity, lock delay, and restart.
- Minimal roguelike loop: stage progression, randomized upgrades, reward selection, and run-based growth.
- Neon MVP presentation: Phaser rendering, HUD, responsive layout, effects profile, placeholder visual assets, and audio hooks.
- Local persistence: save service for lightweight run/player state.

## Security Fix

The release includes the ZI-65 npm audit remediation:

- Upgraded `vite` to `8.1.3`.
- Upgraded `vitest` to `4.1.10`.
- Upgraded `@vitejs/plugin-basic-ssl` to `2.3.0`.
- Refreshed `package-lock.json`.

Release verification on the canonical repository passed with `npm audit` reporting 0 vulnerabilities.

## Verification

- `npm install --cache /tmp/npm-cache`: passed, 0 vulnerabilities.
- `npm audit --cache /tmp/npm-cache`: passed, 0 vulnerabilities.
- `npm test -- --run`: passed, 2 test files / 7 tests.
- `npm run build`: passed.
- Production artifact: `dist/` size 1.2 MB; main JavaScript `1,208.78 kB`, gzip `323.79 kB`.

## Known Risks

- Reward card affordance is still P2: cards look clickable, but the current MVP supports keyboard selection with `1` / `2` / `3` only.
- Browser compatibility remains smoke-only: verification covered HTTP/build/source/layout checks in this runtime, not real multi-browser screenshot validation.
- The main JavaScript chunk exceeds Vite's 500 kB warning threshold after minification. This does not block the MVP release, but later releases should evaluate code splitting.

## Rollback Plan

- GitHub Pages serves the `gh-pages` branch. To roll back, repoint or force-update `gh-pages` to the previous known-good deploy commit.
- Canonical source is retained on `main`; release commit history remains traceable by commit SHA.
- If GitHub Pages configuration causes an availability issue, disable Pages or restore the prior Pages source branch in repository settings.

## Next Steps

- Add mouse/touch reward-card selection to match visual affordance.
- Run real browser compatibility checks across Chrome, Edge, Firefox, and common mobile viewport sizes.
- Split vendor/game chunks or lazy-load Phaser-heavy modules if load performance becomes a release concern.
