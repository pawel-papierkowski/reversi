import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { modeDescr, playerTypeDescr, difficultyDescr } from '../../../code/data/enums';
import { gameConfig } from '../../../code/data/const';
import { GameStateService } from '../../../code/services/gameState.service';

@Component({
  selector: 'app-main-menu-options',
  imports: [ FormsModule ],
  templateUrl: './mainMenuOptions.html',
  styleUrl: './mainMenuOptions.css'
})
export class MainMenuOptions {
  readonly gameStateService = inject(GameStateService);
  readonly gameConfig = gameConfig;
  readonly modes = Object.entries(modeDescr) as [string, string][];
  readonly playerTypes = Object.entries(playerTypeDescr) as [string, string][];
  readonly difficulties = Object.entries(difficultyDescr) as [string, string][];
}
