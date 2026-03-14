import { expect } from 'vitest';

import { EnGameStatus, EnCellState } from '@/code/data/enums';
import type { GameState, Cell, ReversiBoard, GameHistory, GameHistoryEntry } from "@/code/data/gameState";
import { createGameState, createCell, createCellFill, createCellFull, createGameHistoryEntry, createReversiMove } from "@/code/data/gameState";

/**
 * Generate game state after start of game, but with empty board.
 */
export function genEmptyState(boardSize: number): GameState {
  const startGameState = genState(boardSize);
  genDataFromBoard(startGameState);
  return startGameState;
}

/**
 * Generate game state after start of game. Four pieces in center of board are already placed.
 */
export function genStartState(boardSize: number): GameState {
  const startGameState = genState(boardSize);

  const ix = boardSize/2 - 1; // for size 8 it will be 3
  // pieces already on board
  startGameState.board.cells[ix][ix] = createCellFill(EnCellState.W);
  startGameState.board.cells[ix+1][ix] = createCellFill(EnCellState.B);
  startGameState.board.cells[ix][ix+1] = createCellFill(EnCellState.B);
  startGameState.board.cells[ix+1][ix+1] = createCellFill(EnCellState.W);

  // legal moves
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

  // scoring
  startGameState.statistics.emptyCells = boardSize*boardSize - 4;
  startGameState.statistics.player1Score = 2;
  startGameState.statistics.player2Score = 2;

  genDataFromBoard(startGameState);
  return startGameState;
}

//

/**
 * Generate default game state with empty board.
 */
function genState(boardSize: number): GameState {
  const startGameState = createGameState();
  // Mutate only the fields that change after "Start Game" is clicked.

  startGameState.settings.boardSize = boardSize;
  startGameState.board.status = EnGameStatus.InProgress;

  // Game board should have four pieces in middle already.
  startGameState.board.cells = genCells(boardSize); // generate empty board
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
  const historyEntry = createGameHistoryEntry();
  historyEntry.cells = structuredClone(startGameState.board.cells);
  startGameState.board.history.moves.push(historyEntry);

  // Game view should be set.
  startGameState.view.cells = startGameState.board.cells;
}

// ////////////////////////////////////////////////////////////////////////////
// ASSERTIONS

/**
 * Common assertion for game state. Equality check is partitioned to avoid messy and unreadable
 * failure message in console.
 * @param actualGameState Actual game state.
 * @param expectedGameState Expected game state.
 */
export function assertGameState(actualGameState: GameState, expectedGameState: GameState) {
  // first, modify expected game state as certain fields (like player name) are random
  adjustExpectedGameState(actualGameState, expectedGameState);

  expect(actualGameState.settings, 'Settings should be same').toEqual(expectedGameState.settings);
  expect(actualGameState.statistics, 'Statistics should be same').toEqual(expectedGameState.statistics);
  expect(actualGameState.players, 'Players should be same').toEqual(expectedGameState.players);
  assertGameBoard(actualGameState.board, expectedGameState.board);
  expect(actualGameState.view, 'View should be same').toEqual(expectedGameState.view);
  expect(actualGameState.debugSettings, 'Debug settings should be same').toEqual(expectedGameState.debugSettings);

  // Ensure player names at least exist.
  expect(actualGameState.players[0].name.length).toBeGreaterThan(0);
  expect(actualGameState.players[1].name.length).toBeGreaterThan(0);
}

/**
 * Due to size of data in board, it is asserted even more granularly.
 * @param actualBoard Actual board.
 * @param expectedBoard Expected board.
 */
function assertGameBoard(actualBoard: ReversiBoard, expectedBoard: ReversiBoard) {
  expect(actualBoard.status, 'Board status should be same').toEqual(expectedBoard.status);
  expect(actualBoard.currPlayerIx, 'Board currPlayerIx should be same').toEqual(expectedBoard.currPlayerIx);
  assertGameHistory(actualBoard.history, expectedBoard.history);
  expect(actualBoard.legalMoves, 'Board legalMoves should be same').toEqual(expectedBoard.legalMoves);
  expect(actualBoard.cells, 'Board cells should be same').toEqual(expectedBoard.cells);
}

/**
 * Due to size of data in history, it is asserted entry by entry.
 * @param actualHistory Actual history.
 * @param expectedHistory Expected history.
 */
function assertGameHistory(actualHistory: GameHistory, expectedHistory: GameHistory) {
  expect(actualHistory.moves.length, 'Game history must have same size').toEqual(expectedHistory.moves.length);
  for (let i=0; i<actualHistory.moves.length; i++) {
    const actualHistoryEntry = actualHistory.moves[i];
    const expectedHistoryEntry = expectedHistory.moves[i];
    assertGameHistoryEntry(actualHistoryEntry, expectedHistoryEntry, i);
  }
}

/**
 * Asserts single history entry.
 * @param actualHistoryEntry Actual history entry.
 * @param expectedHistoryEntry Expected history entry.
 * @param ix Index of history entry.
 */
function assertGameHistoryEntry(actualHistoryEntry: GameHistoryEntry, expectedHistoryEntry: GameHistoryEntry, ix: number) {
  expect(actualHistoryEntry.playerIx, `History entry [${ix}] playerIx should be same`).toEqual(expectedHistoryEntry.playerIx);
  expect(actualHistoryEntry.move, `History entry [${ix}] move should be same`).toEqual(expectedHistoryEntry.move);
  expect(actualHistoryEntry.cells, `History entry [${ix}] cells should be same`).toEqual(expectedHistoryEntry.cells);
}

function adjustExpectedGameState(actualGameState: GameState, expectedGameState: GameState) {
  // Player names are random, so we test them separately.
  expectedGameState.players[0].name = actualGameState.players[0].name;
  expectedGameState.players[1].name = actualGameState.players[1].name;
}
