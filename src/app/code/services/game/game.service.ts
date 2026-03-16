import { Injectable, inject } from '@angular/core';

import { EnGameStatus, EnCellState } from '@/code/data/enums';
import type { GameHistoryEntry, ReversiMove } from "@/code/data/gameState";

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';

/**
 * General game service.
 */
@Injectable({providedIn: 'root'})
export class GameService {
  private readonly gameStateService = inject(GameStateService);
  private readonly legalMoveService = inject(LegalMoveService);

  /**
   * Initializes game according to settings and prepare for first move.
   * Call at start of game.
   */
  public startGame() {
    this.gameStateService.applySettings(); // use settings from main menu options form
    this.gameStateService.initializeGame();

    this.updateSideData();
    this.addToHistory(-1, null); // initial board state as first entry in history
  }

  /**
   * Update side data for current state of board:
   * - resolve legal moves
   * - scoring
   */
  private updateSideData() {
    this.legalMoveService.resolveMoves();
    this.legalMoveService.showHints();
    this.gameStateService.recalcScoring();
  }

  // PLAYER ACTIONS

  /**
   * Tries to make move.
   * @param x X coordinate.
   * @param y Y coordinate.
   */
  public makeMove(x: number, y: number) {
    const move = this.legalMoveService.findMove(x, y);
    if (move === null) return; // no legal move found for this cell, abort

    // Legal move found, execute it.
    this.gameStateService.executeMove(move);
    // Current state of board as latest entry in history. Notes:
    // - State of board is from PoV of player that made move AFTER making move.
    // - Potential moves are erased.
    this.addToHistory(this.gameStateService.gameState().board.currPlayerIx, move);

    this.gameStateService.changePlayer();
    this.gameStateService.gameState().statistics.moveCount++;

    // NOW update side data, as these must be for next player.
    this.updateSideData();

    // TODO: probably here we will detect if game ended and switch status to PlayerWon or Tie.
    // Game can end if:
    // - no more empty cells left
    // - both players have no legal moves for current board state
  }

  /**
   * Add current state of board to history. Note potential legal moves are erased.
   * @param playerIx Player index or -1 if no player made move (initial state of board).
   * @param move Move that lead to this state of board. Null if it is initial state of board.
   */
  private addToHistory(playerIx: number, move: ReversiMove | null) {
    const moveEntry: GameHistoryEntry = {
      playerIx: playerIx,
      move: move,
      cells: structuredClone(this.gameStateService.gameState().board.cells),
    };
    this.legalMoveService.clearPotentialMoves(moveEntry.cells);
    this.gameStateService.gameState().board.history.moves.push(moveEntry);
  }

  //

  /** Pass move. Works only if player can pass (no legal moves available). */
  public passMove() {
    if (!this.canPassMove()) return;

    // Pass move generates special history entry.
    this.addToHistory(this.gameStateService.gameState().board.currPlayerIx, null);

    this.gameStateService.changePlayer();
    this.gameStateService.gameState().statistics.moveCount++;
    this.updateSideData();
  }

  /**
   * Check if current player can pass move. Player can do it when:
   * - there is still at least one empty cell on board
   * - current player has no legal moves
   * @returns True if can pass move, otherwise false.
   */
  public canPassMove(): boolean {
    if (this.gameStateService.gameState().statistics.emptyCells === 0) return false;
    if (this.gameStateService.gameState().board.legalMoves.length > 0) return false;
    return true;
  }

  // VARIOUS

  /**
   * Check if game is ongoing.
   * @returns True if game is ongoing, otherwise false.
   */
  public isGameOngoing() : boolean {
    return this.gameStateService.gameState().board.status !== EnGameStatus.Pending;
  }

  // //////////////////////////////////////////////////////////////////////////

  // DEBUG AND TEST FUNCTIONS

  /**
   * Manually set cell state. Updates potential moves and scoring. Player stays same.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @param newState New state of cell.
   */
  public debugSetPiece(x: number, y: number, newState: EnCellState) {
    const cell = this.gameStateService.gameState().board.cells[x][y];
    const oldState = cell.state;
    if (oldState === newState) return;

    cell.state = newState;
    // no need to set cell.potentialMove, updateSideData() recalculates them all anyway
    this.updateSideData();
  }

  /**
   * Manually swap cell state: Empty->Black->White->Empty. Updates potential moves and scoring.
   * Player stays same.
   * @param x X coordinate.
   * @param y Y coordinate.
   */
  public debugSwapPiece(x: number, y: number) {
    const cell = this.gameStateService.gameState().board.cells[x][y];

    switch (cell.state) {
      case EnCellState.Empty: cell.state = EnCellState.B; break;
      case EnCellState.B: cell.state = EnCellState.W; break;
      case EnCellState.W: cell.state = EnCellState.Empty; break;
      default: break;
    }

    this.updateSideData();
  }
}
