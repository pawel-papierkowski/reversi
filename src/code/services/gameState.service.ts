import { Injectable, signal } from '@angular/core';

import { GameState, createGameState } from "../../code/data/gameState";

/** Game state service. */
@Injectable({providedIn: 'root'})
export class GameStateService {
  readonly gameState = signal<GameState>(createGameState());

  /** Deploys board. Must be called after settings, but before actual game starts. */
  deployBoard() {
    // TODO prepare game state according to game options set on main menu screen

  }
}
