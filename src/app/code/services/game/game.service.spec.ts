import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import type { GameHistoryEntry } from "@/code/data/gameState";
import { updateCellState } from "@/code/data/gameState";

import { assertGameState, genStartState } from '@/code/services/gameState/gameState.test-setup';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { GameService } from '@/code/services/game/game.service';

describe('GameService', () => {
  let gameStateService: GameStateService;
  let legalMoveService: LegalMoveService;
  let gameService: GameService;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.
    
    gameStateService = TestBed.inject(GameStateService);
    legalMoveService = TestBed.inject(LegalMoveService);
    gameService = TestBed.inject(GameService);
  });

  //

  describe('make move', () => {
    it('on starting board', () => {
      gameService.startGame();
      gameService.makeMove(2, 3);

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 59;
      expectedGameState.statistics.player1Score = 4;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.currPlayerIx = 1;
      updateCellState(expectedGameState.board.cells[2][3], EnCellState.B); // move that black just made
      updateCellState(expectedGameState.board.cells[3][3], EnCellState.B); // flipped white piece

      const historyEntry: GameHistoryEntry = {
        id: 0,
        playerIx: 0,
        move: {x:2, y:3},
        cells: structuredClone(expectedGameState.board.cells)
      };
      legalMoveService.clearPotentialMoves(historyEntry.cells);
      expectedGameState.board.history.moves.unshift(historyEntry);

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

      assertGameState(actualGameState, expectedGameState);
    });

    it('that flips many pieces', () => {
      gameService.startGame();
      // manually add pieces
      gameService.debugSetPiece(1, 3, EnCellState.W);
      gameService.debugSetPiece(2, 3, EnCellState.W); // board looks like this:
      gameService.debugSetPiece(3, 3, EnCellState.W); // ________
      gameService.debugSetPiece(4, 3, EnCellState.W); // _WWWWWWB
      gameService.debugSetPiece(5, 3, EnCellState.W); // ___BW___
      gameService.debugSetPiece(6, 3, EnCellState.W); // ________
      gameService.debugSetPiece(7, 3, EnCellState.B);

      gameService.makeMove(0, 3);

      const historyEntry: GameHistoryEntry = {
        id: 0,
        playerIx: 0,
        move: {x:0, y:3},
        cells: structuredClone(gameStateService.gameState().board.cells)
      };
      legalMoveService.clearPotentialMoves(historyEntry.cells);

      //

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 54;
      expectedGameState.statistics.player1Score = 9;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.currPlayerIx = 1;
      updateCellState(expectedGameState.board.cells[0][3], EnCellState.B);
      updateCellState(expectedGameState.board.cells[1][3], EnCellState.B);
      updateCellState(expectedGameState.board.cells[2][3], EnCellState.B);
      updateCellState(expectedGameState.board.cells[3][3], EnCellState.B);
      updateCellState(expectedGameState.board.cells[4][3], EnCellState.B);
      updateCellState(expectedGameState.board.cells[5][3], EnCellState.B);
      updateCellState(expectedGameState.board.cells[6][3], EnCellState.B);
      updateCellState(expectedGameState.board.cells[7][3], EnCellState.B);

      expectedGameState.board.history.moves.unshift(historyEntry);

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);
      assertGameState(actualGameState, expectedGameState);
    });

    it('unsuccessfully (invalid move)', () => {
      gameService.startGame();

      gameService.makeMove(1, 1); // invalid move, nothing should change

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      assertGameState(actualGameState, expectedGameState);
    });

    it('- unsuccessful pass', () => {
    // see app.logic.spec.ts for test on actual pass
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      expect(gameService.canPassMove(), 'Cannot pass.').toEqual(false);
      gameService.passMove(); // should not do anything

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(4);
      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('debug', () => {
    it('nothing happens', () => {
      gameService.startGame();
      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      assertGameState(actualGameState, expectedGameState);
    });

    it('set piece', () => {
      gameService.startGame();
      gameService.debugSetPiece(0, 0, EnCellState.B);

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      expectedGameState.statistics.emptyCells = 59;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 2;
      updateCellState(expectedGameState.board.cells[0][0], EnCellState.B);

      // This particular change does not affect available legal moves.
      //expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      //legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      assertGameState(actualGameState, expectedGameState);
    });

    it('unset piece', () => {
      gameService.startGame();
      gameService.debugSetPiece(3, 3, EnCellState.Empty); // white piece was here

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      expectedGameState.statistics.emptyCells = 61;
      expectedGameState.statistics.player1Score = 2;
      expectedGameState.statistics.player2Score = 1;
      updateCellState(expectedGameState.board.cells[3][3], EnCellState.Empty);

      // This particular change does affect available legal moves.
      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      assertGameState(actualGameState, expectedGameState);
    });

    it('swap piece Empty->Black', () => {
      gameService.startGame();
      gameService.debugSwapPiece(2, 3);

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      expectedGameState.statistics.emptyCells = 59;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 2;
      updateCellState(expectedGameState.board.cells[2][3], EnCellState.B);

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      assertGameState(actualGameState, expectedGameState);
    });

    it('swap piece Black->White', () => {
      gameService.startGame();
      gameService.debugSwapPiece(4, 3);

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      expectedGameState.statistics.emptyCells = 60;
      expectedGameState.statistics.player1Score = 1;
      expectedGameState.statistics.player2Score = 3;
      updateCellState(expectedGameState.board.cells[4][3], EnCellState.W);

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      assertGameState(actualGameState, expectedGameState);
    });

    it('swap piece White->Empty', () => {
      gameService.startGame();
      gameService.debugSwapPiece(4, 4);

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      expectedGameState.statistics.emptyCells = 61;
      expectedGameState.statistics.player1Score = 2;
      expectedGameState.statistics.player2Score = 1;
      updateCellState(expectedGameState.board.cells[4][4], EnCellState.Empty);

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      assertGameState(actualGameState, expectedGameState);
    });
  });
});
