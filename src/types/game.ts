export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type CellKind = 'empty' | 'normal' | 'garbage' | 'locked' | 'cracked' | 'bomb' | 'ghost';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type StageKind = 'normal' | 'elite' | 'event' | 'boss';

export type Cell = {
  kind: CellKind;
  pieceType?: PieceType;
  durability?: number;
};

export type ActivePiece = {
  type: PieceType;
  x: number;
  y: number;
  rotation: number;
  special?: CellKind;
};

export type InputCommand =
  | 'MoveLeft'
  | 'MoveRight'
  | 'SoftDrop'
  | 'HardDrop'
  | 'RotateCW'
  | 'RotateCCW'
  | 'Hold'
  | 'Pause'
  | 'Skill1'
  | 'Skill2'
  | 'Skill3'
  | 'Reward1'
  | 'Reward2'
  | 'Reward3';

export type LineClearResult = {
  lines: number[];
  cleared: number;
  bombCells: Array<{ x: number; y: number }>;
};

export type ScoreEvent = {
  score: number;
  energy: number;
  fragments: number;
  damage: number;
};
