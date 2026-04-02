import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import type { ReversiBoard } from '@/code/data/gameState';
import { genCoordNum } from "@/code/common/utils";

import { assertCells } from '@/code/services/gameState/gameState.test-setup';

import { MoveService } from '@/code/services/legalMove/move.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { DebugService } from '@/code/services/debug/debug.service';

/**
 * Testing of executeMoveCustom(). Checks:
 * - Undo data.
 * - Cells.
 * - Frontier.
 */
describe('MoveService', () => {
  let moveService: MoveService;
  let legalMoveService: LegalMoveService;
  let debugService: DebugService;

  beforeEach(async () => {
    moveService = TestBed.inject(MoveService);
    legalMoveService = TestBed.inject(LegalMoveService);
    debugService = TestBed.inject(DebugService);
  });

  /**
   * We check only stuff we care about in this test unit: cells and frontier.
   * @param actualBoard Actual board.
   * @param expectedBoard Expected board.
   */
  function assertBoardState(actualBoard: ReversiBoard, expectedBoard: ReversiBoard) {
    assertCells(actualBoard.cells, expectedBoard.cells, 'Board cells should be same');
    expect(actualBoard.frontier, 'Board frontier should be same').toEqual(expectedBoard.frontier);
  }

  //

  describe('execute move', () => {
    it('simple', () => {
      const actualGameState = debugService.genEmptyState(6);
      const boardStr = '______' +
                       '______' +
                       '__WB__' +
                       '__BW__' +
                       '______' +
                       '______';
      debugService.setBoard(actualGameState, boardStr, true, false);
      const expectedGameState = structuredClone(actualGameState);

      const legalMoves = legalMoveService.resolveMovesCustom(actualGameState.board.cells, actualGameState.board.frontier, EnCellState.B);
      const actualUndoData = moveService.executeMoveCustom(actualGameState.board.cells, actualGameState.board.frontier, 0, EnCellState.B, legalMoves[0], false, true);
      const expectedUndoData = {
        affectedCells: [
          { x: 2, y: 2, s: 3, w1: -1, w2: -1, },
          { x: 1, y: 2, s: 1, w1: -2, w2: -2, }
        ],
        affectedFrontierEntries: [
          genCoordNum(0,3,6),genCoordNum(0,2,6),genCoordNum(0,1,6)
        ]
      };
      expect(actualUndoData, 'Affected cells should be same').toEqual(expectedUndoData);

      const expectedBoardStr = '______' + // state of board after executing move
                               '______' +
                               '_BBB__' +
                               '__BW__' +
                               '______' +
                               '______';
      debugService.setBoard(expectedGameState, expectedBoardStr, false, false);
      expectedGameState.board.frontier = new Set([
        genCoordNum(0,3,6),genCoordNum(0,2,6),genCoordNum(0,1,6),
        genCoordNum(1,1,6),genCoordNum(2,1,6),genCoordNum(3,1,6),genCoordNum(4,1,6),
        genCoordNum(4,2,6),genCoordNum(1,3,6),genCoordNum(4,3,6),
        genCoordNum(1,4,6),genCoordNum(2,4,6),genCoordNum(3,4,6),genCoordNum(4,4,6),
      ]);
      assertBoardState(actualGameState.board, expectedGameState.board);
    });

    it('for three-direction flip', () => {
      const actualGameState = debugService.genEmptyState(6);
      const boardStr = 'BW_WWB' +
                       '__W___' +
                       '__W___' +
                       '__W___' +
                       '__W___' +
                       '__B___';
      debugService.setBoard(actualGameState, boardStr, true, false);
      const expectedGameState = structuredClone(actualGameState);

      const legalMoves = legalMoveService.resolveMovesCustom(actualGameState.board.cells, actualGameState.board.frontier, EnCellState.B);
      const actualUndoData = moveService.executeMoveCustom(actualGameState.board.cells, actualGameState.board.frontier, 0, EnCellState.B, legalMoves[0], false, true);
      const expectedUndoData = {
        affectedCells: [
          { x: 3, y: 0, s: 3, w1: 10, w2: 10, },
          { x: 4, y: 0, s: 3, w1: -20, w2: -20, },
          { x: 2, y: 1, s: 3, w1: -2, w2: -2, },
          { x: 2, y: 2, s: 3, w1: -1, w2: -1, },
          { x: 2, y: 3, s: 3, w1: -1, w2: -1, },
          { x: 2, y: 4, s: 3, w1: -2, w2: -2, },
          { x: 1, y: 0, s: 3, w1: -20, w2: -20, },
          { x: 2, y: 0, s: 1, w1: 10, w2: 10, },
        ],
        affectedFrontierEntries: [] // no frontier entries were added for this particular move
      };
      expect(actualUndoData, 'Affected cells should be same').toEqual(expectedUndoData);

      const expectedBoardStr = 'BBBBBB' + // state of board after executing move
                               '__B___' +
                               '__B___' +
                               '__B___' +
                               '__B___' +
                               '__B___';
      debugService.setBoard(expectedGameState, expectedBoardStr, false, false);
      expectedGameState.board.frontier = new Set([
        genCoordNum(0,1,6),genCoordNum(1,1,6),genCoordNum(3,1,6),genCoordNum(4,1,6),genCoordNum(5,1,6),
        genCoordNum(1,2,6),genCoordNum(1,3,6),genCoordNum(1,4,6),genCoordNum(1,5,6),
        genCoordNum(3,2,6),genCoordNum(3,3,6),genCoordNum(3,4,6),genCoordNum(3,5,6),
      ]);
      assertBoardState(actualGameState.board, expectedGameState.board);
    });
  });
});
