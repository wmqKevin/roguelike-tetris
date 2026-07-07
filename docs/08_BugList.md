# 08_BugList - v0.2 QA Bug List

Issue: ZI-72
Build under test: ZI-70 delivery attachment `019f3ba6-b785-7960-8e7a-ecbda7a58852` (`zi-70-v0.2-dev-delivery.tar.gz`)
Date: 2026-07-07

## Summary

| Bug ID | Severity | Owner | Blocks release | Status |
|---|---|---|---|---|
| BUG-001 | P1 | Development | Was Yes | Closed in v0.2 |
| BUG-002 | P2 | Development | No | Closed in v0.2 |
| BUG-003 | P2 | Development | No | 已修 |
| BUG-004 | P1 | Development | Yes | Fixed for v0.2 hotfix |
| BUG-005 | P1 | Development | Was Yes | 已修 - ZI-87 QA 复测通过 |
| BUG-006 | P1 | Development | Was Yes | 已修 - ZI-87 QA 复测通过 |

## BUG-001 - npm audit reports high/critical vulnerabilities in dev toolchain

Severity: P1
Owner: Development
Blocks release: Was Yes
Status: Closed in v0.2

### Evidence

v0.1.0 QA found high/critical advisories in the previous Vite/Vitest toolchain.
v0.2 verification against the ZI-70 delivery artifact passes:

- `npm install --cache /tmp/npm-cache`: passed, `found 0 vulnerabilities`.
- `npm audit --cache /tmp/npm-cache`: passed, `found 0 vulnerabilities`.
- Current package versions include `vite@8.1.3`, `vitest@4.1.10`, and `@vitejs/plugin-basic-ssl@2.3.0`.

### Resolution

Closed. No high/critical npm audit findings remain in the v0.2 candidate.

## BUG-002 - Reward cards are not clickable despite card-style selection UI

Severity: P2
Owner: Development
Blocks release: No
Status: Closed in v0.2

### Evidence

v0.2 reward cards now support both keyboard and mouse selection:

- `src/render/hudRenderer.ts` adds card interactivity, pointer hover feedback, and `pointerdown` selection.
- Reward panel displays `按 1/2/3 或点击选择`.
- Keyboard `1` / `2` / `3` selection is preserved.

### Resolution

Closed. The previous affordance mismatch is fixed in the v0.2 candidate.

## BUG-003 - Game Over retry affordance is text/keyboard only, not a clickable button

Severity: P2
Owner: Development
Blocks release: No
Status: 已修

### Evidence

ZI-70 P1-5 asks for Game Over build review plus a retry button. The v0.2 candidate shows the retry affordance as `Space 再来一局` text and supports keyboard restart, but no mouse-click path is present:

- `src/render/hudRenderer.ts` renders `Space 再来一局` as text in the terminal panel.
- `src/scenes/GameScene.ts` restarts from terminal states through keyboard commands.
- No terminal-panel `setInteractive()` / `pointerdown` retry handler was found.

### Reproduction

1. Enter Game Over or Victory.
2. Inspect the terminal panel.
3. Observe the retry prompt is keyboard text, not a clickable button.

### Expected

If the v0.2 requirement is interpreted literally, the terminal panel should provide a clickable `再来一局` button in addition to the keyboard shortcut.

### Actual

The game can restart with `Space`, but the retry affordance is not mouse-clickable.

### Resolution

v0.3 adds a clickable/touchable `再来一局` button to the Game Over and Victory terminal panels. The existing `Space` / `R` keyboard restart paths remain available.

## BUG-004 - Energy-triggered reward repeats after selecting an upgrade

Severity: P1
Owner: Development
Blocks release: Yes
Status: Fixed for v0.2 hotfix

### Evidence

When a reward is triggered by full energy, `checkStageComplete()` caps energy at `BALANCE.energyMax` and enters the reward phase. Before this hotfix, `selectReward()` advanced to the next stage through `startStage()`, which reset `linesInStage` but left energy at 200. The next locked piece immediately satisfied `energy >= BALANCE.energyMax` again, reopening the reward panel.

The player report mentioned `scrap_recycle` / `废料回收`. That upgrade only increases line-clear fragments; it does not directly trigger rewards. It was easy to associate with the bug because it is a common reward and could be selected from the repeated reward panel.

### Resolution

`selectReward()` now detects rewards selected while energy is full and consumes that energy before the next stage starts. Line-target rewards with non-full energy keep their existing energy carryover.

### Regression

Added Vitest regression coverage for:

- Full-energy reward selection with `scrap_recycle`, followed by another hard drop that must remain in the playing phase instead of immediately reopening rewards.
- Line-target rewards with non-full energy retaining carried energy.
- Full-energy rewards with `quick_charge` consuming the trigger first, then applying the stage-start energy bonus exactly once.

## BUG-005 - Game Over retry button does not restart through real browser click/tap

Severity: P1
Owner: Development
Blocks release: Was Yes
Status: 已修 - ZI-87 QA 复测通过

### Evidence

ZI-86 real-browser QA found that the visible `再来一局` button did not restart through Chrome CDP mouse click or mobile touch tap, while keyboard restart still worked.

ZI-87返工版回归通过：

- Chrome CDP desktop mouse click on retry background: `game_over, score=777` -> `playing, score=0`.
- Chrome CDP desktop mouse click on retry text: `game_over, score=777` -> `playing, score=0`.
- Chrome CDP 390px mobile touch tap on retry background: `game_over, score=888` -> `playing, score=0`.
- Chrome CDP 390px mobile touch tap on retry text: `game_over, score=888` -> `playing, score=0`.
- Retry hit area: `180x56`; text interactive area is at least `140x56`.
- Keyboard regression: `Space` and `R` both restart to `playing, score=0`.

### Resolution

The terminal retry button now uses explicit Phaser hit areas for the background and text, plus a scene-level retry bounds fallback matching the visible button area.

## BUG-006 - 390px mobile viewport does not enter compact HUD

Severity: P1
Owner: Development
Blocks release: Was Yes
Status: 已修 - ZI-87 QA 复测通过

### Evidence

ZI-86 real-browser QA found that a 390px viewport still used the 1280px game scale width for HUD breakpoint logic, so compact HUD did not activate.

ZI-87返工版回归通过：

- 390px viewport: `innerWidth=390`, `canvasCssWidth=390`, `scaleWidth=1280`, `compactHud=true`.
- 390px layout: board center CSS X `195`, expected viewport center `195`; top goal/energy labels present; `HOLD` and `NEXT` folded near the top of the board.
- 520px viewport: `innerWidth=520`, `canvasCssWidth=520`, `scaleWidth=1280`, `compactHud=false`, preserving the normal HUD breakpoint.

### Resolution

Layout creation now receives the canvas displayed width and uses it for the compact HUD breakpoint instead of using the fixed Phaser logical width.
