import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';

import { EnDifficulty, EnGameStatus, EnMode, EnPlayerType } from '@/code/data/enums';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { DebugService } from '@/code/services/debug/debug.service';

import { setupTestBedTranslate, startGame, clickOnCell, clickOnPass, assertPassButton, assertDomBoard } from './app.test-setup';
import { selectComboboxOption } from '@/components/basic/comboBox/_tests/comboBox.test-setup';
import { assertGameState } from '@/code/services/gameState/gameState.test-setup';

import { App } from '../app';

describe('App (logic)', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let gameStateService: GameStateService;
  let legalMoveService: LegalMoveService;
  let debugService: DebugService;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.

    fixture = await setupTestBedTranslate([]);
    router = TestBed.inject(Router);
    gameStateService = TestBed.inject(GameStateService);
    legalMoveService = TestBed.inject(LegalMoveService);
    debugService = TestBed.inject(DebugService);

    // Disable AI trigger.
    gameStateService.gameState().debugSettings.disableAutoAi = true;

    // Trigger initial navigation to load the '' (MainMenu) route.
    router.initialNavigation();
    await fixture.whenStable(); // ensure everything is fully loaded on page before continuing
    fixture.detectChanges();
  });

  // //////////////////////////////////////////////////////////////////////////
  // Game logic.

  describe('should have correct game state when game starts', () => {
    it('with default settings', async () => {
      await startGame(fixture);

      const boardStr = "________"+ // Expected board state.
                       "________"+
                       "________"+
                       "___WB___"+
                       "___BW___"+
                       "________"+
                       "________"+
                       "________";
      assertDomBoard(fixture, boardStr); // Check state of board in browser.

      // Check game state.
      const actualGameState = gameStateService.gameState();
      const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.debugSettings.disableAutoAi = true;
      assertGameState(actualGameState, expectedGameState);
    });

    it('with changed settings', async () => {
      // AI is not triggered, this is intentional. We test trigger separately.
      // Set AI as first and set 4x4 board.
      selectComboboxOption(fixture, 'cb-mainMenu-whoFirst', 1);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0);
      await startGame(fixture);

      const boardStr = "_b__"+ // Expected board state.
                       "bWB_"+
                       "_BWb"+
                       "__b_";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state.
      const actualGameState = gameStateService.gameState();
      const expectedGameState = debugService.genStartState(4, EnPlayerType.AI, EnMode.HumanVsAi);
      expectedGameState.debugSettings.disableAutoAi = true;
      assertGameState(actualGameState, expectedGameState);
    });

    it('with HumanVsHuman', async () => {
      // Change mode to Human vs Human and try to set AI as first.
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0); // Human vs Human will disable whoFirst
      selectComboboxOption(fixture, 'cb-mainMenu-whoFirst', 1); // Combobox is disabled.
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0);
      await startGame(fixture);

      const boardStr = "_b__"+ // Expected board state.
                       "bWB_"+
                       "_BWb"+
                       "__b_";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state.
      const actualGameState = gameStateService.gameState();
      const expectedGameState = debugService.genStartState(4, EnPlayerType.Human, EnMode.HumanVsHuman);
      expectedGameState.debugSettings.disableAutoAi = true;
      assertGameState(actualGameState, expectedGameState);
    });

    it('in AI vs AI mode', async () => {
      // AI is not triggered, this is intentional. We test trigger separately.
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 2); // AI vs AI
      selectComboboxOption(fixture, 'cb-mainMenu-difficulty', 3); // hard difficulty
      await startGame(fixture);

      const boardStr = "________"+ // Expected board state.
                       "________"+
                       "________"+
                       "___WB___"+
                       "___BW___"+
                       "________"+
                       "________"+
                       "________";
      assertDomBoard(fixture, boardStr); // Check state of board in browser.

      // Check game state.
      const actualGameState = gameStateService.gameState();
      const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.AiVsAi);
      expectedGameState.settings.difficulty = EnDifficulty.Hard;
      expectedGameState.debugSettings.disableAutoAi = true;
      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('clicking', () => {
    it('on invalid cell should not change anything', async () => {
      // board 4x4, moves: b2
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);

      // Find correct cell and click it. Note this cell is not on list of legal moves.
      const cell = fixture.nativeElement.querySelector('[data-testid="cell-2x2"]') as HTMLButtonElement;
      cell.click();
      await fixture.whenStable();

      const boardStr = "____"+ // Expected board state.
                       "_WB_"+
                       "_BW_"+
                       "____";
      assertDomBoard(fixture, boardStr); // Check state of board in browser.

      // Check game state. Nothing should change.
      const actualGameState = gameStateService.gameState();
      const expectedGameState = debugService.genStartState(4);
      expectedGameState.debugSettings.disableAutoAi = true;
      assertGameState(actualGameState, expectedGameState);
    });

    it('on valid cell should add piece and flip piece', async () => {
      // board 6x6, moves: e4
      const expectedGameState = debugService.genStartState(6);
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 1); // 6x6
      await startGame(fixture);

      await clickOnCell(debugService, fixture, expectedGameState, 0, "e4 d4"); // black e4

      const boardStr = "______"+ // Expected board state.
                       "______"+
                       "__WBw_"+
                       "__BBB_"+
                       "__w_w_"+
                       "______";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state.
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 31;
      expectedGameState.statistics.player1Score = 4;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.debugSettings.disableAutoAi = true;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('on two valid cells should add and flip pieces for both players', async () => {
      const expectedGameState = debugService.genStartState(4);
      // board 4x4, moves: b1 a3
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);

      await clickOnCell(debugService, fixture, expectedGameState, 0, "b1 b2"); // black b1
      await clickOnCell(debugService, fixture, expectedGameState, 1, "a3 b3"); // white a3

      const boardStr = "_B__"+ // Expected board state.
                       "_BB_"+
                       "WWW_"+
                       "bbbb";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state.
      expectedGameState.statistics.moveCount = 2;
      expectedGameState.statistics.emptyCells = 10;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.debugSettings.disableAutoAi = true;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('special situation when', () => {
    it('one of players cannot make legal move and has to pass move', async () => {
      const expectedGameState = debugService.genStartState(4);
      // board 4x4, moves: b1 c1 d3 a1 pass
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCell(debugService, fixture, expectedGameState, 0, "b1 b2"); // black b1
      assertPassButton(fixture, false, 'after b1');
      await clickOnCell(debugService, fixture, expectedGameState, 1, "c1 c2"); // white c1
      assertPassButton(fixture, false, 'after c1');
      await clickOnCell(debugService, fixture, expectedGameState, 0, "d3 c2 c3"); // black d3
      assertPassButton(fixture, false, 'after d3');
      await clickOnCell(debugService, fixture, expectedGameState, 1, "a1 b1"); // white a1
      assertPassButton(fixture, true, 'after a1');

      const boardPassStr = "WWW_"+ // Expected board state.
                           "_BB_"+ // Black has no legal moves available.
                           "_BBB"+
                           "____";
      assertDomBoard(fixture, boardPassStr, true); // Check state of board in browser.

      await clickOnPass(debugService, fixture, expectedGameState, 0); // black pass

      const boardStr = "WWW_"+ // Expected board state.
                       "_BB_"+ // After pass, whites now have some legal moves available.
                       "wBBB"+
                       "_www";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state after 4 moves and pass.
      expectedGameState.statistics.moveCount = 5; // would be 4 without pass
      expectedGameState.statistics.emptyCells = 8;
      expectedGameState.statistics.player1Score = 5;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.board.currPlayerIx = 1; // would be 0 without pass
      expectedGameState.debugSettings.disableAutoAi = true;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('end game detection when', () => {
    it('board is filled completely', async () => {
      const expectedGameState = debugService.genStartState(4);
      // board 4x4, moves: b1 a1 a2 c1 d1 a3 a4 d2 d3 b4 c4 d4
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCell(debugService, fixture, expectedGameState, 0, "b1 b2"); // black b1
      await clickOnCell(debugService, fixture, expectedGameState, 1, "a1 b2"); // white a1
      await clickOnCell(debugService, fixture, expectedGameState, 0, "a2 b2"); // black a2
      await clickOnCell(debugService, fixture, expectedGameState, 1, "c1 b1 c2"); // white c1
      await clickOnCell(debugService, fixture, expectedGameState, 0, "d1 c2"); // black d1
      await clickOnCell(debugService, fixture, expectedGameState, 1, "a3 a2 b2 b3"); // white a3
      await clickOnCell(debugService, fixture, expectedGameState, 0, "a4 b3"); // black a4
      await clickOnCell(debugService, fixture, expectedGameState, 1, "d2 c2"); // white d2
      await clickOnCell(debugService, fixture, expectedGameState, 0, "d3 d2 c3"); // black d3
      await clickOnCell(debugService, fixture, expectedGameState, 1, "b4 b3"); // white b4
      await clickOnCell(debugService, fixture, expectedGameState, 0, "c4 b4"); // black c4
      await clickOnCell(debugService, fixture, expectedGameState, 1, "d4 c3"); // white d4

      const boardStr = "WWWB"+ // Expected board state.
                       "WWWB"+
                       "WWWB"+
                       "BBBW";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state at end of game.
      expectedGameState.statistics.moveCount = 12;
      expectedGameState.statistics.emptyCells = 0;
      expectedGameState.statistics.player1Score = 6;
      expectedGameState.statistics.player2Score = 10;
      expectedGameState.statistics.player2Win = 1;
      expectedGameState.statistics.player2WinInRow = 1;
      expectedGameState.board.status = EnGameStatus.PlayerWon;
      expectedGameState.board.doublePass = true;
      expectedGameState.debugSettings.disableAutoAi = true;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);

      // Now we start next round. Next round button should be present.
      const nextRoundButton = fixture.nativeElement.querySelector('[data-testid="btn-nextRound"]') as HTMLButtonElement;
      expect(nextRoundButton, 'Next round button must exist').not.toBeNullable();
      nextRoundButton.click();
      await fixture.whenStable();

      const boardNewStr = "_b__"+ // Expected board state.
                          "bWB_"+
                          "_BWb"+
                          "__b_";
      assertDomBoard(fixture, boardNewStr, true); // Check state of board in browser.

      // Ensure state of game is correct after starting next round.
      const actualGameStateNewRound = gameStateService.gameState();
      const expectedGameStateNewRound = debugService.genStartState(4);
      expectedGameStateNewRound.statistics.round = 2;
      expectedGameStateNewRound.statistics.player2Win = 1;
      expectedGameStateNewRound.statistics.player2WinInRow = 1;
      expectedGameStateNewRound.debugSettings.disableAutoAi = true;
      assertGameState(actualGameStateNewRound, expectedGameStateNewRound);
    });

    it('draw happens', async () => {
      const expectedGameState = debugService.genStartState(4);
      // board 4x4, moves: c4 d4 d3 b4 a4 d2 b1 a3 d1 a2 a1 pass c1
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCell(debugService, fixture, expectedGameState, 0, "c4 c3"); // black c4
      await clickOnCell(debugService, fixture, expectedGameState, 1, "d4 c3"); // white d4
      await clickOnCell(debugService, fixture, expectedGameState, 0, "d3 c3"); // black d3
      await clickOnCell(debugService, fixture, expectedGameState, 1, "b4 b3 c4"); // white b4
      await clickOnCell(debugService, fixture, expectedGameState, 0, "a4 b3"); // black a4
      await clickOnCell(debugService, fixture, expectedGameState, 1, "d2 c2 c3 d3"); // white d2
      await clickOnCell(debugService, fixture, expectedGameState, 0, "b1 b2"); // black b1
      await clickOnCell(debugService, fixture, expectedGameState, 1, "a3 b3"); // white a3
      await clickOnCell(debugService, fixture, expectedGameState, 0, "d1 c2 b3"); // black d1
      await clickOnCell(debugService, fixture, expectedGameState, 1, "a2 b2 c2 b3"); // white a2
      await clickOnCell(debugService, fixture, expectedGameState, 0, "a1 a2 a3"); // black a1
      await clickOnPass(debugService, fixture, expectedGameState, 1); // white pass
      await clickOnCell(debugService, fixture, expectedGameState, 0, "c1 b2"); // black c1
      assertPassButton(fixture, false, 'after board fill');

      const boardStr = "BBBB"+ // Expected board state.
                       "BBWW"+
                       "BWWW"+
                       "BWWW";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state at end of game.
      expectedGameState.statistics.moveCount = 13;
      expectedGameState.statistics.emptyCells = 0;
      expectedGameState.statistics.player1Score = 8;
      expectedGameState.statistics.player2Score = 8;
      expectedGameState.statistics.ties = 1;
      expectedGameState.statistics.tiesInRow = 1;
      expectedGameState.board.status = EnGameStatus.Tie;
      expectedGameState.board.doublePass = true;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.debugSettings.disableAutoAi = true;
      debugService.fillGameState(expectedGameState);

      // Now we start next round. Next round button should be present.
      const nextRoundButton = fixture.nativeElement.querySelector('[data-testid="btn-nextRound"]') as HTMLButtonElement;
      expect(nextRoundButton, 'Next round button must exist').not.toBeNullable();
      nextRoundButton.click();
      await fixture.whenStable();

      // Ensure state of game is correct after starting next round.
      const actualGameStateNewRound = gameStateService.gameState();
      const expectedGameStateNewRound = debugService.genStartState(4);
      expectedGameStateNewRound.statistics.round = 2;
      expectedGameStateNewRound.statistics.ties = 1;
      expectedGameStateNewRound.statistics.tiesInRow = 1;
      expectedGameStateNewRound.debugSettings.disableAutoAi = true;
      assertGameState(actualGameStateNewRound, expectedGameStateNewRound);
    });

    it('double pass happens', async () => {
      const expectedGameState = debugService.genStartState(4);
      // board 4x4, moves: c4 d4 d3 b4 a4 d2 d1 a2 pass b1
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCell(debugService, fixture, expectedGameState, 0, "c4 c3"); // black c4
      await clickOnCell(debugService, fixture, expectedGameState, 1, "d4 c3"); // white d4
      await clickOnCell(debugService, fixture, expectedGameState, 0, "d3 c3"); // black d3
      await clickOnCell(debugService, fixture, expectedGameState, 1, "b4 b3 c4"); // white b4
      await clickOnCell(debugService, fixture, expectedGameState, 0, "a4 b3"); // black a4
      await clickOnCell(debugService, fixture, expectedGameState, 1, "d2 c2 c3 d3"); // white d2 ---
      await clickOnCell(debugService, fixture, expectedGameState, 0, "d1 c2"); // black d1
      await clickOnCell(debugService, fixture, expectedGameState, 1, "a2 b3"); // white a2
      await clickOnPass(debugService, fixture, expectedGameState, 0); // black pass
      await clickOnCell(debugService, fixture, expectedGameState, 1, "b1 c2"); // white b1

      const boardStr = "_W_B"+ // Expected board state.
                       "WWWW"+ // Neither player has legal moves, so game ends.
                       "_WWW"+
                       "BWWW";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state at end of game.
      expectedGameState.statistics.moveCount = 10;
      expectedGameState.statistics.emptyCells = 3;
      expectedGameState.statistics.player1Score = 2;
      expectedGameState.statistics.player2Score = 11;
      expectedGameState.statistics.player2Win = 1;
      expectedGameState.statistics.player2WinInRow = 1;
      expectedGameState.board.status = EnGameStatus.PlayerWon;
      expectedGameState.board.doublePass = true;
      expectedGameState.debugSettings.disableAutoAi = true;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);

      // Now we start next round. Next round button should be present.
      const nextRoundButton = fixture.nativeElement.querySelector('[data-testid="btn-nextRound"]') as HTMLButtonElement;
      expect(nextRoundButton, 'Next round button must exist').not.toBeNullable();
      nextRoundButton.click();
      await fixture.whenStable();

      // Ensure state of game is correct after starting next round.
      const actualGameStateNewRound = gameStateService.gameState();
      const expectedGameStateNewRound = debugService.genStartState(4);
      expectedGameStateNewRound.statistics.round = 2;
      expectedGameStateNewRound.statistics.player2Win = 1;
      expectedGameStateNewRound.statistics.player2WinInRow = 1;
      expectedGameStateNewRound.debugSettings.disableAutoAi = true;
      assertGameState(actualGameStateNewRound, expectedGameStateNewRound);
    });

    it('fastest wipeout happens', async () => {
      // wipeout means one of player loses all pieces
      const expectedGameState = debugService.genStartState(6);
      // board 6x6, moves: d5 e3 d2 e5 f4 c5 d6 e4 b4
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 1); // 6x6
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCell(debugService, fixture, expectedGameState, 0, "d5 d4"); // black d5
      await clickOnCell(debugService, fixture, expectedGameState, 1, "e3 d3"); // white e3
      await clickOnCell(debugService, fixture, expectedGameState, 0, "d2 d3"); // black d2
      await clickOnCell(debugService, fixture, expectedGameState, 1, "e5 d4"); // white e5
      await clickOnCell(debugService, fixture, expectedGameState, 0, "f4 e3"); // black f4
      await clickOnCell(debugService, fixture, expectedGameState, 1, "c5 c4 d5"); // white c5
      await clickOnCell(debugService, fixture, expectedGameState, 0, "d6 d4 d5 e5"); // black d6
      await clickOnCell(debugService, fixture, expectedGameState, 1, "e4 d4"); // white e4
      await clickOnCell(debugService, fixture, expectedGameState, 0, "b4 c3 c4 c5 d4 e4"); // black b4

      const boardStr = "______"+ // Expected board state.
                       "___B__"+ // Wipeout happened. Black wins.
                       "__BBB_"+
                       "_BBBBB"+
                       "__BBB_"+
                       "___B__";
      assertDomBoard(fixture, boardStr, true); // Check state of board in browser.

      // Check game state at end of game.
      expectedGameState.statistics.moveCount = 9;
      expectedGameState.statistics.emptyCells = 23;
      expectedGameState.statistics.player1Score = 13;
      expectedGameState.statistics.player2Score = 0;
      expectedGameState.statistics.player1Win = 1;
      expectedGameState.statistics.player1WinInRow = 1;
      expectedGameState.board.status = EnGameStatus.PlayerWon;
      expectedGameState.board.doublePass = true;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.debugSettings.disableAutoAi = true;
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);

      // Now we start next round. Next round button should be present.
      const nextRoundButton = fixture.nativeElement.querySelector('[data-testid="btn-nextRound"]') as HTMLButtonElement;
      expect(nextRoundButton, 'Next round button must exist').not.toBeNullable();
      nextRoundButton.click();
      await fixture.whenStable();

      // Ensure state of game is correct after starting next round.
      const actualGameStateNewRound = gameStateService.gameState();
      const expectedGameStateNewRound = debugService.genStartState(6);
      expectedGameStateNewRound.statistics.round = 2;
      expectedGameStateNewRound.statistics.player1Win = 1;
      expectedGameStateNewRound.statistics.player1WinInRow = 1;
      expectedGameStateNewRound.debugSettings.disableAutoAi = true;
      assertGameState(actualGameStateNewRound, expectedGameStateNewRound);
    });
  });
});
