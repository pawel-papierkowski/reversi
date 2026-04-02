import { Injectable, inject } from '@angular/core';

import { EnCellState, EnDir, EnGameStatus, EnMode, EnPlayerType } from '@/code/data/enums';
import type { Coordinate, WeightCoord, DirCoord } from "@/code/data/types";
import { weights } from '@/code/data/aiConst';
import type { GameState, Cell, GameHistoryEntry } from "@/code/data/gameState";
import { createGameState } from "@/code/data/gameState";
import { genCoordNum } from "@/code/common/utils";

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';
import { MoveService } from '@/code/services/legalMove/move.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { _ } from '@ngx-translate/core';

/**
 * Debug service. Used for debug and unit tests only.
 * NEVER use it in production code!
 */
@Injectable({providedIn: 'root'})
export class DebugService {
  private readonly gameStateService = inject(GameStateService);
  private readonly gameService = inject(GameService);
  private readonly moveService = inject(MoveService);
  private readonly legalMoveService = inject(LegalMoveService);

  /**
   * Generate game state after start of game, but with empty board.
   * @param boardSize Size of board.
   * @param whoFirst Who first.
   * @param mode Mode.
   */
  public genEmptyState(boardSize: number, whoFirst: EnPlayerType=EnPlayerType.Human, mode: EnMode=EnMode.HumanVsHuman): GameState {
    const startGameState = this.genState(boardSize); // empty board as base

    this.genStatistics(startGameState, boardSize, true);

    this.genDataFromBoard(startGameState);
    startGameState.settings.whoFirst = whoFirst;
    this.setupMode(startGameState, mode);
    return startGameState;
  }

  /**
   * Generate game state after start of game. Four pieces in center of board are already placed.
   * @param boardSize Size of board.
   * @param whoFirst Who first.
   * @param mode Mode.
   */
  public genStartState(boardSize: number, whoFirst: EnPlayerType=EnPlayerType.Human, mode: EnMode=EnMode.HumanVsHuman): GameState {
    const startGameState = this.genState(boardSize); // empty board as base

    const ix = boardSize/2 - 1; // for size 8 it will be 3
    this.genStartPieces(startGameState, ix);
    this.genStartFrontier(startGameState, ix, boardSize);
    this.genStartMoves(startGameState, ix, boardSize);
    this.genStatistics(startGameState, boardSize, false);

    this.genDataFromBoard(startGameState);
    startGameState.settings.whoFirst = whoFirst;
    this.setupMode(startGameState, mode);
    return startGameState;
  }

  //

  /**
   * Manually set pieces already on board in center.
   * @param gameState Game state to modify.
   * @param ix Top left corner of initial 4 pieces on board.
   */
  private genStartPieces(gameState: GameState, ix: number) {
    gameState.board.cells[ix][ix].state = EnCellState.W;
    gameState.board.cells[ix+1][ix].state = EnCellState.B;
    gameState.board.cells[ix][ix+1].state = EnCellState.B;
    gameState.board.cells[ix+1][ix+1].state = EnCellState.W;
  }

  /**
   * Manually set frontier entries.
   * @param cells Board state.
   */
  private genStartFrontier(gameState: GameState, ix: number, boardSize: number) {
    const frontier: Set<number> = new Set([
      genCoordNum(ix-1, ix-1, boardSize), // top left corner
      genCoordNum(ix,   ix-1, boardSize),
      genCoordNum(ix-1, ix,   boardSize),
      genCoordNum(ix+1, ix-1, boardSize), // top right corner
      genCoordNum(ix+2, ix-1, boardSize),
      genCoordNum(ix+2, ix,   boardSize),
      genCoordNum(ix-1, ix+1, boardSize), // bottom left corner
      genCoordNum(ix-1, ix+2, boardSize),
      genCoordNum(ix,   ix+2, boardSize),
      genCoordNum(ix+2, ix+2, boardSize), // bottom right corner
      genCoordNum(ix+2, ix+1, boardSize),
      genCoordNum(ix+1, ix+2, boardSize)]);
    gameState.board.frontier = frontier;
  }

