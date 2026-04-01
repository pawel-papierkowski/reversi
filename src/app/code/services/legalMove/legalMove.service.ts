import { Injectable, inject } from '@angular/core';

import { EnCellState, EnDir } from '@/code/data/enums';
import type { DirCoord } from '@/code/data/types';
import type { ReversiMove, Cell } from '@/code/data/gameState';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { MoveService } from '@/code/services/move/move.service';

/**
 * Legal move service.
 * Finds out all legal moves for given board state and current player.
 */
@Injectable({providedIn: 'root'})
export class LegalMoveService {
  private readonly gameStateService = inject(GameStateService);
  private readonly moveService = inject(MoveService);

  /**
   * Find move for matching coordinates.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @returns Found move or null if no move found.
   */
  public findMove(x: number, y: number) : ReversiMove|null {
    for (let move of this.gameStateService.gameState().board.legalMoves) {
      if (move.x === x && move.y === y) return move;
    }
    return null;
  }

  //

  /**
   * Finds out all legal moves for current game state.
   * @returns Array of legal moves. Can be empty if no legal moves available.
   */
  public resolveMoves() {
    const cells = this.gameStateService.gameState().board.cells;
    const playerPiece = this.gameStateService.getCurrPlayer().piece;
    const currPlayerMoves = this.resolveMovesCustom(cells, playerPiece);
    this.gameStateService.gameState().board.legalMoves = currPlayerMoves;

    // detect double pass
    if (currPlayerMoves.length === 0) {
      const oppPlayerPiece = this.moveService.getOppPiece(playerPiece);
      const nextPlayerMoves = this.resolveMovesCustom(cells, oppPlayerPiece);
      if (nextPlayerMoves.length === 0) this.gameStateService.gameState().board.doublePass = true;
    }
  }

  /**
   * Finds out all legal moves for given board state and player.
   * @param cells State of board.
   * @param playerPiece Player piece.
   * @returns Array of legal moves. Can be empty if no legal moves available.
   */
  public resolveMovesCustom(cells: Cell[][], playerPiece: EnCellState) : ReversiMove[] {
    const foundMoves: ReversiMove[] = [];
    const boardSize = cells.length;

    // Go over entire board and check every cell for legal move.
    for (let x=0; x<boardSize; x++) {
      for (let y=0; y<boardSize; y++) {
        const move = this.resolveMove(cells, x, y, playerPiece);
        if (move !== null) foundMoves.push(move);
      }
    }

    // Sort moves descending by score. This will make Alpha-Beta pruning more likely to trigger early.
    foundMoves.sort((a, b) => b.score - a.score);
    return foundMoves;
  }

  /**
   * Process given cell - find out if it can be used for legal move in Reversi.
   * @param cells State of board.
   * @param x X coordinate of cell.
   * @param y Y coordinate of cell.
   * @param playerPiece Piece of your player.
   * @returns Legal move or null if player cannot make move at this cell.
   */
  private resolveMove(cells: Cell[][], x: number, y: number, playerPiece: EnCellState): ReversiMove | null {
    const cell = cells[x][y]; // First, chosen cell must be empty.
    if (cell.state !== EnCellState.Empty) return null;
    const oppPlayerPiece = this.moveService.getOppPiece(playerPiece);

    const alteredPieces: DirCoord[] = [];
    for (let dir = EnDir.N; dir <= EnDir.NW; dir++) {
      let dirCoord : DirCoord = { dir: dir, x: x, y: y };
      this.moveService.applyDir(dirCoord); // move dirCoord in given direction by one cell
      if (!this.canUsePotentialMove(cells, dirCoord, oppPlayerPiece)) continue;
      this.moveService.trace(cells, dirCoord, playerPiece, oppPlayerPiece, alteredPieces);
    }

    if (alteredPieces.length === 0) return null; // no legal move found
    alteredPieces.push({ dir:EnDir.N, x:x, y:y }); // origin point

    // Score move based on cell weight.
    const score = (playerPiece === EnCellState.B) ? cell.weight1 : cell.weight2;
    return { x: x, y: y, path: alteredPieces, score: score };
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
    if (!this.moveService.isInsideBoard(dirCoord, size)) return false;
    const cell = cells[dirCoord.x][dirCoord.y];
    return cell.state === oppPlayerPiece;
  }

  // //////////////////////////////////////////////////////////////////////////
  // HINTS

  /**
   * Show potential legal moves on board for current game state.
   */
  public showHints() {
    const cells = this.gameStateService.gameState().board.cells;
    const playerPiece = this.gameStateService.getCurrPlayer().piece;
    const moves = this.gameStateService.gameState().board.legalMoves;
    this.showHintsCustom(cells, playerPiece, moves);
  }

  /**
   * Show potential legal moves on board for custom data.
   * @param cells State of board to modify.
   * @param playerPiece Player piece.
   * @param moves Array of legal moves.
   */
  public showHintsCustom(cells: Cell[][], playerPiece: EnCellState, moves: ReversiMove[]) {
    if (!this.canShowPotentialMoves()) return;
    this.clearPotentialMoves(cells); // First, clear board.

    for (let i=0; i<moves.length; i++) {
      const move = moves[i];
      const cell = cells[move.x][move.y];
      cell.potentialMove = playerPiece;
    }
  }

  /**
   * Check if can show potential legal moves.
   * @returns True if can show hints, otherwise false.
   */
  private canShowPotentialMoves(): boolean {
    if (this.gameStateService.gameState().settings.showHints) return true;
    return false;
  }

  /**
   * Clears out potential move field in all cells.
   * @param cells State of board.
   */
  public clearPotentialMoves(cells: Cell[][])  {
    const boardSize = cells.length;
    for (let x=0; x<boardSize; x++) {
      for (let y=0; y<boardSize; y++) {
        cells[x][y].potentialMove = EnCellState.Empty;
      }
    }
  }
}
