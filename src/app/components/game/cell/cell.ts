import { Component, input, inject } from '@angular/core';

import { EnCellState, EnPlayerType } from '@/code/data/enums';
import type { Cell } from "@/code/data/gameState";

import { ReversiPieceUnknownCmp } from '@/components/assets/piece/piece-unknown';
import { ReversiPieceCmp } from '@/components/game/piece/piece';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';

@Component({
  selector: 'reversi-board-cell',
  imports: [ReversiPieceUnknownCmp, ReversiPieceCmp],
  templateUrl: './cell.html',
  styleUrl: './cell.css'
})
export class ReversiCellCmp {
  private readonly gameStateService = inject(GameStateService);
  private readonly gameService = inject(GameService);

  public readonly cell = input.required<Cell>();
  public readonly x = input.required<number>();
  public readonly y = input.required<number>();
  public EnCellState = EnCellState;

  //

  /**
   * Provides unique test identificator.
   * @returns Test identificator of cell.
   */
  public cellTestId(): string {
    return `cell-${this.x()}x${this.y()}`;
  }

  /**
   * React to cell click.
   */
  public cellClick() {
    if (!this.canCellClick()) return;
    this.gameService.makeMove(this.x(), this.y());
    //this.gameService.debugSwapPiece(this.x(), this.y());
  }

    /**
   * Check if can make click on cell.
   * @returns True if click is allowed, otherwise false.
   */
  private canCellClick(): boolean {
    // must be human player's turn
    if (this.gameStateService.getCurrPlayer().type !== EnPlayerType.Human) return false;
    return true;
  }

  // DEBUG

  /**
   * Check if can show debug data.
   * @returns True if can show debug data, otherwise false.
   */
  public canShowDebug(): boolean {
    return this.gameStateService.gameState().debugSettings.debugMode;
  }
}
