import { Component, inject, input, computed } from '@angular/core';
import {TranslatePipe } from '@ngx-translate/core';

import { EnPlayerType, EnGameStatus, EnViewMode } from '@/code/data/enums';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';

import { PlayerNameCmp } from '@/components/common/playerName/playerName';
import { SpinnerCmp } from '@/components/assets/basic/spinner/spinner';

@Component({
  selector: 'app-player-box',
  imports: [TranslatePipe, PlayerNameCmp, SpinnerCmp],
  templateUrl: './playerBox.html',
  styleUrl: './playerBox.css'
})
export class PlayerBoxCmp {
  public readonly gameStateService = inject(GameStateService);
  public readonly gameService = inject(GameService);
  public readonly playerIx = input.required<number>();

  public readonly player = computed(() => this.gameStateService.getPlayer(this.playerIx()));
  public readonly currPlayer = computed<boolean>(() => {
    const status = this.gameStateService.gameState().board.status;
    if (status !== EnGameStatus.InProgress) return false;
    return this.gameStateService.getCurrPlayer().ix === this.playerIx();
  });
  public readonly winningPlayer = computed<boolean>(() => {
    const status = this.gameStateService.gameState().board.status;
    if (status === EnGameStatus.InProgress) return false;
    return this.gameStateService.getWinningPlayer().ix === this.playerIx();
  });

  public getClasses(): string[] {
    const classes: string[] = [];
    if (this.currPlayer()) classes.push("selected");
    if (this.winningPlayer()) classes.push("win");
    return classes;
  }
}
