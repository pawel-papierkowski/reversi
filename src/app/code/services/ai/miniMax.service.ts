import { Injectable, inject } from '@angular/core';

import { aiProp } from '@/code/data/const';
import { getOppPiece } from '@/code/data/dirCoord';
import type { Cell, ReversiMove } from "@/code/data/gameState";

import type { MiniMaxReq, MiniMaxResp, MiniMaxResult, MiniMaxArgs } from "@/code/data/aiState";
import { createMiniMaxResult } from "@/code/data/aiState";

import { GameStateService } from '@/code/services/gameState/gameState.service';
import { LegalMoveService } from '@/code/services/legalMove/legalMove.service';
import { EnCellState } from '@/code/data/enums';

/**
 * MiniMax algorithm for Reversi. It is recursive algorithm.
 */
@Injectable({providedIn: 'root'})
export class MiniMaxService {
  private readonly gameStateService = inject(GameStateService);
  private readonly legalMoveService = inject(LegalMoveService);

  /**
   * Resolve best moves for current state of board.
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

    // Sort descending by score. If scores are tied (results in 0), sort ascending by depth.
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
   * @returns
   */
  private executeSearch(req: MiniMaxReq, legalMove: ReversiMove) : MiniMaxResult {
    const otherPiece = getOppPiece(req.piece);
    // Starting data for beginning of recursive chain. This has given legal move already baked in.
    const updatedCells = structuredClone(req.cells);
    // Make move as CURRENT player.
    this.gameStateService.executeMoveCustom(updatedCells, req.piece, legalMove);

    const args: MiniMaxArgs = {
      piece: otherPiece, // go as NEXT player
      isYou: false,
      currDepth: 0,
      maxDepth: req.maxDepth,
      cells: updatedCells,
      moves: [{x: legalMove.x, y: legalMove.y}],
    };
    return this.recursiveMiniMax(args);
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

    // First check states that stops recursive call:
    // neither player can make legal moves for current state of board. That can happen in two cases:
    // - board is completely filled (we do not have to check for it separately)
    // - double pass happened
    // We also stop if we hit max depth.
    let terminalResult : MiniMaxResult | null = null;
    if (currPlayerMoves.length === 0 && nextPlayerMoves.length === 0) {
      terminalResult = {
        score: this.evaluate(args),
        depth: args.currDepth,
        moves: [...args.moves],
      };
    } else if (args.currDepth === args.maxDepth) { // hit max depth
      terminalResult = {
        score: this.evaluate(args),
        depth: args.currDepth,
        moves: [...args.moves],
      };
    }

    if (terminalResult !== null) {
      console.log("Terminal result: ", terminalResult);
      return terminalResult;
    }

    // Handle skip case here.
    if (currPlayerMoves.length === 0) {
      // switch players and continue, if we are here, we know next player must have at least one legal move
      const newArgs: MiniMaxArgs = {
        ...args,
        piece: otherPiece,
        isYou: !args.isYou,
      }
      return this.recursiveMiniMax(newArgs);
    }

    // Now process all legal moves.
    const results : MiniMaxResult[] = [];
    for (const legalMove of currPlayerMoves) {
      args.moves.push({x: legalMove.x, y: legalMove.y}); // Remember that move.

      // We need to clone board, as we cannot easily revert state of cells.
      const updatedCells = structuredClone(args.cells);
      // Make move as CURRENT player.
      this.gameStateService.executeMoveCustom(updatedCells, args.piece, legalMove);

      // Swap to NEXT player and find deeper moves.
      const newArgs: MiniMaxArgs = {
        ...args,
        piece: otherPiece,
        isYou: !args.isYou,
        currDepth: args.currDepth + 1,
        cells: updatedCells, // copy of previous board
        // we persist moves, as we can revert these easily
      }
      const result = this.recursiveMiniMax(newArgs);
      results.push(result);

      args.moves.pop(); // Unmake that move.
    }

    // Find best result.
    const bestResult = this.findBestResult(results, args.isYou, args.currDepth);
    console.log("Best (non-terminal) result: ", bestResult);
    return bestResult;
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

  //

  /**
   * Evaluate state of board and calculate score.
   * @param args Data for evaluation.
   * @returns Summary score for all cells.
   */
  public evaluate(args: MiniMaxArgs): number {
    let score = 0;
    for (let x=0; x<args.cells.length; x++) { // columns
      const row = args.cells[x];
      for (let y=0; y<row.length; y++) { // rows
        const cell = row[y];
        score += this.evaluateCell(x, y, cell, true, args);
      }
    }
    return score;
  }

  /**
   * Evaluates score for single cell.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @param cell Cell data.
   * @param useWeights If true, use weights.
   * @param args Arguments.
   * @returns Score for single cell.
   */
  private evaluateCell(x:number, y: number, cell: Cell, useWeights: boolean, args: MiniMaxArgs): number {
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
    let weight = useWeights ? cell.weight : 1;
    return weight * mul;
  }
}
