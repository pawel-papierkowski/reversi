import { TestBed } from '@angular/core/testing';

import { EnCellState, EnDir } from '@/code/data/enums';
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
        { x:2, y:3, score: -1, path: [{dir:EnDir.E, x:3, y:3},{dir:EnDir.N, x:2, y:3}] },
        { x:3, y:2, score: -1, path: [{dir:EnDir.S, x:3, y:3},{dir:EnDir.N, x:3, y:2}] },
        { x:4, y:5, score: -1, path: [{dir:EnDir.N, x:4, y:4},{dir:EnDir.N, x:4, y:5}] },
        { x:5, y:4, score: -1, path: [{dir:EnDir.W, x:4, y:4},{dir:EnDir.N, x:5, y:4}] },
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });

    it('on board that has only one legal move available', () => {
      const gameState = debugService.genEmptyState(4);
      const boardStr = "____"+
                       "_BB_"+
                       "_BB_"+
                       "___W";
      debugService.setBoard(gameState, boardStr, true, false);

      const expectedLegalMoves : ReversiMove[] = [
        { x:0, y:0, score: 100, path: [{dir:EnDir.SE, x:1, y:1},{dir:EnDir.SE, x:2, y:2},{dir:EnDir.N, x:0, y:0}] },
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.W);
    });

    it('on edge of board', () => {
      const gameState = debugService.genEmptyState(6);
      const boardStr = "BW____"+
                       "W_____"+
                       "______"+
                       "______"+
                       "______"+
                       "______";
      debugService.setBoard(gameState, boardStr, true, false);

      const expectedLegalMoves : ReversiMove[] = [
        { x:0, y:2, score: 10, path: [{dir:EnDir.N, x: 0, y: 1},{dir:EnDir.N, x:0, y:2}] },
        { x:2, y:0, score: 10, path: [{dir:EnDir.W, x: 1, y: 0},{dir:EnDir.N, x:2, y:0}] },
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });

    it('with different move scoring', () => {
      const gameState = debugService.genEmptyState(4);
      const boardStr = "_WB_"+
                       "____"+
                       "BW_W"+
                       "___B";
      debugService.setBoard(gameState, boardStr, true, false);

      const expectedLegalMoves : ReversiMove[] = [
        { x:0, y:0, score: 100, path: [{dir:EnDir.E, x: 1, y: 0},{dir:EnDir.N, x:0, y:0}] },
        { x:3, y:1, score: -20, path: [{dir:EnDir.S, x: 3, y: 2},{dir:EnDir.N, x:3, y:1}] },
        { x:2, y:2, score: -50, path: [{dir:EnDir.W, x: 1, y: 2},{dir:EnDir.N, x:2, y:2}] },
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
      debugService.setBoard(gameState, boardStr, true, false);

      const expectedLegalMoves : ReversiMove[] = [];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });

    it('when there is empty space between opposite piece and your piece', () => {
      const gameState = debugService.genEmptyState(4);
      const boardStr = "____"+
                       "B_W_"+ // B_WB is NOT correct move
                       "____"+
                       "____";
      debugService.setBoard(gameState, boardStr, true, false);

      const expectedLegalMoves : ReversiMove[] = [];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.B);
    });
  });

  describe('find legal move(s) on specific board state', () => {
    it('when there are multiple traces', () => {
      const gameState = debugService.genEmptyState(4);
      const boardStr = "W__W"+
                       "_B_B"+
                       "__BB"+
                       "WBB_";
      debugService.setBoard(gameState, boardStr, true, false);

      const expectedLegalMoves : ReversiMove[] = [
        { x:3, y:3, score: 100, path: [{dir:EnDir.N, x:3, y:2},{dir:EnDir.N, x:3, y:1}, // all three traces
                                       {dir:EnDir.W, x:2, y:3},{dir:EnDir.W, x:1, y:3},
                                       {dir:EnDir.NW, x:2, y:2},{dir:EnDir.NW, x:1, y:1},
                                       {dir:EnDir.N, x:3, y:3}] }, // origin point
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.W);
    });

    it('when there are disjointed areas', () => {
      const gameState = debugService.genEmptyState(6);
      const boardStr = "WB____"+
                       "______"+
                       "______"+
                       "WBBBB_"+
                       "______"+
                       "______";
      debugService.setBoard(gameState, boardStr, true, false);

      const expectedLegalMoves : ReversiMove[] = [
        { x:2, y:0, score: 10, path: [{dir:EnDir.W, x:1, y:0},{dir:EnDir.N, x:2, y:0}] },
        { x:5, y:3, score: 10, path: [{dir:EnDir.W, x:4, y:3},{dir:EnDir.W, x:3, y:3},{dir:EnDir.W, x:2, y:3},{dir:EnDir.W, x:1, y:3},{dir:EnDir.N, x:5, y:3}] },
      ];
      assertLegalMoves(gameState, expectedLegalMoves, EnCellState.W);
    });
  });
});
