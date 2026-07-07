# 05 Art Style Guide - Neon Breach Tetris

## 1. Visual Direction

Project tone: a high-contrast cyber-neon roguelike Tetris board inside a collapsing combat simulator.

Style keywords:
- Neon grid
- Dark arcade cockpit
- Energy pulse
- Glitch warning
- Crystal blocks
- Readable pressure

The game must feel sharp and fast, but the board remains the most readable element. Effects may flare outside the board; active cells and collision boundaries must never become ambiguous.

## 2. MVP Art Scope

MVP covers desktop keyboard play, the first 6-8 stages, P0 SFX hooks, no full T-Spin visual package, and no permanent meta progression UI.

Required for development:
- Board cells for 7 standard tetromino colors.
- Special cells: garbage, locked, cracked, bomb, ghost.
- Core UI panels: title, HUD, reward choice, pause, game over.
- Icons: upgrade rarity, stage affix, active skills, score/energy/stage.
- VFX definitions: line clear, Tetris clear, hard drop, reward select, stage warning, game over.
- Reduced-motion alternatives for every VFX category.

## 3. Palette

Base colors:

| Token | Hex | Usage |
|---|---:|---|
| `bg_void` | `#070812` | Page/game background |
| `bg_panel` | `#101525` | HUD panels and modals |
| `grid_line` | `#26304A` | Board grid lines |
| `text_main` | `#EAF2FF` | Primary text |
| `text_muted` | `#8EA3C8` | Secondary text |
| `danger` | `#FF3B6B` | Game over, pressure, locked blocks |
| `warning` | `#FFB000` | stage warnings, cracked blocks |
| `energy` | `#00F0FF` | energy, selection, UI pulse |
| `power` | `#B85CFF` | epic/legendary, rogue reward glow |
| `success` | `#45FF99` | recovery, shield, positive feedback |

Tetromino colors:

| Piece | Hex | Readability Note |
|---|---:|---|
| I | `#00E5FF` | bright cyan, strongest long-piece signal |
| O | `#FFE45C` | yellow with warm inner glow |
| T | `#B85CFF` | purple, links to rogue power |
| S | `#45FF99` | green |
| Z | `#FF3B6B` | red/pink |
| J | `#4B7CFF` | blue |
| L | `#FF8A2A` | orange |

Rarity colors:

| Rarity | Hex | Treatment |
|---|---:|---|
| Common | `#8EA3C8` | thin rim, no burst |
| Rare | `#00E5FF` | cyan rim, short pulse |
| Epic | `#B85CFF` | purple rim, particle ring |
| Legendary | `#FFE45C` | gold rim, slow halo |

## 4. Board and Cell Rules

Board:
- Standard visible grid: 10 x 20, plus 2 hidden rows in logic.
- Recommended render cell: 32 px at 720p baseline; scale responsively by board height.
- Board background uses `bg_void`, grid lines use `grid_line` at 40-60% opacity.
- Add a 2 px neon outer rim. Rim color can change by stage affix, but should not pulse faster than 2 Hz.

Cell visual structure:
- Outer bevel: 2 px darker edge.
- Inner face: main color.
- Top-left highlight: 1 px or soft stripe.
- Center glow: low alpha radial or rectangular glow.
- Locked/special state must add shape language, not only color.

Special cells:

| Cell | Visual |
|---|---|
| Garbage | desaturated steel block, scratched diagonal line, low glow |
| Locked | red core with clamp/cross bars, clearly not normal red Z block |
| Cracked | amber fracture lines across standard block |
| Bomb | circular cyan/magenta core, warning ring |
| Ghost | translucent cyan outline, 30-45% fill opacity |

## 5. UI Style

Layout tone: compact cockpit HUD, not a marketing page.

HUD requirements:
- Center board dominant.
- Left column: Hold box and obtained upgrades.
- Right column: Next queue, score, stage, energy.
- Top strip: stage/affix warning.
- Reward modal: 3 cards, keyboard labels 1/2/3.

UI components:
- Panels: 8 px radius maximum, 1 px cyan/blue-gray border, dark fill.
- Buttons: rectangular, 6 px radius, icon or concise command label.
- Reward cards: rarity rim, icon, name, 2-line effect copy max.
- Warning banners: high contrast, short text, no paragraph copy in gameplay.

Typography:
- Use a square techno display face only for logo/stage titles if bundled.
- Gameplay text should use a readable sans-serif fallback stack.
- Never use tiny text inside the board area.

## 6. Asset Paths

Follow architecture paths:

```text
public/assets/
  images/
    board/
    blocks/
    ui/
    icons/
    backgrounds/
  particles/
  audio/
  fonts/
assets/prompts/
docs/
```

MVP files delivered in this run:

