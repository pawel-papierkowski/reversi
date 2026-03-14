import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import type { GameHistoryEntry } from "@/code/data/gameState";
import { createCellFill, createCellFull } from "@/code/data/gameState";

import { assertGameState, genStartState, genEmptyState } from '@/code/services/gameState/gameState.test-setup';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { GameService } from '@/code/services/game/game.service';

describe('GameService', () => {
  let gameStateService: GameStateService;
  let legalMoveService: LegalMoveService;
  let gameService: GameService;

  beforeEach(async () => {
    gameStateService = TestBed.inject(GameStateService);
    legalMoveService = TestBed.inject(LegalMoveService);
    gameService = TestBed.inject(GameService);
    gameService.startGame();
  });

  //

  describe('execute move', () => {
    it('on starting board', () => {
      gameService.makeMove(2, 3);

      const actualGameState = gameStateService.gameState();
      const expectedGameState = genStartState(8);
      expectedGameState.statistics.moveCount = 1;
      expectedGameState.statistics.emptyCells = 59;
      expectedGameState.statistics.player1Score = 4;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.currPlayerIx = 1;
      expectedGameState.board.cells[2][3] = createCellFull(EnCellState.B, EnCellState.B); // move that black just made
      expectedGameState.board.cells[3][3] = createCellFill(EnCellState.B); // flipped white piece

      const historyEntry: GameHistoryEntry = {
        playerIx: 0,
        move: {x:2, y:3},
        cells: structuredClone(expectedGameState.board.cells)
      };
      expectedGameState.board.history.moves.push(historyEntry);

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.W);
      legalMoveService.debugShowMovesCustom(expectedGameState.board.cells, EnCellState.W, expectedGameState.board.legalMoves);

      assertGameState(actualGameState, expectedGameState);
    });
  });
});
