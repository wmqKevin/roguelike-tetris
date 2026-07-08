import Phaser from 'phaser';
import { createPhaserConfig } from './phaserConfig';

declare global {
  interface Window {
    __ROGUELIKE_TETRIS_GAME__?: Phaser.Game;
  }
}

let game: Phaser.Game | undefined;

export function startGame(parent: string): Phaser.Game {
  game?.destroy(true);
  game = new Phaser.Game(createPhaserConfig(parent));
  window.__ROGUELIKE_TETRIS_GAME__ = game;
  return game;
}
