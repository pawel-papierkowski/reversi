import { Component, input, inject } from '@angular/core';

import { EnCellState } from '@/code/data/enums';
import type { Cell } from "@/code/data/gameState";

import { ReversiPieceUnknownCmp } from '@/components/assets/piece/piece-unknown';
import { ReversiPieceCmp } from '@/components/game/piece/piece';

import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';

@Component({
  selector: 'reversi-board-cell',
  imports: [ReversiPieceUnknownCmp, ReversiPieceCmp],
  templateUrl: './cell.html',
  styleUrl: './cell.css'
})
export class ReversiCellCmp {
  private readonly legalMoveService = inject(LegalMoveService);

  public readonly cell = input.required<Cell>();
  public EnCellState = EnCellState;

  /**
   * React to cell click.
   */
  cellClick() {
    // TODO will allow only cells that are on list of legal moves.
    //if (!this.canClick()) return;

    // TODO for now, flip pieces for debug purposes.
    switch (this.cell().state) {
      case EnCellState.Empty: this.cell().state = EnCellState.B; break;
      case EnCellState.B: this.cell().state = EnCellState.W; break;
      case EnCellState.W: this.cell().state = EnCellState.Empty; break;
      default: break;
    }

    this.legalMoveService.resolve();
    this.legalMoveService.debugShowMoves();
  }

  canClick(): boolean {
    if (this.cell().state === EnCellState.Unknown || this.cell().state === EnCellState.Empty)
      return false;
    return true;
  }
}
