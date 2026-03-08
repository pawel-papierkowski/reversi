import { environment } from '../../../environments/environment';

import { EnDifficulty, EnAiTactic, EnPlayerType } from '@/code/data/enums';
import type { ProjectProp, DifficultyConfig, GameConfig } from '@/code/data/types';

export const projectProp: ProjectProp = {
  title: "Reversi",
  author: "Paweł Papierkowski",
  dateRange: "2026",
  version: environment.version, // from package.json, defined in environment.ts and related
  build: environment.production ? "PROD" : "DEV",
};

/** Fallback language. */
export const fallbackLang = 'en';

/** Language list. */
export const languages: string[] = [ 'en', 'pl' ];

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
  boardSizes: [4, 6, 8, 10],
};

//

const aiNames = [
  'Clanker',
  'Rustbucket',
  'Glitchface',
  'Beep Boop',
  'Derpy-3000',
  'Malfunctron',
  'Buffering...',
  '404Brain',
  'Lag Machine',
  'Overheater',
];

const humanNames = [
  'Hooman',
  'Paleface',
  'Meatbag',
  'Squishy',
  'Carbon Unit',
  'Monkey Fingers',
  'Wetware',
  'Breather',
  'Fleshpilot',
  'Nerve Clump',
];

export const playerNames: Record<EnPlayerType, string[]> = {
  [EnPlayerType.Human]: humanNames,
  [EnPlayerType.AI]: aiNames,
};

