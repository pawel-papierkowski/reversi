import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';

import { setupTestBedTranslate, startGame, clickOnCellMoves, clickOnPass, assertPassButton } from './app.test-setup';
import { selectComboboxOption } from '@/components/basic/comboBox/_tests/comboBox.test-setup';
import { assertGameState, genStartState } from '@/code/services/gameState/gameState.test-setup';

import { App } from '../app';
import { EnCellState, EnGameStatus, EnMode, EnPlayerType } from '@/code/data/enums';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';

describe('App (logic)', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let gameStateService: GameStateService;
  let legalMoveService: LegalMoveService;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.

    fixture = await setupTestBedTranslate([]);
    router = TestBed.inject(Router);
    gameStateService = TestBed.inject(GameStateService);
    legalMoveService = TestBed.inject(LegalMoveService);

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

      // Now we check game state.
      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      assertGameState(actualGameState, expectedGameState);
    });

    it('with changed settings', async () => {
      // Change mode to Human vs AI, set AI as first and set 4x4 board.
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 1);
      selectComboboxOption(fixture, 'cb-mainMenu-whoFirst', 1);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0);
      await startGame(fixture);

      // Now we check game state.
      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(4);
      expectedGameState.settings.mode = EnMode.HumanVsAi;
      expectedGameState.settings.whoFirst = EnPlayerType.AI;
      expectedGameState.players[0].type = EnPlayerType.AI;

      assertGameState(actualGameState, expectedGameState);
    });

    it('in AI vs AI mode', async () => {
      // Change mode to AI vs AI
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 2);
      await startGame(fixture);

      // Now we check game state.
      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      expectedGameState.settings.mode = EnMode.AiVsAi;
      expectedGameState.players[0].type = EnPlayerType.AI;
      expectedGameState.players[1].type = EnPlayerType.AI;

      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('clicking', () => {
    it('on invalid cell should not change anything', async () => {
      // board 4x4, moves: b2
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);

      // Find correct cell and click it. Note this cell is not on list of legal moves.
      const cell = fixture.nativeElement.querySelector('[data-testid="cell-2x2"]') as HTMLButtonElement;
      cell.click();
      await fixture.whenStable();

      // Now we check game state. Nothing should change.
      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(4);

      assertGameState(actualGameState, expectedGameState);
    });

    it('on valid cell should add piece and flip piece', async () => {
      // board 6x6, moves: e4
      const expectedGameState = genStartState(6);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 1); // 6x6
      await startGame(fixture);

      await clickOnCellMoves(fixture, expectedGameState, 0, "e4 d4"); // black e4

      // Now we check game state.
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 31;
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

    it('on two valid cells should add and flip pieces for both players', async () => {
      // board 4x4, moves: b1 a3
      const expectedGameState = genStartState(4);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);

      await clickOnCellMoves(fixture, expectedGameState, 0, "b1 b2"); // black b1
      await clickOnCellMoves(fixture, expectedGameState, 1, "a3 b3"); // white a3

      // Now we check game state.
      expectedGameState.statistics.moveCount = 2;
      expectedGameState.statistics.emptyCells = 10;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('special situation when', () => {
    it('one of players cannot make legal move and has to pass move', async () => {
      const expectedGameState = genStartState(4);
      // board 4x4, moves: b1 c1 d3 a1 pass
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCellMoves(fixture, expectedGameState, 0, "b1 b2"); // black b1
      assertPassButton(fixture, false, 'after b1');
      await clickOnCellMoves(fixture, expectedGameState, 1, "c1 c2"); // white c1
      assertPassButton(fixture, false, 'after c1');
      await clickOnCellMoves(fixture, expectedGameState, 0, "d3 c2 c3"); // black d3
      assertPassButton(fixture, false, 'after d3');
      await clickOnCellMoves(fixture, expectedGameState, 1, "a1 b1"); // white a1
      assertPassButton(fixture, true, 'after a1');

      // state of board:
      // WWW_
      // _BB_
      // _BBB
      // ____
      // Black has no legal moves available.

      await clickOnPass(fixture, expectedGameState, 0); // black pass

      // Now we check game state after 4 moves and pass.
      expectedGameState.statistics.moveCount = 5; // would be 4 without pass
      expectedGameState.statistics.emptyCells = 8;
      expectedGameState.statistics.player1Score = 5;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.board.currPlayerIx = 1; // would be 0 without pass
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('end game detection when', () => {
    it('board is filled completely', async () => {
      const expectedGameState = genStartState(4);
      // board 4x4, moves: b1 a1 a2 c1 d1 a3 a4 d2 d3 b4 c4 d4
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCellMoves(fixture, expectedGameState, 0, "b1 b2"); // black b1
      await clickOnCellMoves(fixture, expectedGameState, 1, "a1 b2"); // white a1
      await clickOnCellMoves(fixture, expectedGameState, 0, "a2 b2"); // black a2
      await clickOnCellMoves(fixture, expectedGameState, 1, "c1 b1 c2"); // white c1
      await clickOnCellMoves(fixture, expectedGameState, 0, "d1 c2"); // black d1
      await clickOnCellMoves(fixture, expectedGameState, 1, "a3 a2 b2 b3"); // white a3
      await clickOnCellMoves(fixture, expectedGameState, 0, "a4 b3"); // black a4
      await clickOnCellMoves(fixture, expectedGameState, 1, "d2 c2"); // white d2
      await clickOnCellMoves(fixture, expectedGameState, 0, "d3 d2 c3"); // black d3
      await clickOnCellMoves(fixture, expectedGameState, 1, "b4 b3"); // white b4
      await clickOnCellMoves(fixture, expectedGameState, 0, "c4 b4"); // black c4
      await clickOnCellMoves(fixture, expectedGameState, 1, "d4 c3"); // white d4

      // Resulting board:
      // WWWB
      // WWWB
      // WWWB
      // BBBW

      // next round button should be present
      const nextRoundButton = fixture.nativeElement.querySelector('[data-testid="btn-nextRound"]') as HTMLButtonElement;
      expect(nextRoundButton, 'Next round button must exist').not.toBeNullable();

      // now we check game state at end of game
      expectedGameState.statistics.moveCount = 12;
      expectedGameState.statistics.emptyCells = 0;
      expectedGameState.statistics.player1Score = 6;
      expectedGameState.statistics.player2Score = 10;
      expectedGameState.statistics.player2Win = 1;
      expectedGameState.statistics.player2WinInRow = 1;
      expectedGameState.board.status = EnGameStatus.PlayerWon;
      expectedGameState.board.doublePass = true;
      expectedGameState.board.currPlayerIx = 0;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);

      // and now we start next round
      nextRoundButton.click();
      await fixture.whenStable();

      // ensure state of game is correct after starting next round
      const actualGameStateNewRound = gameStateService.gameState();
      const expectedGameStateNewRound = genStartState(4);
      expectedGameStateNewRound.statistics.round = 2;
      expectedGameStateNewRound.statistics.player2Win = 1;
      expectedGameStateNewRound.statistics.player2WinInRow = 1;
      assertGameState(actualGameStateNewRound, expectedGameStateNewRound);
    });

    it('draw happens', async () => {
      const expectedGameState = genStartState(4);
      // board 4x4, moves: c4 d4 d3 b4 a4 d2 b1 a3 d1 a2 a1 pass c1
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCellMoves(fixture, expectedGameState, 0, "c4 c3"); // black c4
      await clickOnCellMoves(fixture, expectedGameState, 1, "d4 c3"); // white d4
      await clickOnCellMoves(fixture, expectedGameState, 0, "d3 c3"); // black d3
      await clickOnCellMoves(fixture, expectedGameState, 1, "b4 b3 c4"); // white b4
      await clickOnCellMoves(fixture, expectedGameState, 0, "a4 b3"); // black a4
      await clickOnCellMoves(fixture, expectedGameState, 1, "d2 c2 c3 d3"); // white d2
      await clickOnCellMoves(fixture, expectedGameState, 0, "b1 b2"); // black b1
      await clickOnCellMoves(fixture, expectedGameState, 1, "a3 b3"); // white a3
      await clickOnCellMoves(fixture, expectedGameState, 0, "d1 c2 b3"); // black d1
      await clickOnCellMoves(fixture, expectedGameState, 1, "a2 b2 c2 b3"); // white a2
      await clickOnCellMoves(fixture, expectedGameState, 0, "a1 a2 a3"); // black a1
      await clickOnPass(fixture, expectedGameState, 1); // white pass
      await clickOnCellMoves(fixture, expectedGameState, 0, "c1 b2"); // black c1
      assertPassButton(fixture, false, 'after board fill');

      // Resulting board:
      // BBBB
      // BBWW
      // BWWW
      // BWWW

      // next round button should be present
      const nextRoundButton = fixture.nativeElement.querySelector('[data-testid="btn-nextRound"]') as HTMLButtonElement;
      expect(nextRoundButton, 'Next round button must exist').not.toBeNullable();

      // now we check game state at end of game
      expectedGameState.statistics.moveCount = 13;
      expectedGameState.statistics.emptyCells = 0;
      expectedGameState.statistics.player1Score = 8;
      expectedGameState.statistics.player2Score = 8;
      expectedGameState.statistics.ties = 1;
      expectedGameState.statistics.tiesInRow = 1;
      expectedGameState.board.status = EnGameStatus.Tie;
      expectedGameState.board.doublePass = true;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);

      // and now we start next round
      nextRoundButton.click();
      await fixture.whenStable();

      // ensure state of game is correct after starting next round
      const actualGameStateNewRound = gameStateService.gameState();
      const expectedGameStateNewRound = genStartState(4);
      expectedGameStateNewRound.statistics.round = 2;
      expectedGameStateNewRound.statistics.ties = 1;
      expectedGameStateNewRound.statistics.tiesInRow = 1;
      assertGameState(actualGameStateNewRound, expectedGameStateNewRound);
    });

    it('double pass happens', async () => {
      const expectedGameState = genStartState(4);
      // board 4x4, moves: c4 d4 d3 b4 a4 d2 d1 a2 pass b1
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCellMoves(fixture, expectedGameState, 0, "c4 c3"); // black c4
      await clickOnCellMoves(fixture, expectedGameState, 1, "d4 c3"); // white d4
      await clickOnCellMoves(fixture, expectedGameState, 0, "d3 c3"); // black d3
      await clickOnCellMoves(fixture, expectedGameState, 1, "b4 b3 c4"); // white b4
      await clickOnCellMoves(fixture, expectedGameState, 0, "a4 b3"); // black a4
      await clickOnCellMoves(fixture, expectedGameState, 1, "d2 c2 c3 d3"); // white d2 ---
      await clickOnCellMoves(fixture, expectedGameState, 0, "d1 c2"); // black d1
      await clickOnCellMoves(fixture, expectedGameState, 1, "a2 b3"); // white a2
      await clickOnPass(fixture, expectedGameState, 0); // black pass
      await clickOnCellMoves(fixture, expectedGameState, 1, "b1 c2"); // white b1

      // Resulting board:
      // _W_B
      // WWWW
      // _WWW
      // BWWW
      // Neither player has legal moves, so game ends.

      // next round button should be present
      const nextRoundButton = fixture.nativeElement.querySelector('[data-testid="btn-nextRound"]') as HTMLButtonElement;
      expect(nextRoundButton, 'Next round button must exist').not.toBeNullable();

      // now we check game state at end of game
      expectedGameState.statistics.moveCount = 10;
      expectedGameState.statistics.emptyCells = 3;
      expectedGameState.statistics.player1Score = 2;
      expectedGameState.statistics.player2Score = 11;
      expectedGameState.statistics.player2Win = 1;
      expectedGameState.statistics.player2WinInRow = 1;
      expectedGameState.board.status = EnGameStatus.PlayerWon;
      expectedGameState.board.doublePass = true;
      expectedGameState.board.currPlayerIx = 0;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);

      // and now we start next round
      nextRoundButton.click();
      await fixture.whenStable();

      // ensure state of game is correct after starting next round
      const actualGameStateNewRound = gameStateService.gameState();
      const expectedGameStateNewRound = genStartState(4);
      expectedGameStateNewRound.statistics.round = 2;
      expectedGameStateNewRound.statistics.player2Win = 1;
      expectedGameStateNewRound.statistics.player2WinInRow = 1;
      assertGameState(actualGameStateNewRound, expectedGameStateNewRound);
    });

    it('fastest wipeout happens', async () => {
      // wipeout means one of player loses all pieces
      const expectedGameState = genStartState(6);
      // board 6x6, moves: d5 e3 d2 e5 f4 c5 d6 e4 b4
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 1); // 6x6
      await startGame(fixture);
      assertPassButton(fixture, false, 'after start');

      await clickOnCellMoves(fixture, expectedGameState, 0, "d5 d4"); // black d5
      await clickOnCellMoves(fixture, expectedGameState, 1, "e3 d3"); // white e3
      await clickOnCellMoves(fixture, expectedGameState, 0, "d2 d3"); // black d2
      await clickOnCellMoves(fixture, expectedGameState, 1, "e5 d4"); // white e5
      await clickOnCellMoves(fixture, expectedGameState, 0, "f4 e3"); // black f4
      await clickOnCellMoves(fixture, expectedGameState, 1, "c5 c4 d5"); // white c5
      await clickOnCellMoves(fixture, expectedGameState, 0, "d6 d4 d5 e5"); // black d6
      await clickOnCellMoves(fixture, expectedGameState, 1, "e4 d4"); // white e4
      await clickOnCellMoves(fixture, expectedGameState, 0, "b4 c3 c4 c5 d4 e4"); // black b4

      // Resulting board:
      // ______
      // ___B__
      // __BBB_
      // _BBBBB
      // __BBB_
      // ___B__
      // Wipeout happened. Black wins.

      // next round button should be present
      const nextRoundButton = fixture.nativeElement.querySelector('[data-testid="btn-nextRound"]') as HTMLButtonElement;
      expect(nextRoundButton, 'Next round button must exist').not.toBeNullable();

      // now we check game state at end of game
      expectedGameState.statistics.moveCount = 9;
      expectedGameState.statistics.emptyCells = 23;
      expectedGameState.statistics.player1Score = 13;
      expectedGameState.statistics.player2Score = 0;
      expectedGameState.statistics.player1Win = 1;
      expectedGameState.statistics.player1WinInRow = 1;
      expectedGameState.board.status = EnGameStatus.PlayerWon;
      expectedGameState.board.doublePass = true;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);

      // and now we start next round
      nextRoundButton.click();
      await fixture.whenStable();

      // ensure state of game is correct after starting next round
      const actualGameStateNewRound = gameStateService.gameState();
      const expectedGameStateNewRound = genStartState(6);
      expectedGameStateNewRound.statistics.round = 2;
      expectedGameStateNewRound.statistics.player1Win = 1;
      expectedGameStateNewRound.statistics.player1WinInRow = 1;
      assertGameState(actualGameStateNewRound, expectedGameStateNewRound);
    });
  });
});

