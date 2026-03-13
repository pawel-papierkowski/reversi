import { Component, inject } from '@angular/core';
import {TranslatePipe } from '@ngx-translate/core';

import { EnCellState, EnPlayerType, EnGameStatus } from '@/code/data/enums';
import { GameStateService } from '@/code/services/gameState/gameState.service';

import { PlayerName } from '@/components/common/playerName/playerName';
import { Spinner } from '@/components/assets/basic/spinner/spinner';

@Component({
  selector: 'app-game-status',
  imports: [TranslatePipe, PlayerName, Spinner],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class Status {
  readonly gameStateService = inject(GameStateService);
  EnCellState = EnCellState;
  EnPlayerType = EnPlayerType;
  EnGameStatus = EnGameStatus;
}
