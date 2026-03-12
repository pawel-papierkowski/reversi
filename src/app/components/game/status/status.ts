import { Component, inject } from '@angular/core';
import {TranslatePipe, TranslateService } from '@ngx-translate/core';

import { EnMode, EnCellState } from '@/code/data/enums';
import { GameStateService } from '@/code/services/gameState/gameState.service';

import { ReversiPiece } from '@/components/game/piece/piece';

@Component({
  selector: 'app-game-status',
  imports: [TranslatePipe, ReversiPiece],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class Status {
  readonly gameStateService = inject(GameStateService);
  EnCellState = EnCellState;

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
   * Resolves player cell state.
   * @param playerIx Player index.
   * @returns Enum of cell state.
   */
  getPlayerCellState(playerIx: number) : EnCellState {
    const player = this.gameStateService.gameState().players[playerIx];
    return player.cellState;
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
