import { Component, inject } from '@angular/core';
import {TranslatePipe, TranslateService } from '@ngx-translate/core';

import { GameStateService } from '@/code/services/gameState.service';
import { EnMode } from '@/code/data/enums';

@Component({
  selector: 'app-game-status',
  imports: [TranslatePipe],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class Status {
  readonly gameStateService = inject(GameStateService);

  constructor(private translateService: TranslateService) {}

  /**
   * Resolves player name.
   * @param playerIx Player index.
   * @returns Text with player name.
   */
  getPlayerName(playerIx: number) : string {
    const player = this.gameStateService.gameState().players[playerIx];
    return player.name;
  }

  /**
   * Resolves translated player type. If both players have same type, it will add number.
   * @param playerIx Player index.
   * @returns Text with player type.
   */
  getPlayerType(playerIx: number) : string {
    const player = this.gameStateService.gameState().players[playerIx];
    let typeStr = this.translateService.instant('enum.playerType.'+player.type);
    if (this.gameStateService.gameState().settings.mode !== EnMode.HumanVsAi) {
      typeStr = typeStr + ' ' + (playerIx+1);
    }
    return typeStr;
  }
}
