import { EnDifficulty, EnAiTactic } from '@/code/data/enums';

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
  difficulties: DifficultyConfig[];
  boardSizes: number[];
};

/** Properties for AI. */
export type AiProp = {
  wait: number; // in milliseconds
  maxScore: number; // value for maximum possible score
  weights: Record<number, number[][]>; // weights for different sizes of board
  difficulties: Record<EnDifficulty, DifficultyProp>; // properties for difficulty levels
};

/** Properties for difficulty. */
export type DifficultyProp = {
  miniMax: boolean; // If false, pick move randomly instead of using MiniMax.
  maxDepth: number; // How deep is MiniMax search.
};

// OTHER

export type Coordinate = { x: number; y: number };
