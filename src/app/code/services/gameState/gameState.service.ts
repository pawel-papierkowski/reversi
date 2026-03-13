import { Injectable, signal } from '@angular/core';

import type { GameState, GameSettings, DebugSettings, Cell, Player, GameHistory, GameHistoryEntry } from "@/code/data/gameState";
import { createGameState, createGameSettings, createGameStatistics, createCell, createDebugSettingsForDev, createDebugSettingsForProd } from "@/code/data/gameState";
import { EnCellState, EnGameStatus, EnMode, EnPlayerType } from '@/code/data/enums';
import { playerNames, projectProp } from '@/code/data/const';

/** Game state service.
 * Provides convenient functions to handle game state like initialization of game or round.
 */
@Injectable({providedIn: 'root'})
export class GameStateService {
  /** Actual game state. */
  readonly gameState = signal<GameState>(createGameState());
  /** Temporary settings used in main menu options. */
  readonly menuSettings = signal<GameSettings>(createGameSettings());

  /**
   * Resolves player with given index.
   * @param playerIx Player index.
   * @returns Player.
   */
  public getPlayer(playerIx: number) : Player {
    const player = this.gameState().players[playerIx];
    return player;
  }

  /**
   * Resolves current player.
   * @returns Current player.
   */
  public getCurrPlayer() : Player {
    const playerIx = this.gameState().board.currPlayerIx;
    return this.getPlayer(playerIx);
  }

  // //////////////////////////////////////////////////////////////////////////

  /** Use temporary settings as actual settings. */
  public applySettings() {
    this.gameState.update(state => ({
      ...state, // duplicates rest of state
      settings: structuredClone(this.menuSettings()) // make sure we use copy of settings
    }));
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Initializes new game. Must be called after modifying settings, but before actual game starts.
   */
  public initializeGame() {
    // Reset game state that needs to be reset for new game.
    // Note that means settings are untouched, as they are determined before initializing new game.
    this.gameState.update(state => ({
      ...state, // duplicates rest of state
      statistics: createGameStatistics(),
      players: this.generatePlayers(),
      debugSettings: this.generateDebugSettings(),
    }));

    this.initializeRound();
  }

  /** Generate debug settings. Ensures production always has debug turn off. */
  private generateDebugSettings(): DebugSettings {
    const debugMode = projectProp.build === "PROD" ? false : true;
    return debugMode ? createDebugSettingsForDev() : createDebugSettingsForProd();
  }

  //

  /**
   * Initializes new round.
   */
  public initializeRound() {
    const newCells = this.generateCells();

    this.gameState.update(state => ({
      ...state, // duplicates rest of state
      board: {
        status: EnGameStatus.InProgress,
        cells: newCells,
        legalMoves: [],
        currPlayerIx: 0,
        history: this.generateHistory(),
      },
      statistics: {
        ...state.statistics,
        moveCount: 0, // reset stats for current state of board
        player1Score: 2,
        player2Score: 2,
      },
      view: {
        cells: newCells,
      },
    }));
  }

  /**
   * Create board for start of the game with correct size and four pieces already placed.
   * @returns Initial board state.
   */
  private generateCells() : Cell[][] {
    const boardSize = this.gameState().settings.boardSize;
    const cells = this.generateCellsEmpty();
    // Now put starting pieces in middle of board, like in Othello.
    const startIx = boardSize/2 - 1;
    cells[startIx][startIx].state = EnCellState.W;
    cells[startIx+1][startIx].state = EnCellState.B;
    cells[startIx][startIx+1].state = EnCellState.B;
    cells[startIx+1][startIx+1].state = EnCellState.W;
    return cells;
  }

  /**
   * Generate empty board of known size.
   * @returns Empty board state.
   */
  private generateCellsEmpty() : Cell[][] {
    const boardSize = this.gameState().settings.boardSize;
    const cells : Cell[][] = Array.from({ length: boardSize }, () =>
      Array.from({ length: boardSize }, () => createCell())
    );
    return cells;
  }

  /**
   * Generates starting history with one entry (initial state of board).
   * @returns History.
   */
  private generateHistory(): GameHistory {
    const moves: GameHistoryEntry[] = [];
    // first entry in history is always initial state of board before making any moves
    const moveEntry: GameHistoryEntry = {
      playerIx: -1, // indicates no player made move
      move: null,
      cells: this.generateCells(),
    };
    moves.push(moveEntry);
    return {
      moves: moves,
    };
  }

  //

  private usedName : string = '';

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
    if (first) this.usedName = '';
    return {
      type : this.generatePlayerType(first),
      piece: first ? EnCellState.B : EnCellState.W,
      name : this.generatePlayerName(first)
    };
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
        return this.resolveNameSameType(EnPlayerType.Human);
      }
      case EnMode.HumanVsAi: {
        const humanIsFirst = this.gameState().settings.whoFirst === EnPlayerType.Human;
        return (first === humanIsFirst) ?
          this.resolveName(EnPlayerType.Human, '') :
          this.resolveName(EnPlayerType.AI, '');
      }
      case EnMode.AiVsAi: {
        return this.resolveNameSameType(EnPlayerType.AI);
      }
    }
  }

  /**
   * Resolves name of player for given type. Remembers used name.
   * @param playerType Player type.
   * @returns Name of player.
   */
  private resolveNameSameType(playerType: EnPlayerType) {
    // usedName ensures there is no duplicate name for both players if they are same type.
    const name = this.resolveName(playerType, this.usedName);
    this.usedName = name;
    return name;
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
