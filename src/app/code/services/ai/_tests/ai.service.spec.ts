import { TestBed } from '@angular/core/testing';

import { EnDifficulty, EnMode, EnPlayerType } from '@/code/data/enums';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';
import { AiService } from '@/code/services/ai/ai.service';

/**
 * Important notes:
 * - In unit tests automatic call to AI is disabled. We call AI service manually.
 * - In unit tests we use RNG seed to make sure we get same result every time.
 */
describe('AiService', () => {
  let gameStateService: GameStateService;
  let gameService: GameService;
  let aiService: AiService;

  beforeEach(async () => {
    gameStateService = TestBed.inject(GameStateService);
    gameService = TestBed.inject(GameService);
    aiService = TestBed.inject(AiService);
  });

  //

  describe('basic tests', () => {
    it('first move', () => {
      gameStateService.menuSettings().mode = EnMode.HumanVsAi;
      gameStateService.menuSettings().whoFirst = EnPlayerType.AI;
      gameStateService.menuSettings().difficulty = EnDifficulty.Mindless;
      gameStateService.menuSettings().boardSize = 4; // 4x4
      gameService.startGame();

      aiService.maybeMakeMove();

      // Verify game state after this call.
      // Problem: from 4 available legal moves, one will be picked randomly.
    });
  });

});
