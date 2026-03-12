import { Component, inject, computed } from '@angular/core';

import { GameStateService } from '@/code/services/gameState/gameState.service';

import { ReversiCell } from '@/components/game/cell/cell';

@Component({
  selector: 'reversi-board',
  imports: [ReversiCell],
  templateUrl: './board.html',
  styleUrl: './board.css',
  host: {
    '[style.--board-size]': 'gameStateService.gameState().settings.boardSize'
  }
})
export class ReversiBoard {
  readonly gameStateService = inject(GameStateService);

  // Computed signal to generate letters: ['a', 'b', 'c' ...]
  readonly columns = computed(() => {
    const size = this.gameStateService.gameState().settings.boardSize;
    return Array.from({ length: size }, (_, i) => String.fromCharCode(97 + i));
  });
}
