import { Component, inject } from '@angular/core';

import { GameStateService } from '../../../code/services/gameState.service';

import { MainMenuOptions } from '../../components/mainMenuOptions/mainMenuOptions';

@Component({
  selector: 'app-main-menu',
  imports: [MainMenuOptions],
  templateUrl: './mainMenu.html',
  styleUrl: './mainMenu.css'
})
export class MainMenu {
  readonly gameStateService = inject(GameStateService);

  startGame() {
    console.info(this.gameStateService.gameState().settings);
    this.gameStateService.deployBoard();
    // route to /board page
  }
}
