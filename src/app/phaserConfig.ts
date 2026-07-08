import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { GameScene } from '../scenes/GameScene';

export function createPhaserConfig(parent: string): Phaser.Types.Core.GameConfig {
  const compactViewport = globalThis.innerWidth <= 520;
  const portrait = compactViewport && globalThis.innerHeight > globalThis.innerWidth;
  return {
    type: Phaser.AUTO,
    parent,
    width: compactViewport ? globalThis.innerWidth : 1280,
    height: compactViewport ? globalThis.innerHeight : 720,
    backgroundColor: '#060814',
    scale: {
      mode: compactViewport ? Phaser.Scale.RESIZE : Phaser.Scale.FIT,
      autoCenter: compactViewport ? Phaser.Scale.NO_CENTER : Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true,
      pixelArt: false
    },
    scene: [BootScene, GameScene]
  };
}
