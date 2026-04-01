import { Injectable, inject } from '@angular/core';

import { EnCellState, EnDir, EnGameStatus, EnMode, EnPlayerType } from '@/code/data/enums';
import type { Coordinate, WeightCoord } from "@/code/data/types";
import { weights } from '@/code/data/aiConst';
import type { GameState, Cell, GameHistoryEntry } from "@/code/data/gameState";
import { createGameState } from "@/code/data/gameState";

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';

/**
 * Debug service. Used for debug and unit tests only.
 * NEVER use it in production code!
 */
@Injectable({providedIn: 'root'})
export class DebugService {
  private readonly gameStateService = inject(GameStateService);
  private readonly gameService = inject(GameService);
  private readonly legalMoveService = inject(LegalMoveService);

  /**
   * Generate game state after start of game, but with empty board.
   * @param boardSize Size of board.
   */
  public genEmptyState(boardSize: number): GameState {
    const startGameState = this.genState(boardSize);
    this.genDataFromBoard(startGameState);
    return startGameState;
  }

  /**
   * Generate game state after start of game. Four pieces in center of board are already placed.
   * @param boardSize Size of board.
   */
  public genStartState(boardSize: number, whoFirst: EnPlayerType=EnPlayerType.Human, mode: EnMode=EnMode.HumanVsHuman): GameState {
    const startGameState = this.genState(boardSize);

    const ix = boardSize/2 - 1; // for size 8 it will be 3
    // manually set pieces already on board in center
    startGameState.board.cells[ix][ix].state = EnCellState.W;
    startGameState.board.cells[ix+1][ix].state = EnCellState.B;
    startGameState.board.cells[ix][ix+1].state = EnCellState.B;
    startGameState.board.cells[ix+1][ix+1].state = EnCellState.W;

    // manually set potential moves for black where needed
    startGameState.board.cells[ix-1][ix].potentialMove = EnCellState.B;
    startGameState.board.cells[ix][ix-1].potentialMove = EnCellState.B;
    startGameState.board.cells[ix+1][ix+2].potentialMove = EnCellState.B;
    startGameState.board.cells[ix+2][ix+1].potentialMove = EnCellState.B;

    // manually set legal moves for this board
    const currWeights = weights[boardSize];
    startGameState.board.legalMoves = [
      { x:ix-1, y:ix,   score: currWeights[ix-1][ix],   path: [{dir:EnDir.E, x: ix, y: ix},    {dir:EnDir.N, x:ix-1, y:ix}] },
      { x:ix,   y:ix-1, score: currWeights[ix][ix-1],   path: [{dir:EnDir.S, x: ix, y: ix},    {dir:EnDir.N, x:ix, y:ix-1}] },
      { x:ix+1, y:ix+2, score: currWeights[ix+1][ix+2], path: [{dir:EnDir.N, x: ix+1, y: ix+1},{dir:EnDir.N, x:ix+1, y:ix+2}] },
      { x:ix+2, y:ix+1, score: currWeights[ix+2][ix+1], path: [{dir:EnDir.W, x: ix+1, y: ix+1},{dir:EnDir.N, x:ix+2, y:ix+1}] },
    ];

    // manually set statistics
    startGameState.statistics.emptyCells = boardSize*boardSize - 4;
    startGameState.statistics.player1Score = 2;
    startGameState.statistics.player2Score = 2;

    this.genDataFromBoard(startGameState);
    startGameState.settings.whoFirst = whoFirst;
    this.setupMode(startGameState, mode);
    return startGameState;
  }

  private setupMode(gameState: GameState, mode: EnMode) {
    gameState.settings.mode = mode;
    switch (mode) {
      case EnMode.HumanVsHuman:
        gameState.players[0].type = EnPlayerType.Human;
        gameState.players[1].type = EnPlayerType.Human;
        break;
      case EnMode.HumanVsAi:
        if (gameState.settings.whoFirst === EnPlayerType.Human) {
          gameState.players[0].type = EnPlayerType.Human;
          gameState.players[1].type = EnPlayerType.AI;
        } else {
          gameState.players[0].type = EnPlayerType.AI;
          gameState.players[1].type = EnPlayerType.Human;
        }
        break;
      case EnMode.AiVsAi:
        gameState.players[0].type = EnPlayerType.AI;
        gameState.players[1].type = EnPlayerType.AI;
        break;
    }
  }

