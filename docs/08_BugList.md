# 08_BugList - v0.2 QA Bug List

Issue: ZI-72
Build under test: ZI-70 delivery attachment `019f3ba6-b785-7960-8e7a-ecbda7a58852` (`zi-70-v0.2-dev-delivery.tar.gz`)
Date: 2026-07-07

## Summary

| Bug ID | Severity | Owner | Blocks release | Status |
|---|---|---|---|---|
| BUG-001 | P1 | Development | Was Yes | Closed in v0.2 |
| BUG-002 | P2 | Development | No | Closed in v0.2 |
| BUG-003 | P2 | Development | No | Open |

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
Status: Open

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

### Recommendation

Add a click/tap retry button to the Game Over/Victory panel, or update the product wording to accept keyboard-only restart for the desktop MVP.
