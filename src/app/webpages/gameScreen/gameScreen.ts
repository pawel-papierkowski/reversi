import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

import { Status } from '@/components/game/status/status';
import { Board } from '@/components/game/board/board';
import { Statistics } from '@/components/game/statistics/statistics';
import { History } from '@/components/game/history/history';

@Component({
  selector: 'app-game-screen',
  imports: [TranslatePipe, Status, Board, Statistics, History],
  templateUrl: './gameScreen.html',
  styleUrl: './gameScreen.css'
})
export class GameScreen {
  readonly router = inject(Router);

  quitGame() {
    this.router.navigate(['/']);
  }
}
