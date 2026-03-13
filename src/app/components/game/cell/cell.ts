import { Component, input } from '@angular/core';

import type { Cell } from "@/code/data/gameState";

import { ReversiPieceUnknown } from '@/components/assets/piece/piece-unknown';
import { ReversiPiece } from '@/components/game/piece/piece';
import { EnCellState } from '@/code/data/enums';

@Component({
  selector: 'reversi-board-cell',
  imports: [ReversiPieceUnknown, ReversiPiece],
  templateUrl: './cell.html',
  styleUrl: './cell.css'
})
export class ReversiCell {
  readonly cell = input.required<Cell>();

  /**
   * React to cell click.
   */
  cellClick() {
    // TODO will allow only cells that are on list of legal moves.
    if (!this.canClick()) return;

    // TODO for now, flip piece for debug purposes.
    this.cell().state = this.cell().state === EnCellState.B ? EnCellState.W : EnCellState.B;
  }

  canClick(): boolean {
    if (this.cell().state === EnCellState.Unknown || this.cell().state === EnCellState.Empty)
      return false;
    return true;
  }
}
