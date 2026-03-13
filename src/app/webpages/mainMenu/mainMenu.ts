import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

import { GameService } from '@/code/services/game/game.service';

import { MainMenuOptionsCmp } from '@/components/mainMenuOptions/mainMenuOptions';

@Component({
  selector: 'app-main-menu',
  imports: [TranslatePipe, MainMenuOptionsCmp],
  templateUrl: './mainMenu.html',
  styleUrl: './mainMenu.css'
})
export class MainMenuPage {
  public readonly router = inject(Router);
  public readonly gameService = inject(GameService);

  public startGame() {
    this.gameService.startGame();
    this.router.navigate(['/board']);
  }

  public continueGame() {
    this.router.navigate(['/board']);
  }
}
