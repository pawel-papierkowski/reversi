import { Component, inject } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

import { EnMode } from '@/code/data/enums';
import { GameStateService } from '@/code/services/gameState/gameState.service';

import { PlayerNameCmp } from '@/components/common/playerName/playerName';

@Component({
  selector: 'app-game-statistics',
  imports: [TranslatePipe, PlayerNameCmp],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class StatisticsCmp {
  public readonly gameStateService = inject(GameStateService);

  /**
   * Check if we are in Human vs Ai mode.
   * @returns True if we are in Human vs Ai mode.
   */
  public showWhenHumanVsAi() : boolean {
    return this.gameStateService.menuSettings().mode === EnMode.HumanVsAi;
  }

  /**
   * Check if we are in mode that involves AI.
   * @returns True if we are in mode that involves AI.
   */
  public showWhenAiInvolved() : boolean {
    switch (this.gameStateService.menuSettings().mode) {
      case EnMode.HumanVsAi:
      case EnMode.AiVsAi: return true;
      default: return false;
    }
  }
}
