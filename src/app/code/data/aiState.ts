import { EnCellState } from '@/code/data/enums';
import type { ScoreCoord, ScoringSystem } from "@/code/data/types";
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
  moves: ScoreCoord[]; // Moves that lead to this result. Note: {x:-1, y:-1} is a pass.
  processed: number; // How many board states were processed.
};

/** Arguments for recursive call of MiniMax algorithm. */
export type MiniMaxArgs = {
  playerIx: number; // Index of current player.
  piece: EnCellState; // Piece of current player.
  isYou: boolean; // If true, this is you (so maximizing). Otherwise it is opponent (so minimizing).
  currDepth: number; // Current depth of search.
  maxDepth: number; // Maximum depth of search.
  alpha: number; // Best score the maximizer is currently guaranteed.
  beta: number; // Best score the minimizer is currently guaranteed.
  cells: Cell[][]; // Current board state.
  nonEmptyCells: number; // Count of non-empty cells.
  moves: ScoreCoord[]; // Moves made so far.
  scoringSystems: ScoringSystem[]; // Available scoring systems.
  scoringSystem: ScoringSystem; // Scoring system to use.
}

/** Arguments for evaluation code. It has partially same fields as MiniMaxArgs. */
export type EvaluateArgs = {
  playerIx: number; // Index of current player.
  piece: EnCellState; // Piece of current player.
  isYou: boolean; // If true, this is you (so maximizing). Otherwise it is opponent (so minimizing).
  cells: Cell[][]; // Current board state.
  scoringSystem: ScoringSystem; // Scoring system to use.
  moveCount: number; // Count of available moves.
}
