import { Injectable, inject, signal } from '@angular/core';

import { XORShift128Plus } from 'random-seedable';

import { EnCellState, EnGameStatus, EnMode, EnPlayerType, EnViewMode } from '@/code/data/enums';
import type { DifficultyProp, BoardStats } from '@/code/data/types';
import { weights, aiProp } from '@/code/data/aiConst';
import { playerNames, projectProp } from '@/code/data/gameConst';
import type { GameState, GameSettings, GameAi, DebugSettings, Cell, Player, GameHistory, GameHistoryEntry } from "@/code/data/gameState";
import { createGameState, createGameSettings, createGameStatistics, createDebugSettingsForProd } from "@/code/data/gameState";

import { GameStorageService } from '@/code/services/gameStorage/gameStorage.service';

/**
 * Game state service.
 * Provides convenient functions to handle game state like initialization of game or round.
 */
@Injectable({providedIn: 'root'})
export class GameStateService {
  private readonly gameStorageService = inject(GameStorageService);

  /** Actual game state. */
  public readonly gameState = signal<GameState>(createGameState());
  /** Temporary settings used in main menu options. */
  public readonly menuSettings = signal<GameSettings>(createGameSettings());
  /** RNG used in game. Moves with same score will be randomly picked. Also needed for seeding in unit tests. */
  public readonly rng = new XORShift128Plus();

