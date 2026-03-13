import { Component } from '@angular/core';

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
}
