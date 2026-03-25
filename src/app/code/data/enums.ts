export enum EnMode {
  HumanVsHuman, // two human players mode
  HumanVsAi, // human vs AI player mode
  AiVsAi, // two AI players mode
}

export const modeDescr: Record<EnMode, string> = {
  [EnMode.HumanVsHuman]: 'Human vs human',
  [EnMode.HumanVsAi]: 'Human vs AI',
  [EnMode.AiVsAi]: 'AI vs AI',
};

export enum EnPlayerType {
  Human,
  AI,
}

export const playerTypeDescr: Record<EnPlayerType, string> = {
  [EnPlayerType.Human]: 'Human',
  [EnPlayerType.AI]: 'AI',
};

export enum EnViewMode {
  CurrentBoard, // we see current board
  History, // we see history entry
}

export const viewModeDescr: Record<EnViewMode, string> = {
  [EnViewMode.CurrentBoard]: 'Current board',
  [EnViewMode.History]: 'History',
};

//

export enum EnDifficulty {
  Mindless, // AI makes completely random moves.
  Easy, // AI uses miniMax to shallow depth.
  Medium, // AI goes deeper.
  Hard, // AI goes deeper and uses additional tricks like dynamic weighting or different scoring.
}

export const difficultyDescr: Record<EnDifficulty, string> = {
  [EnDifficulty.Mindless]: 'Mindless',
  [EnDifficulty.Easy]: 'Easy',
  [EnDifficulty.Medium]: 'Medium',
  [EnDifficulty.Hard]: 'Hard',
};

export enum EnAiTactic {
  Random, // AI makes completely random moves.
  MiniMax, // AI uses MiniMax algorithm.
}

export const aiTacticDescr: Record<EnAiTactic, string> = {
  [EnAiTactic.Random]: 'Random',
  [EnAiTactic.MiniMax]: 'MiniMax',
};

//

export enum EnGameStatus {
  Stop, // game is halted due to error
  Pending, // default state
  InProgress,
  PlayerWon, // we know which one via currPlayerIx
  Tie,
}

export const gameStatusDescr: Record<EnGameStatus, string> = {
  [EnGameStatus.Stop]: 'Stop',
  [EnGameStatus.Pending]: 'Pending',
  [EnGameStatus.InProgress]: 'In progress',
  [EnGameStatus.PlayerWon]: 'Player won',
  [EnGameStatus.Tie]: 'Tie',
};

export enum EnCellState {
  Unknown, // should not happen
  Empty, // starting value
  B, // black piece
  W, // white piece
}

export const cellStateDescr: Record<EnCellState, string> = {
  [EnCellState.Unknown]: 'Unknown',
  [EnCellState.Empty]: 'Empty',
  [EnCellState.B]: 'Black',
  [EnCellState.W]: 'White',
};

//

export enum EnScoringType {
  AvailableMoves, // prioritizes amount of available legal moves
  Weighted, // scores according to weights on board
  Straight, // scores according to amount of pieces on board
}

//

export enum EnDir {
  N,  //  X, -Y
  NE, // +X, -Y
  E,  // +X,  Y
  SE, // +X, +Y
  S,  //  X, +Y
  SW, // -X, +Y
  W,  // -X,  Y
  NW, // -X, -Y
}
