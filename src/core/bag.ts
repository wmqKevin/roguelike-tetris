import type { PieceType } from '../types/game';
import type { Rng } from './rng';
import { shuffle } from './rng';
import { PIECE_TYPES } from './tetrominoes';

export class SevenBag {
  private queue: PieceType[] = [];

  constructor(private readonly rng: Rng) {}

  next(): PieceType {
    this.ensure(1);
    return this.queue.shift()!;
  }

  peek(count: number): PieceType[] {
    this.ensure(count);
    return this.queue.slice(0, count);
  }

  forceNext(type: PieceType): void {
    this.queue.unshift(type);
  }

  private ensure(count: number): void {
    while (this.queue.length < count) {
      this.queue.push(...shuffle(this.rng, PIECE_TYPES));
    }
  }
}