  constructor() {
    this.gameStorageService.loadMenuSettings(this.menuSettings);
    this.gameStorageService.loadGameState(this.gameState);
    // We save menu settings only on game start.
    // We save game state on game start, next round and after every move.
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Resolves player with given index.
   * @param playerIx Player index.
   * @returns Player.
   */
  public getPlayer(playerIx: number) : Player {
    if (playerIx < 0 || playerIx >= this.gameState().players.length) playerIx = 0;
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

  /**
   * Resolves winning player. Note you need to detect tie on your own.
   * @returns Winning player.
   */
  public getWinningPlayer() : Player {
    if (this.gameState().statistics.player1Score > this.gameState().statistics.player2Score)
      return this.getPlayer(0);
    return this.getPlayer(1);
  }

  /** Change current player. There are only two players in Reversi. */
  public changePlayer() {
    const playerIx = this.gameState().board.currPlayerIx;
    this.gameState().board.currPlayerIx = playerIx === 0 ? 1 : 0;
  }

  // //////////////////////////////////////////////////////////////////////////

  /** Use temporary settings as actual settings. */
  public applySettings() {
    // Note: This is only place we update/save menu settings, that's intentional.
    // So if we change settings on main menu screen (without starting game) and refresh page,
    // these settings will be back to what was before.
    this.gameStorageService.updateMenuSettings(this.menuSettings);
    this.gameStorageService.saveMenuSettings(this.menuSettings);

    this.gameState.update(state => ({ // apply settings
      ...state, // duplicates rest of game state
      settings: structuredClone(this.menuSettings()) // make sure we use copy of settings
    }));
  }

  /**
   * Recalculate score for current board state.
   */
  public recalcScoring() {
    const statistics = this.gameState().statistics;
    const cells = this.gameState().board.cells;

    const stats = this.calcCellStats(cells);
    statistics.emptyCells = stats.empty;
    statistics.player1Score = stats.player1Score;
    statistics.player2Score = stats.player2Score;
  }

  /**
   * Calculate certain statistics about given board.
   * @param cells Board data.
   * @returns Statistics about board.
   */
  public calcCellStats(cells: Cell[][]): BoardStats {
    const size = cells.length;
    const total = size*size;
    let empty = 0;
    let player1Score = 0;
    let player2Score = 0;

    // Go over entire board and check every cell.
    for (let x=0; x<size; x++) {
      for (let y=0; y<size; y++) {
        const cell = cells[x][y];
        if (cell.state == EnCellState.B) player1Score++;
        else if (cell.state == EnCellState.W) player2Score++;
        else if (cell.state == EnCellState.Empty) empty++;
      }
    }
    return { empty: empty, player1Score: player1Score, player2Score: player2Score, total: total };
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Initializes new game. Must be called after modifying settings, but before actual game starts.
   * You also need to handle some stuff after initialization like round-specific things, legal moves or history entry.
   */
  public initializeGame() {
    // Reset game state that needs to be reset for new game.
    // Note that means settings are untouched, as they are determined before initializing new game.
    this.gameState.update(state => ({ // initialize game
      ...state, // duplicates rest of state
      statistics: createGameStatistics(),
      ai: this.generateGameAi(),
      players: this.generatePlayers(),
      debugSettings: this.generateDebugSettings(),
    }));
    // execute initializeRound() separately after that
  }

  /**
   * Generate game AI data.
   * @returns Game AI data.
   */
  private generateGameAi(): GameAi {
    // Difficulty data will be further modified later, like calculating thresholds, so we need copy.
    // We do not want to affect aiProp data.
    const difficulty = structuredClone(this.resolveDifficulty());
    return {
      difficulty: difficulty,
    };
  }

  /**
   * Resolve properties for given difficulty.
   * @returns Difficulty properties.
   */
  protected resolveDifficulty(): DifficultyProp {
    if (aiProp.customDifficulty !== null) return aiProp.customDifficulty;
    return aiProp.difficulties[this.gameState().settings.difficulty];
  }

  /**
   * Generate debug settings. Ensures production always has debug turn off.
   * @returns Debug settings.
   */
  private generateDebugSettings(): DebugSettings {
    const debugMode = projectProp.build === "PROD" ? false : true;
    return debugMode ? this.gameState().debugSettings : createDebugSettingsForProd();
  }

  //

  /**
   * Initializes new round. That involves resetting of most game data.
   */
  public initializeRound() {
    const boardSize = this.gameState().settings.boardSize;
    const newCells = this.genCells(boardSize); // same for board and view

    this.gameState.update(state => ({ // initialize round
      ...state, // duplicates rest of state
      board: {
        status: EnGameStatus.InProgress,
        cells: newCells, // yes, common reference
        legalMoves: [],
        doublePass: false,
        currPlayerIx: 0,
        history: this.generateEmptyHistory(), // will add initial entry later
      },
      statistics: {
        ...state.statistics, // rest of statistics (win/tie counts) won't be touched
        round: state.statistics.round+1,
        moveCount: 0, // reset part of stats for start of new round
        emptyCells: boardSize**2 - 4,
        player1Score: 2,
        player2Score: 2,
      },
      view: {
        viewMode: EnViewMode.CurrentBoard,
        viewMove: -1,
        cells: newCells, // yes, common reference
      },
    }));
  }

  /**
   * Create board for start of the game with correct size and four pieces already placed.
   * @param boardSize Size of board.
   * @returns Initial board state.
   */
  private genCells(boardSize: number) : Cell[][] {
    const cells = this.genCellsEmpty(boardSize);
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
   * @param boardSize Size of board.
   * @returns 2D array of cells.
   */
  public genCellsEmpty(boardSize: number) : Cell[][] {
    const currentWeights = weights[boardSize];

    const cells : Cell[][] = Array.from({ length: boardSize }, (_, x) =>
      Array.from({ length: boardSize }, (_, y) => {
        // Lookup the predefined weight, falling back to 0 if the size isn't mapped.
        const weightVal = currentWeights ? currentWeights[x][y] : 0;
        return {
          state: EnCellState.Empty,
          potentialMove: EnCellState.Empty,
          weight1: weightVal,
          weight2: weightVal,
        };
      })
    );
    return cells;
  }

  /**
   * Generates empty history.
   * @returns History.
   */
  private generateEmptyHistory(): GameHistory {
    const moves: GameHistoryEntry[] = [];
    return {
      moves: moves,
    };
  }

  //

  private usedName : string = '';

  /**
   * Generate all players based on settings.
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
      ix: first ? 0 : 1,
      type: this.generatePlayerType(first),
      piece: first ? EnCellState.B : EnCellState.W,
      name: this.generatePlayerName(first)
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
      foundName = this.rng.choice(names);
    } while (foundName === excludeName);
    return foundName;
  }
}
