# Neon Breach Tetris Release Notes

Release date: 2026-07-08
Platform: Web
Deployment URL: https://wmqkevin.github.io/roguelike-tetris/

## v0.6.0 Draft

v0.6.0 focuses on making upgrade feedback feel immediate while tightening the
portrait HUD.

### Release Scope

- P0: Portrait toast now uses viewport width minus 28px, stays centered, and
  wraps text; compact objective copy is split into a main row and rotating
  secondary row.
- P1: First reward selection triggers a short forced demo: hard-drop energy fly
  text, Next highlight, or skill-ready flash/pulse depending on reward type.
- P1: Feedback has stronger synthesized audio and visual layering for hard
  drop, 1/2/3/4 line clears, reward select, skill release, and Game Over. BGM is
  a generated Web Audio loop, so no external audio license is required.
- P1: Terminal panel now adds targeted next-run advice and highlights codex /
  highest-stage badge progress.
- Cleanup: No repository favicon or stale asset reference was found; headless
  Chrome output showed only environment Chrome/DBus/cache messages, not app
  asset 404s.

### Verification

- `npm install`: completed with 0 vulnerabilities.
- `npm test`: 5 files / 28 tests passed.
- `npm run build`: passed; Vite still reports the expected Phaser bundle-size
  warning.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Real Chrome smoke: 390x844 portrait and 960x720 desktop screenshots render
  correctly. Interactive reward/toast browser automation is not available in
  this runtime; portrait toast geometry is covered by unit tests.

## v0.5.0 Release

v0.5.0 focuses on phone-first playability and making the first roguelike reward
feel immediately concrete, while adding lightweight post-run progression hooks.

### Release Scope

- P0: Narrow portrait launches now use a viewport-sized canvas and independent
  portrait layout instead of scaling the fixed 1280x720 stage. The board is
  enlarged for 390px phones, with status text near the top and Hold/Next in the
  bottom tray. Landscape, 520px+, and desktop layouts keep the v0.4 FIT path.
- P0: First reward choices now include a four-piece trial window and immediate
  demonstrations: precise hard drop can force a high-drop I piece with energy
  feedback, stable preview highlights the additional Next value, and advanced
  skill grants enough energy to try the skill right away.
- P1: Game Over and Victory summaries now explain the failure reason, the best
  run performance, the run style, and the next improvement target.
- P1: A lightweight local codex records collected upgrades, highest-stage
  badges, and best run style through `localStorage`, with write-failure fallback
  so storage restrictions do not interrupt terminal flow.
- P2: BGM, sound layering, particle intensity, new stages, new special blocks,
  backend meta progression, and leaderboards remain deferred to v0.6+.

### Verification

- `npm install`: required before release verification; expected 0
  vulnerabilities.
- `npm audit --audit-level=high`: required to report 0 high/critical
  vulnerabilities.
- `npm test`: required to pass all automated tests; QA accepted 4 files / 23
  tests after BUG-008 hotfix.
- `npm run build`: required to produce the production bundle.
- Real Chrome QA gate: 390x844 portrait board enlarged with top status and
  bottom Hold/Next; 844x390 landscape and 1280x720 desktop retain the regular
  FIT / side-HUD layout.
- GitHub Pages HTTP smoke: root page and the new hashed JavaScript asset must
  return 200 after deployment; the superseded v0.4 JavaScript asset should
  return 404 after cleanup.

### Known Risks

- The main JavaScript chunk is expected to remain above Vite's 500 kB warning
  threshold because Phaser is bundled with the game.
- Mobile validation covered 390x844 browser automation and QA review; broader
  physical-device coverage, audio feel, and particle polish are deferred to
  v0.6.
- Local codex data is intentionally browser-local and can be unavailable in
  private or restricted storage contexts; v0.5 falls back without crashing, but
  persistence may be skipped by the browser.

### Rollback Plan

- GitHub Pages serves the `gh-pages` branch. To roll back to v0.4.0, restore
  deploy commit `6be0aa16979e53c6b3c82503ddf25078e84c536c`.
- The v0.4.0 source baseline is `main`
  `357b334c329a56d212f69e5f5384e516b6a838f8`.
- Keep source and Pages commit SHAs in release/deployment logs so the previous
  build can be restored without rebuilding.

# Neon Breach Tetris v0.4.0 Release Note

