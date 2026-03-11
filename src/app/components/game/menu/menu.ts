import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

import { GameStateService } from '@/code/services/gameState.service';
import { EnGameStatus } from '@/code/data/enums';

@Component({
  selector: 'app-game-menu',
  imports: [TranslatePipe],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class GameMenu {
  readonly router = inject(Router);
  readonly gameStateService = inject(GameStateService);

  canShowNextRound(): boolean {
    const status = this.gameStateService.gameState().board.status;
    if (status === EnGameStatus.PlayerWon || status === EnGameStatus.Tie) return true;
    return false;
  }

  nextRound() {
    // TODO: move on to next round.
  }

  backToMenu() {
    this.router.navigate(['/']);
  }
}
