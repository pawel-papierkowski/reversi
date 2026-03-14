import { Injectable, inject } from '@angular/core';

import { EnGameStatus, EnCellState } from '@/code/data/enums';
import type { Cell } from "@/code/data/gameState";

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
    this.gameStateService.addToHistory(null); // initial board state as first entry in history
  }

  /**
   * Update side data for current state of board:
   * - resolve legal moves
   * - scoring
   */
  private updateSideData() {
    this.legalMoveService.resolveMoves();
    this.legalMoveService.debugShowMoves();
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
    // Current state of board as latest entry in history. Note it is still for player that made move.
    this.gameStateService.addToHistory(move);

    this.gameStateService.changePlayer();
    this.gameStateService.gameState().statistics.moveCount++;
    this.gameStateService.gameState().statistics.emptyCells--;

    // NOW update side data, as it must be for next player.
    this.updateSideData();

    // TODO: probably here we will detect if game ended and switch status to PlayerWon or Tie.
    // Game can end if:
    // - no more empty cells left
    // - both players have no legal moves for current board state
  }

  /** Skip move. Works only if player can skip (no legal moves available). */
  public skipMove() {
    if (!this.canSkipMove()) return;

    this.gameStateService.changePlayer();
    this.gameStateService.gameState().statistics.moveCount++;
    this.updateSideData();
  }

  /**
   * Check if current player can skip move. Player can do it when:
   * - there is still at least one empty cell on board
   * - current player has no legal moves
   * @returns True if can skip move, otherwise false.
   */
  public canSkipMove(): boolean {
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
    if (oldState === EnCellState.Empty) this.gameStateService.gameState().statistics.emptyCells--;
    if (newState === EnCellState.Empty) this.gameStateService.gameState().statistics.emptyCells++;

    cell.state = newState;
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
      case EnCellState.Empty: {
        cell.state = EnCellState.B;
        this.gameStateService.gameState().statistics.emptyCells--;
        break;
      }
      case EnCellState.B: cell.state = EnCellState.W; break;
      case EnCellState.W: {
        cell.state = EnCellState.Empty;
        this.gameStateService.gameState().statistics.emptyCells++;
        break;
      }
      default: break;
    }

    this.updateSideData();
  }
}
