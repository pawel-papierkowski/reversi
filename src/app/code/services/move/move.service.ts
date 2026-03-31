import { Injectable, inject } from '@angular/core';

import { EnCellState, EnDir } from '@/code/data/enums';
import type { Coordinate, DirCoord, StateCoord } from '@/code/data/types';
import { aiProp } from '@/code/data/aiConst';
import type { Cell, ReversiMove } from "@/code/data/gameState";

import { GameStateService } from '@/code/services/gameState/gameState.service';

/**
 * Move service.
 * Handle code related to making moves on Reversi board.
 */
@Injectable({providedIn: 'root'})
export class MoveService {
  private readonly gameStateService = inject(GameStateService);

  /**
   * Execute move for current state of board. That means changing state of selected cell
   * and flipping any contiguous line of opposite pieces that touch this piece.
   * It also will affect weights if chosen difficulty allows it.
   * Note: code assumes this move is legal. Check it before calling this function!
   * @param move Move to execute.
   */
  public executeMove(move: ReversiMove) {
    const cells = this.gameStateService.gameState().board.cells;
    const playerIx = this.gameStateService.getCurrPlayer().ix;
    const playerPiece = this.gameStateService.getCurrPlayer().piece;
    const dynamicWeights = this.gameStateService.gameState().ai.difficulty.dynamicWeights;
    this.executeMoveCustom(cells, playerIx, playerPiece, move, true, dynamicWeights);
  }

  /**
   * Execute move for current state of board. That means changing state of selected cell
   * and flipping any contiguous line of opposite pieces that touch this piece.
   * It also will affect weights if allowed.
   * Note: code assumes this move is legal and valid.
   * @param cells State of board.
   * @param playerIx Player index.
   * @param playerPiece Player piece.
   * @param legalMove Legal move to execute. Note it contains path.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @param canDynamicWeights If true, affect weights on board.
   * @returns Affected cells as array of coordinates and previous values. Used for restoring state of board in MiniMax algo.
   */
  public executeMoveCustom(cells: Cell[][], playerIx: number, playerPiece: EnCellState, legalMove: ReversiMove, copy: boolean, canDynamicWeights: boolean): StateCoord[] {
    const affectedCells: StateCoord[] = [];
    // Note legalMove contains path, so we do not have to re-trace. Just use data present in legalMove.path.
    for (const pathEntry of legalMove.path) {
      const oldCell = this.setCell(cells, pathEntry.x, pathEntry.y, playerPiece, copy); // most important line of code in the game
      affectedCells.push(oldCell);
    }

    if (canDynamicWeights) this.affectWeightsCustom(cells, playerIx, legalMove, copy, affectedCells);
    return affectedCells;
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
    const opposingPieces: DirCoord[] = [];
    // We always are one step away from origin point, so add it already.
    // NOTE: origin point is NOT included!
    opposingPieces.push({ x: dirCoord.x, y: dirCoord.y, dir: dirCoord.dir });
    // Take advantage of fact single trace always goes in same direction.
    const offX = this.dx[dirCoord.dir];
    const offY = this.dy[dirCoord.dir];

    do {
      dirCoord.x += offX; // move coordinates
      dirCoord.y += offY;

      if (!this.isInsideBoard(dirCoord, boardSize)) return false; // outside board, can't be valid move
      const cell = cells[dirCoord.x][dirCoord.y];
      if (cell.state !== playerPiece && cell.state !== oppPlayerPiece) return false; // can't be legal move!
      if (cell.state === oppPlayerPiece) {
        // Found piece of opposite player, add to array and continue.
        // This is piece that would be flipped.
        opposingPieces.push({ x: dirCoord.x, y: dirCoord.y, dir: dirCoord.dir });
        continue;
      }

      if (cell.state === playerPiece) {
        path.push(...opposingPieces);
        return true; // it is legal move!
      }
    } while (true);
  }

  /**
   * Check if given coordinates are inside board.
   * @param dirCoord Coordinates.
   * @param size Size of board.
   * @returns True if inside board, otherwise false.
   */
  public isInsideBoard(dirCoord : DirCoord, size: number): boolean {
    if (dirCoord.x < 0 || dirCoord.x >= size) return false;
    if (dirCoord.y < 0 || dirCoord.y >= size) return false;
    return true;
  }

  // //////////////////////////////////////////////////////////////////////////

  // Lookup table.
  private readonly dx = [ 0,  1, 1, 1, 0, -1, -1, -1]; // Offsets for N, NE, E, SE, S, SW, W, NW
  private readonly dy = [-1, -1, 0, 1, 1,  1,  0, -1];

  /**
   * Applies direction to X and Y coordinates.
   * Note YOU are responsible for checking if coordinates went out of bounds.
   * @param dirCoord Coordinates to modify in-place.
   */
  public applyDir(dirCoord : DirCoord) {
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
    if (this.isCorner(legalMove, cells.length-1)) this.affectCorners(cells, playerIx, legalMove, copy, affectedCells);
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
    const maxCoord = cells.length-1;
    const coords: Coordinate[] = [];
    if (legalMove.x === 0 && legalMove.y === 0) {
      coords.push({x:1, y:0});
      coords.push({x:0, y:1});
      coords.push({x:1, y:1});
    } else if (legalMove.x === maxCoord && legalMove.y === 0) {
      coords.push({x:maxCoord-1, y:0});
      coords.push({x:maxCoord, y:1});
      coords.push({x:maxCoord-1, y:1});
    } else if (legalMove.x === 0 && legalMove.y === maxCoord) {
      coords.push({x:1, y:maxCoord});
      coords.push({x:0, y:maxCoord-1});
      coords.push({x:1, y:maxCoord-1});
    } else if (legalMove.x === maxCoord && legalMove.y === maxCoord) {
      coords.push({x:maxCoord-1, y:maxCoord});
      coords.push({x:maxCoord, y:maxCoord-1});
      coords.push({x:maxCoord-1, y:maxCoord-1});
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
    for (const coord of coords) {
      const cell = cells[coord.x][coord.y];
      const oldState = { x: coord.x, y: coord.y, s: cell.state, w1: cell.weight1, w2: cell.weight2 };
      affectedCells.push(oldState);

      // update reference so cell notifiers (like cell field in cell.ts) can register change in cell
      if (copy) cells[coord.x][coord.y] = { ...cell };

      if (playerIx === 0) cells[coord.x][coord.y].weight1 = newWeightValue;
      else cells[coord.x][coord.y].weight2 = newWeightValue;
    }
  }
}
