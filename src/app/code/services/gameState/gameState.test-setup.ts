import { expect } from 'vitest';

import type { GameState, Cell, ReversiBoard, GameHistory, GameHistoryEntry } from "@/code/data/gameState";

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
  assertCells(actualBoard.cells, expectedBoard.cells, 'Board cells should be same');
  expect(actualBoard.legalMoves, 'Board legalMoves should be same').toEqual(expectedBoard.legalMoves);
  expect(actualBoard.doublePass, 'Board doublePass should be same').toEqual(expectedBoard.doublePass);
}

/**
 * Due to size of data in history, it is asserted entry by entry.
 * @param actualHistory Actual history.
 * @param expectedHistory Expected history.
 */
function assertGameHistory(actualHistory: GameHistory, expectedHistory: GameHistory) {
  expect(actualHistory.moves.length, 'Game history must have same size').toEqual(expectedHistory.moves.length);
  // We check history backwards, from initial state of board to last (chronologically) move.
  // Reminder that moves are stored in order from latest move to first move.
  for (let i=actualHistory.moves.length-1; i>=0; i--) {
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
  assertCells(actualHistoryEntry.cells, expectedHistoryEntry.cells, `History entry [${ix}] cells should be same`);
}

/**
 * Asserts cells.
 * @param actualCells Actual 2d array of cells.
 * @param expectedCells Expected 2d array of cells.
 */
function assertCells(actualCells: Cell[][], expectedCells: Cell[][], comment: string) {
  //expect(actualCells, `${comment}`).toEqual(expectedCells);
  expect(actualCells.length, `${comment}. Array should have same size`).toEqual(expectedCells.length);
  const size = actualCells.length;
  for (let x=0; x<size; x++) {
    for (let y=0; y<size; y++) {
      const actualCell = actualCells[x][y];
      const expectedCell = expectedCells[x][y];
      const subComment = `${comment}. Cell x=${x}, y=${y} differs`
      assertCell(actualCell, expectedCell, subComment);
    }
  }
}

/**
 * Asserts single cell.
 * @param actualCell Actual cell.
 * @param expectedCell Expected cell.
 */
function assertCell(actualCell: Cell, expectedCell: Cell, comment: string) {
  expect(actualCell, `${comment}`).toEqual(expectedCell);
}

function adjustExpectedGameState(actualGameState: GameState, expectedGameState: GameState) {
  // Player names are random, so we test them separately.
  expectedGameState.players[0].name = actualGameState.players[0].name;
  expectedGameState.players[1].name = actualGameState.players[1].name;
}
