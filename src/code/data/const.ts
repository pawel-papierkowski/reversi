import { environment } from '../../environments/environment';
import { EnDifficulty, EnAiTactic } from './enums';
import type { ProjectProp, DifficultyConfig, GameConfig } from './types';

export const projectProp: ProjectProp = {
  title: "Reversi",
  author: "Paweł Papierkowski",
  dateRange: "2026",
  version: environment.version, // from package.json, defined in environment.ts and related
  build: environment.production ? "PROD" : "DEV",
};

//

const difficultyEasy: DifficultyConfig = {
  diff: EnDifficulty.Easy,
  tactic: EnAiTactic.Random,
  maxDepth: -1, // easy difficulty do not use miniMax algo
};

const difficultyMedium: DifficultyConfig = {
  diff: EnDifficulty.Medium,
  tactic: EnAiTactic.MiniMax,
  maxDepth: 3,
};

const difficultyHard: DifficultyConfig = {
  diff: EnDifficulty.Hard,
  tactic: EnAiTactic.MiniMax,
  maxDepth: 5,
};

export const gameConfig: GameConfig = {
  aiWait: 700, // in ms, default is 700
  difficulties: [ difficultyEasy, difficultyMedium, difficultyHard ],
  boardSizes: [4, 5, 6, 7, 8],
};
