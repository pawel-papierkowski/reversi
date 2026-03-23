import { EnDifficulty } from '@/code/data/enums';
import type { AiProp, DifficultyProp } from '@/code/data/types';

// DIFFICULTIES

const difficultyMindless: DifficultyProp = {
  miniMax: false,
  maxDepth: 0, // does not matter on mindless
};

const difficultyEasy: DifficultyProp = {
  miniMax: true,
  maxDepth: 5,
};

const difficultyMedium: DifficultyProp = {
  miniMax: true,
  maxDepth: 7,
};

const difficultyHard: DifficultyProp = {
  miniMax: true,
  maxDepth: 9,
};

/** All difficulties in map. */
const difficulties: Record<EnDifficulty, DifficultyProp> = {
  [EnDifficulty.Mindless]: difficultyMindless,
  [EnDifficulty.Easy]: difficultyEasy,
  [EnDifficulty.Medium]: difficultyMedium,
  [EnDifficulty.Hard]: difficultyHard,
}

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

// PROPERTIES

/** AI properties. */
export const aiProp: AiProp = {
  wait: 700,
  maxScore: 100000,
  weights: weights,
  difficulties: difficulties,
};
