import { Component, inject } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

import type { GameHistoryEntry } from "@/code/data/gameState";

import { GameStateService } from '@/code/services/gameState/gameState.service';

import { HistoryEntryCmp } from '@/components/game/historyEntry/historyEntry';

@Component({
  selector: 'app-game-history',
  imports: [HistoryEntryCmp, TranslatePipe],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class HistoryCmp {
  private readonly gameStateService = inject(GameStateService);

  /**
   * Retrieve history entries.
   * @returns Array of history entries.
   */
  public getHistoryEntries(): GameHistoryEntry[] {
    return this.gameStateService.gameState().board.history.moves;
  }
}
