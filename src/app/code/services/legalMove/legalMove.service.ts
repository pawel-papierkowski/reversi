import { Injectable, inject } from '@angular/core';

import { EnCellState, EnDir } from '@/code/data/enums';
import type { ReversiMove, Cell } from '@/code/data/gameState';
import { createReversiMove } from '@/code/data/gameState';
import type { DirCoord } from '@/code/services/legalMove/legalMoveTypes';
import { createDirCoord, applyDir, getOppPiece } from '@/code/services/legalMove/legalMoveTypes';

import { GameStateService } from '@/code/services/gameState/gameState.service';

/**
 * Legal move service.
 * Finds out all legal moves for given board state and current player.
 */
@Injectable({providedIn: 'root'})
export class LegalMoveService {
  private readonly gameStateService = inject(GameStateService);

  /**
   * Finds out all legal moves for current game state.
   * @returns Array of legal moves. Can be empty if no legal moves available.
   */
  public resolveMoves() {
    const cells = this.gameStateService.gameState().board.cells;
    const playerPiece = this.gameStateService.getCurrPlayer().piece;
    const moves = this.resolveMovesCustom(cells, playerPiece);
    this.gameStateService.gameState().board.legalMoves = moves;
  }

  /**
   * Finds out all legal moves for given board state and player.
   * @param cells State of board.
   * @param playerPiece Player piece.
   * @returns Array of legal moves. Can be empty if no legal moves available.
   */
  public resolveMovesCustom(cells: Cell[][], playerPiece: EnCellState) : ReversiMove[] {
    const foundMoves: ReversiMove[] = [];
    const boardSize = this.gameStateService.gameState().settings.boardSize;

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

    const oppPlayerPiece = getOppPiece(playerPiece);
    const offsets : DirCoord[] = [];
    // Find out all directions around given cell.
    // Already exclude coordinates out of range or containing something else than piece of opposite color.
    for (let dir = EnDir.N; dir <= EnDir.NW; dir++) {
      let dirCoord : DirCoord = createDirCoord(dir, x, y);
      dirCoord = applyDir(dirCoord);
      if (this.canUseOffset(cells, dirCoord, oppPlayerPiece)) offsets.push(dirCoord);
    }

    // Now for all these direction cast traces to check if it ends in cell containing piece of your color.
    // Only then it is legal move.
    for (let i=0; i<offsets.length; i++) {
      const offset = offsets[i];
      if (this.trace(cells, offset, playerPiece, oppPlayerPiece)) return createReversiMove(x, y);
    }

    return null; // no legal move found
  }

  /**
   * Check if can use offset coordinates (starting points for tracing). Conditions:
   * - X and Y cannot be outside range.
   * - Cell must contain piece for opposing player.
   * @param cells State of board.
   * @param dirCoord Coordinates to use.
   * @param oppPlayerPiece Piece of opposing player.
   * @returns True if can use given coordinates, otherwise false.
   */
  private canUseOffset(cells: Cell[][], dirCoord : DirCoord, oppPlayerPiece: EnCellState) : boolean {
    const size = this.gameStateService.gameState().settings.boardSize;
    if (dirCoord.x < 0 || dirCoord.x >= size) return false;
    if (dirCoord.y < 0 || dirCoord.y >= size) return false;
    const cell = cells[dirCoord.x][dirCoord.y];
    return cell.state === oppPlayerPiece;
  }

  /**
   * Trace from given coordinates in given direction across board until you hit edge or cell that has
   * something else than piece of opposing player. If that cell has your piece, bingo. Move is valid.
   * @param cells State of board.
   * @param dirCoord Coordinates+direction to use.
   * @param playerPiece Piece of your player.
   * @returns True if given coordinates are for legal move, otherwise false.
   */
  private trace(cells: Cell[][], dirCoord: DirCoord, playerPiece: EnCellState, oppPlayerPiece: EnCellState): boolean {
    do {
      dirCoord = applyDir(dirCoord); // move coordinates
      if (!this.hitEdge(dirCoord)) return false; // hit edge of board, can't be valid move
      const cell = cells[dirCoord.x][dirCoord.y];
      if (cell.state !== playerPiece && cell.state !== oppPlayerPiece) return false; // it is illegal move!
      if (cell.state === oppPlayerPiece) continue; // still pieces of opposite player, continue
      if (cell.state === playerPiece) return true; // it is legal move!
    } while (true);
  }

  private hitEdge(dirCoord : DirCoord): boolean {
    const size = this.gameStateService.gameState().settings.boardSize;
    if (dirCoord.x < 0 || dirCoord.x >= size) return false;
    if (dirCoord.y < 0 || dirCoord.y >= size) return false;
    return true;
  }

  // //////////////////////////////////////////////////////////////////////////

  // DEBUG

  /**
   * Show legal moves on board for current game state.
   */
  public debugShowMoves() {
    const cells = this.gameStateService.gameState().board.cells;
    const playerPiece = this.gameStateService.getCurrPlayer().piece;
    const moves = this.gameStateService.gameState().board.legalMoves;
    this.debugShowMovesCustom(cells, playerPiece, moves);
  }

  /**
   * Show legal moves on board for custom data.
   * @param cells State of board.
   * @param playerPiece Player piece.
   * @param moves Array of legal moves.
   */
  public debugShowMovesCustom(cells: Cell[][], playerPiece: EnCellState, moves: ReversiMove[]) {
    if (!this.gameStateService.gameState().debugSettings.showMove) return;
    this.clearPotentialMoves(cells); // First, clear board.

    for (let i=0; i<moves.length; i++) {
      const move = moves[i];
      const cell = cells[move.x][move.y];
      cell.potentialMove = playerPiece;
    }
  }

  /**
   * Clears out potential move field in all cells.
   * @param cells State of board.
   */
  private clearPotentialMoves(cells: Cell[][])  {
    const boardSize = this.gameStateService.gameState().settings.boardSize;
    for (let x=0; x<boardSize; x++) {
      for (let y=0; y<boardSize; y++) {
        cells[x][y].potentialMove = EnCellState.Empty;
      }
    }
  }
}
