import { Component, inject } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

import { EnMode, EnCellState } from '@/code/data/enums';
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

  public showWhenHumanVsAi() : boolean {
    return this.gameStateService.menuSettings().mode === EnMode.HumanVsAi;
  }
}
