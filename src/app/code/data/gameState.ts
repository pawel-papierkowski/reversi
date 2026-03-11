import { EnMode, EnPlayerType, EnDifficulty, EnGameStatus, EnCellState } from '@/code/data/enums';

// ////////////////////////////////////////////////////////////////////////////
// FULL GAME STATE                                                           //
// ////////////////////////////////////////////////////////////////////////////

// DEBUG CONSTANTS
export const defDebugMode: boolean = true;

// //////////
// Game view.
// //////////

type GameView = {
  // Separate from cells in board because we want to show also state of board from history.
  cells: Cell[][];
};

export function createGameView(): GameView {
  return {
    cells: [],
  };
}

// //////////////
// Game settings.
// //////////////

export type GameSettings = {
  mode: EnMode;
  whoFirst: EnPlayerType; // matters only in human vs AI mode
  difficulty: EnDifficulty;
  boardSize: number;
};

export function createGameSettings(): GameSettings {
  return {
    mode: EnMode.HumanVsHuman, // will be HumanVsAi
    whoFirst: EnPlayerType.Human,
    difficulty: EnDifficulty.Easy,
    boardSize: 8,
  };
}

// ///////////////
// Debug settings.
// ///////////////

export type DebugSettings = {
  debugMode: boolean;
};

export function createDebugSettings(): DebugSettings {
  return {
    debugMode: defDebugMode, // Settable only in code.
  };
}

// ////////////////
// Game statistics.
// ////////////////

type GameStatistics = {
  round: number;
  moveCount: number;
  ties: number;
  tiesInRow: number;
  player1Score: number;
  player1WinInRow: number;
  player2Score: number;
  player2WinInRow: number;
};

export function createGameStatistics(): GameStatistics {
  return {
    round: 0,
    moveCount: 0,
    ties: 0,
    tiesInRow: 0,
    player1Score: 0,
    player1WinInRow: 0,
    player2Score: 0,
    player2WinInRow: 0,
  };
}

// ////////////////////////
// Reversi board state.
// ////////////////////////

export type Cell = {
  state: EnCellState;
}

export function createCell(): Cell {
  return {
    state: EnCellState.Empty,
  };
}

//

export type Player = {
  type: EnPlayerType;
  name: string;
}

export function createPlayer(): Player {
  return {
    type: EnPlayerType.Human,
    name: '',
  };
}

//

export type GameHistoryEntry = {
  playerIx: number; // needed as player must skip move if no legal moves available at given moment for that player
  move: string; // encoded move to show on screen
  cells: Cell[][]; // board state as copy of main board at that moment
};

export type GameHistory = {
  moves: GameHistoryEntry[];
};

export function createGameHistory(): GameHistory {
  return {
    moves: [],
  };
}

//

type ReversiBoard = {
  status: EnGameStatus;
  cells: Cell[][]; // Current state of board.
  currPlayerIx: number; // index for players
  history: GameHistory; // tracks history of moves in current round
};

export function createGameBoard(): ReversiBoard {
  return {
    status: EnGameStatus.Pending,
    cells: [], // actually filled later, as we need to know settings like board size
    currPlayerIx: 0,
    history: createGameHistory(),
  };
}

// ///////////////////////
// Complete state of game.
// In principle you could serialize it into file on disk, creating full save of game.
// ///////////////////////

export type GameState = {
  view: GameView; // what should be shown on screen, updated when needed
  settings: GameSettings; // persists between games unless updated in main menu
  statistics: GameStatistics; // statistics, reset for new game
  players: Player[]; // players, reset for new game
  board: ReversiBoard; // data about board state, reset for new game and every round
  debugSettings: DebugSettings; // debug settings, reset for new game
};

/** Create default game state. */
export function createGameState(): GameState {
  return {
    view: createGameView(),
    settings: createGameSettings(),
    statistics: createGameStatistics(),
    players: [], // actually filled later, as we need to know settings like mode and who is first
    board: createGameBoard(),
    debugSettings: createDebugSettings(),
  };
}
