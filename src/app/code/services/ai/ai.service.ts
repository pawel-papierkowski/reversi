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

    const p1 = delay(aiProp.wait); // for visual effect
    const p2 = this.makeMove(); // may take some time
    // if p2 finishes quickly, we still wait for p1 so AI move takes some time visually
    await Promise.all([p1, p2]);
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
    console.info("AI should make move NOW");

    let move: Coordinate|null = null;
    if (aiProp.difficulties[this.gameStateService.gameState().settings.difficulty].miniMax)
      move = this.findMoveMiniMax();
    else move = this.findMoveRandom();

    if (move === null) return;

    if (move.x === -1 && move.y === -1) this.gameService.passMove();
    else this.gameService.makeMove(move.x, move.y); // AI player makes move
  }

  /**
   * Pick random move from all availalble legal moves.
   * @returns Move coordinates or null if no move possible.
   */
  private findMoveRandom(): Coordinate|null {
    const moveCount = this.gameStateService.gameState().board.legalMoves.length;
    if (moveCount === 0) return null;

    const ix = Math.floor(Math.random() * moveCount);
    const legalMove = this.gameStateService.gameState().board.legalMoves[ix];
    return {x: legalMove.x, y: legalMove.y};
  }

  /**
   * Pick scored move from all availalble legal moves using MiniMax algorithm.
   * @returns Move coordinates or null if no move possible.
   */
  private findMoveMiniMax(): Coordinate|null {
    const req: MiniMaxReq = {
      piece: this.gameStateService.getCurrPlayer().piece,
      maxDepth: aiProp.difficulties[this.gameStateService.gameState().settings.difficulty].maxDepth,
      legalMoves: this.gameStateService.gameState().board.legalMoves,
      cells: this.gameStateService.gameState().board.cells,
      // TODO additional options later
    }
    const resp = this.miniMaxService.resolve(req); // this might be costly call
    return this.pickMove(resp.results);
  }

  /**
   * Pick best move using score information provided by MiniMax algorithm.
   * @param results All results from MiniMax algorithm.
   * @returns Move coordinates or null if no move possible.
   */
  private pickMove(results: MiniMaxResult[]): Coordinate|null {
    if (results.length === 0) return null;
    // If there are multiple results with same highest score, randomly pick one of them.
    const bestResults = this.resolveBestResults(results);
    const ix = Math.floor(Math.random() * bestResults.length);
    return results[ix].moves[0]; // always first move from result
  }

  /**
   * Returns array of results that have same score as top score.
   * @param results Array of all results.
   * @returns Array of best results.
   */
  private resolveBestResults(results: MiniMaxResult[]): MiniMaxResult[] {
    if (results.length <= 1) return results;
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
