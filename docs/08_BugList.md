# 08_BugList - MVP QA Bug List

Issue: ZI-62  
Build under test: ZI-61 latest delivery attachment `019f39e7-9708-76d6-979d-1dd608114fd7`  
Date: 2026-07-07

## Summary

| Bug ID | Severity | Owner | Blocks release | Status |
|---|---|---|---|---|
| BUG-001 | P1 | Development | Yes | Open |
| BUG-002 | P2 | Development | No | Open |

## BUG-001 - npm audit reports high/critical vulnerabilities in dev toolchain

Severity: P1  
Owner: Development  
Blocks release: Yes, unless release owner explicitly waives because production static deploy does not run the dev/test servers.  
Status: Open

### Evidence

Command: `npm audit --json`  
Result: exit code 1, 5 advisory entries across 3 vulnerable package nodes.

Key vulnerable packages:
- `vitest@2.0.5`: critical advisories for Vitest API/UI server exposure.
- `vite@5.4.2`: high/moderate advisories including dev server file exposure/path traversal/launch-editor issues.
- `esbuild` via Vite: moderate dev server request exposure advisory.

### Reproduction

1. Extract `zi-61-mvp-delivery.tar.gz`.
2. Run `npm install --cache /tmp/npm-cache`.
3. Run `npm audit --json`.
4. Observe non-zero exit and high/critical advisories.

### Expected

Release candidate should have no unresolved high/critical audit findings, or a documented release-owner waiver explaining why the findings cannot affect the deployed static artifact.

### Actual

Audit reports 1 high and 1 critical severity vulnerable package summary during QA. npm reports no non-breaking automatic fix path for the current dependency set.

### Recommendation

Upgrade Vite/Vitest to patched versions and rerun `npm test`, `npm run build`, and `npm audit --omit=dev` plus full `npm audit`. If keeping these exact versions, record an explicit waiver before release that production deployment serves only static `dist/` and never exposes Vite/Vitest servers.

## BUG-002 - Reward cards are not clickable despite card-style selection UI

Severity: P2  
Owner: Development  
Blocks release: No  
Status: Open

### Evidence

`src/render/hudRenderer.ts` renders three reward cards, but no card has `setInteractive()` or pointer/click handlers. `src/scenes/GameScene.ts` only selects rewards through commands mapped to `Digit1`, `Digit2`, and `Digit3`.

### Reproduction

1. Enter reward phase by filling energy or completing a stage target.
2. Click a visible reward card.
3. Observe no selection path in code; selecting with keyboard 1/2/3 works.

### Expected

The visible card UI should support mouse selection, or the UI should clearly present keyboard-only selection as the supported MVP interaction.

### Actual

Cards look clickable but are keyboard-only.

### Recommendation

Add pointer handlers to reward cards or revise the reward UI affordance. This can wait until after MVP if keyboard-only desktop control is acceptable.
