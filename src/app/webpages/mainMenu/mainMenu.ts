import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

import { GameStateService } from '@/code/services/gameState.service';

import { MainMenuOptions } from '@/components/mainMenuOptions/mainMenuOptions';

@Component({
  selector: 'app-main-menu',
  imports: [MainMenuOptions, TranslatePipe],
  templateUrl: './mainMenu.html',
  styleUrl: './mainMenu.css'
})
export class MainMenu {
  readonly router = inject(Router);
  readonly gameStateService = inject(GameStateService);

  startGame() {
    this.gameStateService.initializeBoard();
    console.info(this.gameStateService.gameState());
    this.router.navigate(['/board']);
  }
}
