import type { ActivePiece } from '../types/game';
import { Board } from './board';

const JLSTZ_KICKS: Record<string, Array<[number, number]>> = {
  '0>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1>0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1>2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3>2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3>0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]
};

const I_KICKS: Record<string, Array<[number, number]>> = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]
};

export function tryRotate(board: Board, piece: ActivePiece, direction: 1 | -1): ActivePiece | null {
  if (piece.type === 'O') return { ...piece, rotation: (piece.rotation + direction + 4) % 4 };
  const from = ((piece.rotation % 4) + 4) % 4;
  const to = (from + direction + 4) % 4;
  const kicks = (piece.type === 'I' ? I_KICKS : JLSTZ_KICKS)[`${from}>${to}`] ?? [[0, 0]];
  for (const [dx, dy] of kicks) {
    const rotated = { ...piece, rotation: to, x: piece.x + dx, y: piece.y - dy };
    if (!board.collides(rotated)) return rotated;
  }
  return null;
}
