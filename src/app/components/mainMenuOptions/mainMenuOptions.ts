import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

import { modeDescr, playerTypeDescr, difficultyDescr, EnMode } from '@/code/data/enums';
import { gameConfig } from '@/code/data/gameConst';

import { GameStateService } from '@/code/services/gameState/gameState.service';

import { ComboBoxCmp } from '@/components/basic/comboBox/comboBox';

@Component({
  selector: 'app-main-menu-options',
  imports: [ FormsModule, ComboBoxCmp, TranslatePipe ],
  templateUrl: './mainMenuOptions.html',
  styleUrl: './mainMenuOptions.css'
})
export class MainMenuOptionsCmp {
  public readonly gameStateService = inject(GameStateService);
  public readonly gameConfig = gameConfig;
  public readonly modes = Object.keys(modeDescr).map(Number);
  public readonly playerTypes = Object.keys(playerTypeDescr).map(Number);
  public readonly difficulties = Object.keys(difficultyDescr).map(Number);

  /**
   * Check if whoFirst combobox should be disabled.
   * @returns True if whoFirst combobox should be disabled, otherwise false.
   */
  public isWhoFirstDisabled() : boolean {
    return !(this.gameStateService.menuSettings().mode === EnMode.HumanVsAi);
  }

  /**
   * Check if difficulty combobox should be disabled.
   * @returns True if difficulty combobox should be disabled, otherwise false.
   */
  public isDifficultyDisabled() : boolean {
    switch (this.gameStateService.menuSettings().mode) {
      case EnMode.HumanVsHuman: return true;
      default: return false;
    }
  }
}
