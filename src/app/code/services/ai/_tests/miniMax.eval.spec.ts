import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import { GameState } from '@/code/data/gameState';
import type { MiniMaxArgs } from '@/code/data/aiState';
import { createMiniMaxArgs } from '@/code/data/aiState';

import { MiniMaxService } from '@/code/services/ai/miniMax.service';

import { genStartState } from '@/code/services/gameState/gameState.test-setup';

describe('MiniMax evaluation', () => {
  let miniMaxService: MiniMaxService;

  beforeEach(async () => {
    miniMaxService = TestBed.inject(MiniMaxService);
  });

  //

  function setMiniMaxArgs(gameState: GameState, piece: EnCellState, isYou: boolean): MiniMaxArgs {
    return {
      ...createMiniMaxArgs(), // some fields do not matter for evaluator
      piece: piece,
      isYou: isYou,
      cells: gameState.board.cells,
    }
  }

  //

  describe('scoring for', () => {
    it('starting board', () => {
      const gameState = genStartState(4);

      const args: MiniMaxArgs = setMiniMaxArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 0;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    it('2 moves in', () => {
      const gameState = genStartState(6);
      const cells = gameState.board.cells;
      cells[2][1].state = EnCellState.B; // emulate first move
      cells[2][2].state = EnCellState.B;
      cells[3][1].state = EnCellState.W; // emulate second move
      cells[3][2].state = EnCellState.W;

      const args: MiniMaxArgs = setMiniMaxArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 0;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    // TODO more eval checks:
    // - on edge away from corners
    // - wipeout (only one color)
  });

  describe('game position', () => {
    it('early game', () => {
      const gameState = genStartState(8);
      // TODO fill board some more and finish this test

      const args: MiniMaxArgs = setMiniMaxArgs(gameState, EnCellState.B, true);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 0;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });

    // TODO
    // - early game position (only few moves)
    // - middle game position (half of cells empty)
    // - late game position (few cells empty): note it should use basic scoring instead of weights
    // - filled board (zero cells empty): note it should use basic scoring instead of weights
  });

  describe('player handling', () => {
    it('corner for black and you are black', () => {
      const gameState = genStartState(6);
      const cells = gameState.board.cells;
      cells[0][0].state = EnCellState.B; // +100
      cells[1][0].state = EnCellState.W; // +20
      cells[2][0].state = EnCellState.W; // -10

      const args: MiniMaxArgs = setMiniMaxArgs(gameState, EnCellState.B, true);
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

      const args: MiniMaxArgs = setMiniMaxArgs(gameState, EnCellState.B, false);
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

      const args: MiniMaxArgs = setMiniMaxArgs(gameState, EnCellState.W, true);
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

      const args: MiniMaxArgs = setMiniMaxArgs(gameState, EnCellState.W, false);
      const actualScore = miniMaxService.evaluate(args);
      const expectedScore = 110;
      expect(actualScore, 'Score should be same').toEqual(expectedScore);
    });
  });
});
