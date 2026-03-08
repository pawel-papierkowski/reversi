import { Injectable, signal } from '@angular/core';

import { GameState, createGameState, Cell, createCell, Player } from "@/code/data/gameState";
import { EnCellState, EnGameStatus, EnMode, EnPlayerType } from '@/code/data/enums';
import { playerNames } from '@/code/data/const';

/** Game state service. */
@Injectable({providedIn: 'root'})
export class GameStateService {
  readonly gameState = signal<GameState>(createGameState());

  /**
   * Check if game is ongoing.
   * @returns True if game is ongoing, otherwise false.
   */
  public isGameOngoing() : boolean {
    return this.gameState().board.status !== EnGameStatus.Pending;
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Initializes board. Must be called after modifyinh settings, but before
   * actual game starts.
   */
  public initializeBoard() {
    this.gameState().board.cells = this.generateCells();
    this.gameState().board.players = this.generatePlayers();
    this.gameState().board.status = EnGameStatus.InProgress;
  }

  //

  private generateCells() : Cell[][] {
    const size = this.gameState().settings.boardSize;
    const cells : Cell[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => createCell())
    );
    // Now put starting pieces in middle of board, like in Othello.
    const start = size/2-1;
    cells[start][start].state = EnCellState.W;
    cells[start+1][start].state = EnCellState.B;
    cells[start][start+1].state = EnCellState.B;
    cells[start+1][start+1].state = EnCellState.W;
    return cells;
  }

  //

  /** Generate all players based on settings.
   * @returns Players.
   */
  private generatePlayers() : Player[] {
    const player1 = this.generatePlayer(true);
    const player2 = this.generatePlayer(false);
    const players : Player[] = [ player1, player2 ];
    return players;
  }

  /**
   * Generate player based on settings.
   * @param first Is this first player?
   * @returns Generated player.
   */
  private generatePlayer(first : boolean) : Player {
    return {
      type : this.generatePlayerType(first),
      name : this.generatePlayerName(first)
    }
  }

  /**
   * Finds out player type based on first and settings.
   * @param first Is this first player?
   * @returns Player type.
   */
  private generatePlayerType(first : boolean) : EnPlayerType {
    switch (this.gameState().settings.mode) {
      case EnMode.HumanVsHuman: return EnPlayerType.Human; // both human
      case EnMode.HumanVsAi: {
        const humanIsFirst = this.gameState().settings.whoFirst === EnPlayerType.Human;
        return (first === humanIsFirst) ? EnPlayerType.Human : EnPlayerType.AI;
      }
      case EnMode.AiVsAi: return EnPlayerType.AI; // both AI
    }
  }

  /**
   * Finds out player name based on first and settings.
   * @param first Is this first player?
   * @returns Player name.
   */
  private generatePlayerName(first : boolean) : string {
    switch (this.gameState().settings.mode) {
      case EnMode.HumanVsHuman: {
        const name1 = this.resolveName(EnPlayerType.Human, '');
        const name2 = this.resolveName(EnPlayerType.Human, name1);
        return first ? name1+' 1' : name2+' 2';
      }
      case EnMode.HumanVsAi: {
        const humanIsFirst = this.gameState().settings.whoFirst === EnPlayerType.Human;
        return (first === humanIsFirst) ?
          this.resolveName(EnPlayerType.Human, '') :
          this.resolveName(EnPlayerType.AI, '');
      }
      case EnMode.AiVsAi: {
        const name1 = this.resolveName(EnPlayerType.AI, '');
        const name2 = this.resolveName(EnPlayerType.AI, name1);
        return first ? name1+' 1' : name2+' 2';
      }
    }
  }

  /**
   * Randomly find one name from the list.
   * @param playerType Player type.
   * @param excludeName Name to exclude. Use empty string if no name to exclude.
   * @returns Found name.
   */
  private resolveName(playerType : EnPlayerType, excludeName : string) : string {
    const names = playerNames[playerType];

    let foundName = '';
    do {
      const index = Math.floor(Math.random() * names.length);
      foundName = names[index];
    } while (foundName === excludeName);
    return foundName;
  }
}
