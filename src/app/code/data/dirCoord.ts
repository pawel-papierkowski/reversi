import { EnDir, EnCellState } from '@/code/data/enums';

export type DirCoord = {
  dir: EnDir,
  x: number;
  y: number;
};

// Lookup table.
const dx = [ 0,  1, 1, 1, 0, -1, -1, -1]; // Offsets for N, NE, E, SE, S, SW, W, NW
const dy = [-1, -1, 0, 1, 1,  1,  0, -1];

/**
 * Applies direction to X and Y coordinates.
 * Note YOU are responsible for checking if coordinates went out of bounds.
 * @param dirCoord Coordinates to modify in-place.
 */
export function applyDir(dirCoord : DirCoord) {
  dirCoord.x += dx[dirCoord.dir];
  dirCoord.y += dy[dirCoord.dir];
}

/**
 * Gets value of opposing piece.
 * @param state Piece value.
 * @returns Piece value for opponent.
 */
export function getOppPiece(state: EnCellState): EnCellState {
  return state === EnCellState.B ? EnCellState.W : EnCellState.B;
}
