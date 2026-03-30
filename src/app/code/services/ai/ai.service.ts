import { Injectable, inject } from '@angular/core';

import { EnPlayerType, EnGameStatus } from '@/code/data/enums';
import { aiProp } from '@/code/data/aiConst';
import type { Coordinate } from "@/code/data/types";
import { delay } from '@/code/common/utils';
import { MiniMaxReq, MiniMaxResult } from '@/code/data/aiState';

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { GameService } from '@/code/services/game/game.service';
import { MiniMaxService } from '@/code/services/ai/miniMax.service';

/**
 * Handling AI for Reversi.
 */
@Injectable({providedIn: 'root'})
export class AiService {
  private readonly gameStateService = inject(GameStateService);
  private readonly gameService = inject(GameService);
  private readonly miniMaxService = inject(MiniMaxService);

  /**
   * Check if AI can make move and if so, do it.
   */
  public async maybeMakeMove() {
    if (!this.canMakeMove()) return;

    // NOTE: Promise.all() does not work as intended. When makeMove() executes, board state is updated
    // as soon as possible.
    // Delay still occurs, but it is not visible, as browser screen is updated as soon as board state
    // is updated. Bruh.
    // Proper solution would require redesign of how game works from scratch. Mainly more clean split
    // between internal state of game and externally visible data on screen.
    // Something to keep in mind for next time.
    await delay(aiProp.wait); // for visual effect
    await this.makeMove();
  }

  /**
   * Check if AI can make move.
   * @returns True if can make move, otherwise false.
   */
  private canMakeMove(): boolean {
    if (this.gameStateService.gameState().board.status !== EnGameStatus.InProgress) return false;
    if (this.gameStateService.getCurrPlayer().type !== EnPlayerType.AI) return false;
    return true;
  }

  // //////////////////////////////////////////////////////////////////////////

  /** Actually make move. */
  private async makeMove() {
    let move = this.findMove();
    if (move === null) this.gameService.passMove();
    else this.gameService.makeMove(move.x, move.y); // AI player makes move
  }

  /**
   * Find single move from available legal moves.
   * @returns Found move or null if no move exist.
   */
  private findMove(): Coordinate|null {
    // No moves available.
    if (this.gameStateService.gameState().board.legalMoves.length === 0) return null;

    // Only one move available.
    if (this.gameStateService.gameState().board.legalMoves.length === 1)
      return this.gameStateService.gameState().board.legalMoves[0];

    // Can we use MiniMax to determine which move to use?
    if (this.gameStateService.gameState().ai.difficulty.canMiniMax) return this.findMoveMiniMax();

    // Well, if all else fails, we just pick move randomly...
    return this.findMoveRandom();
  }

  /**
   * Pick random move from all availalble legal moves.
   * @returns Move coordinates.
   */
  private findMoveRandom(): Coordinate {
    const legalMoves = this.gameStateService.gameState().board.legalMoves;
    const legalMove = this.gameStateService.rng.choice(legalMoves);
    return {x: legalMove.x, y: legalMove.y};
  }

  /**
   * Pick scored move from all availalble legal moves using MiniMax algorithm.
   * @returns Move coordinates or null if no move possible.
   */
  private findMoveMiniMax(): Coordinate {
    const diffProp = this.gameStateService.gameState().ai.difficulty;
    const req: MiniMaxReq = {
      playerIx: this.gameStateService.getCurrPlayer().ix,
      piece: this.gameStateService.getCurrPlayer().piece,
      legalMoves: this.gameStateService.gameState().board.legalMoves,
      cells: this.gameStateService.gameState().board.cells,
      maxDepth: diffProp.maxDepth,
      dynamicWeights: diffProp.dynamicWeights,
      scoringSystems: diffProp.scoringSystems,
    }
    const resp = this.miniMaxService.resolve(req); // this might be costly call
    return this.pickMove(resp.results);
  }

  /**
   * Pick best move using score information provided by MiniMax algorithm.
   * @param results All results from MiniMax algorithm.
   * @returns Move coordinates or null if no move possible.
   */
  private pickMove(results: MiniMaxResult[]): Coordinate {
    const bestResults = this.resolveBestResults(results);
    // If there are multiple results with same highest score, randomly pick one of them.
    const bestResult = this.gameStateService.rng.choice(bestResults);
    return bestResult.moves[0]; // always first move from result
  }

  /**
   * Returns array of results that have same top score.
   * @param results Array of all results.
   * @returns Array of best results.
   */
  private resolveBestResults(results: MiniMaxResult[]): MiniMaxResult[] {
    // Note: results are already sorted, highest score first.
    const bestResults: MiniMaxResult[] = [];
    bestResults.push(results[0]); // always at least first one

    let topScore = results[0].score;
    for (let i=1; i<results.length; i++) { // skip first
      const currResult = results[i];
      if (currResult.score === topScore) {
        bestResults.push(currResult);
        continue;
      }
      break; // end immediately if we hit result with lower score
    }
    return bestResults;
  }
}
