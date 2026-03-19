import { environment } from '../../../environments/environment';

import { EnDifficulty, EnAiTactic, EnPlayerType } from '@/code/data/enums';
import type { ProjectProp, DifficultyConfig, GameConfig, AiProp } from '@/code/data/types';

// DEBUG CONSTANTS
export const defDebugMode: boolean = true;
export const defDebugHint: boolean = true;

//

/** Project properties. */
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

// AI WEIGHTS

/** Initial weights for 4x4 board. */
const weights4: number[][] = [
  [ 100, -20, -20, 100],
  [ -20, -50, -50, -20],
  [ -20, -50, -50, -20],
  [ 100, -20, -20, 100]
];

/** Initial weights for 6x6 board. */
const weights6: number[][] = [
  [ 100, -20,  10,  10,  -20,  100],
  [ -20, -50,  -2,  -2,  -50,  -20],
  [  10,  -2,  -1,  -1,   -2,   10],
  [  10,  -2,  -1,  -1,   -2,   10],
  [ -20, -50,  -2,  -2,  -50,  -20],
  [ 100, -20,  10,  10,  -20,  100]
];

/** Initial weights for 8x8 board. */
const weights8: number[][] = [
  [ 100, -20,  10,   5,   5,  10, -20,  100],
  [ -20, -50,  -2,  -2,  -2,  -2, -50,  -20],
  [  10,  -2,  -1,  -1,  -1,  -1,  -2,   10],
  [   5,  -2,  -1,   0,   0,  -1,  -2,    5],
  [   5,  -2,  -1,   0,   0,  -1,  -2,    5],
  [  10,  -2,  -1,  -1,  -1,  -1,  -2,   10],
  [ -20, -50,  -2,  -2,  -2,  -2, -50,  -20],
  [ 100, -20,  10,   5,   5,  10, -20,  100]
];

/** Initial weights for 10x10 board. */
const weights10: number[][] = [
  [ 100, -20,  10,   5,   5,   5,   5,  10, -20, 100],
  [ -20, -50,  -2,  -2,  -2,  -2,  -2,  -2, -50, -20],
  [  10,  -2,  -1,  -1,  -1,  -1,  -1,  -1,  -2,  10],
  [   5,  -2,  -1,   0,   0,   0,   0,  -1,  -2,   5],
  [   5,  -2,  -1,   0,   0,   0,   0,  -1,  -2,   5],
  [   5,  -2,  -1,   0,   0,   0,   0,  -1,  -2,   5],
  [   5,  -2,  -1,   0,   0,   0,   0,  -1,  -2,   5],
  [  10,  -2,  -1,  -1,  -1,  -1,  -1,  -1,  -2,  10],
  [ -20, -50,  -2,  -2,  -2,  -2,  -2,  -2, -50, -20],
  [ 100, -20,  10,   5,   5,   5,   5,  10, -20, 100]
];

/** All weights in map. */
export const weights: Record<number, number[][]> = {
  4: weights4,
  6: weights6,
  8: weights8,
  10: weights10,
}

/** AI properties. */
export const aiProp: AiProp = {
  maxScore: 100000,
  weights: weights,
};
