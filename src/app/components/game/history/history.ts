import { Component, inject } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

import { GameStateService } from '@/code/services/gameState/gameState.service';

@Component({
  selector: 'app-game-history',
  imports: [TranslatePipe],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {
  readonly gameStateService = inject(GameStateService);
}
