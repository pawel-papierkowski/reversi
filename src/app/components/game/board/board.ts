import { Component, inject } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

import { GameStateService } from '@/code/services/gameState.service';

@Component({
  selector: 'app-game-board',
  imports: [TranslatePipe],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class Board {
  readonly gameStateService = inject(GameStateService);
}
