import { Injectable, inject } from '@angular/core';

import { EnGameStatus } from '@/code/data/enums';

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

    this.beforeNextMove();
  }

  /**
   * Prepare needed stuff before next move.
   */
  public beforeNextMove() {
    this.legalMoveService.resolve();
    this.legalMoveService.debugShowMoves();
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
