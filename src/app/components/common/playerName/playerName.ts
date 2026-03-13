import { Component, input, computed } from '@angular/core';

import { Player } from '@/code/data/gameState';
import { ReversiPiece } from '@/components/game/piece/piece';

@Component({
  selector: 'app-player-name',
  imports: [ReversiPiece],
  templateUrl: './playerName.html',
  styleUrl: './playerName.css',
})
export class PlayerName {
  player = input.required<Player>();
  anim = input<boolean>(true); // if false, disable animation

}
