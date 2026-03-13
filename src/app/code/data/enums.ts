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

//

export enum EnDifficulty {
  Easy, // AI makes completely random moves.
  Medium, // AI goes to relatively shallow depth.
  Hard, // AI goes deeper.
}

export const difficultyDescr: Record<EnDifficulty, string> = {
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
