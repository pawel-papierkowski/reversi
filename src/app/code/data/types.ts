import { EnDifficulty, EnAiTactic, EnScoringType } from '@/code/data/enums';

/** Fundamental project properties. More or less constant. */
export type ProjectProp = {
  title: string;
  author: string;
  dateRange: string;
  version: string;
  build: string;
};

/** Difficulty setup. */
export type DifficultyConfig = {
  diff: EnDifficulty;
  tactic: EnAiTactic;
  maxDepth: number; // maximum depth to go, for miniMax algo
};

/** General configuration of game. */
export type GameConfig = {
  aiWait: number; // how long AI is idling before making move in milliseconds
  boardSizes: number[];
};

// AI

export type BoardStats = {
  empty: number;
  player1Score: number;
  player2Score: number;
  total: number;
}

/** Properties for AI. */
export type AiProp = {
  wait: number; // in milliseconds
  maxScore: number; // value for maximum possible score
  weights: Record<number, number[][]>; // weights for different sizes of board
  weightData: WeightData; // weight values for dynamic weighting
  difficulties: Record<EnDifficulty, DifficultyProp>; // properties for difficulty levels
  customDifficulty: DifficultyProp|null;
};

export type WeightData = {
  friendlyCorner: number; // weight value for friendly corner
};

/** Scoring system. */
export type ScoringSystem = {
  type: EnScoringType; // Type of scoring.
  weight: number; // How important this scoring is.
  threshold: number; // Calculated threshold. -1 means not yet calculated.
};

/** Properties for difficulty. */
export type DifficultyProp = {
  canMiniMax: boolean; // If false, pick move randomly instead of using MiniMax.
  maxDepth: number; // How deep is MiniMax search.
  dynamicWeights: boolean; // If true, AI edits its weights dynamically.
  scoringSystems: ScoringSystem[]; // defines scoring system
};

// OTHER

export type Coordinate = {
  x: number;
  y: number;
};

export type ScoreCoord = {
  x: number;
  y: number;
  s: number; // score
};

export type WeightCoord = {
  x: number;
  y: number;
  w: number; // weight
};
