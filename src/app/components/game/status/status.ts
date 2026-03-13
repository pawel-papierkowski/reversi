import { Component, inject } from '@angular/core';
import {TranslatePipe } from '@ngx-translate/core';

import { EnCellState, EnPlayerType, EnGameStatus } from '@/code/data/enums';
import { GameStateService } from '@/code/services/gameState/gameState.service';

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
  public EnPlayerType = EnPlayerType;
  public EnGameStatus = EnGameStatus;
}
