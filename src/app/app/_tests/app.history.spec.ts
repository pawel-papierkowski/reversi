import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';

import { EnCellState, EnViewMode } from '@/code/data/enums';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';

import { setupTestBedTranslate, startGame, clickOnCell, clickOnPass, assertDomBoard } from './app.test-setup';
import { selectComboboxOption } from '@/components/basic/comboBox/_tests/comboBox.test-setup';
import { assertGameState, genStartState } from '@/code/services/gameState/gameState.test-setup';

import { App } from '../app';

describe('App (history)', () => {
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
  // History handling.

  it('verify content of history panel', async () => {
    const expectedGameState = genStartState(4);
    // board 4x4, moves: b1 c1 d3 a1 pass
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
    selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
    await startGame(fixture);

    await clickOnCell(fixture, expectedGameState, 0, "b1 b2"); // black b1
    await clickOnCell(fixture, expectedGameState, 1, "c1 c2"); // white c1
    await clickOnCell(fixture, expectedGameState, 0, "d3 c2 c3"); // black d3
    await clickOnCell(fixture, expectedGameState, 1, "a1 b1"); // white a1
    await clickOnPass(fixture, expectedGameState, 0); // black pass

    // CHECKING WEBPAGE
    // Currently there should be 6 entries in history panel: initial state, 4 moves and pass.
    const historyEntries = fixture.nativeElement.querySelectorAll('.historyEntry');
    expect(historyEntries.length, 'Amount of history entries is different').toEqual(6);

    // Moves are in reverse order - newest move first.
    expect(historyEntries[0]?.textContent, 'History entry [0] is different').toContain("5. Pass");
    expect(historyEntries[1]?.textContent, 'History entry [1] is different').toContain("4. a1");
    expect(historyEntries[2]?.textContent, 'History entry [2] is different').toContain("3. d3");
    expect(historyEntries[3]?.textContent, 'History entry [3] is different').toContain("2. c1");
    expect(historyEntries[4]?.textContent, 'History entry [4] is different').toContain("1. b1");
    expect(historyEntries[5]?.textContent, 'History entry [5] is different').toContain("0. Start of game");
  });

  it('click on history entry and exit', async () => {
    const expectedGameState = genStartState(4);
    // board 4x4, moves: b1 c1 d3 a1 pass
      selectComboboxOption(fixture, 'cb-mainMenu-mode', 0);
    selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 0); // 4x4
    await startGame(fixture);

    await clickOnCell(fixture, expectedGameState, 0, "b1 b2"); // black b1
    await clickOnCell(fixture, expectedGameState, 1, "c1 c2"); // white c1
    await clickOnCell(fixture, expectedGameState, 0, "d3 c2 c3"); // black d3
    await clickOnCell(fixture, expectedGameState, 1, "a1 b1"); // white a1
    await clickOnPass(fixture, expectedGameState, 0); // black pass

    const boardStr = "WWW_"+ // Expected board state.
                     "_BB_"+
                     "wBBB"+
                     "_www";
    assertDomBoard(fixture, boardStr, true, 'Before going to history'); // Check state of board in browser.

    // CHECKING WEBPAGE
    // Currently there should be 6 entries in history panel: initial state, 4 moves and pass.
    const historyEntries = fixture.nativeElement.querySelectorAll('.historyEntry');
    expect(historyEntries.length, 'Amount of history entries is different').toEqual(6);

    // Entering history at index 3.
    // Keep in mind history entries are in reversed order (oldest move at bottom, newest at top).
    // So index 0 will always point to newest move.
    const historyEntry = historyEntries[3] as HTMLElement;
    historyEntry.click();
    await fixture.whenStable();

    // Make sure status is correct.
    const div = fixture.nativeElement.querySelector('[data-testid="div-status"]') as HTMLElement;
    expect(div.textContent).toContain('Viewing board for move 2.');

    // Make sure historical state of board on screen is correct.
    const boardHistoryStr = "_BW_"+ // Expected board state.
                            "_BW_"+ // This is from history, move 2 (ix 3 in history.moves array).
                            "_BW_"+
                            "____";
    assertDomBoard(fixture, boardHistoryStr, true, 'Viewing board for move 2'); // Check state of board in browser.

    // Now we check game state when we are in history.
    expectedGameState.statistics.moveCount = 5;
    expectedGameState.statistics.emptyCells = 8;
    expectedGameState.statistics.player1Score = 5;
    expectedGameState.statistics.player2Score = 3;
    expectedGameState.board.currPlayerIx = 1;
    expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
    expectedGameState.view.viewMode = EnViewMode.History;
    expectedGameState.view.viewMove = 3;
    expectedGameState.view.cells = expectedGameState.board.history.moves[3].cells;

    expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
    legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

    const actualGameStateHist = gameStateService.gameState();
    assertGameState(actualGameStateHist, expectedGameState);

    // Button to exit history should be visible.
    const exitHistoryButton = fixture.nativeElement.querySelector('[data-testid="btn-exitHistory"]') as HTMLButtonElement;
    expect(exitHistoryButton, 'Exit history button must exist').not.toBeNullable();
    exitHistoryButton.click();
    await fixture.whenStable();

    // Make sure state of board on screen is correct after return from history.
    assertDomBoard(fixture, boardStr, true, 'After return from history'); // Check state of board in browser.

    // Now we check game state after returning from history.
    expectedGameState.statistics.moveCount = 5;
    expectedGameState.statistics.emptyCells = 8;
    expectedGameState.statistics.player1Score = 5;
    expectedGameState.statistics.player2Score = 3;
    expectedGameState.board.currPlayerIx = 1;
    expectedGameState.board.cells = structuredClone(expectedGameState.board.history.moves[0].cells);
    expectedGameState.view.viewMode = EnViewMode.CurrentBoard;
    expectedGameState.view.viewMove = -1;
    expectedGameState.view.cells = expectedGameState.board.cells;

    expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
    legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

    const actualGameState = gameStateService.gameState();
    assertGameState(actualGameState, expectedGameState);
  });
});
