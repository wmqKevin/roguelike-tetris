import type { ActivePiece, Cell, LineClearResult } from '../types/game';
import { getCells } from './tetrominoes';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 22;
export const VISIBLE_HEIGHT = 20;
export const HIDDEN_ROWS = 2;

export const emptyCell = (): Cell => ({ kind: 'empty' });

export class Board {
  readonly width = BOARD_WIDTH;
  readonly height = BOARD_HEIGHT;
  cells: Cell[];

  constructor(cells?: Cell[]) {
    this.cells = cells ? cells.map((cell) => ({ ...cell })) : Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, emptyCell);
  }

  clone(): Board {
    return new Board(this.cells);
  }

  get(x: number, y: number): Cell {
    if (!this.inBounds(x, y)) return { kind: 'locked', durability: 1 };
    return this.cells[y * this.width + x];
  }

  set(x: number, y: number, cell: Cell): void {
    if (this.inBounds(x, y)) this.cells[y * this.width + x] = { ...cell };
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  collides(piece: ActivePiece): boolean {
    return getCells(piece.type, piece.rotation).some(([dx, dy]) => {
      const x = piece.x + dx;
      const y = piece.y + dy;
      return x < 0 || x >= this.width || y >= this.height || (y >= 0 && this.get(x, y).kind !== 'empty' && this.get(x, y).kind !== 'ghost');
    });
  }

  lock(piece: ActivePiece): void {
    for (const [dx, dy] of getCells(piece.type, piece.rotation)) {
      const x = piece.x + dx;
      const y = piece.y + dy;
      if (y >= 0) this.set(x, y, { kind: piece.special ?? 'normal', pieceType: piece.type, durability: piece.special === 'locked' ? 2 : 1 });
    }
  }

  clearLines(): LineClearResult {
    const lines: number[] = [];
    const bombCells: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < this.height; y += 1) {
      let full = true;
      for (let x = 0; x < this.width; x += 1) {
        const cell = this.get(x, y);
        if (cell.kind === 'empty' || cell.kind === 'locked') full = false;
        if (cell.kind === 'bomb') bombCells.push({ x, y });
      }
      if (full) lines.push(y);
    }
    for (const bomb of bombCells) {
      if (lines.includes(bomb.y)) this.explode(bomb.x, bomb.y);
    }
    for (const y of lines) {
      this.cells.splice(y * this.width, this.width);
      this.cells.unshift(...Array.from({ length: this.width }, emptyCell));
    }
    return { lines, cleared: lines.length, bombCells };
  }

  addGarbageRows(count: number, holeColumn: number): void {
    for (let i = 0; i < count; i += 1) {
      this.cells.splice(0, this.width);
      for (let x = 0; x < this.width; x += 1) {
        this.cells.push(x === holeColumn ? emptyCell() : { kind: 'garbage', durability: 1 });
      }
    }
  }

  highestVisibleRow(): number {
    for (let y = HIDDEN_ROWS; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (this.get(x, y).kind !== 'empty') return y - HIDDEN_ROWS;
      }
    }
    return VISIBLE_HEIGHT;
  }

  private explode(cx: number, cy: number): void {
    for (let y = cy - 1; y <= cy + 1; y += 1) {
      for (let x = cx - 1; x <= cx + 1; x += 1) {
        const cell = this.get(x, y);
        if (cell.kind !== 'locked') this.set(x, y, emptyCell());
      }
    }
  }
}
