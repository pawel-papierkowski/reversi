import { Injectable, inject } from '@angular/core';

import { EnCellState, EnDir } from '@/code/data/enums';
import type { Coordinate, DirCoord, StateCoord } from '@/code/data/types';
import { aiProp } from '@/code/data/aiConst';
import type { Cell, ReversiMove } from "@/code/data/gameState";
import { genCoordNum } from "@/code/common/utils";

import { GameStateService } from '@/code/services/gameState/gameState.service';

/**
 * Move service.
 * Handle code related to making moves on Reversi board.
 */
@Injectable({providedIn: 'root'})
export class MoveService {
  private readonly gameStateService = inject(GameStateService);

  /**
   * Execute move for current game state. That means changing state of selected cell
   * and flipping any contiguous line of opposite pieces that touch this piece.
   * Frontier will be updated too. It also will affect weights if chosen difficulty allows it.
   * Note: code assumes this move is legal and valid.
   * @param move Move to execute.
   */
  public executeMove(move: ReversiMove) {
    const cells = this.gameStateService.gameState().board.cells;
    const frontier = this.gameStateService.gameState().board.frontier;
    const playerIx = this.gameStateService.getCurrPlayer().ix;
    const playerPiece = this.gameStateService.getCurrPlayer().piece;
    const dynamicWeights = this.gameStateService.gameState().ai.difficulty.dynamicWeights;
    this.executeMoveCustom(cells, frontier, playerIx, playerPiece, move, true, dynamicWeights);
  }

  /**
   * Execute move for current state of board. That means changing state of selected cell
   * and flipping any contiguous line of opposite pieces that touch this piece.
   * It also will affect weights if allowed.
   * Note: code assumes this move is legal and valid.
   * @param cells State of board.
   * @param frontier Frontier data.
   * @param playerIx Player index.
   * @param playerPiece Player piece.
   * @param legalMove Legal move to execute. Note it contains path.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @param canDynamicWeights If true, affect weights on board.
   * @returns Affected cells and affected frontier entries. Used for restoring state of board in MiniMax algo.
   */
  public executeMoveCustom(cells: Cell[][], frontier: Set<number>, playerIx: number, playerPiece: EnCellState, legalMove: ReversiMove, copy: boolean, canDynamicWeights: boolean):
    { affectedCells: StateCoord[], affectedFrontierEntries: number[] } {
    const affectedCells: StateCoord[] = [];
    // Note legalMove contains path, so we do not have to re-trace. Just use data present in legalMove.path.
    for (let i = 0; i < legalMove.path.length; i++) {
      const pathEntry = legalMove.path[i];
      const oldCell = this.setCell(cells, pathEntry.x, pathEntry.y, playerPiece, copy); // most important line of code in the game
      affectedCells.push(oldCell);
    }

    if (canDynamicWeights) this.affectWeightsCustom(cells, playerIx, legalMove, copy, affectedCells);
    const affectedFrontierEntries = this.updateFrontierAdd(cells, frontier, legalMove.x, legalMove.y);
    return { affectedCells: affectedCells, affectedFrontierEntries: affectedFrontierEntries };
  }

