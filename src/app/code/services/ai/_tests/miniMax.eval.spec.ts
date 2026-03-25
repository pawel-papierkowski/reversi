import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import { GameState } from '@/code/data/gameState';
import type { EvaluateArgs } from '@/code/data/aiState';

import { MiniMaxService } from '@/code/services/ai/miniMax.service';

import { genStartState, setCells, setBoard } from '@/code/services/gameState/gameState.test-setup';

describe('MiniMax evaluation', () => {
  let miniMaxService: MiniMaxService;

  beforeEach(async () => {
    miniMaxService = TestBed.inject(MiniMaxService);
  });

  //

  /**
   * Creates instance of MiniMaxArgs.
   * @param gameState Game state.
   * @param piece Piece.
   * @param isYou Is this you?
   * @returns Instance of MiniMaxArgs.
   */
  function setEvaluateArgs(gameState: GameState, piece: EnCellState, isYou: boolean, useWeights:boolean=true): EvaluateArgs {
    return {
      piece: piece,
      isYou: isYou,
      cells: gameState.board.cells,
      useWeights: useWeights,
    }
  }

  //

  describe('scoring for', () => {
    it('starting board', () => {
      const gameState = genStartState(4);

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 0; // everything sums up to 0
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('on edges', () => {
      const gameState = genStartState(6);
      setCells(gameState, EnCellState.B, [{x:0,y:2},{x:0,y:3},{x:2,y:5},{x:3,y:5}]);

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 40; // center sums up to 0, edges sum to 40
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('wipeout', () => {
      const gameState = genStartState(6);
      setCells(gameState, EnCellState.B, [{x:2,y:2},{x:2,y:3},{x:3,y:2},{x:3,y:3}]);

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = -4;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('empty board', () => {
      const gameState = genStartState(6);
      setCells(gameState, EnCellState.Empty, [{x:2,y:2},{x:2,y:3},{x:3,y:2},{x:3,y:3}]);

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 0;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });
  });

  describe('game position', () => {
    it('2 moves in', () => {
      const gameState = genStartState(6);
      setCells(gameState, EnCellState.B, [{x:2,y:1},{x:2,y:2}]); // emulate first move
      setCells(gameState, EnCellState.W, [{x:3,y:1},{x:3,y:2}]); // emulate second move

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 0; // uses weights, everything sums up to 0
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('early game', () => {
      const gameState = genStartState(8);
      setCells(gameState, EnCellState.B, [{x:5,y:4},{x:2,y:5},{x:5,y:6}]);
      setCells(gameState, EnCellState.W, [{x:3,y:5},{x:5,y:5},{x:6,y:6}]);
      // note these moves break symmetry, causing non-zero score

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 48; // uses weights
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('middle game', () => {
      const gameState = genStartState(8);
      const boardStr = "WB______"+
                       "_W______"+
                       "BBBBBB__"+
                       "BBWBBB__"+
                       "BWBBBBW_"+
                       "WWWWWW__"+
                       "__B_WBW_"+
                       "________";
      setBoard(gameState, boardStr);

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = -12; // uses weights
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('late game', () => {
      const gameState = genStartState(8);
      const boardStr = "__W_WWWW"+
                       "BWWWWWWW"+
                       "_WBBWWWW"+
                       "_WBBWWWW"+
                       "BWBBBWWB"+
                       "_BWBWBWW"+
                       "BBWWBB__"+
                       "_WWBBBB_";
      setBoard(gameState, boardStr);

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = -60; // uses weights
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('filled board', () => {
      const gameState = genStartState(8);
      const boardStr = "BBBWWWWW"+
                       "BBBWWBWW"+
                       "BWBBBWWW"+
                       "BBWWBWWB"+
                       "BBBWWBWB"+
                       "BWWWWWBB"+
                       "WBWWWBBB"+
                       "BWWWWWWW";
      setBoard(gameState, boardStr);

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = -50; // uses weights
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });
  });

  describe('different player handling', () => {
    it('corner for black and you are black', () => {
      const gameState = genStartState(6);
      const cells = gameState.board.cells;
      cells[0][0].state = EnCellState.B; // +100
      cells[1][0].state = EnCellState.W; // +20
      cells[2][0].state = EnCellState.W; // -10

      const args = setEvaluateArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 110;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('corner for black and you are white', () => {
      const gameState = genStartState(6);
      const cells = gameState.board.cells;
      cells[5][5].state = EnCellState.B; // +100
      cells[5][4].state = EnCellState.W; // +20
      cells[5][3].state = EnCellState.W; // -10

      const args = setEvaluateArgs(gameState, EnCellState.B, false);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = -110;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('corner for white and you are white', () => {
      const gameState = genStartState(6);
      const cells = gameState.board.cells;
      cells[5][5].state = EnCellState.B; // -100
      cells[4][5].state = EnCellState.W; // -20
      cells[3][5].state = EnCellState.W; // 10

      const args = setEvaluateArgs(gameState, EnCellState.W, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = -110;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('corner for white and you are black', () => {
      const gameState = genStartState(6);
      const cells = gameState.board.cells;
      cells[0][0].state = EnCellState.B; // -100
      cells[0][1].state = EnCellState.W; // -20
      cells[0][2].state = EnCellState.W; // 10

      const args = setEvaluateArgs(gameState, EnCellState.W, false);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 110;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });
  });
});
