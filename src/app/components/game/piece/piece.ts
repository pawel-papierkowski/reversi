import { Component, input, computed } from '@angular/core';

import { EnCellState } from '@/code/data/enums';

import { ReversiPieceWhite } from '@/components/game/piece/piece-white';
import { ReversiPieceBlack } from '@/components/game/piece/piece-black';

@Component({
  selector: 'reversi-piece',
  imports: [ReversiPieceWhite, ReversiPieceBlack],
  templateUrl: './piece.html',
  styleUrl: './piece.css',
  host: {
    // Dynamically add the 'inline-mode' class to the host element if mode is 'inline'
    '[class.inline-mode]': 'mode() === "inline"'
  }
})
export class ReversiPiece {
  state = input.required<EnCellState>();
  anim = input<boolean>(true); // if false, disable animation
  mode = input<'board' | 'inline'>('board'); // Optional input: 'board' (default) or 'inline'.
  
  classes = computed<string[]>(() => {
    const cssClasses: string[] = [];
    cssClasses.push('flipper');
    if (!this.anim()) cssClasses.push('disableAnim');
    return cssClasses;
  });

  // Expose the enum to the template for comparison.
  EnCellState = EnCellState;
}
