import { TestBed } from '@angular/core/testing';

import { EnDifficulty, EnMode, EnPlayerType, EnCellState } from '@/code/data/enums';
import { aiProp, difficultyEasy } from '@/code/data/aiConst';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { AiService } from '@/code/services/ai/ai.service';

import { assertGameState, genStartState, addToHistory } from '@/code/services/gameState/gameState.test-setup';

/**
 * Important notes:
 * - In unit tests automatic call to AI is disabled. We call AI service manually.
 * - In unit tests we use RNG seed to make sure we get same result every time.
 */
describe('AiService', () => {
  let gameStateService: GameStateService;
  let gameService: GameService;
  let legalMoveService: LegalMoveService;
  let aiService: AiService;

  beforeEach(async () => {
    gameStateService = TestBed.inject(GameStateService);
    gameService = TestBed.inject(GameService);
    legalMoveService = TestBed.inject(LegalMoveService);
    aiService = TestBed.inject(AiService);

    // set up rng seed
    gameStateService.rng.seed = 333333;
    aiProp.wait = 0;
    aiProp.customDifficulty = null;
  });

  //

  describe('basic tests', () => {
    it('cannot first move', async () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsAi;
      gameStateService.menuSettings().whoFirst = EnPlayerType.Human;
      gameStateService.menuSettings().difficulty = EnDifficulty.Mindless;
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      // Current player is human, so AI should do nothing.
      const makeMoveSpy = vi.spyOn(aiService as any, 'makeMove'); // spy on aiService.makeMove()
      await aiService.maybeMakeMove();
      expect(makeMoveSpy).toBeCalledTimes(0);

      // Verify game state after this call.

      const expectedGameState = genStartState(4, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.settings.difficulty = EnDifficulty.Mindless;

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('can pick first move randomly', async () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsAi;
      gameStateService.menuSettings().whoFirst = EnPlayerType.AI;
      gameStateService.menuSettings().difficulty = EnDifficulty.Mindless; // use rng
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      // From 4 available legal moves, one will be picked randomly since we are on Mindless difficulty.
      const findMoveRandomSpy = vi.spyOn(aiService as any, 'findMoveRandom'); // spy on aiService.findMoveRandom()
      const findMoveMiniMaxSpy = vi.spyOn(aiService as any, 'findMoveMiniMax'); // spy on aiService.findMoveMiniMax()
      await aiService.maybeMakeMove();
      expect(findMoveRandomSpy).toBeCalledTimes(1);
      expect(findMoveMiniMaxSpy).toBeCalledTimes(0);

      // Verify game state after this call.
      const expectedGameState = genStartState(4, EnPlayerType.AI, EnMode.HumanVsAi);
      expectedGameState.settings.difficulty = EnDifficulty.Mindless;

      // Check game state.
      addToHistory(expectedGameState, 0, "b1 b2");
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 11;
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

    it('can pick first move using MiniMax', async () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsAi;
      gameStateService.menuSettings().whoFirst = EnPlayerType.AI;
      gameStateService.menuSettings().difficulty = EnDifficulty.Easy; // use MiniMax
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      // From 4 available legal moves, one will be picked randomly since we are on Mindless difficulty.
      const findMoveRandomSpy = vi.spyOn(aiService as any, 'findMoveRandom'); // spy on aiService.findMoveRandom()
      const findMoveMiniMaxSpy = vi.spyOn(aiService as any, 'findMoveMiniMax'); // spy on aiService.findMoveMiniMax()
      await aiService.maybeMakeMove();
      expect(findMoveRandomSpy).toBeCalledTimes(0);
      expect(findMoveMiniMaxSpy).toBeCalledTimes(1);

      // Verify game state after this call.
      const expectedGameState = genStartState(4, EnPlayerType.AI, EnMode.HumanVsAi);
      expectedGameState.settings.difficulty = EnDifficulty.Easy;

      // Check game state.
      addToHistory(expectedGameState, 0, "b1 b2");
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 11;
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

    it('only one legal move', async () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsAi;
      gameStateService.menuSettings().whoFirst = EnPlayerType.AI;
      gameStateService.menuSettings().difficulty = EnDifficulty.Mindless;
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      gameService.makeMove(0, 1); // a2
      gameService.makeMove(0, 0); // a1
      gameService.makeMove(2, 3); // c4
      gameService.makeMove(0, 2); // a3

      // There is only one legal move available for black.
      const findMoveRandomSpy = vi.spyOn(aiService as any, 'findMoveRandom'); // spy on aiService.findMoveRandom()
      const findMoveMiniMaxSpy = vi.spyOn(aiService as any, 'findMoveMiniMax'); // spy on aiService.findMoveMiniMax()
      await aiService.maybeMakeMove();
      expect(findMoveRandomSpy).toBeCalledTimes(0); // will NOT call these, as code immediately returns single available move
      expect(findMoveMiniMaxSpy).toBeCalledTimes(0);

      // Verify game state after this call.
      const expectedGameState = genStartState(4, EnPlayerType.AI, EnMode.HumanVsAi);
      expectedGameState.settings.difficulty = EnDifficulty.Mindless;

      // Check game state.
      addToHistory(expectedGameState, 0, "a2 b2");
      addToHistory(expectedGameState, 1, "a1 b2");
      addToHistory(expectedGameState, 0, "c4 c3");
      addToHistory(expectedGameState, 1, "a3 a2");
      addToHistory(expectedGameState, 0, "b1 b2"); // AI move
      expectedGameState.statistics.moveCount = 5;
      expectedGameState.statistics.emptyCells = 7;
      expectedGameState.statistics.player1Score = 6;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('MiniMax', () => {
    it('two legal move with different score', async () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsAi;
      gameStateService.menuSettings().whoFirst = EnPlayerType.Human;
      gameStateService.menuSettings().difficulty = EnDifficulty.Easy; // use minimax
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      gameService.makeMove(2, 3); // c4
      gameService.makeMove(1, 3); // b4
      gameService.makeMove(0, 2); // a3

      // There are two legal move available for white: d2 and d4.
      // They have different weights, so AI will always pick d4. No randomness here.
      await aiService.maybeMakeMove();

      // Verify game state after this call.
      const expectedGameState = genStartState(4, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.settings.difficulty = EnDifficulty.Easy;

      // Check game state.
      addToHistory(expectedGameState, 0, "c4 c3");
      addToHistory(expectedGameState, 1, "b4 b3");
      addToHistory(expectedGameState, 0, "a3 b3");
      addToHistory(expectedGameState, 1, "d4 c3 c4"); // AI move
      expectedGameState.statistics.moveCount = 4;
      expectedGameState.statistics.emptyCells = 8;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 5;
      expectedGameState.board.currPlayerIx = 0;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('four legal moves, two of them equally best', async () => {
      aiProp.customDifficulty = { ...difficultyEasy, maxDepth: 1 };

      gameStateService.menuSettings().mode = EnMode.HumanVsAi;
      gameStateService.menuSettings().whoFirst = EnPlayerType.AI;
      gameStateService.menuSettings().difficulty = EnDifficulty.Easy; // use minimax
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      gameService.makeMove(0, 1); // a2
      gameService.makeMove(2, 0); // c1

      // There are four legal move available for black: d1, d2, d3 and d4.
      // From these moves we have d1 and d4 as equally best moves.
      // AI will pick randomly one of them, because they have same top score.
      await aiService.maybeMakeMove();

      // Verify game state after this call.
      const expectedGameState = genStartState(4, EnPlayerType.AI, EnMode.HumanVsAi);
      expectedGameState.settings.difficulty = EnDifficulty.Easy;

      // Check game state.
      addToHistory(expectedGameState, 0, "a2 b2");
      addToHistory(expectedGameState, 1, "c1 c2");
      addToHistory(expectedGameState, 0, "d4 c3"); // AI move
      expectedGameState.statistics.moveCount = 3;
      expectedGameState.statistics.emptyCells = 9;
      expectedGameState.statistics.player1Score = 5;
      expectedGameState.statistics.player2Score = 2;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('no legal moves, must pass', async () => {
      gameStateService.menuSettings().mode = EnMode.AiVsAi;
      gameStateService.menuSettings().whoFirst = EnPlayerType.Human;
      gameStateService.menuSettings().difficulty = EnDifficulty.Easy; // use minimax
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      gameService.makeMove(1, 0); // b1
      gameService.makeMove(2, 0); // c1
      gameService.makeMove(3, 2); // d3
      gameService.makeMove(0, 0); // a1

      // There are no legal moves available for black. AI passes.
      await aiService.maybeMakeMove();

      // Verify game state after this call.
      const expectedGameState = genStartState(4, EnPlayerType.Human, EnMode.AiVsAi);
      expectedGameState.settings.difficulty = EnDifficulty.Easy;

      // Check game state.
      addToHistory(expectedGameState, 0, "b1 b2");
      addToHistory(expectedGameState, 1, "c1 c2");
      addToHistory(expectedGameState, 0, "d3 c2 c3");
      addToHistory(expectedGameState, 1, "a1 b1");
      addToHistory(expectedGameState, 0, ""); // AI move: pass
      expectedGameState.statistics.moveCount = 5;
      expectedGameState.statistics.emptyCells = 8; // with normal move it would be 7
      expectedGameState.statistics.player1Score = 5;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });
});
