import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import { MiniMaxReq, MiniMaxResp } from '@/code/data/aiState';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';
import { MiniMaxService } from '@/code/services/ai/miniMax.service';

describe('MiniMaxService', () => {
  let gameStateService: GameStateService;
  let gameService: GameService;
  let miniMaxService: MiniMaxService;

  beforeEach(async () => {
    gameStateService = TestBed.inject(GameStateService);
    gameService = TestBed.inject(GameService);
    miniMaxService = TestBed.inject(MiniMaxService);
  });

  //

  describe('scoring results for starting board', () => {
    it('0 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        piece: EnCellState.B,
        maxDepth: 0,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
      }
      // Notes:
      // - 0 max depth means we are scoring for each of black's legal move available at this time.
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -120, depth: 0, moves: [{x:0, y:1}]},
        {score: -120, depth: 0, moves: [{x:1, y:0}]},
        {score: -120, depth: 0, moves: [{x:2, y:3}]},
        {score: -120, depth: 0, moves: [{x:3, y:2}]},
      ]};
      // TODO check why -120 and not any other result, most likely -70
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });
  });
});