  /**
   * Manually set potential/legal moves for given board.
   * @param gameState Game state to modify.
   * @param ix Top left corner of initial 4 pieces on board.
   * @param boardSize Board size.
   */
  private genStartMoves(gameState: GameState, ix: number, boardSize: number) {
    // manually set potential moves for black where needed
    gameState.board.cells[ix-1][ix].potentialMove = EnCellState.B;
    gameState.board.cells[ix][ix-1].potentialMove = EnCellState.B;
    gameState.board.cells[ix+1][ix+2].potentialMove = EnCellState.B;
    gameState.board.cells[ix+2][ix+1].potentialMove = EnCellState.B;

    // manually set legal moves for this board
    const currWeights = weights[boardSize];
    gameState.board.legalMoves = [
      { x:ix-1, y:ix,   score: currWeights[ix-1][ix],   path: [{dir:EnDir.E, x: ix, y: ix},    {dir:EnDir.N, x:ix-1, y:ix}] },
      { x:ix,   y:ix-1, score: currWeights[ix][ix-1],   path: [{dir:EnDir.S, x: ix, y: ix},    {dir:EnDir.N, x:ix, y:ix-1}] },
      { x:ix+1, y:ix+2, score: currWeights[ix+1][ix+2], path: [{dir:EnDir.N, x: ix+1, y: ix+1},{dir:EnDir.N, x:ix+1, y:ix+2}] },
      { x:ix+2, y:ix+1, score: currWeights[ix+2][ix+1], path: [{dir:EnDir.W, x: ix+1, y: ix+1},{dir:EnDir.N, x:ix+2, y:ix+1}] },
    ];
  }

  /**
   * Manually set statistics.
   * @param gameState Game state to modify.
   */
  private genStatistics(gameState: GameState, boardSize: number, empty: boolean) {
    gameState.statistics.emptyCells = boardSize**2;
    if (!empty) {
      gameState.statistics.emptyCells -= 4;
      gameState.statistics.player1Score = 2;
      gameState.statistics.player2Score = 2;
    }
  }

  //

  /**
   * Generate default game state with empty board.
   * @param boardSize Board size.
   * @returns New game state.
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
    this.genInitialHistoryEntry(gameState);

    // Game view should be set.
    gameState.view.cells = gameState.board.cells;
  }

  private genInitialHistoryEntry(gameState: GameState) {
    gameState.board.history.moves = []; // reset

    const historyEntry: GameHistoryEntry = {
      ix: 0,
      num: 0,
      playerIx: -1,
      move: null,
      cells: structuredClone(gameState.board.cells),
    };
    this.legalMoveService.clearPotentialMoves(historyEntry.cells);
    gameState.board.history.moves.push(historyEntry);
  }

  /**
   * Set up stuff that depends on mode.
   * @param gameState Game state to modify.
   * @param mode Mode.
   */
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
   * Generate frontier from scratch.
   * @param cells Board state.
   * @returns Generated frontier entries.
   */
  public genFrontier(cells: Cell[][]): Set<number> {
    const frontier: Set<number> = new Set();
    const boardSize = cells.length;

    for (let x=0; x<boardSize; x++) {
      for (let y=0; y<boardSize; y++) {
        if (!this.canBeFrontierCell(cells, x, y)) continue;
        const frontierNumber = genCoordNum(x, y, boardSize);
        frontier.add(frontierNumber);
      }
    }

    return frontier;
  }

  /**
   * Check if given cell and its surroundings make this cell eligible for frontier.
   * @param cells Board state.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @returns True if cell with these coordinates is eligible for frontier, otherwise false.
   */
  private canBeFrontierCell(cells: Cell[][], x: number, y: number): boolean {
    if (cells[x][y].state !== EnCellState.Empty) return false;

    let dirCoord : DirCoord = { dir: EnDir.N, x: x, y: y }; // create object only once, we will reuse it
    for (let dir = EnDir.N; dir <= EnDir.NW; dir++) {
      dirCoord.dir = dir;
      dirCoord.x = x;
      dirCoord.y = y;
      this.moveService.applyDir(dirCoord); // move dirCoord in given direction by one cell
      if (this.isNeighborFrontier(cells, dirCoord)) return true;
    }
    return false;
  }

