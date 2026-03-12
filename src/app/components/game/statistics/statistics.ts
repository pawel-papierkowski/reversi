import { Component, inject } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

import { EnMode } from '@/code/data/enums';
import { GameStateService } from '@/code/services/gameState/gameState.service';

@Component({
  selector: 'app-game-statistics',
  imports: [TranslatePipe],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class Statistics {
  readonly gameStateService = inject(GameStateService);

  showWhenHumanVsAi() : boolean {
    return this.gameStateService.menuSettings().mode === EnMode.HumanVsAi;
  }
}
