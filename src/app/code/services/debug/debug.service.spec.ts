import { TestBed } from '@angular/core/testing';

import { EnCellState, EnMode, EnPlayerType } from '@/code/data/enums';

import { assertGameState } from '@/code/services/gameState/gameState.test-setup';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { GameService } from '@/code/services/game/game.service';
import { DebugService } from '@/code/services/debug/debug.service';

describe('DebugService', () => {
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

  it('nothing happens', () => {
    gameService.startGame();
    const actualGameState = gameStateService.gameState();
    const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
    assertGameState(actualGameState, expectedGameState);
  });

  it('set piece', () => {
    gameService.startGame();
    debugService.setPiece(0, 0, EnCellState.B);

    const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
    expectedGameState.statistics.emptyCells = 59;
    expectedGameState.statistics.player1Score = 3;
    expectedGameState.statistics.player2Score = 2;
    expectedGameState.board.cells[0][0].state = EnCellState.B;

    // This particular change does not affect available legal moves.
    //expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
    //legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

    const actualGameState = gameStateService.gameState();
    assertGameState(actualGameState, expectedGameState);
  });

  it('unset piece', () => {
    gameService.startGame();
    debugService.setPiece(3, 3, EnCellState.Empty); // white piece was here

    const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
    expectedGameState.statistics.emptyCells = 61;
    expectedGameState.statistics.player1Score = 2;
    expectedGameState.statistics.player2Score = 1;
    expectedGameState.board.cells[3][3].state = EnCellState.Empty;

    // This particular change does affect available legal moves.
    expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
    legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

    const actualGameState = gameStateService.gameState();
    assertGameState(actualGameState, expectedGameState);
  });

  it('swap piece Empty->Black', () => {
    gameService.startGame();
    debugService.swapPiece(2, 3);

    const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
    expectedGameState.statistics.emptyCells = 59;
    expectedGameState.statistics.player1Score = 3;
    expectedGameState.statistics.player2Score = 2;
    expectedGameState.board.cells[2][3].state = EnCellState.B;

    expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
    legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

    const actualGameState = gameStateService.gameState();
    assertGameState(actualGameState, expectedGameState);
  });

  it('swap piece Black->White', () => {
    gameService.startGame();
    debugService.swapPiece(4, 3);

    const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
    expectedGameState.statistics.emptyCells = 60;
    expectedGameState.statistics.player1Score = 1;
    expectedGameState.statistics.player2Score = 3;
    expectedGameState.board.cells[4][3].state = EnCellState.W;

    expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
    legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

    const actualGameState = gameStateService.gameState();
    assertGameState(actualGameState, expectedGameState);
  });

  it('swap piece White->Empty', () => {
    gameService.startGame();
    debugService.swapPiece(4, 4);

    const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
    expectedGameState.statistics.emptyCells = 61;
    expectedGameState.statistics.player1Score = 2;
    expectedGameState.statistics.player2Score = 1;
    expectedGameState.board.cells[4][4].state = EnCellState.Empty;

    expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
    legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

    const actualGameState = gameStateService.gameState();
    assertGameState(actualGameState, expectedGameState);
  });
});
