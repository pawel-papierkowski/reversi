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
   * Note: code assumes this move is legal. Check it before calling this function!
   * @param cells State of board.
   * @param playerIx Player index.
   * @param playerPiece Player piece.
   * @param move Move to execute.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @param canDynamicWeights If true, affect weights on board.
   * @returns Affected cells as array of coordinates and previous values. Used for restoring state of board in MiniMax algo.
   */
  public executeMoveCustom(cells: Cell[][], playerIx: number, playerPiece: EnCellState, move: ReversiMove, copy: boolean, canDynamicWeights: boolean): StateCoord[] {
    const affectedCells: StateCoord[] = [];
    const oppPlayerPiece = this.getOppPiece(playerPiece);
    const oldCell = this.setCell(cells, move.x, move.y, playerPiece, copy);
    affectedCells.push(oldCell);

    const potentialMoves = this.resolvePotentialMoves(cells, move.x, move.y, oppPlayerPiece);
    for (let i=0; i<potentialMoves.length; i++) {
      const potentialMove = potentialMoves[i];
      this.tryFlipInDirection(cells, potentialMove, playerPiece, oppPlayerPiece, copy, affectedCells);
    }

    if (canDynamicWeights) this.affectWeightsCustom(cells, playerIx, move, copy, affectedCells);
    return affectedCells;
  }

  /**
   * Try to flip pieces in given direction for given coordinates.
   * This is done in two phases:
   * - First we trace until we hit another your player piece. If that fails, we abort.
   * - Now we flip all opposing pieces detected in trace.
   * @param cells State of board.
   * @param potentialMove Direction and coordinates to use.
   * @param playerPiece Piece of your player.
   * @param oppPlayerPiece Piece of opposing player.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @param affectedCells Affected cells as array of coordinates and previous values.
   */
  private tryFlipInDirection(cells: Cell[][], potentialMove: DirCoord, playerPiece: EnCellState, oppPlayerPiece: EnCellState, copy: boolean, affectedCells: StateCoord[]) {
    const opposingPieces: DirCoord[] = this.trace(cells, potentialMove, playerPiece, oppPlayerPiece);
    if (opposingPieces.length === 0) return; // nothing to do in this direction

    for (let i=0; i<opposingPieces.length; i++) { // flip them all
      const opposingPiece = opposingPieces[i];
      const oldCell = this.setCell(cells, opposingPiece.x, opposingPiece.y, playerPiece, copy); // most important line of code in the game
      affectedCells.push(oldCell);
    }
  }

  /**
   * Set new cell state for given player.
   * @param cells State of board.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @param playerPiece Player piece.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @return Old state of cell.
   */
  private setCell(cells: Cell[][], x: number, y: number, playerPiece: EnCellState, copy: boolean): StateCoord {
    const cell = cells[x][y];
    const oldState = { x: x, y: y, s: cell.state, w: [...cell.weights] };
    cell.state = playerPiece;
    cell.potentialMove = EnCellState.Empty;
    // Update reference so cell notifiers (like cell field in cell.ts) can register change in cell.
    // Note it is not needed for MiniMax algorithm, as it makes only simulated moves, not real ones.
    // Use copy = true only for moves on actual board.
    if (copy) cells[x][y] = { ...cell };
    return oldState;
  }

  //

  /**
   * Resolve potential moves around selected cell.
   * Note you will need to cast trace out of them to ensure this potential move is in fact legal move.
   * @param cells State of board.
   * @param x X coordinate of cell.
   * @param y Y coordinate of cell.
   * @param oppPlayerPiece Piece of opposing player.
   * @returns Array of offsets.
   */
  public resolvePotentialMoves(cells: Cell[][], x: number, y: number, oppPlayerPiece: EnCellState): DirCoord[] {
    const potentialMoves : DirCoord[] = [];
    // Find out all directions around given cell.
    // Already exclude coordinates out of range or containing something else than piece of opposite color.
    for (let dir = EnDir.N; dir <= EnDir.NW; dir++) {
      let dirCoord : DirCoord = { dir: dir, x: x, y: y };
      this.applyDir(dirCoord); // move dirCoord in given direction by one cell
      if (this.canUsePotentialMove(cells, dirCoord, oppPlayerPiece)) potentialMoves.push(dirCoord);
    }
    return potentialMoves;
  }

  /**
   * Check if can use coordinates (starting point for tracing) of potential move. Conditions:
   * - X and Y cannot be outside range.
   * - Cell must contain piece for opposing player.
   * @param cells State of board.
   * @param dirCoord Coordinates to use.
   * @param oppPlayerPiece Piece of opposing player.
   * @returns True if can use given coordinates, otherwise false.
   */
  private canUsePotentialMove(cells: Cell[][], dirCoord : DirCoord, oppPlayerPiece: EnCellState) : boolean {
    const size = cells.length;
    if (!this.isInsideBoard(dirCoord, size)) return false;
    const cell = cells[dirCoord.x][dirCoord.y];
    return cell.state === oppPlayerPiece;
  }

  //

  /**
   * Trace from given coordinates in given direction across board until you hit edge or cell that has
   * something else than piece of opposing player. If that cell has your piece, bingo. Move is valid.
   * @param cells State of board.
   * @param dirCoord Coordinates+direction to use.
   * @param playerPiece Piece of your player.
   * @param oppPlayerPiece Piece of opposing player.
   * @returns Array of coordinates where opposing pieces are present. If empty, this is not legal move.
   */
  public trace(cells: Cell[][], dirCoord: DirCoord, playerPiece: EnCellState, oppPlayerPiece: EnCellState): DirCoord[] {
    const boardSize = cells.length;
    const opposingPieces: DirCoord[] = [];
    // we always are one step away from origin point
    opposingPieces.push({ x: dirCoord.x, y: dirCoord.y, dir: dirCoord.dir });

    do {
      this.applyDir(dirCoord); // move coordinates
      if (!this.isInsideBoard(dirCoord, boardSize)) return []; // hit edge of board, can't be valid move
      const cell = cells[dirCoord.x][dirCoord.y];
      if (cell.state !== playerPiece && cell.state !== oppPlayerPiece) return []; // can't be legal move!
      if (cell.state === oppPlayerPiece) {
        // found piece of opposite player, add to array and continue
        opposingPieces.push({ x: dirCoord.x, y: dirCoord.y, dir: dirCoord.dir });
        continue;
      }
      if (cell.state === playerPiece) return opposingPieces; // it is legal move!
    } while (true);
  }

  /**
   * Check if given coordinates are inside board.
   * @param dirCoord Coordinates.
   * @param size Size of board.
   * @returns True if inside board, otherwise false.
   */
  private isInsideBoard(dirCoord : DirCoord, size: number): boolean {
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
  private applyDir(dirCoord : DirCoord) {
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
   * @param move Move.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @param affectedCells Affected cells as array of coordinates and previous values.
   */
  private affectWeightsCustom(cells: Cell[][], playerIx: number, move: ReversiMove, copy: boolean, affectedCells: StateCoord[]) {
    // Right now, we only change weights for corners.
    if (this.isCorner(move, cells.length-1)) this.affectCorners(cells, playerIx, move, copy, affectedCells);
  }

  /**
   * Check if given move is corner.
   * @param move Move to check.
   * @param maxCoord Maximum coordinate value.
   * @returns True if it is corner, otherwise false.
   */
  private isCorner(move: ReversiMove, maxCoord: number): boolean {
    return (move.x === 0 || move.x === maxCoord) &&
           (move.y === 0 || move.y === maxCoord);
  }

  /**
   * Affect weights on corner.
   * @param cells State of board.
   * @param playerIx Player index.
   * @param move Move.
   * @param copy If true, make copy of cell instead of changing cell values on spot.
   * @param affectedCells Affected cells as array of coordinates and previous values.
   */
  private affectCorners(cells: Cell[][], playerIx: number, move: ReversiMove, copy: boolean, affectedCells: StateCoord[]) {
    const maxCoord = cells.length-1;
    const coords: Coordinate[] = [];
    if (move.x === 0 && move.y === 0) {
      coords.push({x:1, y:0});
      coords.push({x:0, y:1});
      coords.push({x:1, y:1});
    } else if (move.x === maxCoord && move.y === 0) {
      coords.push({x:maxCoord-1, y:0});
      coords.push({x:maxCoord, y:1});
      coords.push({x:maxCoord-1, y:1});
    } else if (move.x === 0 && move.y === maxCoord) {
      coords.push({x:1, y:maxCoord});
      coords.push({x:0, y:maxCoord-1});
      coords.push({x:1, y:maxCoord-1});
    } else if (move.x === maxCoord && move.y === maxCoord) {
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
      const oldState = { x: coord.x, y: coord.y, s: cell.state, w: [...cell.weights] };
      affectedCells.push(oldState);

      // update reference so cell notifiers (like cell field in cell.ts) can register change in cell
      if (copy) {
        cells[coord.x][coord.y] = {
          ...cell,
          // yes, weights are also copied, otherwise it wont properly update visually in debug mode
          weights: [...cell.weights]
        };
      }
      cells[coord.x][coord.y].weights[playerIx] = newWeightValue;
    }
  }
}
