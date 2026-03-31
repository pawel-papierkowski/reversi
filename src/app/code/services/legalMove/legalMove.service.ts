import { Injectable, inject } from '@angular/core';

import { EnCellState } from '@/code/data/enums';
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
    return foundMoves;
  }

  /**
   * Process given cell - find out if it can be used for legal move in Reversi.
   * @param cells State of board.
   * @param x X coordinate of cell.
   * @param y Y coordinate of cell.
   * @param playerPiece Piece of your player.
   * @returns Legal move or null if player cannot make move on this cell.
   */
  private resolveMove(cells: Cell[][], x: number, y: number, playerPiece: EnCellState): ReversiMove | null {
    const cell = cells[x][y]; // First, chosen cell must be empty.
    if (cell.state !== EnCellState.Empty) return null;

    const oppPlayerPiece = this.moveService.getOppPiece(playerPiece);
    const potentialMoves = this.moveService.resolvePotentialMoves(cells, x, y, oppPlayerPiece);
    if (potentialMoves.length === 0) return null; // no eligible potential moves found

    // Now for all these direction cast traces to check if it ends in cell containing piece of your color.
    // Only then it is legal move.
    for (let i=0; i<potentialMoves.length; i++) {
      const potentialMove = potentialMoves[i];
      const opposingPieces = this.moveService.trace(cells, potentialMove, playerPiece, oppPlayerPiece);
      if (opposingPieces.length > 0) return { x: x, y: y };
    }

    return null; // no legal move found
  }

  // //////////////////////////////////////////////////////////////////////////

  // DEBUG

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
    const boardSize = this.gameStateService.gameState().settings.boardSize;
    for (let x=0; x<boardSize; x++) {
      for (let y=0; y<boardSize; y++) {
        cells[x][y].potentialMove = EnCellState.Empty;
      }
    }
  }
}
