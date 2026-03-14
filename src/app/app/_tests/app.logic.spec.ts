import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';

import { setupTestBedTranslate } from './app.test-setup';
import { selectComboboxOption } from '@/components/basic/comboBox/_tests/comboBox.test-setup';
import { assertGameState, genStartState } from '@/code/services/gameState/gameState.test-setup';

import { App } from '../app';
import { EnCellState, EnMode, EnPlayerType } from '@/code/data/enums';
import type { GameHistoryEntry } from "@/code/data/gameState";
import { createCellFill, createCellFull } from "@/code/data/gameState";

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

  it('should have correct game state when game starts with default settings', async () => {
    // Find the primary Start Game button inside the rendered MainMenu and click it.
    const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
    startButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    // Now we check game state.
    const actualGameState = gameStateService.gameState();
    const expectedGameState = genStartState(8);
    assertGameState(actualGameState, expectedGameState);
  });

  it('should have correct game state when game starts with changed settings', async () => {
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

  it('should have correct game state when game starts in AI vs AI mode', async () => {
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

  //

  it('cell click on invalid cell should not change anything', async () => {
    selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4

    // Find the primary Start Game button inside the rendered MainMenu and click it.
    const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
    startButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    // Find correct cell and click it. Note this cell is not on list of legal moves.
    const cell = fixture.nativeElement.querySelector('[data-testid="cell-2x2"]') as HTMLButtonElement;
    cell.click();

    await fixture.whenStable(); // Wait for Angular to finish.
    fixture.detectChanges();

    // Now we check game state. Nothing should change.
    const actualGameState = gameStateService.gameState();
    const expectedGameState = genStartState(4);

    assertGameState(actualGameState, expectedGameState);
  });

  it('cell click should add and flip pieces', async () => {
    selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 1); // 6x6

    // Find the primary Start Game button inside the rendered MainMenu and click it.
    const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
    startButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    const expectedHistoryEntry1: GameHistoryEntry = {
      playerIx: 0,
      move: {x:4, y:3},
      cells: structuredClone(gameStateService.gameState().board.cells)
    };
    expectedHistoryEntry1.cells[4][3].state = EnCellState.B; // added
    expectedHistoryEntry1.cells[3][3].state = EnCellState.B; // flipped

    // Find correct cell and click it.
    const cell = fixture.nativeElement.querySelector('[data-testid="cell-4x3"]') as HTMLButtonElement;
    cell.click();

    await fixture.whenStable(); // Wait for Angular to finish.
    fixture.detectChanges();

    // Now we check game state.
    const actualGameState = gameStateService.gameState();
    const expectedGameState = genStartState(6);
    expectedGameState.statistics.moveCount = 1;
    expectedGameState.statistics.emptyCells = 31;
    expectedGameState.statistics.player1Score = 4;
    expectedGameState.statistics.player2Score = 1;
    expectedGameState.board.currPlayerIx = 1;
    expectedGameState.board.cells[4][3].state = EnCellState.B; // move that black just made
    expectedGameState.board.cells[3][3].state = EnCellState.B; // flipped white piece

    expectedGameState.board.history.moves.push(expectedHistoryEntry1);

    expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
    legalMoveService.debugShowMovesCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

    assertGameState(actualGameState, expectedGameState);
  });

  it('two clicks should add and flip pieces for both players', async () => {
    selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4

    // Find the primary Start Game button inside the rendered MainMenu and click it.
    const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
    startButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    const expectedHistoryEntry1: GameHistoryEntry = {
      playerIx: 0,
      move: {x:1, y:0},
      cells: structuredClone(gameStateService.gameState().board.cells)
    };
    expectedHistoryEntry1.cells[1][0].state = EnCellState.B; // added
    expectedHistoryEntry1.cells[1][1].state = EnCellState.B; // flipped

    // Find correct cell and click it as black.
    const cell1 = fixture.nativeElement.querySelector('[data-testid="cell-1x0"]') as HTMLButtonElement;
    cell1.click();

    await fixture.whenStable(); // Wait for Angular to finish.

    const expectedHistoryEntry2: GameHistoryEntry = {
      playerIx: 1,
      move: {x:0, y:2},
      cells: structuredClone(gameStateService.gameState().board.cells)
    };
    expectedHistoryEntry2.cells[0][2].state = EnCellState.W; // added
    expectedHistoryEntry2.cells[1][2].state = EnCellState.W; // flipped

    // Find correct cell and click it as white.
    const cell2 = fixture.nativeElement.querySelector('[data-testid="cell-0x2"]') as HTMLButtonElement;
    cell2.click();

    await fixture.whenStable(); // Wait for Angular to finish.

    // Now we check game state.
    const actualGameState = gameStateService.gameState();
    const expectedGameState = genStartState(4);
    expectedGameState.statistics.moveCount = 2;
    expectedGameState.statistics.emptyCells = 10;
    expectedGameState.statistics.player1Score = 3;
    expectedGameState.statistics.player2Score = 3;
    expectedGameState.board.cells[1][0].state = EnCellState.B; // black move
    expectedGameState.board.cells[1][1].state = EnCellState.B; // flipped white piece
    expectedGameState.board.cells[0][2].state = EnCellState.W; // white move
    expectedGameState.board.cells[1][2].state = EnCellState.W; // flipped black piece

    expectedGameState.board.history.moves.push(expectedHistoryEntry1);
    expectedGameState.board.history.moves.push(expectedHistoryEntry2);

    expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
    legalMoveService.debugShowMovesCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

    assertGameState(actualGameState, expectedGameState);
  });
});

