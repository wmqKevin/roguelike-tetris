export type Layout = {
  boardX: number;
  boardY: number;
  cell: number;
  sideLeftX: number;
  sideRightX: number;
  compactHud: boolean;
  portrait: boolean;
};

export function createLayout(width: number, height: number, displayWidth = width): Layout {
  const compactHud = displayWidth <= 520;
  const portrait = compactHud && height > width;
  const compactLandscape = compactHud && !portrait;
  const cell = portrait
    ? Math.max(24, Math.min(36, Math.floor((width - 28) / 10), Math.floor((height - 170) / 20)))
    : compactLandscape
      ? Math.max(14, Math.min(18, Math.floor((height - 86) / 20), Math.floor((width * 0.44) / 10)))
      : Math.max(22, Math.min(32, Math.floor(height / 24)));
  const boardW = cell * 10;
  const boardH = cell * 20;
  const boardX = compactLandscape ? 14 : Math.floor(width / 2 - boardW / 2);
  const boardY = portrait
    ? Math.max(96, Math.min(116, Math.floor((height - boardH) / 2 + 10)))
    : compactLandscape
      ? Math.max(70, Math.floor(height / 2 - boardH / 2 + 30))
      : Math.floor(height / 2 - boardH / 2 + 20);
  return {
    boardX,
    boardY,
    cell,
    sideLeftX: Math.max(24, boardX - 230),
    sideRightX: Math.min(width - 210, boardX + boardW + 40),
    compactHud,
    portrait
  };
}
