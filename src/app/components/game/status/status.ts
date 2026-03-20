import { Component, inject } from '@angular/core';
import {TranslatePipe } from '@ngx-translate/core';

import { EnPlayerType, EnGameStatus, EnViewMode } from '@/code/data/enums';
import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';

import { PlayerBoxCmp } from '@/components/common/playerBox/playerBox';
import { PlayerNameCmp } from '@/components/common/playerName/playerName';
import { SpinnerCmp } from '@/components/assets/basic/spinner/spinner';

@Component({
  selector: 'app-game-status',
  imports: [TranslatePipe, PlayerBoxCmp, PlayerNameCmp, SpinnerCmp],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class StatusCmp {
  public readonly gameStateService = inject(GameStateService);
  public readonly gameService = inject(GameService);
  public EnPlayerType = EnPlayerType;
  public EnGameStatus = EnGameStatus;
  public EnViewMode = EnViewMode;

  //

  /**
   * Check if current player can pass move.
   * @returns True if can pass move, otherwise false.
   */
  public canPassMove(): boolean {
    return this.gameService.canPassMove();
  }

  /**
   * Pass move.
   */
  public passMove() {
    this.gameService.passMove();
  }

  /**
   * Exits history mode.
   */
  public exitHistory() {
    this.gameService.exitHistory();
  }
}
