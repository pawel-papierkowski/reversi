import { Component, inject } from '@angular/core';
import {TranslatePipe } from '@ngx-translate/core';

import { EnPlayerType, EnGameStatus, EnViewMode } from '@/code/data/enums';
import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';

import { PlayerBoxCmp } from '@/components/common/playerBox/playerBox';
import { PlayerNameCmp } from '@/components/common/playerName/playerName';

@Component({
  selector: 'app-game-status',
  imports: [TranslatePipe, PlayerBoxCmp, PlayerNameCmp],
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
   * Retrieve move number. It is in opposite order from move id.
   * @returns Move number.
   */
  public getMoveNumber(): number {
    const moveIx = this.gameStateService.gameState().view.viewMove;
    return this.gameStateService.gameState().board.history.moves[moveIx].num;
  }

  //

  /**
   * Check if current player can pass move.
   * @returns True if can pass move, otherwise false.
   */
  public canPassMove(): boolean {
    // must be human player's turn
    if (this.gameStateService.getCurrPlayer().type !== EnPlayerType.Human) return false;
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
