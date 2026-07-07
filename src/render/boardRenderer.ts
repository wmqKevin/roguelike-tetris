import Phaser from 'phaser';
import type { ActivePiece, CellKind, PieceType } from '../types/game';
import { Board, HIDDEN_ROWS } from '../core/board';
import { getCells } from '../core/tetrominoes';
import type { Layout } from './responsiveLayout';

const PIECE_COLORS: Record<PieceType, number> = {
  I: 0x00e5ff,
  O: 0xfff45c,
  T: 0xb36bff,
  S: 0x3dff98,
  Z: 0xff4f78,
  J: 0x3f7cff,
  L: 0xff9d42
};

const SPECIAL_COLORS: Partial<Record<CellKind, number>> = {
  garbage: 0x55606f,
  locked: 0xff2bd6,
  cracked: 0xf2b84b,
  bomb: 0xff4a2d,
  ghost: 0x7ce7ff
};

export class BoardRenderer {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  render(board: Board, active: ActivePiece, ghost: ActivePiece, layout: Layout): void {
    const { boardX, boardY, cell } = layout;
    this.graphics.clear();
    this.graphics.fillStyle(0x0a1022, 0.92).fillRoundedRect(boardX - 10, boardY - 10, cell * 10 + 20, cell * 20 + 20, 8);
    this.graphics.lineStyle(2, 0x00e5ff, 0.6).strokeRoundedRect(boardX - 10, boardY - 10, cell * 10 + 20, cell * 20 + 20, 8);
    for (let y = HIDDEN_ROWS; y < board.height; y += 1) {
      for (let x = 0; x < board.width; x += 1) {
        const sx = boardX + x * cell;
        const sy = boardY + (y - HIDDEN_ROWS) * cell;
        this.graphics.lineStyle(1, 0x1b2a46, 0.5).strokeRect(sx, sy, cell, cell);
        const cellData = board.get(x, y);
        if (cellData.kind !== 'empty') {
          this.drawCell(sx, sy, cell, SPECIAL_COLORS[cellData.kind] ?? PIECE_COLORS[cellData.pieceType ?? 'I'], cellData.kind === 'ghost' ? 0.45 : 0.95);
        }
      }
    }
    this.drawPiece(ghost, layout, 0.16);
    this.drawPiece(active, layout, active.special === 'ghost' ? 0.55 : 1);
  }

  drawMiniPiece(type: PieceType, x: number, y: number, cell: number, alpha = 1): void {
    for (const [dx, dy] of getCells(type, 0)) this.drawCell(x + dx * cell, y + dy * cell, cell, PIECE_COLORS[type], alpha);
  }

  private drawPiece(piece: ActivePiece, layout: Layout, alpha: number): void {
    const color = piece.special ? SPECIAL_COLORS[piece.special] ?? PIECE_COLORS[piece.type] : PIECE_COLORS[piece.type];
    for (const [dx, dy] of getCells(piece.type, piece.rotation)) {
      const y = piece.y + dy - HIDDEN_ROWS;
      if (y >= 0) this.drawCell(layout.boardX + (piece.x + dx) * layout.cell, layout.boardY + y * layout.cell, layout.cell, color, alpha);
    }
  }

  private drawCell(x: number, y: number, size: number, color: number, alpha: number): void {
    const inset = 2;
    this.graphics.fillStyle(color, alpha).fillRoundedRect(x + inset, y + inset, size - inset * 2, size - inset * 2, 4);
    this.graphics.lineStyle(1, 0xffffff, alpha * 0.5).strokeRoundedRect(x + inset, y + inset, size - inset * 2, size - inset * 2, 4);
  }
}
