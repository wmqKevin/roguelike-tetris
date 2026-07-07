export type Layout = {
  boardX: number;
  boardY: number;
  cell: number;
  sideLeftX: number;
  sideRightX: number;
  compactHud: boolean;
};

export function createLayout(width: number, height: number, displayWidth = width): Layout {
  const compactHud = displayWidth < 520;
  const cell = compactHud ? Math.max(18, Math.min(28, Math.floor((height - 112) / 22), Math.floor((width - 48) / 10))) : Math.max(22, Math.min(32, Math.floor(height / 24)));
  const boardW = cell * 10;
  const boardH = cell * 20;
  const boardX = Math.floor(width / 2 - boardW / 2);
  const boardY = compactHud ? Math.max(102, Math.floor(height / 2 - boardH / 2 + 44)) : Math.floor(height / 2 - boardH / 2 + 20);
  return {
    boardX,
    boardY,
    cell,
    sideLeftX: Math.max(24, boardX - 230),
    sideRightX: Math.min(width - 210, boardX + boardW + 40),
    compactHud
  };
}
