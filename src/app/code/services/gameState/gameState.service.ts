import { Injectable, signal } from '@angular/core';

import { EnCellState, EnGameStatus, EnMode, EnPlayerType, EnDir, EnViewMode } from '@/code/data/enums';
import { playerNames, projectProp, weights } from '@/code/data/const';
import type { DirCoord } from '@/code/data/dirCoord';
import { createDirCoord, applyDir, getOppPiece } from '@/code/data/dirCoord';
import type { GameState, GameSettings, DebugSettings, Cell, Player, ReversiMove, GameHistory, GameHistoryEntry } from "@/code/data/gameState";
import { createGameState, createGameSettings, createGameStatistics, createCell, createDebugSettingsForDev, createDebugSettingsForProd } from "@/code/data/gameState";

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

    this.gameState.update(state => ({
      ...state, // duplicates rest of state
      board: {
        ...state.board, // duplicates rest of board
        currPlayerIx: playerIx === 0 ? 1 : 0,
      }
    }));
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Execute move for current state of board.
   * That means changing state of selected cell and flipping
   * any contiguous line of opposite pieces that touch this piece.
   * @param move Move to execute.
   */
  public executeMove(move: ReversiMove) {
    const cells = this.gameState().board.cells;
    const playerPiece = this.getCurrPlayer().piece;
    return this.executeMoveCustom(cells, playerPiece, move);
  }

  /**
   * Execute move for given board.
   * That means changing state of selected cell and flipping
   * any contiguous line of opposite pieces that touch this piece.
   * @param cells State of board.
   * @param playerPiece Player piece.
   * @param move Move to execute.
   */
  public executeMoveCustom(cells: Cell[][], playerPiece: EnCellState, move: ReversiMove) {
    const oppPlayerPiece = getOppPiece(playerPiece);
    const cell = cells[move.x][move.y];
    this.setCell(cell, playerPiece);

    const potentialMoves = this.resolvePotentialMoves(cells, move.x, move.y, oppPlayerPiece);
    for (let i=0; i<potentialMoves.length; i++) {
      const potentialMove = potentialMoves[i];
      this.tryFlipInDirection(cells, potentialMove, playerPiece, oppPlayerPiece);
    }
  }

  /**
   * Try to flip pieces in given direction for given coordinates.
   * This is done in two phases:
   * - First we trace until we hit another your player piece. If that fails, we abort.
   * - Now we flipp all opposing pieces detected in trace.
   * @param potentialMove Direction and coordinates to use.
   * @param playerPiece Piece of your player.
   * @param oppPlayerPiece Piece of opposing player.
   */
  private tryFlipInDirection(cells: Cell[][], potentialMove: DirCoord, playerPiece: EnCellState, oppPlayerPiece: EnCellState) {
    const opposingPieces: DirCoord[] = this.trace(cells, potentialMove, playerPiece, oppPlayerPiece);
    if (opposingPieces.length === 0) return; // nothing to do in this direction

    for (let i=0; i<opposingPieces.length; i++) { // flip them all
      const opposingPiece = opposingPieces[i];
      const cell = cells[opposingPiece.x][opposingPiece.y];
      cell.state = playerPiece; // most important line of code in game
    }
  }

  /**
   * Set new cell state for given player.
   * @param cell Cell to modify.
   * @param playerPiece Player piece.
   */
  private setCell(cell: Cell, playerPiece: EnCellState) {
    cell.state = playerPiece;
    cell.potentialMove = EnCellState.Empty;
  }

  //

  /**
   * Resolve potential moves around selected cell.
   * Note you will need to cast trace out of them to ensure this potential move is in fact legal move.
   * @param cells State of board.
   * @param x X coordinate of cell.
   * @param y Y coordinate of cell.
   * @param oppPlayerPiece Piece of opposing player.
   * @returns Array of offsets.
   */
  public resolvePotentialMoves(cells: Cell[][], x: number, y: number, oppPlayerPiece: EnCellState): DirCoord[] {
    const potentialMoves : DirCoord[] = [];
    // Find out all directions around given cell.
    // Already exclude coordinates out of range or containing something else than piece of opposite color.
    for (let dir = EnDir.N; dir <= EnDir.NW; dir++) {
      let dirCoord : DirCoord = createDirCoord(dir, x, y);
      dirCoord = applyDir(dirCoord);
      if (this.canUsePotentialMove(cells, dirCoord, oppPlayerPiece)) potentialMoves.push(dirCoord);
    }
    return potentialMoves;
  }

  /**
   * Check if can use coordinates (starting point for tracing) of potential move. Conditions:
   * - X and Y cannot be outside range.
   * - Cell must contain piece for opposing player.
   * @param cells State of board.
   * @param dirCoord Coordinates to use.
   * @param oppPlayerPiece Piece of opposing player.
   * @returns True if can use given coordinates, otherwise false.
   */
  private canUsePotentialMove(cells: Cell[][], dirCoord : DirCoord, oppPlayerPiece: EnCellState) : boolean {
    const size = this.gameState().settings.boardSize;
    if (dirCoord.x < 0 || dirCoord.x >= size) return false;
    if (dirCoord.y < 0 || dirCoord.y >= size) return false;
    const cell = cells[dirCoord.x][dirCoord.y];
    return cell.state === oppPlayerPiece;
  }

  //

  /**
   * Trace from given coordinates in given direction across board until you hit edge or cell that has
   * something else than piece of opposing player. If that cell has your piece, bingo. Move is valid.
   * @param cells State of board.
   * @param dirCoord Coordinates+direction to use.
   * @param playerPiece Piece of your player.
   * @returns Array of coordinates where opposing pieces are present. If empty, this is not legal move.
   */
  public trace(cells: Cell[][], dirCoord: DirCoord, playerPiece: EnCellState, oppPlayerPiece: EnCellState): DirCoord[] {
    const opposingPieces: DirCoord[] = [];
    // we always are one step away from origin point
    //if (cells[dirCoord.x][dirCoord.y].state === oppPlayerPiece)
    opposingPieces.push(structuredClone(dirCoord));

    do {
      dirCoord = applyDir(dirCoord); // move coordinates
      if (!this.hitEdge(dirCoord)) return []; // hit edge of board, can't be valid move
      const cell = cells[dirCoord.x][dirCoord.y];
      if (cell.state !== playerPiece && cell.state !== oppPlayerPiece) return []; // can't be legal move!
      if (cell.state === oppPlayerPiece) {
        // found piece of opposite player, add to array and continue
        opposingPieces.push(structuredClone(dirCoord));
        continue;
      }
      if (cell.state === playerPiece) return opposingPieces; // it is legal move!
    } while (true);
  }

  /**
   * Check if we hit edge of board.
   * @param dirCoord Coordinates.
   * @returns True if edge was hit, otherwise false.
   */
  private hitEdge(dirCoord : DirCoord): boolean {
    const size = this.gameState().settings.boardSize;
    if (dirCoord.x < 0 || dirCoord.x >= size) return false;
    if (dirCoord.y < 0 || dirCoord.y >= size) return false;
    return true;
  }

  // //////////////////////////////////////////////////////////////////////////

  /** Use temporary settings as actual settings. */
  public applySettings() {
    this.gameState.update(state => ({
      ...state, // duplicates rest of state
      settings: structuredClone(this.menuSettings()) // make sure we use copy of settings
    }));
  }

  /**
   * Recalculate score for current board state.
   */
  public recalcScoring() {
    const statistics = this.gameState().statistics;
    const boardSize = this.gameState().settings.boardSize;
    const cells = this.gameState().board.cells;

    statistics.emptyCells = 0; // reset score first
    statistics.player1Score = 0;
    statistics.player2Score = 0;

    // Go over entire board and check every cell.
    for (let x=0; x<boardSize; x++) {
      for (let y=0; y<boardSize; y++) {
        const cell = cells[x][y];
        if (cell.state == EnCellState.B) statistics.player1Score++;
        else if (cell.state == EnCellState.W) statistics.player2Score++;
        else if (cell.state == EnCellState.Empty) statistics.emptyCells++;
      }
    }
  }

  // //////////////////////////////////////////////////////////////////////////

  /**
   * Initializes new game. Must be called after modifying settings, but before actual game starts.
   * You also need to handle some stuff after initialization like legal moves or history entry.
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
    // execute initializeRound() separately after that
  }

  /** Generate debug settings. Ensures production always has debug turn off. */
  private generateDebugSettings(): DebugSettings {
    const debugMode = projectProp.build === "PROD" ? false : true;
    return debugMode ? createDebugSettingsForDev() : createDebugSettingsForProd();
  }

  //

  /**
   * Initializes new round. That involves resetting of most game data.
   */
  public initializeRound() {
    const boardSize = this.gameState().settings.boardSize;
    const newCells = this.generateCells(boardSize);

    this.gameState.update(state => ({
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
        emptyCells: boardSize*boardSize - 4,
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
   * @returns Initial board state.
   */
  private generateCells(boardSize: number) : Cell[][] {
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
    const currentWeights = weights[boardSize];

    const cells : Cell[][] = Array.from({ length: boardSize }, (_, rowIndex) =>
      Array.from({ length: boardSize }, (_, colIndex) => {
        // Lookup the predefined weight, falling back to 0 if the size isn't mapped.
        const weight = currentWeights ? currentWeights[rowIndex][colIndex] : 0;
        return createCell(weight);
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
      const index = Math.floor(Math.random() * names.length);
      foundName = names[index];
    } while (foundName === excludeName);
    return foundName;
  }
}
