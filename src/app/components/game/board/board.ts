import { Component, inject, computed } from '@angular/core';

import { GameStateService } from '@/code/services/gameState/gameState.service';

import { ReversiCellCmp } from '@/components/game/cell/cell';
import { EnGameStatus, EnViewMode } from '@/code/data/enums';

@Component({
  selector: 'reversi-board',
  imports: [ReversiCellCmp],
  templateUrl: './board.html',
  styleUrl: './board.css',
  host: {
    '[style.--board-size]': 'gameStateService.gameState().settings.boardSize'
  }
})
export class ReversiBoardCmp {
  public readonly gameStateService = inject(GameStateService);

  // Computed signal to generate letters: ['a', 'b', 'c' ...]
  public readonly columns = computed(() => {
    const size = this.gameStateService.gameState().settings.boardSize;
    // 97 is ASCII for 'a'
    return Array.from({ length: size }, (_, i) => String.fromCharCode(97 + i));
  });

  public readonly boardCss = computed(() => {
    const isHistory = this.gameStateService.gameState().view.viewMode === EnViewMode.History;
    const status = this.gameStateService.gameState().board.status;
    const isEndRound = status === EnGameStatus.PlayerWon || status === EnGameStatus.Tie;

    const cssClasses: string[] = [];
    cssClasses.push('board');
    if (isHistory) cssClasses.push('history');
    else if (isEndRound) cssClasses.push('endRound');
    console.info(cssClasses);
    return cssClasses;
  });
}
