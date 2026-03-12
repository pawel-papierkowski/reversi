import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

import { GameStateService } from '@/code/services/gameState/gameState.service';

import { MainMenuOptions } from '@/components/mainMenuOptions/mainMenuOptions';

@Component({
  selector: 'app-main-menu',
  imports: [TranslatePipe, MainMenuOptions],
  templateUrl: './mainMenu.html',
  styleUrl: './mainMenu.css'
})
export class MainMenu {
  readonly router = inject(Router);
  readonly gameStateService = inject(GameStateService);

  startGame() {
    // use settings from main menu options form
    this.gameStateService.applySettings();
    this.gameStateService.initializeGame();
    this.router.navigate(['/board']);
  }

  continueGame() {
    this.router.navigate(['/board']);
  }
}
