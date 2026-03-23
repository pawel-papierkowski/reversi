import { TestBed } from '@angular/core/testing';

import { EnCellState } from '@/code/data/enums';
import { MiniMaxReq, MiniMaxResp } from '@/code/data/aiState';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { MiniMaxService } from '@/code/services/ai/miniMax.service';

import { setBoard } from '@/code/services/gameState/gameState.test-setup';

describe('MiniMaxService', () => {
  let gameStateService: GameStateService;
  let gameService: GameService;
  let legalMoveService: LegalMoveService;
  let miniMaxService: MiniMaxService;

  beforeEach(async () => {
    gameStateService = TestBed.inject(GameStateService);
    gameService = TestBed.inject(GameService);
    legalMoveService = TestBed.inject(LegalMoveService);
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
      // Note: 0 max depth means we are scoring for every black's legal move available at this
      // time without going deeper.
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -120, depth: 0, moves: [{x:0, y:1}]},
        {score: -120, depth: 0, moves: [{x:1, y:0}]},
        {score: -120, depth: 0, moves: [{x:2, y:3}]},
        {score: -120, depth: 0, moves: [{x:3, y:2}]},
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });

    it('1 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        piece: EnCellState.B,
        maxDepth: 1,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
      }
      // Note: 1 max depth means we are scoring for every black's legal move available at this
      // time, going one depth below (analyzing every legal move of whites in response).
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -120, depth: 1, moves: [{x:0, y:1},{x:0, y:0}]},
        {score: -120, depth: 1, moves: [{x:1, y:0},{x:0, y:0}]},
        {score: -120, depth: 1, moves: [{x:2, y:3},{x:3, y:3}]},
        {score: -120, depth: 1, moves: [{x:3, y:2},{x:3, y:3}]},
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });

    it('2 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        piece: EnCellState.B,
        maxDepth: 2,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -240, depth: 2, moves: [{x:0, y:1},{x:0, y:0},{x:3, y:2}]},
        {score: -240, depth: 2, moves: [{x:1, y:0},{x:0, y:0},{x:3, y:2}]},
        {score: -240, depth: 2, moves: [{x:2, y:3},{x:3, y:3},{x:3, y:2}]},
        {score: -240, depth: 2, moves: [{x:3, y:2},{x:3, y:3},{x:2, y:3}]},
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });

    it('3 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        piece: EnCellState.B,
        maxDepth: 3,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -80, depth: 3, moves: [{x:0, y:1},{x:0, y:0},{x:1, y:0},{x:2, y:0}]},
        {score: -80, depth: 3, moves: [{x:1, y:0},{x:0, y:0},{x:0, y:1},{x:2, y:0}]},
        {score: -80, depth: 3, moves: [{x:2, y:3},{x:3, y:3},{x:3, y:2},{x:3, y:1}]},
        {score: -80, depth: 3, moves: [{x:3, y:2},{x:3, y:3},{x:2, y:3},{x:3, y:1}]},
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });

    it('4 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        piece: EnCellState.B,
        maxDepth: 4,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -120, depth: 4, moves: [{x:0, y:1},{x:2, y:0},{x:3, y:3},{x:0, y:3},{x:3, y:1}]},
        {score: -120, depth: 4, moves: [{x:1, y:0},{x:0, y:2},{x:3, y:3},{x:3, y:0},{x:3, y:2}]},
        {score: -120, depth: 4, moves: [{x:2, y:3},{x:3, y:1},{x:3, y:0},{x:3, y:3},{x:1, y:0}]},
        {score: -120, depth: 4, moves: [{x:3, y:2},{x:1, y:3},{x:0, y:3},{x:3, y:3},{x:1, y:0}]},
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });

    it('5 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        piece: EnCellState.B,
        maxDepth: 5,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: 20, depth: 5, moves: [{x:0, y:1},{x:2, y:0},{x:3, y:1},{x:0, y:0},{x:1, y:0},{x:0, y:2}]},
        {score: 20, depth: 5, moves: [{x:1, y:0},{x:0, y:2},{x:1, y:3},{x:0, y:0},{x:0, y:1},{x:2, y:0}]},
        {score: 20, depth: 5, moves: [{x:2, y:3},{x:3, y:1},{x:2, y:0},{x:3, y:3},{x:3, y:2},{x:1, y:3}]},
        {score: 20, depth: 5, moves: [{x:3, y:2},{x:1, y:3},{x:0, y:2},{x:3, y:3},{x:2, y:3},{x:3, y:1}]},
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });
  });

  //

  describe('scoring results for specific state of board', () => {
    it('asymmetric starting point', () => {
      gameStateService.menuSettings().boardSize = 6; // 6x6, moves: e4 e5 e6 f6 b3 b2 c2 b4 a4
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "______"+
                       "_WB___"+
                       "_BBB__"+
                       "BBBBB_"+
                       "____W_"+
                       "____BW";
      setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        piece: EnCellState.W,
        maxDepth: 2,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: 4, depth: 2, moves: [{x:3, y:1},{x:2, y:0},{x:4, y:2}]},
        {score: 4, depth: 2, moves: [{x:4, y:2},{x:5, y:2},{x:3, y:1}]},
        {score: -14, depth: 2, moves: [{x:3, y:5},{x:0, y:0},{x:4, y:2}]},
        {score: -40, depth: 2, moves: [{x:1, y:4},{x:0, y:2},{x:5, y:3}]},
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });

    it('proper handling of single pass', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4, moves: b1 c1 d3
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "_BW_"+ // white a1 will cause pass for black
                       "_BB_"+
                       "_BBB"+
                       "____";
      setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        piece: EnCellState.W,
        maxDepth: 2,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: 180, depth: 2, moves: [{x:0, y:0},{x:-1, y:-1},{x:3, y:3}]}, // pass
        {score: 40, depth: 2, moves: [{x:2, y:3},{x:3, y:0},{x:0, y:0}]},
        {score: -120, depth: 2, moves: [{x:0, y:2},{x:0, y:0},{x:2, y:3}]},
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });

    it('double pass while there are still empty cells', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4, moves: c4 d4 d3 b4 a4 d2 d1 a2 pass
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "___B"+ // b1 will cause double pass
                       "WWBW"+
                       "_WWW"+
                       "BWWW";
      setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        piece: EnCellState.W,
        maxDepth: 2,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -360, depth: 2, moves: [{x:2, y:0},{x:1, y:0},{x:-1, y:-1}]},
        {score: -420, depth: 0, moves: [{x:1, y:0}]}, // double pass
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });
  });

    it('board almost completely filled up', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4, moves: b1 a1 a2 a3 a4 c4 d4 d3 d2 c1 d1
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "WWWB"+ // white b4 will end the game
                       "WWBB"+
                       "WBWB"+
                       "B_WB";
      setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        piece: EnCellState.W,
        maxDepth: 5,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -380, depth: 0, moves: [{x:1, y:3}]}, // end of game
      ]};
      expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
    });

  // TODO: testing for high difficulty level:
  // - scoring system change when board is mostly filled (over 3/4 of cells not empty)
  // - dynamic weighting tests
});
