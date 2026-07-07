# Neon Breach Art Prompts

## Shared Style Prefix

```text
Cyber neon roguelike Tetris game art, dark arcade cockpit, crystal-like luminous blocks, cyan magenta violet accent lighting, clean readable shapes, high contrast, crisp edges, no text, no logos, no watermark, game asset, orthographic 2D, consistent palette: #070812 #00E5FF #B85CFF #FF3B6B #FFE45C.
```

## Shared Negative Prompt

```text
photorealistic, cluttered, blurry, unreadable, excessive bloom, text, letters, watermark, logo, beige palette, low contrast, noisy background, characters covering gameplay area.
```

## Background - Title

```text
Cyber neon roguelike Tetris game art, dark arcade cockpit, crystal-like luminous blocks, cyan magenta violet accent lighting, clean readable shapes, high contrast, crisp edges, no text, no logos, no watermark, game asset, orthographic 2D, consistent palette: #070812 #00E5FF #B85CFF #FF3B6B #FFE45C. Wide 16:9 title screen background, deep black grid tunnel, distant falling tetromino silhouettes, subtle particle sparks, center area kept clear for logo and start button, cinematic but readable.
```

## Background - Gameplay

```text
Cyber neon roguelike Tetris game art, dark arcade cockpit, crystal-like luminous blocks, cyan magenta violet accent lighting, clean readable shapes, high contrast, crisp edges, no text, no logos, no watermark, game asset, orthographic 2D, consistent palette: #070812 #00E5FF #B85CFF #FF3B6B #FFE45C. Wide 16:9 gameplay background, subdued dark cockpit frame, low contrast neon circuitry, empty center focus for a 10 by 20 board, no busy detail behind board.
```

## Blocks - Standard Cell

```text
Cyber neon roguelike Tetris game art, dark arcade cockpit, crystal-like luminous blocks, cyan magenta violet accent lighting, clean readable shapes, high contrast, crisp edges, no text, no logos, no watermark, game asset, orthographic 2D, consistent palette: #070812 #00E5FF #B85CFF #FF3B6B #FFE45C. Single square Tetris block cell, beveled glass face, bright inner glow, top left highlight, transparent background, 32x32 sprite, color variant: {piece_color}.
```

Use `piece_color` values:
- I cyan `#00E5FF`
- O yellow `#FFE45C`
- T purple `#B85CFF`
- S green `#45FF99`
- Z pink red `#FF3B6B`
- J blue `#4B7CFF`
- L orange `#FF8A2A`

## Blocks - Special Cells

Garbage:

```text
Single square Tetris garbage block cell, dark steel material, diagonal scratch, weak blue edge light, transparent background, 32x32 sprite, no text.
```

Locked:

```text
Single square locked Tetris block cell, red neon core, mechanical clamp cross bars, danger rim, transparent background, 32x32 sprite, no text.
```

Cracked:

```text
Single square cracked Tetris block cell, amber crystal fractures, glowing crack lines, dark bevel, transparent background, 32x32 sprite, no text.
```

Bomb:

```text
Single square bomb Tetris block cell, circular cyan magenta energy core, warning ring, dark crystal bevel, transparent background, 32x32 sprite, no text.
```

Ghost:

```text
Single square ghost Tetris block cell, translucent cyan outline, faint inner fill, holographic scanline, transparent background, 32x32 sprite, no text.
```

## Upgrade Icons

Use transparent background, 64x64 or 128x128.

```text
Cyber neon roguelike Tetris game icon, dark circular base, bright cyan and purple glow, crisp simple symbol, no text, transparent background, icon for upgrade: {upgrade_theme}.
```

MVP upgrade themes:
- hard drop precision: downward arrow impact
- stable preview: three stacked small blocks
- tetris charge: four-row lightning beam
- spare hold: storage slot with rotating block
- low stack reward: low skyline with green plus
- rescue protocol: shield clearing top cells
- long bar calibration: I piece targeting reticle
- chain cleanup: linked combo nodes
- garbage recycle: steel block transforming to fragments
- anti compression field: board shield field

## Skill Icons

```text
Cyber neon roguelike Tetris active skill icon, dark square base, high contrast cyan magenta energy, simple readable symbol, no text, transparent background, icon for skill: {skill_theme}.
```

MVP skill themes:
- line clearer: horizontal laser row
- reroll piece: rotating dice and tetromino
- call long bar: I piece beacon
- purification pulse: red locked blocks turning cyan

## Affix Icons

```text
Cyber neon roguelike Tetris stage affix icon, warning style, dark base, amber red cyan glow, simple readable symbol, no text, transparent background, icon for affix: {affix_theme}.
```

MVP affix themes:
- speed storm: lightning and falling arrow
- fog preview: hidden next queue silhouette
- blocked floor: rising garbage row
- hold interference: crossed hold slot

## Reward Card Frame

```text
Cyber neon roguelike Tetris reward card frame, dark panel, beveled neon border, empty icon slot, empty title strip, empty description area, no readable text, transparent or dark background, 320x180, rarity border color: {rarity_color}.
```

## VFX Texture Prompts

Line clear particle:

```text
Small neon energy shard particle, cyan core, soft glow, transparent background, 64x64, no text.
```

Tetris burst particle:

```text
Bright white cyan angular energy shard, arcade neon glow, transparent background, 64x64, no text.
```

Reward spark:

```text
Tiny purple cyan star spark, crisp game particle, transparent background, 64x64, no text.
```
