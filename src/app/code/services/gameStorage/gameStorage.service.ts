import { Injectable, WritableSignal } from '@angular/core';

import { storageKeys } from '@/code/data/gameConst';
import type { GameState, GameSettings } from "@/code/data/gameState";
import { EnViewMode } from '@/code/data/enums';

/**
 * Game storage service.
 * Handles save/load/update of game data.
 */
@Injectable({providedIn: 'root'})
export class GameStorageService {

  // MENU SETTINGS

  /**
   * Load menu settings from storage. If data in storage are not present, nothing happens.
   * @param menuSettings Menu settings data as signal.
   */
  public loadMenuSettings(menuSettings: WritableSignal<GameSettings>) {
    const storedMenuSettings = localStorage.getItem(storageKeys.menuSettings);
    if (!storedMenuSettings) return;
    try {
      menuSettings.set(JSON.parse(storedMenuSettings));
    } catch (ex) {
      console.error('Failed to parse stored menu settings', ex);
    }
  }

  /**
   * Save menu settings to storage.
   * @param menuSettings Menu settings data as signal.
   */
  public saveMenuSettings(menuSettings: WritableSignal<GameSettings>) {
    localStorage.setItem(storageKeys.menuSettings, JSON.stringify(menuSettings()));
  }

  /**
   * Trigger menu settings update and notifications.
   * @param menuSettings Menu settings data as signal.
   */
  public updateMenuSettings(menuSettings: WritableSignal<GameSettings>) {
    menuSettings.update(state => ({
      ...state,
    }));
  }

  // //////////////////////////////////////////////////////////////////////////
  // GAME STATE

  /**
   * Load game state from storage. If data in storage are not present, nothing happens.
   * @param gameState Game state data as signal.
   */
  public loadGameState(gameState: WritableSignal<GameState>) {
    const storedGameState = localStorage.getItem(storageKeys.gameState);
    if (!storedGameState) return;
    try {
      gameState.set(JSON.parse(storedGameState));
    } catch (ex) {
      console.error('Failed to parse stored game state', ex);
    }

    this.setupLoadedGameState(gameState);
    this.updateGameState(gameState);
  }

  private setupLoadedGameState(gameState: WritableSignal<GameState>) {
    // We need to handle view.cells, as it is reference to either current board or board from history entry.
    if (gameState().view.viewMode === EnViewMode.CurrentBoard) {
      gameState().view.cells = gameState().board.cells;
    } else if (gameState().view.viewMode === EnViewMode.History) {
      gameState().view.cells = gameState().board.history.moves[gameState().view.viewMove].cells;
    }
  }

  /**
   * Save game state to storage.
   * @param gameState Game state data as signal.
   */
  public saveGameState(gameState: WritableSignal<GameState>) {
    localStorage.setItem(storageKeys.gameState, JSON.stringify(gameState()));
  }

  /**
   * Trigger game state update and notifications.
   * NOTE: this update is shallow. gameState() notifiers will trigger, but not any other notifiers,
   * notably cell() in cell.html. You need to properly update any cell that needs updating separately.
   * @param gameState Game state data as signal.
   */
  public updateGameState(gameState: WritableSignal<GameState>) {
    //console.info("updateGameState() called");
    gameState.update(state => ({ // update game state
      ...state, // duplicates state
    }));
  }
}
