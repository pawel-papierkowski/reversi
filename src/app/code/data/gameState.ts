import { EnMode, EnPlayerType, EnDifficulty, EnGameStatus, EnCellState } from '@/code/data/enums';
import { defDebugMode, defDebugShowMove } from '@/code/data/const';

// ////////////////////////////////////////////////////////////////////////////
// FULL GAME STATE                                                           //
// ////////////////////////////////////////////////////////////////////////////


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

// Settable only in code.
export type DebugSettings = {
  debugMode: boolean;
  showMove: boolean; // if true, show
};

/** Debug settings for development: get values from constants. */
export function createDebugSettingsForDev(): DebugSettings {
  return {
    debugMode: defDebugMode,
    showMove: defDebugShowMove,
  };
}

/** Debug settings for production: everything turned off. */
export function createDebugSettingsForProd(): DebugSettings {
  return {
    debugMode: false,
    showMove: false,
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
  player1Win: number;
  player1WinInRow: number;

  player2Score: number;
  player2Win: number;
  player2WinInRow: number;
};

export function createGameStatistics(): GameStatistics {
  return {
    round: 0,
    moveCount: 0,

    ties: 0,
    tiesInRow: 0,

    player1Score: 0,
    player1Win: 0,
    player1WinInRow: 0,

    player2Score: 0,
    player2Win: 0,
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

export function createCellFill(state: EnCellState): Cell {
  return {
    state: state,
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
export function createPlayers(): Player[] {
  return [createPlayer(), createPlayer()];
}

//

export type GameHistoryEntry = {
  playerIx: number; // needed as player must skip move if no legal moves available at given moment for that player
  move: ReversiMove | null; // move itself
  cells: Cell[][]; // board state as copy of main board at that moment
};

export function createGameHistoryEntry(): GameHistoryEntry {
  return {
    playerIx: -1,
    move: null,
    cells: [],
  };
}

export type GameHistory = {
  moves: GameHistoryEntry[];
};

export function createGameHistory(): GameHistory {
  return {
    moves: [],
  };
}

//

export type ReversiMove = {
};

export function createLegalMove(): ReversiMove {
  return {
  };
}

//

type ReversiBoard = {
  status: EnGameStatus;
  cells: Cell[][]; // Current state of board.
  legalMoves: ReversiMove[]; // List of available legal moves for this board state and current player.
  currPlayerIx: number; // index for gameState.players
  history: GameHistory; // tracks history of moves in current round
};

export function createGameBoard(): ReversiBoard {
  return {
    status: EnGameStatus.Pending,
    cells: [], // actually filled later, as we need to know settings like board size
    legalMoves: [],
    currPlayerIx: 0,
    history: createGameHistory(),
  };
}

// ///////////////////////
// Complete state of game.
// In principle you could serialize it into file on disk, creating full save of game.
// ///////////////////////

export type GameState = {
  view: GameView; // what should be shown on screen: updated when needed
  settings: GameSettings; // persists between games unless updated in main menu
  statistics: GameStatistics; // statistics: reset for new game, update for new round
  players: Player[]; // players: reset for new game
  board: ReversiBoard; // data about board state: reset for new game and every round
  debugSettings: DebugSettings; // debug settings: reset for new game
};

/** Create default game state. */
export function createGameState(): GameState {
  return {
    view: createGameView(),
    settings: createGameSettings(),
    statistics: createGameStatistics(),
    players: createPlayers(), // actually filled later, as we need to know settings like mode and who is first
    board: createGameBoard(),
    debugSettings: createDebugSettingsForDev(),
  };
}
