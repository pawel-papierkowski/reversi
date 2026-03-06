import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { GameStateService } from '../../code/services/gameState.service';

/**
 * Makes sure you can enter page only when game is ongoing.
 * @returns True (can navigate to desired page) if game is ongoing,
 *   otherwise UrlTree leading to home page (main menu).
 */
export const gameOngoingGuard: CanActivateFn = () => {
  const router = inject(Router);
  const gameState = inject(GameStateService);

  if (gameState.isGameOngoing()) return true;
  return router.createUrlTree(['']); // kick back to main menu
};
