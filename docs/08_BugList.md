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
| BUG-007 | P1 | Development | Was Yes | Fixed for v0.5 |
| BUG-008 | P1 | Development | Was Yes | 已修 - ZI-92 QA 复测通过 |
| BUG-009 | P1 | Development | Was Yes | 已修 - ZI-103 第 2 轮热修 |

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

## BUG-007 - Portrait mobile still uses fixed 16:9 stage fit

Severity: P1
Owner: Development
Blocks release: Was Yes
Status: Fixed for v0.5

### Evidence

v0.4 compact HUD could trigger at 390px, but the Phaser canvas still used a 1280x720 FIT stage. On portrait phones this kept the board visually small and centered with unused vertical space.

### Resolution

v0.5 switches narrow portrait launches to a viewport-sized Phaser canvas and portrait layout math. The board cell size now uses the available phone width/height directly, with HOLD/NEXT moved to the bottom tray and goal text kept at the top/bottom bands. The >=520px desktop/landscape path keeps the existing 1280x720 FIT behavior.

### Regression

Added layout coverage for 390x844 portrait sizing and retained the compact HUD breakpoint checks for 390px vs 520px.

## BUG-008 - Codex localStorage write failure can crash terminal run recording

Severity: P1
Owner: Development
Blocks release: Was Yes
Status: 已修 - ZI-92 QA 复测通过

### Evidence

ZI-92 first QA pass found that v0.5 codex / badge / best-run-style persistence called `localStorage.setItem()` without a write-failure fallback. In browsers where storage writes are disabled or quota-blocked, Game Over / Victory could throw during `recordRunOnce()`.

Original reproduction:

```text
globalThis.localStorage = {
  getItem() { return null },
  setItem() { throw new Error('quota') }
}
recordRun(100, 2, ['stable_preview'], '清场流') => THREW: quota
```

### Resolution

ZI-96 wraps `save()` writes in try/catch. Write failure now logs a warning and does not interrupt Game Over / Victory. `recordRun()` still returns the in-memory save state with high score, best stage, codex upgrades, stage badge, and best run style populated.

### Regression

ZI-92 hotfix retest passed:

- `npm test`: 4 files / 23 tests passed, including storage write-failure coverage.
- Independent mocked reproduction now returns `{"highScore":100,"bestStage":2,"upgrades":["stable_preview"],"badges":[2],"style":"清场流"}` without throwing.
- `npm run build` passed.
- `npm audit --audit-level=high` found 0 vulnerabilities.

## BUG-009 - 390px Game Over settlement panel overlaps after v0.6 advice/codex additions

Severity: P1
Owner: Development
Blocks release: Was Yes
Status: 已修 - ZI-103 第 2 轮热修

### Evidence

ZI-100 v0.6 real Chrome QA applied `ZI-101-v0.6.patch` on v0.5.0 base `dd908900` and drove a 390x844 portrait run into Game Over with real keyboard events.

The v0.6 terminal panel now includes failure reason, next-run advice, best performance, run style, next target, codex count, highest Stage badge, best style, and retry controls. At 390px portrait these rows overlapped:

- `本局最佳表现`, `本局流派`, `下次目标`, and progress text collided vertically.
- `本局新增图鉴` / `最高 Stage 徽章` / `最佳流派` collided with the retry button area.
- The retry button visually covered lower summary text, so the required settlement-panel recommendation/codex/badge presentation was not readable.

### Reproduction

1. Apply `ZI-101-v0.6.patch` on `dd908900`.
2. Run `npm run dev -- --host 127.0.0.1 --port 5176`.
3. Open Chrome at 390x844.
4. Use hard drop repeatedly until Game Over.
5. Observe the Game Over panel text and retry area overlap.

### Expected

The 390px portrait Game Over panel should keep the new v0.6 advice, codex, badge, and retry controls readable without overlap. If content exceeds the available height, use a compact portrait layout, reduced row count, scrolling panel, or separated sections.

### Actual

Before ZI-102, the settlement panel was readable only in parts; multiple v0.6 rows overlapped and the retry control occluded progress text. This blocked v0.6 release because the required Game Over advice/codex/badge UX was broken on the main mobile viewport.

### Resolution

ZI-102 replaced the 390px portrait terminal panel's fixed Y coordinates with a compact measured vertical stack. Wrapped failure/advice/summary/codex rows reserve estimated height, the panel grows within the portrait viewport, and the retry button is placed after the content with bottom padding. The retry label draw order is also fixed so the button text stays visible.

ZI-103 completes the second-round BUG-009 hotfix after ZI-100 retest found two layout leftovers. The portrait advice row now has an explicit wrapping assertion within the 390px panel width, and small landscape displays use a dedicated two-column terminal panel instead of the tall desktop stack. The true portrait branch remains gated by `displayWidth <= 520 && height > width`, so 520x390 landscape is not routed through portrait layout while still getting a short-height terminal layout. The 960x720 desktop terminal coordinates remain stable.

### Regression

ZI-103 hotfix verification:

- `npm test`: terminal panel coverage asserts the 390x844 summary stack stays above the retry button, 390 advice wraps inside the panel, 520x390 landscape uses two clean columns, and 960x720 coordinates remain stable.
- `npm run build`: passed.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `git apply --check` against base `dd908900`: passed for the final v0.6 hotfix patch.

## BUG-010 - C skill release fly-text overlaps trial reward feedback

Severity: P1
Owner: Development
Blocks release: Was Yes
Status: Closed in v0.10

### Evidence

ZI-132 v0.9 online retest found that C / line-clearer success could emit the
center skill fly-text, energy spend text, trial trigger text, and trial
completion text in the same release moment. The functionality worked, but the
peak was hard to read and screenshots did not reliably catch the intended center
feedback.

### Resolution

ZI-135 adds a scene feedback queue for skill and trial peaks. A successful C
cast now plays a short pause immediately, center `行清除器发动` plus bottom-row
sweep at about 220ms, `-100` energy fly-text at about 920ms, and the trial
reward strip after the next queue slot. The trial completion strip persists for
2 seconds and the normal target switches to `再消 N 行拿下一奖`.

### Regression

- Unit coverage asserts the skill feedback schedule: 0ms pause, 220ms peak, and
  920ms energy spend.
- Unit coverage asserts trial completion emits `+20 能量 / +120 分 / 徽章进度 +1`
  and updates the next-goal copy.
- HUD coverage asserts the reward strip and nearby low-energy C-row warning
  render through compact layout state.
