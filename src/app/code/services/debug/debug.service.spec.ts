import { TestBed } from '@angular/core/testing';

import { EnCellState, EnMode, EnPlayerType } from '@/code/data/enums';

import { assertGameState } from '@/code/services/gameState/gameState.test-setup';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { GameService } from '@/code/services/game/game.service';
import { DebugService } from '@/code/services/debug/debug.service';

describe('DebugService', () => {
  let gameStateService: GameStateService;
  let legalMoveService: LegalMoveService;
  let gameService: GameService;
  let debugService: DebugService;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.

    gameStateService = TestBed.inject(GameStateService);
    legalMoveService = TestBed.inject(LegalMoveService);
    gameService = TestBed.inject(GameService);
    debugService = TestBed.inject(DebugService);
  });

  describe('manually change pieces on board', () => {
    it('nothing happens', () => {
      gameService.startGame();
      const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('set piece', () => {
      gameService.startGame();
      debugService.setPiece(0, 0, EnCellState.B);

      const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.statistics.emptyCells = 59;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 2;
      expectedGameState.board.cells[0][0].state = EnCellState.B;

      // This particular change does not affect available legal moves.
      //expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      //legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('set piece in place of existing piece', () => {
      gameService.startGame();
      debugService.setPiece(3, 3, EnCellState.B);

      const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.statistics.emptyCells = 60;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.cells[3][3].state = EnCellState.B;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('unset piece', () => {
      gameService.startGame();
      debugService.setPiece(3, 3, EnCellState.Empty); // white piece was here

      const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.statistics.emptyCells = 61;
      expectedGameState.statistics.player1Score = 2;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.cells[3][3].state = EnCellState.Empty;

      // This particular change does affect available legal moves.
      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('swap piece Empty->Black', () => {
      gameService.startGame();
      debugService.swapPiece(2, 3);

      const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.statistics.emptyCells = 59;
      expectedGameState.statistics.player1Score = 3;
      expectedGameState.statistics.player2Score = 2;
      expectedGameState.board.cells[2][3].state = EnCellState.B;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('swap piece Black->White', () => {
      gameService.startGame();
      debugService.swapPiece(4, 3);

      const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.statistics.emptyCells = 60;
      expectedGameState.statistics.player1Score = 1;
      expectedGameState.statistics.player2Score = 3;
      expectedGameState.board.cells[4][3].state = EnCellState.W;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('swap piece White->Empty', () => {
      gameService.startGame();
      debugService.swapPiece(4, 4);

      const expectedGameState = debugService.genStartState(8, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.statistics.emptyCells = 61;
      expectedGameState.statistics.player1Score = 2;
      expectedGameState.statistics.player2Score = 1;
      expectedGameState.board.cells[4][4].state = EnCellState.Empty;

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });

  describe('setBoard', () => {
    it('empty', () => {
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();
      const boardStr = "____"+
                       "____"+
                       "____"+
                       "____";
      debugService.setBoard(gameStateService.gameState(), boardStr, true);

      const expectedGameState = debugService.genEmptyState(4, EnPlayerType.Human, EnMode.HumanVsAi);
      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('custom manual', () => {
      gameService.startGame();
      const boardStr = "________"+
                       "________"+
                       "__BBBB__"+
                       "__WWWW__"+
                       "__BBBB__"+
                       "__WWWW__"+
                       "________"+
                       "________";
      debugService.setBoard(gameStateService.gameState(), boardStr, true);

      const expectedGameState = debugService.genEmptyState(8, EnPlayerType.Human, EnMode.HumanVsAi);
      expectedGameState.statistics.emptyCells = 48;
      expectedGameState.statistics.player1Score = 8;
      expectedGameState.statistics.player2Score = 8;
      // set up expected board fully manually
      expectedGameState.board.cells[2][2].state = EnCellState.B;
      expectedGameState.board.cells[3][2].state = EnCellState.B;
      expectedGameState.board.cells[4][2].state = EnCellState.B;
      expectedGameState.board.cells[5][2].state = EnCellState.B;
      expectedGameState.board.cells[2][3].state = EnCellState.W;
      expectedGameState.board.cells[3][3].state = EnCellState.W;
      expectedGameState.board.cells[4][3].state = EnCellState.W;
      expectedGameState.board.cells[5][3].state = EnCellState.W;
      expectedGameState.board.cells[2][4].state = EnCellState.B;
      expectedGameState.board.cells[3][4].state = EnCellState.B;
      expectedGameState.board.cells[4][4].state = EnCellState.B;
      expectedGameState.board.cells[5][4].state = EnCellState.B;
      expectedGameState.board.cells[2][5].state = EnCellState.W;
      expectedGameState.board.cells[3][5].state = EnCellState.W;
      expectedGameState.board.cells[4][5].state = EnCellState.W;
      expectedGameState.board.cells[5][5].state = EnCellState.W;
      expectedGameState.board.history.moves[0].cells = structuredClone(expectedGameState.board.cells);

      expectedGameState.board.legalMoves = legalMoveService.resolveMovesCustom(expectedGameState.board.cells, EnCellState.B);
      legalMoveService.showHintsCustom(expectedGameState.board.cells, EnCellState.B, expectedGameState.board.legalMoves);

      expectedGameState.board.frontier = [
        {x:1,y:1},{x:1,y:2},{x:1,y:3},{x:1,y:4},{x:1,y:5},{x:1,y:6}, // top of square
        {x:2,y:1},{x:2,y:6},{x:3,y:1},{x:3,y:6},{x:4,y:1},{x:4,y:6},{x:5,y:1},{x:5,y:6}, // both sides of square
        {x:6,y:1},{x:6,y:2},{x:6,y:3},{x:6,y:4},{x:6,y:5},{x:6,y:6}, // bottom of square
      ];

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });

    it('custom', () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsHuman;
      gameService.startGame();
      const boardStr = "________"+
                        "________"+
                        "________"+
                        "_WWWWWWB"+ // b4 - h4
                        "___BW___"+ // d5, e5
                        "________"+
                        "________"+
                        "________";
      debugService.setBoard(gameStateService.gameState(), boardStr, true);

      const expectedGameState = debugService.genEmptyState(8);
      debugService.setHistory(expectedGameState, 0, boardStr);

      // Check game state.
      expectedGameState.statistics.moveCount = 0; //1;
      expectedGameState.statistics.emptyCells = 55; //54;
      expectedGameState.statistics.player1Score = 2; //9;
      expectedGameState.statistics.player2Score = 7; //1;
      expectedGameState.board.currPlayerIx = 0; //1;
      expectedGameState.board.frontier = [
        {x:0,y:2},{x:0,y:3},{x:0,y:4}, //{x:0,y:2},{x:0,y:4},
        {x:1,y:2},{x:1,y:4},{x:2,y:2},{x:2,y:4},{x:2,y:5},
        {x:3,y:2},{x:3,y:5},{x:4,y:2},{x:4,y:5},{x:5,y:2},{x:5,y:4},{x:5,y:5},
        {x:6,y:2},{x:6,y:4},{x:7,y:2},{x:7,y:4},
      ];
      debugService.fillGameState(expectedGameState);

      const actualGameState = gameStateService.gameState();
      assertGameState(actualGameState, expectedGameState);
    });
  });
});
