import Phaser from 'phaser';
import { createPhaserConfig } from './phaserConfig';

let game: Phaser.Game | undefined;

export function startGame(parent: string): Phaser.Game {
  game?.destroy(true);
  game = new Phaser.Game(createPhaserConfig(parent));
  return game;
}
