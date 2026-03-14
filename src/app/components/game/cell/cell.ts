import { Component, input, inject } from '@angular/core';

import { EnCellState } from '@/code/data/enums';
import type { Cell } from "@/code/data/gameState";

import { ReversiPieceUnknownCmp } from '@/components/assets/piece/piece-unknown';
import { ReversiPieceCmp } from '@/components/game/piece/piece';

import { GameService } from '@/code/services/game/game.service';

@Component({
  selector: 'reversi-board-cell',
  imports: [ReversiPieceUnknownCmp, ReversiPieceCmp],
  templateUrl: './cell.html',
  styleUrl: './cell.css'
})
export class ReversiCellCmp {
  private readonly gameService = inject(GameService);

  public readonly cell = input.required<Cell>();
  public readonly x = input.required<number>();
  public readonly y = input.required<number>();
  public EnCellState = EnCellState;

  /**
   * React to cell click.
   */
  cellClick() {
    // No worries, makeMove() verifies if move for this cell is legal.
    this.gameService.makeMove(this.x(), this.y());
    //this.gameService.debugSwapPiece(this.cell());
  }
}
