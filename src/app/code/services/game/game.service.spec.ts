import { TestBed } from '@angular/core/testing';

import { EnMode, EnScoringType } from '@/code/data/enums';
import { aiProp } from '@/code/data/aiConst';

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
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('that flips many pieces', () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsHuman;
      gameService.startGame();
      const boardStr = "________"+
                       "________"+
                       "________"+
                       "_WWWWWWB"+ // b4 - h4
                       "___BW___"+ // d5, e5
                       "________"+
                       "________"+
                       "________";
      debugService.setBoard(gameStateService.gameState(), boardStr, true);
      const expectedGameState = structuredClone(gameStateService.gameState());
      gameService.makeMove(0, 3);

      debugService.addToHistory(expectedGameState, 0, "a4 b4 c4 d4 e4 f4 g4 h4");

      // Check game state.
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 54;
      expectedGameState.statistics.player1Score = 9;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.frontier = [
        {x:0,y:2},{x:0,y:3},{x:0,y:4}, //{x:0,y:2},{x:0,y:4},
        {x:1,y:2},{x:1,y:4},{x:2,y:2},{x:2,y:4},{x:2,y:5},
        {x:3,y:2},{x:3,y:5},{x:4,y:2},{x:4,y:5},{x:5,y:2},{x:5,y:4},{x:5,y:5},
        {x:6,y:2},{x:6,y:4},{x:7,y:2},{x:7,y:4},
      ];
      debugService.fillGameState(expectedGameState);

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

    it('that affects weights', () => {
      aiProp.customDifficulty = { canMiniMax: true, maxDepth: 9, dynamicWeights: true,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}] };
      gameStateService.menuSettings().mode = EnMode.HumanVsHuman;
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();
      gameService.makeMove(3, 2); // d3
      gameService.makeMove(3, 3); // d4, this move changes weights

      const expectedGameState = debugService.genStartState(4);
      debugService.addToHistory(expectedGameState, 0, "d3 c3");
      debugService.addToHistory(expectedGameState, 1, "d4 c3", [{x:2, y:3, w:30}, {x:3, y:2, w:30}, {x:2, y:2, w:30}]);

      // Check game state.
      expectedGameState.statistics.moveCount = 2;
      expectedGameState.statistics.emptyCells = 10;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 3;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });
});
