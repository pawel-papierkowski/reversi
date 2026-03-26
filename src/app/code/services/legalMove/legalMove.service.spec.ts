import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import type { ReversiMove, GameState } from '@/code/data/gameState';

import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { DebugService } from '@/code/services/debug/debug.service';

describe('LegalMoveService', () => {
  let legalMoveService: LegalMoveService;
  let debugService: DebugService;

  beforeEach(async () => {
    legalMoveService = TestBed.inject(LegalMoveService);
    debugService = TestBed.inject(DebugService);
  });

  function assertLegalMoves(gameState: GameState, expectedLegalMoves : ReversiMove[], playerPiece: EnCellState) {
    const actualLegalMoves = legalMoveService.resolveMovesCustom(gameState.board.cells, playerPiece);
    expect(actualLegalMoves).toEqual(expectedLegalMoves);
  }

  //

  describe('find legal move(s)', () => {
    it('on starting board', () => {
      const gameState = debugService.genStartState(8);

      const expectedLegalMoves : ReversiMove[] = [
        { x:2, y:3 },
        { x:3, y:2 },
        { x:4, y:5 },
        { x:5, y:4 },
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });

    it('on board that has only one legal move available', () => {
      const gameState = debugService.genEmptyState(4);
      const boardStr = "____"+
                       "_BB_"+
                       "_BB_"+
                       "___W";
      debugService.setBoard(gameState, boardStr);

      const expectedLegalMoves : ReversiMove[] = [
        { x:0, y:0 },
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.W);
    });

    it('on edge of board', () => {
      const gameState = debugService.genEmptyState(8);
      const cells = gameState.board.cells;
      cells[0][0].state = EnCellState.B;
      cells[1][0].state = EnCellState.W;
      cells[0][1].state = EnCellState.W;

      const expectedLegalMoves : ReversiMove[] = [
        { x:0, y:2 },
        { x:2, y:0 },
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });
  });

  describe('does not find legal move', () => {
    it('on board with all pieces of one color', () => {
      const gameState = debugService.genEmptyState(4);
      const boardStr = "____"+
                       "_BB_"+
                       "_BB_"+
                       "____";
      debugService.setBoard(gameState, boardStr);

      const expectedLegalMoves : ReversiMove[] = [];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });

    it('when there is empty space between opposite piece and your piece', () => {
      const gameState = debugService.genEmptyState(4);
      const boardStr = "____"+
                       "B_W_"+ // B_WB is NOT correct move
                       "____"+
                       "____";
      debugService.setBoard(gameState, boardStr);

      const expectedLegalMoves : ReversiMove[] = [];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });
  });

  describe('find legal move(s) on specific board state', () => {
    it('when there are disjointed areas', () => {
      // Won't happen naturally, but we like to test it anyway.
      const gameState = debugService.genEmptyState(6);
      const boardStr = "WB____"+
                       "______"+
                       "______"+
                       "WBBBB_"+
                       "______"+
                       "______";
      debugService.setBoard(gameState, boardStr);

      const expectedLegalMoves : ReversiMove[] = [
        { x:2, y:0 },
        { x:5, y:3 },
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.W);
    });
  });
});
