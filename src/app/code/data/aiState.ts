import { EnCellState } from '@/code/data/enums';
import type { Coordinate } from "@/code/data/types";
import type { Cell, ReversiMove } from "@/code/data/gameState";

// ////////////////////////////////////////////////////////////////////////////
// AI STATE                                                                  //
// ////////////////////////////////////////////////////////////////////////////



// ////////////////////////////////////////////////////////////////////////////
// MINIMAX STATE                                                             //
// ////////////////////////////////////////////////////////////////////////////

/** MiniMax algorithm request. */
export type MiniMaxReq = {
  piece: EnCellState; // start with these pieces
  legalMoves: ReversiMove[]; // available legal moves
  cells: Cell[][]; // cells from Reversi board
  maxDepth: number; // maximum depth of search
  dynamicWeights: boolean; // If true, AI edits its weights dynamically.
  scoringThreshold: number; // 0.0 - 1.0, if board is filled up more than this fraction, use straight scoring instead of weights.
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
  piece: EnCellState; // Piece of current player.
  isYou: boolean; // If true, this is you (so maximizing). Otherwise it is opponent (so minimizing).
  currDepth: number; // Current depth of search.
  maxDepth: number; // Maximum depth of search.
  cells: Cell[][]; // Current board state.
  moves: Coordinate[]; // Moves made so far.
  useWeights: boolean; // If true, use weighted scoring, otherwise use straight scoring.
  scoringThreshold: number; // 0.0 - 1.0, if board is filled up more than this fraction, use straight scoring instead of weights.
}

/** Arguments for evaluation code. */
export type EvaluateArgs = {
  piece: EnCellState; // Piece of current player.
  isYou: boolean; // If true, this is you (so maximizing). Otherwise it is opponent (so minimizing).
  cells: Cell[][]; // Current board state.
  useWeights: boolean; // If true, use weighted scoring, otherwise use straight scoring.
}
