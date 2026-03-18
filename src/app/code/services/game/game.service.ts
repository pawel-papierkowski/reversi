import { Injectable, inject } from '@angular/core';

import { EnGameStatus, EnCellState, EnPlayerType, EnViewMode } from '@/code/data/enums';
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
    this.nextRound();
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
   * Tries to make move. Note both human and AI call this function.
   * @param x X coordinate.
   * @param y Y coordinate.
   */
  public makeMove(x: number, y: number) {
    if (!this.canMakeMove()) return; // cannot make move in general
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

    if (this.canEndRound()) this.endRound();
  }

  /**
   * Check if can make move in general.
   * @returns True if move is allowed, otherwise false.
   */
  private canMakeMove(): boolean {
    // must be in progress
    if (this.gameStateService.gameState().board.status !== EnGameStatus.InProgress) return false;
    // cannot make move when reviewing past moves from history
    if (this.gameStateService.gameState().view.viewMode !== EnViewMode.CurrentBoard) return false;
    return true;
  }

  /**
   * Add current state of board to history. Note potential legal moves are erased.
   * @param playerIx Player index or -1 if no player made move (initial state of board).
   * @param move Move that lead to this state of board. Null if it is initial state of board.
   */
  private addToHistory(playerIx: number, move: ReversiMove | null) {
    const nextId = this.gameStateService.gameState().board.history.moves.length;
    const moveEntry: GameHistoryEntry = {
      id: nextId,
      playerIx: playerIx,
      move: move,
      cells: structuredClone(this.gameStateService.gameState().board.cells),
    };
    this.legalMoveService.clearPotentialMoves(moveEntry.cells);
    // ensure latest history entry is first on list
    this.gameStateService.gameState().board.history.moves.unshift(moveEntry);
  }

  /**
   * Checks conditions when current game is over. Game can end if:
   * - no more empty cells left
   * - both players have no legal moves for current board state
   * @returns True if game is over, otherwise false.
   */
  private canEndRound(): boolean {
    // ran out of empty cells
    if (this.gameStateService.gameState().statistics.emptyCells === 0) return true;
    // doublePass is true only if both current and next player have no legal moves
    if (this.gameStateService.gameState().board.doublePass) return true;
    return false;
  }

  /**
   * Set game to end state. In this state you can only quit, start new round or review history.
   */
  private endRound() {
    let status: EnGameStatus;
    const statistics = this.gameStateService.gameState().statistics;
    if (statistics.player1Score === statistics.player2Score) {
      status = EnGameStatus.Tie;
      // advance appropriate statistics
      statistics.player1WinInRow = 0;
      statistics.player2WinInRow = 0;
      statistics.ties++;
      statistics.tiesInRow++;
    } else {
      status = EnGameStatus.PlayerWon;
      // advance appropriate statistics
      statistics.tiesInRow = 0;
      if (statistics.player1Score > statistics.player2Score) {
        statistics.player1Win++;
        statistics.player1WinInRow++;
      } else {
        statistics.player2Win++;
        statistics.player2WinInRow++;
      }
    }
    // propetly update game state
    this.gameStateService.gameState.update(state => ({
      ...state,
      board: {
        ...state.board,
        statistics: statistics,
        status: status
      }
    }));
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
   * - next player HAS legal moves
   * @returns True if can pass move, otherwise false.
   */
  public canPassMove(): boolean {
    // cannot pass when reviewing past moves from history
    if (this.gameStateService.gameState().view.viewMode !== EnViewMode.CurrentBoard) return false;
    // cannot pass when current player still has some moves
    if (this.gameStateService.gameState().board.legalMoves.length > 0) return false;
    // cannot pass when game is finished due to both players having no legal moves
    if (this.gameStateService.gameState().board.doublePass) return false;
    return true;
  }

  /**
   * Show historical state of board for selected history entry.
   * @param historyEntry History entry to show.
   */
  public jumpToEntry(historyEntry: GameHistoryEntry) {
    if (!this.canJumpToEntry()) return;

    this.gameStateService.gameState.update(state => ({
      ...state,
      view: {
        viewMode: EnViewMode.History,
        viewMove: historyEntry.id,
        cells: historyEntry.cells,
      }
    }));
  }

  /**
   * Check if can jump to history entry.
   * @returns True if can, otherwise false.
   */
  private canJumpToEntry(): boolean {
    // not when AI is thinking on move
    if (this.gameStateService.getCurrPlayer().type === EnPlayerType.AI) return false;
    return true;
  }

  /**
   * Exits history mode.
   */
  public exitHistory() {
    // already out of history mode
    if (this.gameStateService.gameState().view.viewMode === EnViewMode.CurrentBoard) return;

    this.gameStateService.gameState.update(state => ({
      ...state,
      view: {
        viewMode: EnViewMode.CurrentBoard,
        viewMove: -1,
        cells: this.gameStateService.gameState().board.cells, // current board
      }
    }));
  }

  // VARIOUS

  /**
   * Check if game is ongoing.
   * @returns True if game is ongoing, otherwise false.
   */
  public isGameOngoing() : boolean {
    return this.gameStateService.gameState().board.status !== EnGameStatus.Pending;
  }

  /** Move to next round. */
  public nextRound() {
    this.gameStateService.initializeRound();

    this.updateSideData();
    this.addToHistory(-1, null); // initial board state as first entry in history
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
