import { expect } from 'vitest';

import { EnGameStatus, EnCellState, EnMode, EnPlayerType } from '@/code/data/enums';
import { weights } from '@/code/data/aiConst';
import type { Coordinate } from "@/code/data/types";
import type { GameState, Cell, ReversiBoard, GameHistory, GameHistoryEntry } from "@/code/data/gameState";
import { createGameState, createCell, updateCellState, updateCellFull, createGameHistoryEntry, createReversiMove } from "@/code/data/gameState";

/**
 * Generate game state after start of game, but with empty board.
 * @param boardSize Size of board.
 */
export function genEmptyState(boardSize: number): GameState {
  const startGameState = genState(boardSize);
  genDataFromBoard(startGameState);
  return startGameState;
}

/**
 * Generate game state after start of game. Four pieces in center of board are already placed.
 * @param boardSize Size of board.
 */
export function genStartState(boardSize: number, whoFirst: EnPlayerType=EnPlayerType.Human, mode: EnMode=EnMode.HumanVsHuman): GameState {
  const startGameState = genState(boardSize);

  const ix = boardSize/2 - 1; // for size 8 it will be 3
  // add pieces already on board in center
  updateCellState(startGameState.board.cells[ix][ix], EnCellState.W);
  updateCellState(startGameState.board.cells[ix+1][ix], EnCellState.B);
  updateCellState(startGameState.board.cells[ix][ix+1], EnCellState.B);
  updateCellState(startGameState.board.cells[ix+1][ix+1], EnCellState.W);

  // set potential legal moves
  updateCellFull(startGameState.board.cells[ix-1][ix], EnCellState.Empty, EnCellState.B);
  updateCellFull(startGameState.board.cells[ix][ix-1], EnCellState.Empty, EnCellState.B);
  updateCellFull(startGameState.board.cells[ix+1][ix+2], EnCellState.Empty, EnCellState.B);
  updateCellFull(startGameState.board.cells[ix+2][ix+1], EnCellState.Empty, EnCellState.B);

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
  startGameState.settings.whoFirst = whoFirst;
  setupMode(startGameState, mode);
  return startGameState;
}

function setupMode(gameState: GameState, mode: EnMode) {
  gameState.settings.mode = mode;
  switch (mode) {
    case EnMode.HumanVsHuman:
      gameState.players[0].type = EnPlayerType.Human;
      gameState.players[1].type = EnPlayerType.Human;
      break;
    case EnMode.HumanVsAi:
      if (gameState.settings.whoFirst === EnPlayerType.Human) {
        gameState.players[0].type = EnPlayerType.Human;
        gameState.players[1].type = EnPlayerType.AI;
      } else {
        gameState.players[0].type = EnPlayerType.AI;
        gameState.players[1].type = EnPlayerType.Human;
      }
      break;
    case EnMode.AiVsAi:
      gameState.players[0].type = EnPlayerType.AI;
      gameState.players[1].type = EnPlayerType.AI;
      break;
  }
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
  startGameState.board.cells = genCells(boardSize); // generate empty board
  return startGameState;
}

/**
 * Generate cells for board. Every cell is empty.
 * @param boardSize Size of board.
 * @returns 2D array of cells.
 */
function genCells(boardSize: number): Cell[][] {
  const currentWeights = weights[boardSize];

  const cells : Cell[][] = Array.from({ length: boardSize }, (_, x) =>
    Array.from({ length: boardSize }, (_, y) => {
      // Lookup the predefined weight, falling back to 0 if the size isn't mapped.
      const weight = currentWeights ? currentWeights[x][y] : 0;
      return createCell(weight);
    })
  );
  return cells;
}

/**
 * Call it after modifications to board.
 * @param gameState Generated game state.
 */
function genDataFromBoard(gameState: GameState) {
  gameState.statistics.round = 1;

  // Should have first entry (initial board state) already in history.
  const historyEntry = createGameHistoryEntry();
  historyEntry.cells = structuredClone(gameState.board.cells);
  clearPotentialMoves(gameState, historyEntry.cells);
  gameState.board.history.moves.push(historyEntry);

  // Game view should be set.
  gameState.view.cells = gameState.board.cells;
}

