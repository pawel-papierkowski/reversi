import { Component, inject } from '@angular/core';
import {TranslatePipe } from '@ngx-translate/core';

import { EnPlayerType, EnGameStatus } from '@/code/data/enums';
import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';

import { PlayerNameCmp } from '@/components/common/playerName/playerName';
import { SpinnerCmp } from '@/components/assets/basic/spinner/spinner';

@Component({
  selector: 'app-game-status',
  imports: [TranslatePipe, PlayerNameCmp, SpinnerCmp],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class StatusCmp {
  public readonly gameStateService = inject(GameStateService);
  public readonly gameService = inject(GameService);
  public EnPlayerType = EnPlayerType;
  public EnGameStatus = EnGameStatus;

  //

  /**
   * Check if current player can skip move.
   * @returns True if can skip move, otherwise false.
   */
  public canSkipMove(): boolean {
    return this.gameService.canSkipMove();
  }

  /** Skip move. */
  public skipMove() {
    this.gameService.skipMove();
  }
}
