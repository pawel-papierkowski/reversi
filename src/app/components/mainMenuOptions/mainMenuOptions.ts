import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

import { modeDescr, playerTypeDescr, difficultyDescr, EnMode } from '@/code/data/enums';
import { gameConfig } from '@/code/data/const';
import { GameStateService } from '@/code/services/gameState/gameState.service';

import { ComboBox } from '@/components/basic/comboBox/comboBox';

@Component({
  selector: 'app-main-menu-options',
  imports: [ FormsModule, ComboBox, TranslatePipe ],
  templateUrl: './mainMenuOptions.html',
  styleUrl: './mainMenuOptions.css'
})
export class MainMenuOptions {
  readonly gameStateService = inject(GameStateService);
  readonly gameConfig = gameConfig;
  readonly modes = Object.keys(modeDescr).map(Number);
  readonly playerTypes = Object.keys(playerTypeDescr).map(Number);
  readonly difficulties = Object.keys(difficultyDescr).map(Number);

  isWhoFirstDisabled() : boolean {
    return !(this.gameStateService.menuSettings().mode === EnMode.HumanVsAi);
  }
}
