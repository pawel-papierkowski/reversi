import { Injectable, inject } from '@angular/core';

import { aiProp } from '@/code/data/aiConst';
import { getOppPiece } from '@/code/data/dirCoord';
import type { Cell, ReversiMove } from "@/code/data/gameState";

import type { MiniMaxReq, MiniMaxResp, MiniMaxResult, MiniMaxArgs, EvaluateArgs } from "@/code/data/aiState";
import { createMiniMaxResult } from "@/code/data/aiState";

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { EnCellState } from '@/code/data/enums';

/**
 * MiniMax algorithm for Reversi.
 * It is recursive algorithm, though 0 depth is handled separately.
 */
@Injectable({providedIn: 'root'})
export class MiniMaxService {
  private readonly gameStateService = inject(GameStateService);
  private readonly legalMoveService = inject(LegalMoveService);

  /**
   * Check if should use weighted or straight scoring.
   * If amount of filled cells compared to all cells is above threshold, it should use straight scoring.
   * Example: for 8x8 board and threshold 0.8, if amount of filled cells is above 52
   * (so 12 or less empty cells), returns false.
   * @param cells Cells on board.
   * @param scoringThreshold Scoring threshold.
   * @returns True if weighted scoring, otherwise straight scoring.
   */
  public shouldUseWeights(cells: Cell[][], scoringThreshold: number): boolean {
    if (scoringThreshold <= 0) return false; // always straight scoring
    if (scoringThreshold >= 1) return true; // always weighted scoring

    const size = cells.length;
    let nonEmptyCells = 0; // count empty cells
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (cells[x][y].state !== EnCellState.Empty) nonEmptyCells++;
      }
    }
    const totalCells = size*size;
    const thresholdCells = Math.floor(totalCells*scoringThreshold); // round down
    return nonEmptyCells < thresholdCells;
  }

  //

  /**
   * Resolve best moves for current state of board.
   * Note: 0 max depth means we are scoring for every legal move available at this
   * time without going deeper.
   * @param req Request.
   * @returns Response: list of minimax results.
   */
  public resolve(req: MiniMaxReq): MiniMaxResp {
    const response: MiniMaxResp = {results:[]};

    // Resolve for each legal move separately, AI service will pick best(?) one from them.
    for (const legalMove of req.legalMoves) {
      const result = this.executeSearch(req, legalMove);
      response.results.push(result);
    }

    // Sort descending by score. If scores are tied, sort ascending by depth.
    response.results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score; // high score = better
      return a.depth - b.depth; // smaller depth = better
    });
    return response;
  }

  /**
   * Begin evaluating given move.
   * @param req Request.
   * @param legalMove Legal move to evaluate.
   * @returns MiniMax result.
   */
  private executeSearch(req: MiniMaxReq, legalMove: ReversiMove) : MiniMaxResult {
    // Make move as CURRENT player.
    const updatedCells = structuredClone(req.cells);
    this.gameStateService.executeMoveCustom(updatedCells, req.piece, legalMove);

    if (req.maxDepth === 0) {
      // return immediately, evaluating score as CURRENT player
      const evalArgs: EvaluateArgs = {
        piece: req.piece,
        isYou: true,
        cells: updatedCells,
        useWeights: this.shouldUseWeights(req.cells, req.scoringThreshold),
      };
      return {
        score: this.evaluate(evalArgs),
        depth: 0,
        moves: [ {x: legalMove.x, y: legalMove.y} ],
      };
    }

    // Start going deep for real. This is where recursion starts.
    const miniMaxArgs: MiniMaxArgs = {
      piece: getOppPiece(req.piece), // go as NEXT player
      isYou: false,
      currDepth: 0, // yes, that's correct value
      maxDepth: req.maxDepth,
      cells: updatedCells,
      moves: [ {x: legalMove.x, y: legalMove.y} ],
      useWeights: this.shouldUseWeights(updatedCells, req.scoringThreshold),
      scoringThreshold: req.scoringThreshold,
    };
    return this.recursiveMiniMax(miniMaxArgs);
  }

  /**
   * Recursive call for MiniMax algorithm.
   * @param args Arguments.
   * @returns Result.
   */
  private recursiveMiniMax(args: MiniMaxArgs) : MiniMaxResult {
    const otherPiece = getOppPiece(args.piece);

    // Find out legal moves for both players available for current state of board.
    const currPlayerMoves = this.legalMoveService.resolveMovesCustom(args.cells, args.piece);
    const nextPlayerMoves = this.legalMoveService.resolveMovesCustom(args.cells, otherPiece);

    // First check states that stops recursive call (terminal state):
    // - Neither player can make legal moves for current state of board (double pass).
    //   Happens also when board is completely filled, so we do not have to check for it separately.
    // - We also stop if we hit max depth.
    let terminalResult : MiniMaxResult | null = null;
    if ((currPlayerMoves.length === 0 && nextPlayerMoves.length === 0) ||
        (args.currDepth === args.maxDepth)) {
      terminalResult = {
        score: this.evaluate(args),
        depth: args.currDepth,
        moves: [...args.moves],
      };
    }

    if (terminalResult !== null) {
      //console.log("Terminal result: ", terminalResult);
      return terminalResult;
    }

    // Handle skip case here.
    if (currPlayerMoves.length === 0) {
      args.moves.push({x: -1, y: -1}); // Remember pass.
      // Switch players and continue. If we are here, we know next player must have
      // at least one legal move.
      const newArgs = this.createNewArgs(args, otherPiece, args.cells);
      const result = this.recursiveMiniMax(newArgs);
      args.moves.pop(); // Unmake that move.
      return result;
    }

    // Now process all legal moves.
    const results : MiniMaxResult[] = [];
    for (const legalMove of currPlayerMoves) {
      // We persist move history, as we can revert these easily.
      args.moves.push({x: legalMove.x, y: legalMove.y}); // Remember that move.

      // We need to clone board, as we cannot easily revert state of cells.
      const updatedCells = structuredClone(args.cells);
      // Make move as CURRENT player.
      this.gameStateService.executeMoveCustom(updatedCells, args.piece, legalMove);

      // Swap to NEXT player and find deeper moves.
      const newArgs = this.createNewArgs(args, otherPiece, updatedCells);
      const result = this.recursiveMiniMax(newArgs);
      results.push(result);

      args.moves.pop(); // Unmake that move.
    }

    // Find best result.
    const bestResult = this.findBestResult(results, args.isYou, args.currDepth);
    //console.log("Best (non-terminal) result: ", bestResult);
    return bestResult;
  }

  private createNewArgs(args: MiniMaxArgs, otherPiece: EnCellState, cells: Cell[][]): MiniMaxArgs {
    const newArgs: MiniMaxArgs = {
      ...args,
      piece: otherPiece,
      isYou: !args.isYou,
      currDepth: args.currDepth + 1, // we are going even deeper
      cells: cells,
      useWeights: this.shouldUseWeights(cells, args.scoringThreshold),
    }
    return newArgs;
  }

  //

  /**
   * Find best result from array of results.
   * @param results All results from current depth resolved for given state of board.
   * @param isYou If true, this is you (so maximizing). Otherwise it is opponent (so minimizing).
   * @param currDepth Current depth. Starts at 0 and increments for every recursive call.
   * @returns Best result found.
   */
  private findBestResult(results: MiniMaxResult[], isYou: boolean, currDepth: number) : MiniMaxResult {
    let bestResult = createMiniMaxResult();
    bestResult.depth = currDepth;
    bestResult.score = isYou ? -aiProp.maxScore : aiProp.maxScore;

    // Make sure to pick the best result.
    for (const result of results) {
      if (this.isBetterResult(isYou, result, bestResult)) bestResult = result;
    }
    return bestResult;
  }

  /**
   * Check if new result is better than current result.
   * @param newResult New result to check.
   * @param currBestResult Current best result.
   * @param isYou True if maximizing, otherwise it is minimizing.
   * @returns True if given result is better than current best result, otherwise false.
   */
  private isBetterResult(isYou: boolean, newResult: MiniMaxResult, currBestResult: MiniMaxResult): boolean {
    // First, tie logic: we prefer faster wins.
    if (newResult.score === currBestResult.score) {
      if (newResult.depth <= currBestResult.depth) return true;
    }
    // Now different score case.
    return isYou ? newResult.score > currBestResult.score : newResult.score < currBestResult.score;
  }

  // //////////////////////////////////////////////////////////////////////////
  // EVALUATION CODE

  /**
   * Evaluate state of board and calculate score.
   * @param args Data for evaluation.
   * @returns Summary score for all cells.
   */
  public evaluate(args: EvaluateArgs): number {
    const size = args.cells.length;
    let score = 0;
    for (let x=0; x<size; x++) { // columns
      for (let y=0; y<size; y++) { // rows
        const cell = args.cells[x][y];
        score += this.evaluateCell(cell, args);
      }
    }
    return score;
  }

  /**
   * Evaluates score for single cell.
   * @param cell Cell data.
   * @param args Arguments.
   * @returns Score for single cell.
   */
  private evaluateCell(cell: Cell, args: EvaluateArgs): number {
    if (args.useWeights) return this.evaluateCellWeighted(cell, args);
    return this.evaluateCellStraight(cell, args);
  }

  /**
   * Evaluates score for single cell: weighted scoring.
   * @param cell Cell data.
   * @param args Arguments.
   * @returns Score for single cell.
   */
  private evaluateCellWeighted(cell: Cell, args: EvaluateArgs): number {
    let mul = this.findCellMultiplier(cell, args);
    return cell.weight * mul;
  }

  /**
   * Evaluates score for single cell: straight scoring.
   * @param cell Cell data.
   * @param args Arguments.
   * @returns Score for single cell.
   */
  private evaluateCellStraight(cell: Cell, args: EvaluateArgs): number {
    let mul = this.findCellMultiplier(cell, args);
    return mul;
  }

  private findCellMultiplier(cell: Cell, args: EvaluateArgs) {
    let mul = 1;
    switch (cell.state) {
      case EnCellState.B:
        if (args.piece == EnCellState.B && !args.isYou) mul = -1;
        if (args.piece == EnCellState.W && args.isYou) mul = -1;
        break;
      case EnCellState.W:
        if (args.piece == EnCellState.B && args.isYou) mul = -1;
        if (args.piece == EnCellState.W && !args.isYou) mul = -1;
        break;
      default: return 0;
    }
    return mul;
  }
}