function clearPotentialMoves(startGameState: GameState, cells: Cell[][])  {
  const boardSize = startGameState.settings.boardSize;
  for (let x=0; x<boardSize; x++) {
    for (let y=0; y<boardSize; y++) {
      cells[x][y].potentialMove = EnCellState.Empty;
    }
  }
}

// ////////////////////////////////////////////////////////////////////////////
// BOARD EDITING

/**
 * Set cells on board for given player.
 * @param gameState Game state.
 * @param piece Piece.
 * @param coords Array of coordinates to set.
 */
export function setCells(gameState: GameState, piece: EnCellState, coords:Coordinate[]) {
  const cells = gameState.board.cells;
  for (const coord of coords) {
    cells[coord.x][coord.y].state = piece;
  }
}

/**
 * Set cells on board for given player based on boardStr that contains human-readable
 * state of board.
 * @param gameState Game state.
 * @param piece Piece.
 * @param boardStr Board as string. B is black, W is white, _ is empty cell.
 * @param recalcLegalMoves If true, recalculate legal moves.
 */
export function setBoard(gameState: GameState, boardStr:string) {
  const boardSize = gameState.settings.boardSize;
  const cells = gameState.board.cells;
  let ix = 0;
  while (ix < boardStr.length) {
    const char = boardStr[ix];

    if (char === 'B' || char === 'W') {
      const y = Math.floor(ix/boardSize);
      const x = ix - y*boardSize;
      cells[x][y].state = char === 'B' ? EnCellState.B : EnCellState.W;
    }

    ix++;
  }
}

// ////////////////////////////////////////////////////////////////////////////
// HELPERS

/**
 * Convert moves as string to moves as array of coordinates.
 * String contains move sequence using standard grid coordinates
 * (columns are a, b, c... and rows are 1, 2, 3...).
 * Example of movesStr: "d5 e3 a1".
 * Expected result: [{3, 4}, {4, 2}, {0, 0}]
 *
 * @param moves String containing moves in standard grid coordinates.
 * @returns Moves as array of coordinates (zero-based).
 */
function movesStrToMovesCoord(movesStr: string): {x:number, y: number}[] {
  if (!movesStr || movesStr === '') return [];

  const base = 'a'.charCodeAt(0);
  return movesStr.split(' ').map(move => {
    const x = move.charCodeAt(0) - base;
    const y = parseInt(move.substring(1)) - 1;
    return { x, y };
  });
}

  /**
   * Add move to history entry. Note it also affects main board.
   * @param playerIx Player index.
   * @param movesAny First entry is actual move, others are flipped pieces. Empty string/array means no change to board (pass).
   * @returns Moves as array of coordinates.
   */
  export function addToHistory(gameState: GameState, playerIx: number, movesAny: {x:number, y: number}[]|string): {x:number, y: number}[] {
    let moves: {x:number, y: number}[] = [];
    if (typeof movesAny === 'string') {
      moves = movesStrToMovesCoord(movesAny);
    }

    if (moves.length > 0) {
      const piece = playerIx === 0 ? EnCellState.B: EnCellState.W;
      for (let i=0; i<moves.length; i++) {
        const move = moves[i];
        gameState.board.cells[move.x][move.y].state = piece;
      }
    }

    // actually add to history
    const nextNo = gameState.board.history.moves.length;
    const historyEntry: GameHistoryEntry = {
      ix: 0,
      num: nextNo,
      playerIx: playerIx,
      move: moves.length === 0 ? null : {x:moves[0].x, y:moves[0].y},
      cells: structuredClone(gameState.board.cells)
    };
    clearPotentialMoves(gameState, historyEntry.cells);
    // ensure latest history entry is first on list
    gameState.board.history.moves.unshift(historyEntry);
    // update rest of history to reflect correct index
    for (let ix=0; ix<nextNo+1; ix++) {
      gameState.board.history.moves[ix].ix = ix;
    }

    return moves;
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
  expect(actualBoard.cells, 'Board cells should be same').toEqual(expectedBoard.cells);
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
