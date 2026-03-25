import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import type { ReversiMove, GameState } from '@/code/data/gameState';
import { createReversiMove } from '@/code/data/gameState';

import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';

import { genStartState, genEmptyState } from '@/code/services/gameState/gameState.test-setup';
import { setBoard } from '@/code/services/gameState/gameState.test-setup';

describe('LegalMoveService', () => {
  let legalMoveService: LegalMoveService;

  beforeEach(async () => {
    legalMoveService = TestBed.inject(LegalMoveService);
  });

  function assertLegalMoves(gameState: GameState, expectedLegalMoves : ReversiMove[], playerPiece: EnCellState) {
    const actualLegalMoves = legalMoveService.resolveMovesCustom(gameState.board.cells, playerPiece);
    expect(actualLegalMoves).toEqual(expectedLegalMoves);
  }

  //

  describe('find legal move(s)', () => {
    it('on starting board', () => {
      const gameState = genStartState(8);

      const expectedLegalMoves : ReversiMove[] = [
        createReversiMove(2, 3),
        createReversiMove(3, 2),
        createReversiMove(4, 5),
        createReversiMove(5, 4),
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });

    it('on board that has only one legal move available', () => {
      const gameState = genEmptyState(4);
      const boardStr = "____"+
                       "_BB_"+
                       "_BB_"+
                       "___W";
      setBoard(gameState, boardStr);

      const expectedLegalMoves : ReversiMove[] = [
        createReversiMove(0, 0),
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.W);
    });

    it('on edge of board', () => {
      const gameState = genEmptyState(8);
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
      const gameState = genEmptyState(4);
      const boardStr = "____"+
                       "_BB_"+
                       "_BB_"+
                       "____";
      setBoard(gameState, boardStr);

      const expectedLegalMoves : ReversiMove[] = [];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });

    it('when there is empty space between opposite piece and your piece', () => {
      const gameState = genEmptyState(4);
      const boardStr = "____"+
                       "B_W_"+ // B_WB is NOT correct move
                       "____"+
                       "____";
      setBoard(gameState, boardStr);

      const expectedLegalMoves : ReversiMove[] = [];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });
  });

  describe('find legal move(s) on specific board state', () => {
    it('when there are disjointed areas', () => {
      // Won't happen naturally, but we like to test it anyway.
      const gameState = genEmptyState(6);
      const boardStr = "WB____"+
                       "______"+
                       "______"+
                       "WBBBB_"+
                       "______"+
                       "______";
      setBoard(gameState, boardStr);

      const expectedLegalMoves : ReversiMove[] = [
        createReversiMove(2, 0),
        createReversiMove(5, 3),
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.W);
    });
  });
});