  /**
   * Set new cell state for given player.
   * @param cells State of board.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @param playerPiece Player piece.
   * @param copy If true, make copy of cell instead of changing cell values in-place.
   * @return Old state of cell.
   */
  private setCell(cells: Cell[][], x: number, y: number, playerPiece: EnCellState, copy: boolean): StateCoord {
    const cell = cells[x][y];
    const oldState = { x: x, y: y, s: cell.state, w1: cell.weight1, w2: cell.weight2 };
    cell.state = playerPiece;
    cell.potentialMove = EnCellState.Empty;
    // Update reference so cell notifiers (like cell field in cell.ts) can register change in cell.
    // Note it is not needed for MiniMax algorithm, as it makes only simulated moves, not real ones.
    // Use copy = true only for moves on actual board.
    if (copy) cells[x][y] = { ...cell };
    return oldState;
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Trace from given coordinates in given direction across board until you hit edge or cell that has
   * something else than piece of opposing player. If that cell has your piece, bingo. Move is valid.
   * @param cells State of board.
   * @param dirCoord Coordinates+direction to use.
   * @param playerPiece Piece of your player.
   * @param oppPlayerPiece Piece of opposing player.
   * @param path Array of coordinates to fill.
   * @returns True if legal move, otherwise false.
   */
  public trace(cells: Cell[][], dirCoord: DirCoord, playerPiece: EnCellState, oppPlayerPiece: EnCellState, path: DirCoord[]): boolean {
    const boardSize = cells.length;
    const startIdx = path.length;

    const dir = dirCoord.dir;
    const offX = this.dx[dirCoord.dir]; // Take advantage of fact single trace always goes in same direction.
    const offY = this.dy[dirCoord.dir];

    // The starting piece is already an opposing piece (checked before calling trace).
    // NOTE: origin point is NOT included in trace, it is added after everything at end.
    path.push({ x: dirCoord.x, y: dirCoord.y, dir: dir });

    let nx = dirCoord.x;
    let ny = dirCoord.y;

    while (true) {
      nx += offX;
      ny += offY;

      if (nx < 0 || nx >= boardSize || ny < 0 || ny >= boardSize) { // not inside board
        path.length = startIdx; // revert path
        return false;
      }

      const cell = cells[nx][ny];
      if (cell.state === playerPiece) {
        // Found piece of current player, that ends flipping and makes it legal move.
        return true;
      }

      if (cell.state !== oppPlayerPiece) {
        // Hit empty cell, that makes this trace invalid.
        path.length = startIdx; // revert path
        return false;
      }

      // Found piece of opposite player, add to array and continue.
      // This is piece that would be flipped.
      path.push({ x: nx, y: ny, dir: dir });
    }
  }

  /**
   * Check if given coordinates are inside board.
   * @param dirCoord Coordinates.
   * @param size Size of board.
   * @returns True if inside board, otherwise false.
   */
  public isInsideBoard(dirCoord: DirCoord, size: number): boolean {
    if (dirCoord.x < 0 || dirCoord.x >= size) return false;
    if (dirCoord.y < 0 || dirCoord.y >= size) return false;
    return true;
  }

  // //////////////////////////////////////////////////////////////////////////

  // Lookup table.
  public readonly dx = [ 0,  1, 1, 1, 0, -1, -1, -1]; // Offsets for N, NE, E, SE, S, SW, W, NW
  public readonly dy = [-1, -1, 0, 1, 1,  1,  0, -1];

  /**
   * Applies direction to X and Y coordinates.
   * Note YOU are responsible for checking if coordinates went out of bounds.
   * @param dirCoord Coordinates to modify in-place.
   */
  public applyDir(dirCoord: DirCoord) {
    dirCoord.x += this.dx[dirCoord.dir];
    dirCoord.y += this.dy[dirCoord.dir];
  }

  /**
   * Gets value of opposing piece.
   * @param state Piece value.
   * @returns Piece value for opponent.
   */
  public getOppPiece(state: EnCellState): EnCellState {
    return state === EnCellState.B ? EnCellState.W : EnCellState.B;
  }

  // //////////////////////////////////////////////////////////////////////////
  // WEIGHTS

  /**
   * Affect weights on custom board.
   * @param cells State of board.
   * @param playerIx Player index.
   * @param legalMove Legal move.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @param affectedCells Affected cells as array of coordinates and previous values.
   */
  private affectWeightsCustom(cells: Cell[][], playerIx: number, legalMove: ReversiMove, copy: boolean, affectedCells: StateCoord[]) {
    // Right now, we only change weights for corners.
    if (this.isCorner(legalMove, cells.length - 1)) this.affectCorners(cells, playerIx, legalMove, copy, affectedCells);
  }

  /**
   * Check if given move is corner.
   * @param legalMove Move to check.
   * @param maxCoord Maximum coordinate value.
   * @returns True if it is corner, otherwise false.
   */
  private isCorner(legalMove: ReversiMove, maxCoord: number): boolean {
    return (legalMove.x === 0 || legalMove.x === maxCoord) &&
           (legalMove.y === 0 || legalMove.y === maxCoord);
  }

  /**
   * Affect weights on corner.
   * @param cells State of board.
   * @param playerIx Player index.
   * @param legalMove Move.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @param affectedCells Affected cells as array of coordinates and previous values.
   */
  private affectCorners(cells: Cell[][], playerIx: number, legalMove: ReversiMove, copy: boolean, affectedCells: StateCoord[]) {
    const maxCoord = cells.length - 1;
    const coords: Coordinate[] = [];
    if (legalMove.x === 0 && legalMove.y === 0) {
      coords.push({ x: 1, y: 0 });
      coords.push({ x: 0, y: 1 });
      coords.push({ x: 1, y: 1 });
    } else if (legalMove.x === maxCoord && legalMove.y === 0) {
      coords.push({ x: maxCoord - 1, y: 0 });
      coords.push({ x: maxCoord, y: 1 });
      coords.push({ x: maxCoord - 1, y: 1 });
    } else if (legalMove.x === 0 && legalMove.y === maxCoord) {
      coords.push({ x: 1, y: maxCoord });
      coords.push({ x: 0, y: maxCoord - 1 });
      coords.push({ x: 1, y: maxCoord - 1 });
    } else if (legalMove.x === maxCoord && legalMove.y === maxCoord) {
      coords.push({ x: maxCoord - 1, y: maxCoord });
      coords.push({ x: maxCoord, y: maxCoord - 1 });
      coords.push({ x: maxCoord - 1, y: maxCoord - 1 });
    }

    this.affectCellWeights(cells, playerIx, coords, aiProp.weightData.friendlyCorner, copy, affectedCells);
  }

  /**
   * Set new weight value to weights in cells indicated by given array of coordinates.
   * @param cells State of board.
   * @param playerIx Player index.
   * @param coords Array of coordinates.
   * @param newWeightValue New weight value.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @param affectedCells Affected cells as array of coordinates and previous values.
   */
  private affectCellWeights(cells: Cell[][], playerIx: number, coords: Coordinate[], newWeightValue: number, copy: boolean, affectedCells: StateCoord[]) {
    for (let i = 0; i < coords.length; i++) {
      const coord = coords[i];
      const cell = cells[coord.x][coord.y];
      const oldState = { x: coord.x, y: coord.y, s: cell.state, w1: cell.weight1, w2: cell.weight2 };
      affectedCells.push(oldState);

      // update reference so cell notifiers (like cell field in cell.ts) can register change in cell
      if (copy) cells[coord.x][coord.y] = { ...cell };

      if (playerIx === 0) cells[coord.x][coord.y].weight1 = newWeightValue;
      else cells[coord.x][coord.y].weight2 = newWeightValue;
    }
  }

  // //////////////////////////////////////////////////////////////////////////
  // FRONTIER

  /**
   * Update frontier data: after addition of piece.
   * @param cells Board state.
   * @param frontier Frontier data.
   * @param x X coordinate of added piece.
   * @param y Y coordinate of added piece.
   * @returns Affected frontier entries.
   */
  public updateFrontierAdd(cells: Cell[][], frontier: Set<number>, x: number, y: number): number[] {
    const boardSize = cells.length;
    const affectedFrontierEntries: number[] = [];

    // First, we remove frontier entry where new piece was placed.
    frontier.delete(x * boardSize + y);

    // Now we need to add neccessary entries around newly placed piece.
    for (let dir = 0; dir < 8; dir++) { // EnDir.N to EnDir.NW
      const nx = x + this.dx[dir];
      const ny = y + this.dy[dir];

      if (nx < 0 || nx >= boardSize || ny < 0 || ny >= boardSize) continue; // not inside board
      if (cells[nx][ny].state !== EnCellState.Empty) continue; // must be empty cell
      const newFrontierEntry = nx * boardSize + ny;
      if (frontier.has(newFrontierEntry)) continue; // cannot be already present in frontier data

      frontier.add(newFrontierEntry);
      affectedFrontierEntries.push(newFrontierEntry);
    }

    return affectedFrontierEntries; // remember affected frontier entries for reversal in updateFrontierDel()
  }

  /**
   * Update frontier data: after removal of piece. Used in MiniMax as part of reverting of board state.
   * @param boardSize Board size.
   * @param frontier Frontier data.
   * @param affectedFrontierEntries Affected frontier entries.
   * @param legalMove Legal move.
   */
  public updateFrontierDel(boardSize: number, frontier: Set<number>, affectedFrontierEntries: number[], legalMove: ReversiMove) {
    // First, we add frontier entry where new piece was removed.
    frontier.add(genCoordNum(legalMove.x, legalMove.y, boardSize));

    // Now we need to remove unneccessary entries.
    for (const entry of affectedFrontierEntries) {
      frontier.delete(entry);
    }
  }
}
