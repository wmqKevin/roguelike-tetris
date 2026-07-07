import type { InputCommand } from '../types/game';

export const KEYBOARD_BINDINGS: Record<string, InputCommand> = {
  ArrowLeft: 'MoveLeft',
  KeyA: 'MoveLeft',
  ArrowRight: 'MoveRight',
  KeyD: 'MoveRight',
  ArrowDown: 'SoftDrop',
  KeyS: 'SoftDrop',
  Space: 'HardDrop',
  ArrowUp: 'RotateCW',
  KeyX: 'RotateCW',
  KeyK: 'RotateCW',
  KeyZ: 'RotateCCW',
  KeyJ: 'RotateCCW',
  KeyC: 'Hold',
  ShiftLeft: 'Hold',
  ShiftRight: 'Hold',
  Escape: 'Pause',
  KeyP: 'Pause',
  Digit1: 'Skill1',
  Digit2: 'Skill2',
  Digit3: 'Skill3'
};
