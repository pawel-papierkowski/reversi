import { Component, inject, effect, signal, untracked } from '@angular/core';

import { EnPlayerType, EnGameStatus, EnViewMode } from '@/code/data/enums';
import { AiService } from '@/code/services/ai/ai.service';
import { GameStateService } from '@/code/services/gameState/gameState.service';

import { StatusCmp } from '@/components/game/status/status';
import { ReversiBoardCmp } from '@/components/game/board/board';
import { StatisticsCmp } from '@/components/game/statistics/statistics';
import { HistoryCmp } from '@/components/game/history/history';
import { GameMenuCmp } from '@/components/game/menu/menu';

@Component({
  selector: 'app-game-screen',
  imports: [StatusCmp, ReversiBoardCmp, StatisticsCmp, HistoryCmp, GameMenuCmp],
  templateUrl: './gameScreen.html',
  styleUrl: './gameScreen.css'
})
export class GameScreenPage {
  private readonly aiService = inject(AiService);
  private readonly gameStateService = inject(GameStateService);

  /** Flag indicating AI is currently thinking on its move. Prevents multiple calls to AI. */
  private readonly isThinking = signal(false);

  constructor() {
    effect(() => {
      // Trigger AI move if it is AI's turn and game is in progress.
      const state = this.gameStateService.gameState(); // subscribe to game state changes

      if (state.debugSettings.disableAutoAi) return;
      if (this.isThinking()) return; // already thinking, abort

      const isInProgress = state.board.status === EnGameStatus.InProgress;
      const isHistoryMode = state.view.viewMode !== EnViewMode.CurrentBoard;
      const isAiTurn = this.gameStateService.getCurrPlayer().type === EnPlayerType.AI;

      // Only make move if game is in progress, not in history mode and it is AI's turn.
      if (!isInProgress || isHistoryMode || !isAiTurn) return;

      // Note: not executed in unit tests.
      untracked(async () => {
        this.isThinking.set(true);
        try {
          await this.aiService.maybeMakeMove();
        } finally {
          this.isThinking.set(false);
        }
      });
    });
  }
}
