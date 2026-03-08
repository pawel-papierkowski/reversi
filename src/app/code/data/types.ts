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
