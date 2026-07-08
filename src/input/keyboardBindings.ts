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
  KeyC: 'Skill1',
  KeyV: 'Hold',
  ShiftLeft: 'Hold',
  ShiftRight: 'Hold',
  Escape: 'Pause',
  KeyP: 'Pause',
  Digit1: 'Reward1',
  Digit2: 'Reward2',
  Digit3: 'Reward3',
  KeyF: 'Skill2',
  KeyG: 'Skill3'
};