```text
docs/05_ArtStyleGuide.md
assets/prompts/neon_breach_prompts.md
public/assets/images/neon_breach_placeholder_sheet.svg
public/assets/images/asset_manifest.json
public/assets/particles/vfx_manifest.json
```

## 7. Naming Convention

Use lowercase snake case.

Format:

```text
<category>_<subject>_<variant>_<size>.<ext>
```

Examples:
- `block_i_default_32.svg`
- `block_locked_default_32.svg`
- `icon_upgrade_tetris_charge_64.png`
- `ui_reward_card_rare_320x180.png`
- `bg_stage_01_neon_grid_1920x1080.png`
- `particle_line_clear_cyan.json`

Stable IDs must match game config IDs when available:
- `precision_hard_drop`
- `stable_preview`
- `tetris_charge`
- `line_clearer`
- `jammed_hold`

## 8. MVP Asset Checklist

### Blocks

| Asset | Status | Notes |
|---|---|---|
| 7 standard tetromino cells | Placeholder delivered | In `neon_breach_placeholder_sheet.svg` |
| Garbage cell | Placeholder delivered | Steel scratched block |
| Locked cell | Placeholder delivered | Red clamp bars |
| Cracked cell | Placeholder delivered | Amber crack lines |
| Bomb cell | Placeholder delivered | Circular core |
| Ghost cell | Placeholder delivered | Transparent outline |

### UI

| Asset | Status | Notes |
|---|---|---|
| Board frame | Placeholder delivered | SVG sheet |
| HUD panel style | Spec delivered | build in Phaser/CSS-like drawing |
| Reward card frame | Placeholder delivered | common/rare/epic/legendary variants specified |
| Pause panel | Spec delivered | Phaser UI implementation |
| Game over panel | Spec delivered | red pressure treatment |

### Icons

| Group | MVP Count | Status |
|---|---:|---|
| Upgrade icons | 10 minimum | Prompt + naming ready, placeholder symbols in sheet |
| Skill icons | 4 target | Prompt + naming ready |
| Affix icons | 4 MVP | Prompt + naming ready |
| HUD icons | 6 target | Placeholder symbols in sheet |

### Backgrounds

| Asset | Status | Notes |
|---|---|---|
| Title background | Prompt ready | dark neon grid cockpit |
| Game background | Prompt ready | subdued, board-readable |
| Stage warning overlay | Spec ready | generated via UI/VFX |

## 9. VFX Specification

All VFX must expose intensity levels: `low`, `normal`, `high`, `reduced`.

Line clear:
- Single: cyan sweep, 8-12 particles, 60 ms flash, no shake or 1 px shake.
- Double: cyan/green sweep, 18-24 particles, 90 ms flash, 2 px shake.
- Triple: cyan/purple sweep, 32-40 particles, 120 ms flash, 3 px shake.
- Tetris: full-width white-cyan flash, 60-80 particles, 160 ms flash, 5 px shake.

Hard drop:
- Vertical trail from ghost to lock position.
- 80 ms impact ring.
- Reduced motion: static line trail only.

Reward select:
- Card rim brightens, icon pulse, short radial particle ring.
- Reduced motion: rim color change and single spark.

Stage/affix warning:
- Top strip glitch pulse no faster than 2 Hz.
- Reduced motion: static warning strip.

Game over:
- Board rim turns danger red.
- Short descending scanline and UI dim.
- Reduced motion: instant dim and red rim.

## 10. Reduced Motion Contract

When `settings.reducedMotion` is true or browser preference requests reduced motion:
- Disable camera shake.
- Reduce particle count to 20% of normal.
- Replace rapid flashing with opacity fade.
- Disable glitch jitter.
- Keep color, icons, and labels unchanged so gameplay state remains visible.

## 11. Image Generation Prompt Base

Use this shared prefix for generated raster assets:

```text
Cyber neon roguelike Tetris game art, dark arcade cockpit, crystal-like luminous blocks, cyan magenta violet accent lighting, clean readable shapes, high contrast, crisp edges, no text, no logos, no watermark, game asset, orthographic 2D, consistent palette: #070812 #00E5FF #B85CFF #FF3B6B #FFE45C.
```

Negative prompt:

```text
photorealistic, cluttered, blurry, unreadable, excessive bloom, text, letters, watermark, logo, beige palette, low contrast, noisy background, characters covering gameplay area.
```

## 12. Handoff Notes for Development

- Use the SVG placeholder sheet immediately for graybox integration.
- Do not block core gameplay on final raster assets.
- Treat `asset_manifest.json` as the source of paths and intended dimensions.
- Replace SVG placeholders with PNG/WebP as final art arrives, keeping IDs stable.
- Board readability has priority over effect spectacle.

## 13. Current Blockers

Repository and project `github_repo` resource are still unavailable, so these files are delivered as issue attachments rather than committed to `docs/` and `public/assets/`.
