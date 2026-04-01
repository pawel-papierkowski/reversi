import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import type { ReversiBoard } from "@/code/data/gameState";

import { assertCells } from '@/code/services/gameState/gameState.test-setup';

import { MoveService } from '@/code/services/legalMove/move.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { DebugService } from '@/code/services/debug/debug.service';

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
   * We check only stuff we care about: cells and frontier.
  * @param actualBoard Actual board.
  * @param expectedBoard Expected board.
   */
  function assertBoardState(actualBoard: ReversiBoard, expectedBoard: ReversiBoard) {
    assertCells(actualBoard.cells, expectedBoard.cells, 'Board cells should be same');
    expect(actualBoard.frontier, 'Board frontier should be same').toEqual(expectedBoard.frontier);
  }

  //

  describe('execute move', () => {
    it('on custom board', () => {
      const actualGameState = debugService.genEmptyState(6);
      const boardStr = "BW_WWB"+
                       "__W___"+
                       "__W___"+
                       "__W___"+
                       "__W___"+
                       "__B___";
      debugService.setBoard(actualGameState, boardStr);
      const expectedGameState = structuredClone(actualGameState);

      const legalMoves = legalMoveService.resolveMovesCustom(actualGameState.board.cells, EnCellState.B);
      const actualAffectedCells = moveService.executeMoveCustom(actualGameState.board.cells, 0, EnCellState.B, legalMoves[0], false, true);

      const expectedBoardStr = "BBBBBB"+
                               "__B___"+
                               "__B___"+
                               "__B___"+
                               "__B___"+
                               "__B___";
      debugService.setBoard(expectedGameState, expectedBoardStr);
      assertBoardState(actualGameState.board, expectedGameState.board);
    });
  });

});