Release date: 2026-07-07
Platform: Web
Deployment URL: https://wmqkevin.github.io/roguelike-tetris/

## v0.4.0 Release

v0.4.0 focuses on making the first meaningful roguelike loop easier to read,
safer after the first reward, and playable on narrow mobile screens.

### Release Scope

- P0: Game Over and Victory retry now work through real browser mouse click,
  touch tap, `Space`, and `R`; the retry hit area is at least 140x52 and was
  QA-verified on desktop and 390px mobile Chrome.
- P0: The first reward remains guaranteed, then the run enters a low-pressure
  buffer so the player can feel the upgrade before the stack immediately
  punishes them.
- P1: Reward and upgrade feedback now includes numeric fly-text and clearer
  next-goal messaging.
- P1: The terminal summary panel now reports the run build, highest stage, and
  next target so the player understands why the run ended and what to improve.
- P1: Mobile HUD layout now uses the displayed canvas width for compact mode;
  390px viewports fold Hold/Next into the top board area while 520px and wider
  layouts keep the regular HUD.

### Verification

- `npm install`: required before release verification; expected 0
  vulnerabilities.
- `npm audit`: required to report 0 high/critical vulnerabilities.
- `npm test`: required to pass all automated tests; v0.4 QA accepted 19/19.
- `npm run build`: required to produce the production bundle.
- Real Chrome QA gate: retry background/text click, mobile touch tap, `Space`,
  and `R` all restart to `playing, score=0`; 390px compact HUD and 520px
  regular HUD both verified.
- GitHub Pages HTTP smoke: root page and the new hashed JavaScript asset must
  return 200 after deployment.

### Known Risks

- P2 polish is deferred to v0.5, including deeper play-feel tuning, broader
  cross-browser/manual device coverage, and performance/bundle-splitting work.
- The main JavaScript chunk is expected to remain above Vite's 500 kB warning
  threshold because Phaser is bundled with the game.

### Rollback Plan

- GitHub Pages serves the `gh-pages` branch. To roll back to v0.3.0, restore
  deploy commit `b8fd540c897ea34a375fabbadce7e7726482fd65`.
- To roll back to v0.2.1, restore deploy commit
  `8d30736c4d943d4187e75b7cb6daf0612820f6d8`.
- To roll back to v0.2.0, restore deploy commit
  `bbee62057110f61d92d281cdcb359d98d1d3ee2d`.
- Keep source and Pages commit SHAs in release/deployment logs so the previous
  build can be restored without rebuilding.

## v0.3.0 Release

v0.3.0 focuses on onboarding reliability and late-run clarity for the playable
roguelike Tetris build.

### Release Scope

- P0: The first reward is now guaranteed to come from the intended opening
  reward pool when the player reaches the first reward opportunity.
- P0: Game Over and Victory panels now include a clickable/tappable restart
  button while retaining `Space` / `R` keyboard restart support.
- P1: Upgrade feedback and HUD emphasis are clearer after reward selection.
- P1: Ghost piece visuals are easier to distinguish from locked blocks.
- P1: Static asset paths now resolve from the GitHub Pages subpath without 404s.

### Verification

- `npm install`: required before release verification.
- `npm audit`: required to report 0 high/critical vulnerabilities.
- `npm test`: required to pass all automated tests.
- `npm run build`: required to produce the production bundle.
- GitHub Pages HTTP smoke: root page and the new hashed JavaScript asset must
  return 200; the superseded v0.2.1 JavaScript asset should return 404 after
  deployment cleanup.

### Known Risks

- P2 polish items are deferred to v0.4, including deeper play-feel tuning,
  broader cross-browser manual testing, and bundle-splitting/performance work.
- The main JavaScript chunk is expected to remain above Vite's 500 kB warning
  threshold because Phaser is bundled with the game.

### Rollback Plan

- GitHub Pages serves the `gh-pages` branch. To roll back to v0.2.1, restore
  deploy commit `8d30736c4d943d4187e75b7cb6daf0612820f6d8`.
- To roll back to v0.2.0, restore deploy commit
  `bbee62057110f61d92d281cdcb359d98d1d3ee2d`.
- To roll back to v0.1.0, restore deploy commit
  `1598e42d7b984c08533349a12d72d9cc26a781f6`.
- Keep source and Pages commit SHAs in release/deployment logs so the previous
  build can be restored without rebuilding.

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
