import { Component, input } from '@angular/core';

import type { Cell } from "@/code/data/gameState";

import { ReversiPieceUnknown } from '@/components/game/piece/piece-unknown';
import { ReversiPieceWhite } from '@/components/game/piece/piece-white';
import { ReversiPieceBlack } from '@/components/game/piece/piece-black';

@Component({
  selector: 'reversi-board-cell',
  imports: [ReversiPieceUnknown, ReversiPieceWhite, ReversiPieceBlack],
  templateUrl: './cell.html',
  styleUrl: './cell.css'
})
export class ReversiCell {
  readonly cell = input.required<Cell>();
}
