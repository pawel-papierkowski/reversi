import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';

import { EnDifficulty, EnGameStatus, EnMode, EnPlayerType } from '@/code/data/enums';
import { aiProp } from '@/code/data/aiConst';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { DebugService } from '@/code/services/debug/debug.service';

import { setupTestBedTranslate, startGame, clickOnCell, clickOnPass, assertPassButton, assertDomBoard, waitForAi } from './app.test-setup';
import { selectComboboxOption } from '@/components/basic/comboBox/_tests/comboBox.test-setup';
import { assertGameState } from '@/code/services/gameState/gameState.test-setup';

import { App } from '../app';

describe('App (AI)', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let gameStateService: GameStateService;
  let debugService: DebugService;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.

    fixture = await setupTestBedTranslate([]);
    router = TestBed.inject(Router);
    gameStateService = TestBed.inject(GameStateService);
    debugService = TestBed.inject(DebugService);

    // set up all needed properties
    gameStateService.rng.seed = 333333; // for consistency
    aiProp.wait = 0;

    // Trigger initial navigation to load the '' (MainMenu) route.
    router.initialNavigation();
    await fixture.whenStable(); // ensure everything is fully loaded on page before continuing
    fixture.detectChanges();
  });

  // //////////////////////////////////////////////////////////////////////////
  // AI trigger logic.

  describe('triggering AI', () => {
    it('when AI starts first', async () => {
      // AI will be triggered straight after start of game, as it starts first.
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 1); // Human vs AI
      selectComboboxOption(fixture, 'cb-mainMenu-whoFirst', 1); // AI is first.
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // Board is 4x4.
      await startGame(fixture);
      await waitForAi(fixture, gameStateService.gameState(), 1);

      const boardStr = "wBw_"+ // Expected board state.
                       "_BB_"+
                       "wBW_"+
                       "____";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state.
      const expectedGameState = debugService.genStartState(4, EnPlayerType.AI, EnMode.HumanVsAi);

      debugService.addToHistory(expectedGameState, 0, "b1 b2"); // AI move

      expectedGameState.statistics.aiTrigger = 1;
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 11;
      expectedGameState.statistics.player1Score = 4;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.currPlayerIx = 1;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('when AI starts second', async () => {
      const expectedGameState = debugService.genStartState(4, EnPlayerType.Human, EnMode.HumanVsAi);
      // AI will be triggered after first move, as it starts second.
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 1); // Human vs AI
      selectComboboxOption(fixture, 'cb-mainMenu-whoFirst', 0); // Human is first.
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // Board is 4x4.
      await startGame(fixture);

      // Human makes move.
      await clickOnCell(debugService, fixture, expectedGameState, 0, "b1 b2"); // black b1

      await waitForAi(fixture, gameStateService.gameState(), 1);

      const boardStr = "_B__"+ // Expected board state.
                       "_BB_"+
                       "WWW_"+
                       "bbbb";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      debugService.addToHistory(expectedGameState, 1, "a3 b3"); // AI move

      // Check game state.
      expectedGameState.statistics.aiTrigger = 1;
      expectedGameState.statistics.moveCount = 2;
      expectedGameState.statistics.emptyCells = 10;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.board.currPlayerIx = 0;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('when AI vs AI', async () => {
      // AI will be triggered straight after start of game, as it starts first.
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 2); // AI vs AI
      selectComboboxOption(fixture, 'cb-mainMenu-whoFirst', 0); // Human is first, not that it matters here.
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // Board is 4x4.
      await startGame(fixture);
      // AI plays entire round!
      await waitForAi(fixture, gameStateService.gameState(), 13);

      const boardStr = "WWWB"+ // Expected board state.
                       "WWWB"+
                       "WBBB"+
                       "BBBB";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state.
      const expectedGameState = debugService.genStartState(4, EnPlayerType.Human, EnMode.AiVsAi);

      debugService.addToHistory(expectedGameState, 0, "b1 b2");
      debugService.addToHistory(expectedGameState, 1, "a1 b2");
      debugService.addToHistory(expectedGameState, 0, "a2 b2");
      debugService.addToHistory(expectedGameState, 1, "a3 a2 b3");
      debugService.addToHistory(expectedGameState, 0, "d4 c3");
      debugService.addToHistory(expectedGameState, 1, "c1 b1 b2");
      debugService.addToHistory(expectedGameState, 0, "a4 b3");
      debugService.addToHistory(expectedGameState, 1, "c4 c2 c3 b3");
      debugService.addToHistory(expectedGameState, 0, "b4 c4");
      debugService.addToHistory(expectedGameState, 1, "");
      debugService.addToHistory(expectedGameState, 0, "d1 c2 b3");
      debugService.addToHistory(expectedGameState, 1, "d3 c2");

      debugService.addToHistory(expectedGameState, 0, "d2 c3 d3");

      expectedGameState.statistics.aiTrigger = 13;
      expectedGameState.statistics.moveCount = 13;
      expectedGameState.statistics.emptyCells = 0;
      expectedGameState.statistics.player1Score = 9;
      expectedGameState.statistics.player1Win = 1;
      expectedGameState.statistics.player1WinInRow = 1;
      expectedGameState.statistics.player2Score = 7;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.status = EnGameStatus.PlayerWon;
      expectedGameState.board.doublePass = true;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });
});
