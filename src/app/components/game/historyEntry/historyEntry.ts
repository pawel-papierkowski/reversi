import { Component, inject, input, computed } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

import type { GameHistoryEntry } from "@/code/data/gameState";

import { GameStateService } from '@/code/services/gameState/gameState.service'
import { GameService } from '@/code/services/game/game.service';;

import { ReversiPieceCmp } from '@/components/game/piece/piece';
import { EnCellState } from '@/code/data/enums';

@Component({
  selector: 'app-game-history-entry',
  imports: [TranslatePipe, ReversiPieceCmp],
  templateUrl: './historyEntry.html',
  styleUrl: './historyEntry.css'
})
export class HistoryEntryCmp {
  private readonly gameStateService = inject(GameStateService);
  private readonly gameService = inject(GameService);
  public readonly entry = input.required<GameHistoryEntry>();

  cssClasses = computed<string[]>(() => {
    const cssClasses: string[] = [];
    cssClasses.push('historyEntry');
    if (this.entry().id === this.gameStateService.gameState().view.viewMove) cssClasses.push('selected');
    return cssClasses;
  });

  /**
   * Get player's piece color.
   * @returns Player's piece color.
   */
  public getPiece(): EnCellState {
    if (this.entry().playerIx === -1) return EnCellState.Empty;
    return this.gameStateService.getPlayer(this.entry().playerIx).piece;
  }

  /**
   * Get text of entry.
   * @returns Text of entry.
   */
  public getText(): string {
    if (this.entry().playerIx === -1) return "game.history.start";
    if (this.entry().move === null) return "game.history.pass";
    return "game.history.move";
  }

  public getCol(): string {
    if (this.entry().move === null) return "";
    const offset: number = this.entry().move?.y || 0;
    return String.fromCharCode(97 + offset);
  }

  public getRow(): string {
    if (this.entry().move === null) return "";
    const offset: number = this.entry().move?.x || 0;
    return '' + (offset+1);
  }

  //

  /**
   * Show historical state of board for selected move.
   */
  public jumpToEntry() {
    this.gameService.jumpToEntry(this.entry());
  }
}
