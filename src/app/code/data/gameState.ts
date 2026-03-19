import { EnMode, EnPlayerType, EnDifficulty, EnGameStatus, EnCellState, EnViewMode } from '@/code/data/enums';
import { defDebugMode, defDebugHint } from '@/code/data/const';

// ////////////////////////////////////////////////////////////////////////////
// FULL GAME STATE                                                           //
// ////////////////////////////////////////////////////////////////////////////


// //////////
// Game view.
// //////////

type GameView = {
  viewMode: EnViewMode; // View mode - either real board or state from history.
  viewMove: number; // Id of move in history. If -1, no move is viewed.
  // Actually points to current board or board from history entry.
  cells: Cell[][];
};

export function createGameView(): GameView {
  return {
    viewMode: EnViewMode.CurrentBoard,
    viewMove: -1,
    cells: [],
  };
}

// //////////////
// Game settings.
// //////////////

export type GameSettings = {
  mode: EnMode;
  whoFirst: EnPlayerType; // matters only in human vs AI mode
  difficulty: EnDifficulty; // matters only in human vs AI or AI vs AI mode
  boardSize: number;  // size of board, default is 8x8
  showHints: boolean; // shows legal moves on board
};

export function createGameSettings(): GameSettings {
  return {
    mode: EnMode.HumanVsHuman, // will be HumanVsAi
    whoFirst: EnPlayerType.Human,
    difficulty: EnDifficulty.Easy,
    boardSize: 8,
    showHints: defDebugHint,
  };
}

// ///////////////
// Debug settings.
// ///////////////

// Settable only in code.
export type DebugSettings = {
  debugMode: boolean;
};

/** Debug settings for development: get values from constants. */
export function createDebugSettingsForDev(): DebugSettings {
  return {
    debugMode: defDebugMode,
  };
}

/** Debug settings for production: everything turned off. */
export function createDebugSettingsForProd(): DebugSettings {
  return {
    debugMode: false,
  };
}

// ////////////////
// Game statistics.
// ////////////////

type GameStatistics = {
  round: number;
  moveCount: number;
  emptyCells: number;

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
    emptyCells: 0,

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
  potentialMove: EnCellState; // used only when defDebugShowMove === true
  weight: number; // weight of cell for AI
}

export function createCell(weight: number): Cell {
  return {
    state: EnCellState.Empty,
    potentialMove: EnCellState.Empty,
    weight: weight,
  };
}

export function updateCellState(cell: Cell, state: EnCellState) {
  cell.state = state;
  // rest is unchanged
}

export function updateCellFull(cell: Cell, state: EnCellState, potentialMove: EnCellState) {
  cell.state = state;
  cell.potentialMove = potentialMove;
  // rest is unchanged
}

//

export type Player = {
  type: EnPlayerType;
  piece: EnCellState.B | EnCellState.W;
  name: string;
}

export function createPlayer(piece: EnCellState.B | EnCellState.W): Player {
  return {
    type: EnPlayerType.Human,
    piece: piece,
    name: '',
  };
}
export function createPlayers(): Player[] {
  return [createPlayer(EnCellState.B), createPlayer(EnCellState.W)];
}

//

export type GameHistoryEntry = {
  id: number; // for track
  playerIx: number; // Which player did that move.
  move: ReversiMove | null; // Move itself. Null indicates no move (initial state of board or pass).
  cells: Cell[][]; // Board state as copy of main board at that moment.
};

export function createGameHistoryEntry(): GameHistoryEntry {
  return {
    id: 0,
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
  x: number;
  y: number;
};

export function createReversiMove(x: number, y: number): ReversiMove {
  return {
    x: x,
    y: y
  };
}

//

export type ReversiBoard = {
  status: EnGameStatus;
  cells: Cell[][]; // Current state of board.
  legalMoves: ReversiMove[]; // List of available legal moves for this board state and current player.
  doublePass: boolean; // If true, both current and next player has no legal moves.
  currPlayerIx: number; // index for gameState.players
  history: GameHistory; // tracks history of moves in current round
};

export function createGameBoard(): ReversiBoard {
  return {
    status: EnGameStatus.Pending,
    cells: [], // actually filled later, as we need to know settings like board size
    legalMoves: [],
    doublePass: false,
    currPlayerIx: 0,
    history: createGameHistory(),
  };
}

// ///////////////////////
// Complete state of game.
// In principle you could serialize it into file on disk, creating full save of game.
// ///////////////////////

export type GameState = {
  settings: GameSettings; // persists between games unless updated in main menu
  statistics: GameStatistics; // statistics: reset for new game, update for new round
  players: Player[]; // players: reset for new game
  board: ReversiBoard; // data about board state: reset for new game and every round
  view: GameView; // what should be shown on screen: updated when needed
  debugSettings: DebugSettings; // debug settings: reset for new game
};

/** Create default game state. */
export function createGameState(): GameState {
  return {
    settings: createGameSettings(),
    statistics: createGameStatistics(),
    players: createPlayers(), // actually filled later, as we need to know settings like mode and who is first
    board: createGameBoard(),
    view: createGameView(),
    debugSettings: createDebugSettingsForDev(),
  };
}
