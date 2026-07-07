import Phaser from 'phaser';
import type { InputCommand } from '../types/game';
import { KEYBOARD_BINDINGS } from './keyboardBindings';

export class InputManager {
  private cursors = new Set<InputCommand>();
  private repeatElapsed = 0;

  constructor(private readonly scene: Phaser.Scene, private readonly onCommand: (command: InputCommand) => void) {}

  create(): void {
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const command = KEYBOARD_BINDINGS[event.code];
      if (!command) return;
      event.preventDefault();
      if (command === 'MoveLeft' || command === 'MoveRight' || command === 'SoftDrop') {
        this.cursors.add(command);
      }
      this.onCommand(command);
    });
    this.scene.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
      const command = KEYBOARD_BINDINGS[event.code];
      if (command) this.cursors.delete(command);
    });
  }

  update(deltaMs: number): void {
    this.repeatElapsed += deltaMs;
    if (this.repeatElapsed < 80) return;
    this.repeatElapsed = 0;
    if (this.cursors.has('MoveLeft')) this.onCommand('MoveLeft');
    if (this.cursors.has('MoveRight')) this.onCommand('MoveRight');
    if (this.cursors.has('SoftDrop')) this.onCommand('SoftDrop');
  }
}
