# Neon Breach Tetris Release Notes

Release date: 2026-07-09
Platform: Web
Deployment URL: https://wmqkevin.github.io/roguelike-tetris/

## v0.9.0 Release

v0.9.0 focuses on making the first skill pickup safe and satisfying, improving
portrait reward readability, and surfacing longer-term run goals before the
player dies.

### Release Scope

- P0: Successful C/line-clearer casts now show `行清除器发动` center fly-text,
  stronger shake/flash/particles, and a bottom-row sweep while spending energy.
  Low-energy failure feedback is positioned near the skill/board-bottom area.
- P0: First reward skill cards now open a protected skill trial window: gravity
  and danger remain paused until the player can press C, while the skill itself
  is allowed during protection.
- P1: 390px portrait reward selection now uses a focused recommended card with
  full detail, while the other two rewards shrink to selectable title/tag chips.
- P1: Trial completion copy now grants visible growth feedback:
  `+20 能量 / 徽章进度 +1`.
- P1: Opening HUD and post-reward route copy now surface recommended build,
  unlockable badge, codex progress, and the current route such as `清场流`.

### Verification

- `npm install`: completed with 0 vulnerabilities.
- `npm audit`: completed with 0 vulnerabilities.
- `npm test`: 5 files / 48 tests passed.
- `npm run build`: passed and produced `assets/index-BRfhnbcN.js`
  (1,252.82 kB, gzip 335.99 kB), `assets/index-DiInh9Gy.css` (0.39 kB,
  gzip 0.28 kB), and `index.html` (0.40 kB, gzip 0.27 kB). Vite still reports
  the expected Phaser bundle-size warning.
- Post-deploy HTTP smoke must confirm root 200, new JS 200, and old v0.8 JS 404.

### Known Risks

- The main JavaScript chunk still exceeds Vite's 500 kB warning threshold
  because Phaser is bundled with the game.
- P2 manual audio mix and broader physical-device coverage remain deferred.

### Rollback Plan

- To roll back to v0.8.0, restore `gh-pages` deploy commit
  `3fcca2cc1e00ea4da94e2fe2f1543d94618ae61b`.
- The v0.8.0 source baseline is `main`
  `1ffe40238e4fa26b7b56580c85f60ec5a1d05315`.

## v0.8.0 Release

v0.8.0 focuses on making rewards usable immediately after pickup, clarifying
skill outcomes, and keeping low-height landscape reward choices readable.

### Release Scope

- P0: 520x390 landscape reward state now keeps danger copy in a single
  non-overlapping status strip, pauses reward-phase toast overlap, and uses
  shorter two-column reward cards.
- P0: Skills now have a closed feedback loop: unavailable/low-energy casts show
  explicit toast reasons, ready skills highlight in the HUD, line clearer shows
  a target-row preview, C releases the first active skill, and successful casts
  emit result fly-text. Hold moved to Shift/V; 1/2/3 remain reward selection.
- P1: First reward choices now start a 10-second trial goal after the safety
  demo; completing the trial grants +20 energy and +120 score feedback.
- P1: Reward cards show build labels such as recommended, build core,
  shortfall patch, immediate effect, and skill unlock; rare/epic cards have
  stronger visual treatment.
- P1: Settlement copy now reports build-route progress such as `清场流 2/3`
  while retaining next-run build advice.

### Verification

- `npm install`: completed with 0 vulnerabilities.
- `npm audit --audit-level=high`: completed with 0 high/critical
  vulnerabilities.
- `npm test`: 5 files / 45 tests passed.
- `npm run build`: passed and produced `assets/index-BEozkN_s.js`
  (1,248.93 kB, gzip 334.94 kB), `assets/index-DiInh9Gy.css` (0.39 kB,
  gzip 0.28 kB), and `index.html` (0.40 kB, gzip 0.27 kB). Vite still reports
  the expected Phaser bundle-size warning.
- Real Chrome smoke should cover 390x844 portrait, 520x390 landscape, and
  960x720 desktop before deployment.

### Known Risks

- The main JavaScript chunk still exceeds Vite's 500 kB warning threshold
  because Phaser is bundled with the game.
- Touch controls remain outside this scope; keyboard and click/tap reward
  selection remain the supported input paths.
- P2 audio mix, codex/badge entry strengthening, broader device coverage, and
  bundle-splitting remain deferred.

### Rollback Plan

- To roll back to v0.7.0, restore `gh-pages` deploy commit
  `374e687839941537f1ff8d5383fcb812c9fa4aa2`.
- To roll back to v0.6.0, restore `gh-pages` deploy commit
  `92902c2d6a04323652227eaaffba8bcb6a4bf4d1`.
- The v0.7.0 source baseline is `main`
  `aeab311cd900c0151e1a041bc2761533235427d6`.

## v0.7.0 Release

v0.7.0 focuses on making the first roguelike power spike safer and clearer,
especially for new players and low-height landscape viewports.

### Release Scope

- P0: First reward selection now opens a 1.5 second safety demonstration window
  that freezes gravity/input, plays the reward-specific sample, and prevents
  immediate Game Over from covering the power-up moment.
- P0: Stage 1-2 now run on a slower effective gravity interval, and the first
  12 locked pieces can trigger one visible top-danger rescue that clears the
  lowest row.
- P1: 520x390 landscape uses compact two-column readability: board fixed left,
  reward cards summarized to the right, and terminal panels remain two-column.
- P1: UPGRADES and terminal copy now include current build tendency,
  recommended next reward, and next-run build advice.
- P1: First reward, Tetris four-line clears, and skill releases now have
  distinct peak feedback layers.
- P2: Audio/BGM manual mix review and codex/badge entry strengthening are
  deferred to v0.8 or a later polish pass.

### Verification

- `npm install`: required before release verification; expected 0
  vulnerabilities.
- `npm audit --audit-level=high`: required before deployment and expected to
  report 0 high/critical vulnerabilities.
- `npm test`: required to pass 5 files / 37 tests.
- `npm run build`: required to produce the production bundle; Vite is still
  expected to report the Phaser bundle-size warning.
- QA Stage 2 accepted Chrome viewport evidence for 390x844 portrait,
  520x390 landscape, and 960x720 desktop with no P0/P1 blockers.
- GitHub Pages HTTP smoke: root page and the new hashed JavaScript asset must
  return 200 after deployment; the superseded v0.6 JavaScript asset should
  return 404 after cleanup.

### Known Risks

- The main JavaScript chunk still exceeds Vite's 500 kB warning threshold
  because Phaser is bundled with the game.
- P2 audio mix and codex/badge entry polish are intentionally deferred.

### Rollback Plan

- To roll back to v0.6.0, restore `gh-pages` deploy commit `92902c2d`.
- To roll back to v0.5.0, restore `gh-pages` deploy commit `4dd60ce4`.

## v0.6.0 Release

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
- `npm test`: 5 files / 31 tests passed.
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
