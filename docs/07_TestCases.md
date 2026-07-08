# 07_TestCases - MVP QA Test Cases

Issue: ZI-135
Build under test: v0.10 development patch on v0.9.0 base `1abfc9e4de5bffaae37d4a986c84788ba343213b`
Date: 2026-07-09

## Scope

MVP scope is the leader-approved cut: desktop keyboard first, first 6-8 stages, no full T-Spin, no touch controls, no permanent meta progression. v0.10 keeps the v0.9 skill trial and portrait reward work, then staggers C-skill release peaks, makes the trial completion reward strip persist for 2 seconds, moves low-energy failure feedback next to the C skill row, and queues fly-text events to avoid overlap.

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
| TC-032 | First reward safety | P0 | Unit-test first reward selection then step/input before 1.5s | Gravity and commands are frozen until the safety window ends | PASS |
| TC-033 | Stage 1-2 buffer | P0 | Unit-test effective gravity interval at Stage 1 versus Stage 3 | Stage 1-2 interval is slower than later normal curve | PASS |
| TC-034 | Newcomer danger rescue | P0 | Unit-test high stack before first reward within first 12 locks | One-time rescue clears lowest row and emits danger copy | PASS |
| TC-035 | Landscape 520 layout | P1 | Unit-test `createLayout(520,390,520)` | Compact landscape board is fixed left and fits vertically | PASS |
| TC-036 | Build guidance | P1 | Unit-test run-style guidance strings | UPGRADES/current build and next-run build advice are generated | PASS |
| TC-037 | Peak feedback layers | P1 | Unit-test peak effect labels for first reward/Tetris/skill | Distinct fly-text and shake paths are called | PASS |
| TC-038 | Landscape reward/danger layering | P0 | Unit-test 520x390 toast/status and reward card geometry | Reward phase suppresses overlapping toast, status copy stays below HUD, and cards fit inside viewport | PASS |
| TC-039 | Skill three-state feedback | P0 | Unit-test locked/unready/ready line-clearer states plus keyboard bindings | Missing skill reports unavailable, low energy reports `能量不足 100`, ready C cast emits `C 释放最低行清除`; 1/2/3 remain reward-only and Hold is Shift/V | PASS |
| TC-040 | First reward trial target | P1 | Unit-test first reward 10-second trial and completion reward | Trial text starts at 10s; first successful use completes target and grants +20 energy / +120 score | PASS |
| TC-041 | Reward card labels | P1 | Unit-test reward labels | Cards expose recommendation, build-core, shortfall, immediate-effect, and skill-unlock labels | PASS |
| TC-042 | Settlement build route | P1 | Unit-test route text | Settlement route progress renders examples such as `清场流 2/3` and `预判流 1/3` | PASS |
| TC-043 | C skill release peak | P0 | Unit-test line-clearer success event and effect sweep | Successful C cast emits `行清除器发动`, spends 100 energy, triggers bottom-row sweep effect | PASS |
| TC-044 | First skill safety trial | P0 | Unit-test first reward line-clearer safety window | C is castable while gravity danger is frozen; protection ends after the trial completes | PASS |
| TC-045 | Portrait focused reward cards | P1 | Unit-test 390x844 focused reward layout | Recommended card is focused; non-focused cards fit as compact chips with title/tags only | PASS |
| TC-046 | Trial completion reward strip | P1 | Unit-test trial completion event payload | Completion emits `+20 能量 / 徽章进度 +1` plus structured reward payload | PASS |
| TC-047 | Opening long-term goals | P1 | Unit-test opening HUD copy | `本局推荐流派 / 可解锁徽章 / 图鉴进度` text is available before first reward | PASS |
| TC-048 | C skill release stagger | P0 | Unit-test feedback schedule for line-clearer success | Pause starts at 0ms, center peak/sweep at 220ms, `-100` energy fly-text at 920ms | PASS |
| TC-049 | Trial reward strip persistence | P0 | Unit-test trial completion state and HUD strip copy | Completion grants +20 energy / +120 score / badge +1, replaces old target, and HUD renders the reward strip | PASS |
| TC-050 | Low-energy C row warning | P1 | Unit-test compact HUD warning state | `能量不足 100` appears beside the skill row, with red/yellow row styling for the 250ms shake window | PASS |
| TC-051 | Fly-text event queue | P1 | Unit-test feedback scheduler | Skill and trial peak feedback items are offset by 300-500ms queue spacing instead of same-frame rendering | PASS |

## Environment

- Node/npm environment in Multica runtime
- Dev server: Vite on `127.0.0.1:4173` or the next available port
- Browser automation: Google Chrome headless screenshots are requested for 390x844, 520x390, and 960x720. Interactive reward playthrough remains covered by unit behavior tests plus visual smoke screenshots where browser tooling is available.
