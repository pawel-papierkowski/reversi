import { TestBed } from '@angular/core/testing';

import type { ReversiMove, GameState } from '@/code/data/gameState';
import { createReversiMove } from '@/code/data/gameState';

import { genStartState, genEmptyState } from '@/code/services/gameState/gameState.test-setup';

import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { EnCellState } from '@/code/data/enums';

describe('LegalMoveService', () => {
  let legalMoveService: LegalMoveService;

  beforeEach(async () => {
    legalMoveService = TestBed.inject(LegalMoveService);
  });

  function assertLegalMoves(gameState: GameState, expectedLegalMoves : ReversiMove[], playerPiece: EnCellState) {
    const actualLegalMoves = legalMoveService.resolveCustom(gameState.board.cells, playerPiece);
    expect(actualLegalMoves).toEqual(expectedLegalMoves);

  }

  //

  describe('find legal move(s)', () => {
    it('on starting board', () => {
      const gameState = genStartState(null, 8);

      const expectedLegalMoves : ReversiMove[] = [
        createReversiMove(2, 3),
        createReversiMove(3, 2),
        createReversiMove(4, 5),
        createReversiMove(5, 4),
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });

    it('on board that has only one legal move available', () => {
      const gameState = genStartState(null, 8);
      const cells = gameState.board.cells;
      cells[3][3].state = EnCellState.B;
      cells[4][4].state = EnCellState.B;
      cells[5][5].state = EnCellState.W;

      const expectedLegalMoves : ReversiMove[] = [
        createReversiMove(2, 2),
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.W);
    });

    it('on edge of board', () => {
      const gameState = genEmptyState(null, 8);
      const cells = gameState.board.cells;
      cells[0][0].state = EnCellState.B;
      cells[1][0].state = EnCellState.W;
      cells[0][1].state = EnCellState.W;

      const expectedLegalMoves : ReversiMove[] = [
        createReversiMove(0, 2),
        createReversiMove(2, 0),
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });
  });

  describe('does not find legal move', () => {
    it('on board with all pieces of one color', () => {
      const gameState = genStartState(null, 8);
      const cells = gameState.board.cells;
      cells[3][3].state = EnCellState.B;
      cells[4][4].state = EnCellState.B;

      const expectedLegalMoves : ReversiMove[] = [];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });

    it('when there is empty space between opposite piece and your piece', () => {
      const gameState = genEmptyState(null, 8);
      const cells = gameState.board.cells;
      cells[1][1].state = EnCellState.W;
      cells[4][4].state = EnCellState.B;

      const expectedLegalMoves : ReversiMove[] = [];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });
  });
});
