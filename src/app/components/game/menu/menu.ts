import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

import { GameService } from '@/code/services/game/game.service';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { EnGameStatus } from '@/code/data/enums';

@Component({
  selector: 'app-game-menu',
  imports: [TranslatePipe],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class GameMenuCmp {
  public readonly router = inject(Router);
  private readonly gameStateService = inject(GameStateService);
  private readonly gameService = inject(GameService);

  public canShowNextRound(): boolean {
    const status = this.gameStateService.gameState().board.status;
    if (status === EnGameStatus.PlayerWon || status === EnGameStatus.Tie) return true;
    return false;
  }

  public nextRound() {
    this.gameService.nextRound();
  }

  public backToMenu() {
    this.router.navigate(['/']);
  }
}
