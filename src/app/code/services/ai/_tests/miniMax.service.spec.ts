import { TestBed } from '@angular/core/testing';

import { EnCellState, EnScoringType } from '@/code/data/enums';
import { MiniMaxReq, MiniMaxResp } from '@/code/data/aiState';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { MiniMaxService } from '@/code/services/ai/miniMax.service';
import { DebugService } from '@/code/services/debug/debug.service';

import { assertMiniMaxResp } from '@/code/services/ai/_tests/ai.test-setup';

describe('MiniMaxService', () => {
  let gameStateService: GameStateService;
  let gameService: GameService;
  let legalMoveService: LegalMoveService;
  let miniMaxService: MiniMaxService;
  let debugService: DebugService;

  beforeEach(async () => {
    gameStateService = TestBed.inject(GameStateService);
    gameService = TestBed.inject(GameService);
    legalMoveService = TestBed.inject(LegalMoveService);
    miniMaxService = TestBed.inject(MiniMaxService);
    debugService = TestBed.inject(DebugService);

    // reset common stuff
    gameStateService.gameState().debugSettings.evaluateEveryStep = true;
  });

  //

  describe('scoring results for starting board', () => {
    it('0 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        playerIx: 0,
        piece: EnCellState.B,
        maxDepth: 0,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      // Note: 0 max depth means we are scoring for every black's legal move available at this
      // time without going deeper.
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -120, depth: 0, moves: [{x:0, y:1, s:-120}]},
        {score: -120, depth: 0, moves: [{x:1, y:0, s:-120}]},
        {score: -120, depth: 0, moves: [{x:2, y:3, s:-120}]},
        {score: -120, depth: 0, moves: [{x:3, y:2, s:-120}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('1 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        playerIx: 0,
        piece: EnCellState.B,
        maxDepth: 1,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      // Note: 1 max depth means we are scoring for every black's legal move available at this
      // time, going one depth below (analyzing every legal move of whites in response).
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -120, depth: 1, moves: [{x:0, y:1, s:-120},{x:0, y:0, s:-120}]},
        {score: -120, depth: 1, moves: [{x:1, y:0, s:-120},{x:0, y:0, s:-120}]},
        {score: -120, depth: 1, moves: [{x:2, y:3, s:-120},{x:3, y:3, s:-120}]},
        {score: -120, depth: 1, moves: [{x:3, y:2, s:-120},{x:3, y:3, s:-120}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('2 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        playerIx: 0,
        piece: EnCellState.B,
        maxDepth: 2,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -240, depth: 2, moves: [{x:0, y:1, s:-120},{x:0, y:0, s:-120},{x:3, y:2, s:-240}]},
        {score: -240, depth: 2, moves: [{x:1, y:0, s:-120},{x:0, y:0, s:-120},{x:3, y:2, s:-240}]},
        {score: -240, depth: 2, moves: [{x:2, y:3, s:-120},{x:3, y:3, s:-120},{x:3, y:2, s:-240}]},
        {score: -240, depth: 2, moves: [{x:3, y:2, s:-120},{x:3, y:3, s:-120},{x:2, y:3, s:-240}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('3 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        playerIx: 0,
        piece: EnCellState.B,
        maxDepth: 3,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -80, depth: 3, moves: [{x:0, y:1, s:-120},{x:0, y:0, s:-120},{x:1, y:0, s:-240},{x:2, y:0, s:-80}]},
        {score: -80, depth: 3, moves: [{x:1, y:0, s:-120},{x:0, y:0, s:-120},{x:0, y:1, s:-240},{x:2, y:0, s:-80}]},
        {score: -80, depth: 3, moves: [{x:2, y:3, s:-120},{x:3, y:3, s:-120},{x:3, y:2, s:-240},{x:3, y:1, s:-80}]},
        {score: -80, depth: 3, moves: [{x:3, y:2, s:-120},{x:3, y:3, s:-120},{x:2, y:3, s:-240},{x:3, y:1, s:-80}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('4 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        playerIx: 0,
        piece: EnCellState.B,
        maxDepth: 4,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -120, depth: 4, moves: [{x:0, y:1, s:-120},{x:2, y:0, s:0},{x:3, y:3, s:0},{x:0, y:3, s:0},{x:3, y:1, s:-120}]},
        {score: -120, depth: 4, moves: [{x:1, y:0, s:-120},{x:2, y:0, s:0},{x:3, y:3, s:0},{x:0, y:3, s:0},{x:0, y:2, s:-120}]},
        {score: -120, depth: 4, moves: [{x:2, y:3, s:-120},{x:3, y:1, s:0},{x:3, y:0, s:0},{x:3, y:3, s:0},{x:1, y:0, s:-120}]},
        {score: -120, depth: 4, moves: [{x:3, y:2, s:-120},{x:3, y:1, s:0},{x:0, y:0, s:0},{x:0, y:3, s:0},{x:0, y:2, s:-120}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('5 depth', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      const req: MiniMaxReq = {
        playerIx: 0,
        piece: EnCellState.B,
        maxDepth: 5,
        legalMoves: gameStateService.gameState().board.legalMoves,
        cells: gameStateService.gameState().board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: 20, depth: 5, moves: [{x:0, y:1, s:-120},{x:2, y:0, s:0},{x:3, y:1, s:-120},{x:0, y:0, s:-120},{x:1, y:0, s:-240},{x:0, y:2, s:20}]},
        {score: 20, depth: 5, moves: [{x:1, y:0, s:-120},{x:0, y:2, s:0},{x:1, y:3, s:-120},{x:0, y:0, s:-120},{x:0, y:1, s:-240},{x:2, y:0, s:20}]},
        {score: 20, depth: 5, moves: [{x:2, y:3, s:-120},{x:3, y:1, s:0},{x:2, y:0, s:-120},{x:3, y:3, s:-120},{x:3, y:2, s:-240},{x:1, y:3, s:20}]},
        {score: 20, depth: 5, moves: [{x:3, y:2, s:-120},{x:1, y:3, s:0},{x:0, y:2, s:-120},{x:3, y:3, s:-120},{x:2, y:3, s:-240},{x:3, y:1, s:20}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
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
      debugService.setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        playerIx: 1,
        piece: EnCellState.W,
        maxDepth: 2,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: 4,   depth: 2, moves: [{x:3, y:1, s:16},{x:2, y:0, s:10},{x:4, y:2, s:4}]},
        {score: 4,   depth: 2, moves: [{x:4, y:2, s:16},{x:5, y:2, s:10},{x:3, y:1, s:4}]},
        {score: -14, depth: 2, moves: [{x:3, y:5, s:-8},{x:0, y:0, s:-8},{x:4, y:2, s:-14}]},
        {score: -40, depth: 2, moves: [{x:1, y:4, s:-36},{x:0, y:2, s:-42},{x:5, y:3, s:-40}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('proper handling of single pass', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4, moves: b1 c1 d3
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "_BW_"+ // white a1 will cause pass for black
                       "_BB_"+
                       "_BBB"+
                       "____";
      debugService.setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        playerIx: 1,
        piece: EnCellState.W,
        maxDepth: 2,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: 180,  depth: 2, moves: [{x:0, y:0, s:280},{x:-1, y:-1, s:280},{x:3, y:3, s:180}]}, // pass
        {score: 40,   depth: 2, moves: [{x:2, y:3, s:0},{x:3, y:0, s:40},{x:0, y:0, s:40}]},
        {score: -120, depth: 2, moves: [{x:0, y:2, s:100},{x:0, y:0, s:100},{x:2, y:3, s:-120}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('double pass while there are still empty cells', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4, moves: c4 d4 d3 b4 a4 d2 d1 a2 pass
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "___B"+ // b1 will cause double pass
                       "WWBW"+
                       "_WWW"+
                       "BWWW";
      debugService.setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        playerIx: 1,
        piece: EnCellState.W,
        maxDepth: 2,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -360, depth: 2, moves: [{x:2, y:0, s:-420},{x:1, y:0, s:-360},{x:-1, y:-1, s:-360}]},
        {score: -420, depth: 0, moves: [{x:1, y:0, s:-420}]}, // double pass
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('board almost completely filled up', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4, moves: b1 a1 a2 a3 a4 c4 d4 d3 d2 c1 d1
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "WWWB"+ // white b4 will end the game
                       "WWBB"+
                       "WBWB"+
                       "B_WB";
      debugService.setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        playerIx: 1,
        piece: EnCellState.W,
        maxDepth: 5,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -380, depth: 0, moves: [{x:1, y:3, s:-380}]}, // end of game
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });
  });

  //

  describe('change in scoring system', () => {
    it('for weighted scoring', () => {
      gameStateService.menuSettings().boardSize = 6; // 6x6
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "WB____"+ // artificial state of board
                       "______"+ // it has two moves for white
                       "______"+ // one will flip one piece
                       "WBBBB_"+ // second will flip 4 pieces at once
                       "______"+
                       "______";
      debugService.setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        playerIx: 1,
        piece: EnCellState.W,
        maxDepth: 0,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}], // use weighted scoring
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: 134, depth: 0, moves: [{x:5, y:3, s:134}]},
        {score: 106, depth: 0, moves: [{x:2, y:0, s:106}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('for straight scoring', () => {
      // state of board same as in 'for weighted scoring'
      gameStateService.menuSettings().boardSize = 6; // 6x6
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "WB____"+ // artificial state of board
                       "______"+ // it has two moves for white
                       "______"+ // one will flip one piece
                       "WBBBB_"+ // second will flip 4 pieces at once
                       "______"+
                       "______";
      debugService.setBoard(gameState, boardStr);

      const req: MiniMaxReq = {
        playerIx: 1,
        piece: EnCellState.W,
        maxDepth: 0,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.W),
        cells: gameState.board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Straight, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: 6, depth: 0, moves: [{x:5, y:3, s:6}]},
        {score: 0, depth: 0, moves: [{x:2, y:0, s:0}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('for available moves scoring, starting board', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();
      const gameState = gameStateService.gameState();

      const req: MiniMaxReq = {
        playerIx: 0,
        piece: EnCellState.B,
        maxDepth: 3,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.B),
        cells: gameState.board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.AvailableMoves, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: -2, depth: 3, moves: [{x:0, y:1, s:4}, {x:2, y:0, s:-3}, {x:3, y:0, s:4}, {x:0, y:2, s:-2}]},
        {score: -2, depth: 3, moves: [{x:1, y:0, s:4}, {x:2, y:0, s:-3}, {x:3, y:0, s:4}, {x:0, y:2, s:-2}]},
        {score: -2, depth: 3, moves: [{x:2, y:3, s:4}, {x:3, y:3, s:-3}, {x:3, y:2, s:3}, {x:3, y:1, s:-2}]},
        {score: -2, depth: 3, moves: [{x:3, y:2, s:4}, {x:3, y:3, s:-3}, {x:2, y:3, s:3}, {x:3, y:1, s:-2}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });

    it('for available moves scoring, custom board', () => {
      gameStateService.menuSettings().boardSize = 6; // 6x6
      gameService.startGame();
      const gameState = gameStateService.gameState();
      const boardStr = "______"+
                       "__WW__"+
                       "__WW__"+
                       "__WW__"+
                       "__WW__"+
                       "___B__";
      debugService.setBoard(gameState, boardStr);
      // two moves available on this board for black: d1 (flips a lot of pieces in way that provides a lot of potential moves) and b4

      const req: MiniMaxReq = {
        playerIx: 0,
        piece: EnCellState.B,
        maxDepth: 2,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.B),
        cells: gameState.board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.AvailableMoves, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [
        {score: 5, depth: 2, moves: [{x:3, y:0, s:2}, {x:4, y:3, s:-6}, {x:1, y:1, s:5}]},
        {score: 3, depth: 2, moves: [{x:1, y:3, s:2}, {x:1, y:5, s:-5}, {x:4, y:3, s:3}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });
  });

  describe('other', () => {
    it('evaluateEveryStep = false', () => {
      gameStateService.gameState().debugSettings.evaluateEveryStep = false;
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();
      const gameState = gameStateService.gameState();

      const req: MiniMaxReq = {
        playerIx: 0,
        piece: EnCellState.B,
        maxDepth: 3,
        legalMoves: legalMoveService.resolveMovesCustom(gameState.board.cells, EnCellState.B),
        cells: gameState.board.cells,
        dynamicWeights: false,
        scoringSystems: [{type: EnScoringType.Weighted, weight: 1, threshold: -1}],
      }
      const actualResponse = miniMaxService.resolve(req);
      const expectedResponse: MiniMaxResp = { results: [ // s will be 0 everywhere, as evaluation happens only on terminal state
        {score: -80, depth: 3, moves: [{x:0, y:1, s:0}, {x:0, y:0, s:0}, {x:1, y:0, s:0}, {x:2, y:0, s:0}]},
        {score: -80, depth: 3, moves: [{x:1, y:0, s:0}, {x:0, y:0, s:0}, {x:0, y:1, s:0}, {x:2, y:0, s:0}]},
        {score: -80, depth: 3, moves: [{x:2, y:3, s:0}, {x:3, y:3, s:0}, {x:3, y:2, s:0}, {x:3, y:1, s:0}]},
        {score: -80, depth: 3, moves: [{x:3, y:2, s:0}, {x:3, y:3, s:0}, {x:2, y:3, s:0}, {x:3, y:1, s:0}]},
      ]};
      assertMiniMaxResp(actualResponse, expectedResponse);
    });
  });
});
