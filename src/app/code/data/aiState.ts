import { EnCellState } from '@/code/data/enums';
import type { Coordinate, ScoringSystem } from "@/code/data/types";
import type { Cell, ReversiMove } from "@/code/data/gameState";

// ////////////////////////////////////////////////////////////////////////////
// AI STATE                                                                  //
// ////////////////////////////////////////////////////////////////////////////



// ////////////////////////////////////////////////////////////////////////////
// MINIMAX STATE                                                             //
// ////////////////////////////////////////////////////////////////////////////

/** MiniMax algorithm request. */
export type MiniMaxReq = {
  playerIx: number; // Index of current player.
  piece: EnCellState; // Start with this piece.
  legalMoves: ReversiMove[]; // Available legal moves.
  cells: Cell[][]; // Cells from Reversi board.
  maxDepth: number; // Maximum depth of search.
  dynamicWeights: boolean; // If true, AI edits its weights dynamically.
  scoringSystems: ScoringSystem[]; // Available scoring systems.
}

/** MiniMax algorithm response. */
export type MiniMaxResp = {
  results: MiniMaxResult[]; // All results, one per each legal move provided.
};

/** Single result. */
export type MiniMaxResult = {
  score: number; // Best score found.
  depth: number; // Depth.
  moves: Coordinate[]; // Moves that lead to this result. Note: {x:-1, y:-1} is pass.
};

export function createMiniMaxResult(): MiniMaxResult {
  return {
    score: 0,
    depth: -1,
    moves: [],
  };
}

/** Arguments for recursive call of MiniMax algorithm. */
export type MiniMaxArgs = {
  playerIx: number; // Index of current player.
  piece: EnCellState; // Piece of current player.
  isYou: boolean; // If true, this is you (so maximizing). Otherwise it is opponent (so minimizing).
  currDepth: number; // Current depth of search.
  maxDepth: number; // Maximum depth of search.
  cells: Cell[][]; // Current board state.
  moves: Coordinate[]; // Moves made so far.
  scoringSystems: ScoringSystem[]; // Available scoring systems.
  scoringSystem: ScoringSystem; // Scoring system to use.
}

/** Arguments for evaluation code. It is subset of MiniMaxArgs. */
export type EvaluateArgs = {
  playerIx: number; // Index of current player.
  piece: EnCellState; // Piece of current player.
  isYou: boolean; // If true, this is you (so maximizing). Otherwise it is opponent (so minimizing).
  cells: Cell[][]; // Current board state.
  scoringSystem: ScoringSystem; // Scoring system to use.
}
