import { Component, input, computed } from '@angular/core';

import { EnCellState } from '@/code/data/enums';

import { ReversiPieceWhiteCmp } from '@/components/assets/piece/piece-white';
import { ReversiPieceBlackCmp } from '@/components/assets/piece/piece-black';

@Component({
  selector: 'reversi-piece',
  imports: [ReversiPieceWhiteCmp, ReversiPieceBlackCmp],
  templateUrl: './piece.html',
  styleUrl: './piece.css',
  host: {
    // Dynamically add the 'inline-mode' class to the host element if mode is 'inline'
    '[class.inline-mode]': 'mode() === "inline"',
    // Dynamically set opacity based on attribute.
    '[style.opacity.%]': 'opacity()'
  }
})
export class ReversiPieceCmp {
  state = input.required<EnCellState>();
  anim = input<boolean>(true); // if false, disable animation
  mode = input<'board' | 'inline'>('board'); // Optional input: 'board' (default) or 'inline'.
  opacity = input<number>(100); // by default full opacity

  cssClasses = computed<string[]>(() => {
    const cssClasses: string[] = [];
    cssClasses.push('flipper');
    if (!this.anim()) cssClasses.push('disableAnim');
    return cssClasses;
  });

  // Expose the enum to the template for comparison.
  EnCellState = EnCellState;

  /**
   * Check if piece should be visible.
   * @returns True if visible, otherwise false.
   */
  public visible(): boolean {
    switch (this.state()) {
      case EnCellState.B:
      case EnCellState.W: return true;
      default: return false;
    }
  }
}
