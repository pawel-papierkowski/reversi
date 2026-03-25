import { environment } from '../../../environments/environment';

import { EnDifficulty, EnAiTactic, EnPlayerType } from '@/code/data/enums';
import type { ProjectProp, DifficultyConfig, GameConfig } from '@/code/data/types';

// DEBUG CONSTANTS
export const defDebugMode: boolean = true;
export const defDebugPanel: boolean = true;
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

/** Storage keys. */
export const storageKeys = {
  gameState: 'reversi.gameState', // complete game state
  menuSettings: 'reversi.menuSettings', // settings from main menu
  language: 'app.language', // currently set language
};

/** Fallback language. */
export const fallbackLang = 'en';

/** Language list. */
export const languages: string[] = [ 'en', 'pl' ];

//

export const gameConfig: GameConfig = {
  aiWait: 700, // in ms, default is 700
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
