import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';

import { setupTestBedTranslate } from './app.test-setup';
import { selectComboboxOption } from '@/components/basic/comboBox/_tests/comboBox.test-setup';
import { assertGameState, genStartState, addToHistory } from '@/code/services/gameState/gameState.test-setup';

import { App } from '../app';
import { EnCellState, EnMode, EnPlayerType } from '@/code/data/enums';

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

  //

  //

  function assertPassButton(exists: boolean) {
    if (exists) {
      const passButton = fixture.nativeElement.querySelector('[data-testid="btn-pass"]') as HTMLButtonElement;
      expect(passButton, 'Pass button must exist for this board state.').not.toBeNullable(); // make sure it exists
    } else {
      const noPassButton = fixture.nativeElement.querySelector('[data-testid="btn-pass"]') as HTMLButtonElement;
      expect(noPassButton, 'Pass button cannot exist for this board state.').toBeNullable();
    }
  }

  // //////////////////////////////////////////////////////////////////////////
  // Game logic.

  describe('should have correct game state when game starts', () => {
    it('with default settings', async () => {
      // Find the primary Start Game button inside the rendered MainMenu and click it.
      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

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

      // Find the primary Start Game button inside the rendered MainMenu and click it.
      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

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

      // Find the primary Start Game button inside the rendered MainMenu and click it.
      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

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

      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable();

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
      // board 6x6, moves: d2
      const expectedGameState = genStartState(6);
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 1); // 6x6

      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable();

      addToHistory(expectedGameState, 0, [{x:4, y:3}, {x:3, y:3}]); // for move below

      // Find correct cell and click it.
      const cell = fixture.nativeElement.querySelector('[data-testid="cell-4x3"]') as HTMLButtonElement;
      cell.click();
      await fixture.whenStable();

      // Now we check game state.
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 31;
      expectedGameState.statistics.player1Score = 4;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[expectedGameState.board.history.moves.length-1].cells);
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

      // Find the primary Start Game button inside the rendered MainMenu and click it.
      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable();

      addToHistory(expectedGameState, 0, [{x:1, y:0}, {x:1, y:1}]); // for move below

      // Find correct cell and click it as black.
      const cell1 = fixture.nativeElement.querySelector('[data-testid="cell-1x0"]') as HTMLButtonElement;
      cell1.click();
      await fixture.whenStable();

      addToHistory(expectedGameState, 1, [{x:0, y:2}, {x:1, y:2}]); // for move below

      // Find correct cell and click it as white.
      const cell2 = fixture.nativeElement.querySelector('[data-testid="cell-0x2"]') as HTMLButtonElement;
      cell2.click();
      await fixture.whenStable();

      // Now we check game state.
      expectedGameState.statistics.moveCount = 2;
      expectedGameState.statistics.emptyCells = 10;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[expectedGameState.board.history.moves.length-1].cells);
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
      // board 4x4, moves: b1 c1 d3 a1
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4

      // Find the primary Start Game button inside the rendered MainMenu and click it.
      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable();
      assertPassButton(false);

      // black move b1
      addToHistory(expectedGameState, 0, [{x:1, y:0}, {x:1, y:1}]); // for move below

      // Find correct cell and click it.
      const cell1 = fixture.nativeElement.querySelector('[data-testid="cell-1x0"]') as HTMLButtonElement;
      cell1.click();
      await fixture.whenStable();
      assertPassButton(false);

      // white move c1
      addToHistory(expectedGameState, 1, [{x:2, y:0}, {x:2, y:1}]); // for move below

      // Find correct cell and click it.
      const cell2 = fixture.nativeElement.querySelector('[data-testid="cell-2x0"]') as HTMLButtonElement;
      cell2.click();
      await fixture.whenStable();
      assertPassButton(false);

      // black move d3
      addToHistory(expectedGameState, 0, [{x:3, y:2}, {x:2, y:1}, {x:2, y:2}]); // for move below

      // Find correct cell and click it.
      const cell3 = fixture.nativeElement.querySelector('[data-testid="cell-3x2"]') as HTMLButtonElement;
      cell3.click();
      await fixture.whenStable();
      assertPassButton(false);

      // white move a1
      addToHistory(expectedGameState, 1, [{x:0, y:0}, {x:1, y:0}]); // for move below

      // Find correct cell and click it.
      const cell4 = fixture.nativeElement.querySelector('[data-testid="cell-0x0"]') as HTMLButtonElement;
      cell4.click();
      await fixture.whenStable();
      assertPassButton(true);

      // black passes move
      addToHistory(expectedGameState, 0, []); // for pass below

      // Find pass move button and click it.
      const passButton = fixture.nativeElement.querySelector('[data-testid="btn-pass"]') as HTMLButtonElement;
      passButton.click();
      await fixture.whenStable();

      // Now we check game state after 4 moves and pass.
      expectedGameState.statistics.moveCount = 5; // would be 4 without pass
      expectedGameState.statistics.emptyCells = 8;
      expectedGameState.statistics.player1Score = 5;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.board.currPlayerIx = 1; // would be 0 without pass
      expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[expectedGameState.board.history.moves.length-1].cells);
      expectedGameState.view.cells = expectedGameState.board.cells;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('end game detection when', () => {
    it('board is filled completely', async () => {
      // board 4x4, moves: ?
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4

      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable();
      assertPassButton(false);

      // TODO

    });

    it('draw happens', async () => {
      // board 4x4, moves: c4 d4 d3 b4 a4 d2 b1 a3 d1 a2 a1 pass c1
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4

      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable();
      assertPassButton(false);

      // TODO

    });

    it('fastest wipeout happens', async () => {
      // board 6x6, moves: d5 e3 d2 e5 f4 c5 d6 e4 b4
      selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 1); // 6x6

      const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
      startButton.click();
      await fixture.whenStable();
      assertPassButton(false);

      // TODO
    });
  });
});

