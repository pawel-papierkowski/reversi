import { Component, inject, input } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

import { EnMode, EnCellState } from '@/code/data/enums';
import { GameStateService } from '@/code/services/gameState/gameState.service';

import { ReversiPiece } from '@/components/game/piece/piece';

@Component({
  selector: 'app-game-statistics',
  imports: [TranslatePipe, ReversiPiece],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class Statistics {
  readonly gameStateService = inject(GameStateService);
  EnCellState = EnCellState;

  showWhenHumanVsAi() : boolean {
    return this.gameStateService.menuSettings().mode === EnMode.HumanVsAi;
  }
}
