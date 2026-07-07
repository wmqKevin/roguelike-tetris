# Neon Breach Tetris v0.2.1 Release Note

Release date: 2026-07-07
Platform: Web
Deployment URL: https://wmqkevin.github.io/roguelike-tetris/

## v0.2.1 Hotfix

v0.2.1 fixes BUG-004, where a reward triggered by full energy could immediately
reopen after the player selected an upgrade. The root cause was that
`selectReward()` advanced to the next stage without consuming the full-energy
trigger, so the next locked piece still satisfied the energy reward condition.

The hotfix consumes energy when the selected reward was triggered by full
energy. Line-target rewards with non-full energy keep their existing energy
carryover. QA regression covered `scrap_recycle`, non-full-energy line-target
carryover, and `quick_charge` stage-start energy behavior.

## v0.2 Release

## Release Scope

v0.2 updates the playable roguelike Tetris build with five experience improvements approved through ZI-70 and ZI-72:

- Stage 1 target adjusted from 6 lines to 4 lines, with clearer target prompts, near-target flashing, and Energy pulse feedback.
- Reward cards now support mouse selection, hover feedback, keyboard `1` / `2` / `3`, and explicit selection guidance.
- Upgrade feedback now includes toast messaging, HUD highlighting, layered effects, and stronger audio cues.
- First-run keyboard guidance fades after the player's first movement or rotation input.
- Game Over and Victory panels now show a run build review, including acquired upgrades and restart guidance.

## Security Status

The v0.2 release retains the ZI-65 npm audit remediation:

- `vite` is on `8.1.3`.
- `vitest` is on `4.1.10`.
- `@vitejs/plugin-basic-ssl` is on `2.3.0`.
- `npm audit` reports 0 vulnerabilities in release verification.

## Verification

- `npm install --cache /tmp/npm-cache`: passed, 0 vulnerabilities.
- `npm audit --cache /tmp/npm-cache`: passed, 0 vulnerabilities.
- `npm test`: passed, 2 test files / 12 tests.
- `npm run build`: passed.
- Production artifact: `dist/` size 1.3 MB; main JavaScript `1,213.81 kB`, gzip `325.44 kB`.

## Known Risks

- Real browser feel was not re-tested in this runtime because Chrome/Chromium is unavailable. This matches the accepted v0.1.0 environment limitation; v0.2 was covered by source review, automated tests, production build, and HTTP smoke verification.
- BUG-003 remains open: the Game Over/Victory retry affordance is keyboard text (`Space 再来一局`) rather than a clickable button. Keyboard restart works, and CEO accepted this as non-blocking for v0.2.
- The main JavaScript chunk exceeds Vite's 500 kB warning threshold after minification. This does not block the release, but later releases should evaluate code splitting.

## Rollback Plan

- GitHub Pages serves the `gh-pages` branch. To roll back to v0.2.0, restore the previous deploy commit `bbee620`.
- To roll back to v0.1.0, restore deploy commit `1598e42`.
- Keep source and Pages commit SHAs in release/deployment logs so the previous build can be restored without rebuilding.
- If Pages availability regresses, restore the previous `gh-pages` branch tip or disable Pages temporarily while the branch pointer is corrected.

## Next Steps

- Target BUG-003 for v0.3 by adding a click/tap retry button to the Game Over/Victory panel.
- Run real browser compatibility checks across Chrome, Edge, Firefox, and common mobile viewport sizes when a browser-capable runtime is available.
- Split vendor/game chunks or lazy-load Phaser-heavy modules if load performance becomes a release concern.