  //

  /**
   * Generate default game state with empty board.
   */
  private genState(boardSize: number): GameState {
    const startGameState = createGameState();
    // Mutate only the fields that change after "Start Game" is clicked.
    startGameState.settings.boardSize = boardSize;
    startGameState.board.status = EnGameStatus.InProgress;
    startGameState.board.cells = this.gameStateService.genCellsEmpty(boardSize);
    return startGameState;
  }

  /**
   * Call it after modifications to board.
   * @param gameState Generated game state.
   */
  private genDataFromBoard(gameState: GameState) {
    gameState.statistics.round = 1;

    // Should have first entry (initial board state) already in history.
    const historyEntry: GameHistoryEntry = {
      ix: 0,
      num: 0,
      playerIx: -1,
      move: null,
      cells: structuredClone(gameState.board.cells),
    };
    this.clearPotentialMoves(gameState, historyEntry.cells);
    gameState.board.history.moves.push(historyEntry);

    // Game view should be set.
    gameState.view.cells = gameState.board.cells;
  }

  private clearPotentialMoves(startGameState: GameState, cells: Cell[][])  {
    const boardSize = startGameState.settings.boardSize;
    for (let x=0; x<boardSize; x++) {
      for (let y=0; y<boardSize; y++) {
        cells[x][y].potentialMove = EnCellState.Empty;
      }
    }
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Fill certain parts of game state based on other data in game state.
   * In particular, it expects history to be properly filled.
   * @param gameState Game state.
   */
  public fillGameState(gameState: GameState) {
    gameState.board.cells = structuredClone(gameState.board.history.moves[0].cells);
    gameState.view.cells = gameState.board.cells;

    const piece = gameState.board.currPlayerIx == 0 ? EnCellState.B : EnCellState.W;
    gameState.board.legalMoves = this.legalMoveService.resolveMovesCustom(gameState.board.cells, piece);
    this.legalMoveService.showHintsCustom(gameState.board.cells, piece, gameState.board.legalMoves);
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Set pieces on board based on boardStr that contains human-readable state of board.
   * @param gameState Game state.
   * @param boardStr Board as string. B is black, W is white, _ is empty cell.
   * @param resolvePotentialMoves If true, resolve potential moves for this board.
   */
  public setBoard(gameState: GameState, boardStr:string, resolvePotentialMoves: boolean=false) {
    const size = Math.sqrt(boardStr.length);
    if (!Number.isInteger(size)) throw new Error(`Board string length ${boardStr.length} is not a perfect square.`);
    const boardSize = gameState.settings.boardSize;
    if (size !== boardSize) throw new Error(`Size of board from boardStr (${size}) does not match game board data (${boardSize}).`);

    const cells = gameState.board.cells;
    let ix = 0;
    while (ix < boardStr.length) {
      const char = boardStr[ix];
      const state = this.char2state(char);

      const y = Math.floor(ix/boardSize);
      const x = ix - y*boardSize;
      cells[x][y].state = state;
      ix++;
    }

    if (resolvePotentialMoves) {
      const piece = gameState.players[gameState.board.currPlayerIx].piece;
      gameState.board.legalMoves = this.legalMoveService.resolveMovesCustom(gameState.board.cells, piece);
      this.legalMoveService.showHintsCustom(gameState.board.cells, piece, gameState.board.legalMoves);
    }
  }

  /**
   * Converts character to cell state. Unknown character is considered empty cell.
   * @param char Character representing cell state.
   * @returns Enum for cell state.
   */
  private char2state(char: string): EnCellState  {
    if (char === '_') return EnCellState.Empty;
    if (char === 'B') return EnCellState.B;
    if (char === 'W') return EnCellState.W;
    return EnCellState.Empty;
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Add move to history entry. Note it also affects main board.
   * @param playerIx Player index.
   * @param movesAny First entry is actual move, others are flipped pieces. Empty string/array means no change to board (pass).
   * @param weightChanges If present, it is array of weights to change.
   * @returns Moves as array of coordinates.
   */
  public addToHistory(gameState: GameState, playerIx: number, movesAny: Coordinate[]|string, weightChanges:WeightCoord[]=[]): {x:number, y: number}[] {
    let moves: Coordinate[] = [];
    if (typeof movesAny === 'string') { // first convert to array of coordinates if needed
      moves = this.movesStrToMovesCoord(movesAny.trim());
    }

    if (moves.length > 0) { // change state of board
      const piece = playerIx === 0 ? EnCellState.B: EnCellState.W;
      for (let i=0; i<moves.length; i++) {
        const move = moves[i];
        gameState.board.cells[move.x][move.y].state = piece;
      }
    }

    if (weightChanges.length > 0) { // change weights
      for (let i=0; i<weightChanges.length; i++) {
        const weightChange = weightChanges[i];
        const cell = gameState.board.cells[weightChange.x][weightChange.y];
        if (playerIx == 0) cell.weight1 = weightChange.w;
        else cell.weight2 = weightChange.w;
      }
    }

    // actually add to history
    const nextMoveNum = gameState.board.history.moves.length;
    const historyEntry: GameHistoryEntry = {
      ix: 0,
      num: nextMoveNum,
      playerIx: playerIx,
      move: moves.length === 0 ? null : { x: moves[0].x, y: moves[0].y },
      cells: structuredClone(gameState.board.cells)
    };
    this.clearPotentialMoves(gameState, historyEntry.cells);
    // ensure latest history entry is first on list
    gameState.board.history.moves.unshift(historyEntry);
    // update rest of history to reflect correct index
    for (let ix=0; ix<nextMoveNum+1; ix++) {
      gameState.board.history.moves[ix].ix = ix;
    }

    return moves;
  }

  /**
   * Convert moves as string to moves as array of coordinates.
   * String contains move sequence using standard grid coordinates
   * (columns are a, b, c... and rows are 1, 2, 3...).
   * Example of movesStr: "d5 e3 a1".
   * Expected result: [{3, 4}, {4, 2}, {0, 0}]
   *
   * @param moves String containing moves in standard grid coordinates.
   * @returns Moves as array of coordinates (zero-based).
   */
  private movesStrToMovesCoord(movesStr: string): Coordinate[] {
    if (!movesStr || movesStr === '') return []; // pass

    const base = 'a'.charCodeAt(0);
    return movesStr.split(' ').map(move => {
      const x = move.charCodeAt(0) - base;
      const y = parseInt(move.substring(1)) - 1;
      return { x, y };
    });
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Manually set cell state. Updates potential moves and scoring. Player stays same.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @param newState New state of cell.
   */
  public setPiece(x: number, y: number, newState: EnCellState) {
    const cell = this.gameStateService.gameState().board.cells[x][y];
    const oldState = cell.state;
    if (oldState === newState) return;

    cell.state = newState;
    // no need to set cell.potentialMove, updateSideData() recalculates them all anyway
    this.gameService.updateSideData();
  }

  /**
   * Manually swap cell state: Empty->Black->White->Empty. Updates potential moves and scoring.
   * Player stays same.
   * @param x X coordinate.
   * @param y Y coordinate.
   */
  public swapPiece(x: number, y: number) {
    const cell = this.gameStateService.gameState().board.cells[x][y];

    switch (cell.state) {
      case EnCellState.Empty: cell.state = EnCellState.B; break;
      case EnCellState.B: cell.state = EnCellState.W; break;
      case EnCellState.W: cell.state = EnCellState.Empty; break;
      default: break;
    }

    this.gameService.updateSideData();
  }

  /**
   * Set cells on board for given player.
   * @param gameState Game state.
   * @param piece Piece.
   * @param coords Array of coordinates to set.
   */
  public setCells(gameState: GameState, piece: EnCellState, coords:Coordinate[]) {
    const cells = gameState.board.cells;
    for (const coord of coords) {
      cells[coord.x][coord.y].state = piece;
    }
  }
}
