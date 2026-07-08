import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { GameScene } from '../scenes/GameScene';

export function createPhaserConfig(parent: string): Phaser.Types.Core.GameConfig {
  const portrait = globalThis.innerWidth < 520 && globalThis.innerHeight > globalThis.innerWidth;
  return {
    type: Phaser.AUTO,
    parent,
    width: portrait ? globalThis.innerWidth : 1280,
    height: portrait ? globalThis.innerHeight : 720,
    backgroundColor: '#060814',
    scale: {
      mode: portrait ? Phaser.Scale.RESIZE : Phaser.Scale.FIT,
      autoCenter: portrait ? Phaser.Scale.NO_CENTER : Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true,
      pixelArt: false
    },
    scene: [BootScene, GameScene]
  };
}
