import { EnGameStatus, EnCellState } from '@/code/data/enums';
import type { GameState, Cell } from "@/code/data/gameState";
import { createGameState, createCell, createCellFill, createCellFull, createGameHistoryEntry, createReversiMove } from "@/code/data/gameState";

/**
 * Generate game state after start of game, but with empty board.
 */
export function genEmptyState(actualGameState: GameState | null, boardSize: number): GameState {
  const startGameState = genState(actualGameState, boardSize);
  genDataFromBoard(startGameState);
  return startGameState;
}

/**
 * Generate game state after start of game. Four pieces in center of board are already placed.
 */
export function genStartState(actualGameState: GameState | null, boardSize: number): GameState {
  const startGameState = genState(actualGameState, boardSize);

  const ix = boardSize/2 - 1; // for size 8 it will be 3
  startGameState.board.cells[ix][ix] = createCellFill(EnCellState.W);
  startGameState.board.cells[ix+1][ix] = createCellFill(EnCellState.B);
  startGameState.board.cells[ix][ix+1] = createCellFill(EnCellState.B);
  startGameState.board.cells[ix+1][ix+1] = createCellFill(EnCellState.W);

  startGameState.board.cells[ix-1][ix] = createCellFull(EnCellState.Empty, EnCellState.B);
  startGameState.board.cells[ix][ix-1] = createCellFull(EnCellState.Empty, EnCellState.B);
  startGameState.board.cells[ix+1][ix+2] = createCellFull(EnCellState.Empty, EnCellState.B);
  startGameState.board.cells[ix+2][ix+1] = createCellFull(EnCellState.Empty, EnCellState.B);

  startGameState.board.legalMoves = [
    createReversiMove(ix-1, ix),
    createReversiMove(ix, ix-1),
    createReversiMove(ix+1, ix+2),
    createReversiMove(ix+2, ix+1),
  ];

  startGameState.statistics.player1Score = 2;
  startGameState.statistics.player2Score = 2;

  genDataFromBoard(startGameState);
  return startGameState;
}

//

/**
 * Generate default game state with empty board.
 */
function genState(actualGameState: GameState | null, boardSize: number): GameState {
  const startGameState = createGameState();
  // Mutate only the fields that change after "Start Game" is clicked.

  startGameState.settings.boardSize = boardSize;
  startGameState.board.status = EnGameStatus.InProgress;

  // Game board should have four pieces in middle already.
  startGameState.board.cells = genCells(boardSize); // generate empty board

  // Player names are random, so we test them separately.
  startGameState.players[0].name = actualGameState?.players[0].name || '';
  startGameState.players[1].name = actualGameState?.players[1].name || '';
  return startGameState;
}

/**
 * Generate cells for board. Every cell is empty.
 * @param boardSize Size of board.
 * @returns 2D array of cells.
 */
function genCells(boardSize: number): Cell[][] {
  const cells : Cell[][] = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => createCell())
  );
  return cells;
}

/**
 * Call it after modifications to board.
 * @param startGameState Generated game state.
 */
function genDataFromBoard(startGameState: GameState) {
  // Should have first move (initial board state) already in history.
  const move = createGameHistoryEntry();
  move.cells = startGameState.board.cells;
  startGameState.board.history.moves.push(move);

  // Game view should be set.
  startGameState.view.cells = startGameState.board.cells;
}
