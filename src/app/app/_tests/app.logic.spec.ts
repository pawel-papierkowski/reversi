import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';

import { setupTestBedTranslate } from './app.test-setup';
import { selectComboboxOption } from '@/components/common/comboBox/_tests/comboBox.test-setup';

import { App } from '../app';
import { EnGameStatus, EnCellState, EnMode, EnPlayerType } from '@/code/data/enums';
import type { GameState, Cell } from "@/code/data/gameState";
import { createGameState, createCell, createCellFill, createGameHistoryEntry } from "@/code/data/gameState";
import { GameStateService } from '@/code/services/gameState.service';

describe('App (logic)', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let gameStateService: GameStateService;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.

    fixture = await setupTestBedTranslate([]);
    router = TestBed.inject(Router);
    gameStateService = TestBed.inject(GameStateService);

    // Trigger initial navigation to load the '' (MainMenu) route.
    router.initialNavigation();
    await fixture.whenStable(); // ensure everything is fully loaded on page before continuing
    fixture.detectChanges();
  });

  //

  /** Generate game state after start of game.
   */
  function genStartState(actualGameState: GameState, boardSize: number): GameState {
    const startGameState = createGameState();
    // Mutate only the fields that change after "Start Game" is clicked.

    startGameState.settings.boardSize = boardSize;
    startGameState.board.status = EnGameStatus.InProgress;

    // Game board should have four pieces in middle already.
    const ix = boardSize/2 - 1;
    startGameState.board.cells = genCells(boardSize); // generate empty board
    startGameState.board.cells[ix][ix] = createCellFill(EnCellState.W);
    startGameState.board.cells[ix+1][ix] = createCellFill(EnCellState.B);
    startGameState.board.cells[ix][ix+1] = createCellFill(EnCellState.B);
    startGameState.board.cells[ix+1][ix+1] = createCellFill(EnCellState.W);

    // Should have first move (initial board state) already in history.
    const move = createGameHistoryEntry();
    move.cells = startGameState.board.cells;
    startGameState.board.history.moves.push(move);

    // Game view should be set.
    startGameState.view.cells = startGameState.board.cells;

    // Player names are random, so we test them separately.
    startGameState.players[0].name = actualGameState.players[0].name;
    startGameState.players[1].name = actualGameState.players[1].name;
    return startGameState;
  }

  function genCells(boardSize: number): Cell[][] {
    const cells : Cell[][] = Array.from({ length: boardSize }, () =>
      Array.from({ length: boardSize }, () => createCell())
    );
    return cells;
  }

  function assertGameState(actualGameState: GameState, expectedGameState: GameState) {
    // Deep equality check (except names, as these are random).
    expect(actualGameState).toEqual(expectedGameState);
    // Ensure player names at least exist.
    expect(actualGameState.players[0].name.length).toBeGreaterThan(0);
    expect(actualGameState.players[1].name.length).toBeGreaterThan(0);
  }

  // //////////////////////////////////////////////////////////////////////////
  // Game logic.

  it('should have correct game state when game starts with default settings', async () => {
    // Find the primary Start Game button inside the rendered MainMenu and click it.
    const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
    startButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    // Now we check game state.
    const actualGameState = gameStateService.gameState();
    const expectedGameState = genStartState(actualGameState, 8);
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
    const expectedGameState = genStartState(actualGameState, 4);
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
    const expectedGameState = genStartState(actualGameState, 8);
    expectedGameState.settings.mode = EnMode.AiVsAi;
    expectedGameState.players[0].type = EnPlayerType.AI;
    expectedGameState.players[1].type = EnPlayerType.AI;

    assertGameState(actualGameState, expectedGameState);
  });
});

