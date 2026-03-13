import { Injectable, inject } from '@angular/core';

import { EnGameStatus } from '@/code/data/enums';
import type { ReversiMove } from "@/code/data/gameState";

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
    // use settings from main menu options form
    this.gameStateService.applySettings();
    this.gameStateService.initializeGame();

    this.afterMove(null); // initial state of board
  }

  /**
   * Prepares needed stuff after making move or at beginning of game.
   * @param move Move that lead to this state of board. Null if it is initial state of board.
   */
  public afterMove(move: ReversiMove | null) {
    this.legalMoveService.resolveMoves();
    this.legalMoveService.debugShowMoves();
    this.gameStateService.addToHistory(move);
  }

  // VARIOUS

  /**
   * Check if game is ongoing.
   * @returns True if game is ongoing, otherwise false.
   */
  public isGameOngoing() : boolean {
    return this.gameStateService.gameState().board.status !== EnGameStatus.Pending;
  }
}
