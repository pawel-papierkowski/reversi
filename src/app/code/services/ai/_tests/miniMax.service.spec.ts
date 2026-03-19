import { TestBed } from '@angular/core/testing';

import { MiniMaxService } from '@/code/services/ai/miniMax.service';

import { genStartState } from '@/code/services/gameState/gameState.test-setup';

describe('MiniMaxService', () => {
  let miniMaxService: MiniMaxService;

  beforeEach(async () => {
    miniMaxService = TestBed.inject(MiniMaxService);
  });

  //

  describe('scoring results for empty board', () => {
    it('0 depth (scoring for this state of board only)', () => {
      //const gameState = genStartState(4);
      // TODO
    });
  });
});
