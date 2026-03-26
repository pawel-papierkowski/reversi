import { TestBed } from '@angular/core/testing';

import { EnCellState, EnMode } from '@/code/data/enums';

import { assertGameState } from '@/code/services/gameState/gameState.test-setup';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { GameService } from '@/code/services/game/game.service';
import { DebugService } from '@/code/services/debug/debug.service';

describe('GameService', () => {
  let gameStateService: GameStateService;
  let legalMoveService: LegalMoveService;
  let gameService: GameService;
  let debugService: DebugService;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.

    gameStateService = TestBed.inject(GameStateService);
    legalMoveService = TestBed.inject(LegalMoveService);
    gameService = TestBed.inject(GameService);
    debugService = TestBed.inject(DebugService);
  });

  //

  describe('make move', () => {
    it('on starting board', () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsHuman;
      gameService.startGame();
      gameService.makeMove(2, 3);

      const expectedGameState = debugService.genStartState(8);
      debugService.addToHistory(expectedGameState, 0, "c4 d4");

      // Check game state.
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 59;
      expectedGameState.statistics.player1Score = 4;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('that flips many pieces', () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsHuman;
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "________"+
                       "________"+
                       "________"+
                       "_WWWWWWB"+
                       "___BW___"+
                       "________"+
                       "________"+
                       "________";
      debugService.setBoard(gameState, boardStr, true);

      gameService.makeMove(0, 3);

      //

      const expectedGameState = debugService.genStartState(8);
      debugService.addToHistory(expectedGameState, 0, "a4 b4 c4 d4 e4 f4 g4 h4");

      // Check game state.
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 54;
      expectedGameState.statistics.player1Score = 9;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.currPlayerIx = 1;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('unsuccessfully (invalid move)', () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsHuman;
      gameService.startGame();

      gameService.makeMove(1, 1); // invalid move, nothing should change

      const actualGameState = gameStateService.gameState();
      const expectedGameState = debugService.genStartState(8);
      assertGameState(actualGameState, expectedGameState);
    });

    it('- unsuccessful pass', () => {
      // see app.logic.spec.ts for successful pass tests
      gameStateService.menuSettings().mode = EnMode.HumanVsHuman;
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      expect(gameService.canPassMove(), 'Cannot pass.').toEqual(false);
      gameService.passMove(); // should not do anything

      const actualGameState = gameStateService.gameState();
      const expectedGameState = debugService.genStartState(4);
      assertGameState(actualGameState, expectedGameState);
    });
  });
});
