import { Component } from '@angular/core';

import { Status } from '@/components/game/status/status';
import { ReversiBoard } from '@/components/game/board/board';
import { Statistics } from '@/components/game/statistics/statistics';
import { History } from '@/components/game/history/history';
import { GameMenu } from '@/components/game/menu/menu';

@Component({
  selector: 'app-game-screen',
  imports: [Status, ReversiBoard, Statistics, History, GameMenu],
  templateUrl: './gameScreen.html',
  styleUrl: './gameScreen.css'
})
export class GameScreen {
}
