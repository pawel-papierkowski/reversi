import { EnMode, EnPlayerType, EnDifficulty, EnGameStatus, EnCellState } from '@/code/data/enums';

// ////////////////////////////////////////////////////////////////////////////
// FULL GAME STATE                                                           //
// ////////////////////////////////////////////////////////////////////////////

// DEBUG CONSTANTS
const defDebugMode: boolean = true;

// //////////
// Game view.
// //////////

type GameView = {
  activeScreen: 'mainMenu' | 'gameBoard';
};

export function createGameView(): GameView {
  return {
    activeScreen: 'mainMenu',
  };
}

// //////////////
// Game settings.
// //////////////

type GameSettings = {
  mode: EnMode;
  whoFirst: EnPlayerType; // matters only in human vs AI mode
  difficulty: EnDifficulty;
  boardSize: number;
};

export function createGameSettings(): GameSettings {
  return {
    mode: EnMode.HumanVsAi,
    whoFirst: EnPlayerType.Human,
    difficulty: EnDifficulty.Easy,
    boardSize: 8,
  };
}

// ///////////////
// Debug settings.
// ///////////////

type DebugSettings = {
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

type ReversiBoard = {
  status: EnGameStatus;
  cells: Cell[][];
  players: Player[];
  currPlayer: number; // index for players
};

export function createReversiBoard(): ReversiBoard {
  return {
    status: EnGameStatus.Pending,
    cells: [], // actually filled later, as we need to know settings like board size
    players: [], // actually filled later, as we need to know settings like mode and who is first
    currPlayer: 0,
  };
}


// ///////////////////////
// Complete state of game.
// In principle you could serialize it into file on disk, creating full save of game.
// ///////////////////////

export type GameState = {
  view: GameView; // what should be shown on screen
  settings: GameSettings; // determined in main menu
  debugSettings: DebugSettings; // updated before and after every move
  statistics: GameStatistics; // reset every game
  board: ReversiBoard; // reset every round (and so also every game)
};

/** Create default game state. */
export function createGameState(): GameState {
  return {
    view: createGameView(),
    settings: createGameSettings(),
    debugSettings: createDebugSettings(),
    statistics: createGameStatistics(),
    board: createReversiBoard(),
  };
}