  /**
   * Check if given neighbor cell contains black or white piece.
   * @param cells Board state.
   * @param dirCoord Coordinates of neighbor cell.
   * @returns True if neighbor cell has black or white piece, otherwise false.
   */
  private isNeighborFrontier(cells: Cell[][], dirCoord : DirCoord): boolean {
    const size = cells.length;
    if (dirCoord.x < 0 || dirCoord.x >= size || dirCoord.y < 0 || dirCoord.y >= size) return false; // must be inside board
    // That cell must be neighbor of at least one black or white piece.
    const cell = cells[dirCoord.x][dirCoord.y];
    return cell.state === EnCellState.B || cell.state === EnCellState.W;
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Fill certain parts of game state based on other data in game state.
   * In particular, it expects history to be properly filled.
   * @param gameState Game state.
   */
  public fillGameState(gameState: GameState) {
     // first entry in history.moves array is state of last board (order is from newest board to oldest board)
    gameState.board.cells = structuredClone(gameState.board.history.moves[0].cells);
    gameState.view.cells = gameState.board.cells;

    const piece = gameState.board.currPlayerIx === 0 ? EnCellState.B : EnCellState.W;
    gameState.board.legalMoves = this.legalMoveService.resolveMovesCustom(gameState.board.cells, gameState.board.frontier, piece);
    this.legalMoveService.showHintsCustom(gameState.board.cells, piece, gameState.board.legalMoves);
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Set pieces on board and related data based on boardStr that contains human-readable state of board.
   * Note: after this call you need to get clone of game state for assertions. Example:
   * > const boardStr = "...";
   * > debugService.setBoard(gameStateService.gameState(), boardStr, true);
   * > const expectedGameState = structuredClone(gameStateService.gameState());
   *
   * This will allow you verify changes to board correctly.
   * @param gameState Game state.
   * @param boardStr Board as string. B is black, W is white, _ is empty cell.
   * @param resolveFrontier If true, resolve frontier for this board.
   * @param resolvePotentialMoves If true, resolve potential moves for this board.
   */
  public setBoard(gameState: GameState, boardStr:string, resolveFrontier: boolean, resolvePotentialMoves: boolean) {
    const cells = gameState.board.cells;
    this.setCellsFromStr(cells, boardStr);

    if (resolveFrontier) gameState.board.frontier = this.genFrontier(cells);
    this.gameStateService.recalcScoringCustom(cells, gameState.statistics);
    this.genInitialHistoryEntry(gameState);

    if (resolvePotentialMoves) {
      const piece = gameState.players[gameState.board.currPlayerIx].piece;
      gameState.board.legalMoves = this.legalMoveService.resolveMovesCustom(gameState.board.cells, gameState.board.frontier, piece);
      this.legalMoveService.showHintsCustom(gameState.board.cells, piece, gameState.board.legalMoves);
    }
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Add move to history entry. Note it also affects main board.
   * @param gameState Game state.
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

      // change frontier (we test frontier changes separately)
      this.moveService.updateFrontierAdd(gameState.board.cells, gameState.board.frontier, moves[0].x, moves[0].y);
    }

    if (weightChanges.length > 0) { // change weights
      for (let i=0; i<weightChanges.length; i++) {
        const weightChange = weightChanges[i];
        const cell = gameState.board.cells[weightChange.x][weightChange.y];
        if (playerIx === 0) cell.weight1 = weightChange.w;
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
    this.legalMoveService.clearPotentialMoves(historyEntry.cells);
    // ensure latest history entry is first on list
    gameState.board.history.moves.unshift(historyEntry);
    // update rest of history to reflect correct index
    for (let ix=0; ix<nextMoveNum+1; ix++) {
      gameState.board.history.moves[ix].ix = ix;
    }

    return moves;
  }

  /**
   * Manually set indicated history entry.
   * @param gameState Game state.
   * @param entryIx Index of history entry.
   * @param boardStr Board as string. B is black, W is white, _ is empty cell.
   */
  public setHistory(gameState: GameState, entryIx: number, boardStr:string) {
    this.setCellsFromStr(gameState.board.history.moves[entryIx].cells, boardStr);
  }

  //

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

  /**
   * Set cells of board from human-readable string.
   * @param cells Given board to modify.
   * @param boardStr Board as string. B is black, W is white, _ is empty cell.
   */
  private setCellsFromStr(cells: Cell[][], boardStr:string) {
    const size = Math.sqrt(boardStr.length);
    if (!Number.isInteger(size)) throw new Error(`Board string length ${boardStr.length} is not a perfect square.`);
    const boardSize = cells.length;
    if (size !== boardSize) throw new Error(`Size of board from boardStr (${size}) does not match game board data (${boardSize}).`);

    let ix = 0;
    while (ix < boardStr.length) {
      const char = boardStr[ix];
      const state = this.char2state(char);

      const y = Math.floor(ix/boardSize);
      const x = ix - y*boardSize;
      cells[x][y].state = state;
      ix++;
    }
  }

  /**
   * Converts character to cell state. Unknown character is considered empty cell.
   * @param char Character representing cell state.
   * @returns Enum for cell state.
   */
  private char2state(char: string): EnCellState  {
    //if (char === '_') return EnCellState.Empty;
    if (char === 'B') return EnCellState.B;
    if (char === 'W') return EnCellState.W;
    return EnCellState.Empty;
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
   * Set cells on board for given player. Note it does not affect anything else!
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
