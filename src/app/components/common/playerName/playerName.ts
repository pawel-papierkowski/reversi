import { Component, input, computed } from '@angular/core';

import { Player } from '@/code/data/gameState';

import { ReversiPieceCmp } from '@/components/game/piece/piece';

@Component({
  selector: 'app-player-name',
  imports: [ReversiPieceCmp],
  templateUrl: './playerName.html',
  styleUrl: './playerName.css',
})
export class PlayerNameCmp {
  player = input.required<Player>();
  anim = input<boolean>(true); // if false, disable animation
}
