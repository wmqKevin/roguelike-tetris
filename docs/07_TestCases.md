# 07_TestCases - MVP QA Test Cases

Issue: ZI-62  
Build under test: ZI-61 latest delivery attachment `019f39e7-9708-76d6-979d-1dd608114fd7`  
Date: 2026-07-07

## Scope

MVP scope is the leader-approved cut: desktop keyboard first, first 6-8 stages, no full T-Spin, no touch controls, no permanent meta progression. v0.6 adds portrait toast fixes, first-reward demonstration feedback, synthesized BGM/SFX layering, and terminal next-run advice.

## Test Cases

| ID | Area | Priority | Case | Expected | Result |
|---|---|---:|---|---|---|
| TC-001 | Install | P0 | Run `npm install --cache /tmp/npm-cache` | Dependencies install without fatal error | PASS |
| TC-002 | Unit tests | P0 | Run `npm test` | All automated tests pass | PASS |
| TC-003 | Build | P0 | Run `npm run build` | TypeScript and Vite production build pass | PASS |
| TC-004 | Browser smoke | P0 | Run dev server and request `/` | HTTP 200 and Vite serves app shell | PASS |
| TC-005 | F01 pieces | P0 | Verify 7-bag emits I/O/T/S/Z/J/L once per bag | All 7 tetrominoes appear once before reshuffle | PASS |
| TC-006 | F01 movement | P0 | Inspect/execute movement commands left/right/soft drop/hard drop | Commands map to game state mutations | PASS |
| TC-007 | F01 rotation | P0 | Validate SRS wall kick for T near left wall | Rotation succeeds without crossing wall | PASS |
| TC-008 | F01 hold | P0 | Hold current piece twice before lock | Second hold is rejected | PASS |
| TC-009 | F02 scoring | P0 | Validate single/Tetris scoring and combo path | Score/energy/fragments match configured formulas | PASS |
| TC-010 | F03 preview | P0 | Inspect preview queue | Default preview count is 3; upgrade can increase it | PASS |
| TC-011 | F04 difficulty | P0 | Inspect stages/gravity | 8 stages, gravity levels increase from 1 to 4 with affix modifiers | PASS |
| TC-012 | F05 top-out | P0 | Inspect spawn collision handling | Spawn collision changes phase to `game_over` | PASS |
| TC-013 | F06 reward | P0 | Fill energy or line target | Reward phase opens with three non-owned options | PASS |
| TC-014 | F07 upgrades | P0 | Validate MVP upgrade pool | 12 enabled MVP upgrades with non-text effect paths | PASS |
| TC-015 | F08 specials | P0 | Apply special-block upgrades | Bomb and ghost special intervals exist and feed spawn path | PASS |
| TC-016 | F09 stages | P0 | Inspect stage config | 8 stages with goals, garbage, affixes, and reward tiers | PASS |
| TC-017 | F10 restart | P0 | Inspect restart path | New `GameState` is created on R/Space after terminal state | PASS |
| TC-018 | F11 feedback | P0 | Inspect effects and tests | Flash, particles, and shake exist; Tetris intensity > single-line; reduced motion lowers particles/shake | PASS |
| TC-019 | F12 save | P0 | Inspect localStorage save path | High score/best stage persist via `localStorage` | PASS |
| TC-020 | F13 pause | P0 | Inspect pause phase and step guard | `step()` returns while paused; P/Esc toggles pause | PASS |
| TC-021 | Audio SFX | P0 | Inspect event hooks | hard drop, 1/2/3/4 line clear, reward, skill, and game-over SFX paths exist; Web Audio absence is safe | PASS |
| TC-022 | Responsive layout | P1 | Inspect 1280x720 and small viewport layout math | Desktop target is covered; mobile/touch remains deferred | PASS with scope note |
| TC-023 | Bundle size | P0 | Inspect production bundle size | `dist` 1.5 MB raw; main JS 344.52 KB gzip, under 5 MB gzip budget | PASS |
| TC-024 | Security audit | P1 | Run `npm audit --audit-level=high` | No high/critical unresolved vulnerabilities before release | PASS |
| TC-025 | Reward card mouse UX | P2 | Inspect reward card UI | Cards render with pointer/click handler; keyboard 1/2/3 works | PASS |
| TC-026 | Portrait toast | P0 | Unit-test compact toast geometry at 390px | Toast width is viewport - 28, centered, and text wrap width is inset | PASS |
| TC-027 | First reward demo | P1 | Unit-test first reward skill demo effect | Demo creates flash/pulse/fly-text feedback within the reward path | PASS |
| TC-028 | Terminal advice | P1 | Unit-test failure pattern advice | Center stack, right well, and no-clear hard-drop patterns map to targeted advice | PASS |
| TC-029 | BGM fallback | P1 | Unit-test `AudioManager` without Web Audio | SFX/music calls no-op without throwing | PASS |
| TC-030 | Real Chrome portrait | P0 | Headless Google Chrome 390x844 screenshot | Board renders, target is split into two rows, no app asset 404 seen in output | PASS with note |
| TC-031 | Real Chrome desktop | P0 | Headless Google Chrome 960x720 screenshot | Desktop side HUD and board render without layout regression | PASS |

## Environment

- Node/npm environment in Multica runtime
- Dev server: Vite on `127.0.0.1:4173`
- Browser automation: Google Chrome headless screenshots are available; interactive reward/toast playthrough automation is not available in this runtime, so toast behavior is covered by unit geometry tests plus visual smoke screenshots.
