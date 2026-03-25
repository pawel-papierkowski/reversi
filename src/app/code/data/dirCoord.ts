import { EnDir, EnCellState } from '@/code/data/enums';

export type DirCoord = {
  dir: EnDir,
  x: number;
  y: number;
};

export function createDirCoord(dir: EnDir, x: number, y: number): DirCoord {
  return {
    dir: dir,
    x: x,
    y: y
  };
}

/**
 * Applies direction to X and Y coordinates.
 * Note YOU are responsible for checking if coordinates went out of bounds.
 * @param dirCoord Original coordinates
 * @returns Updated coordinates.
 */
export function applyDir(dirCoord : DirCoord): DirCoord {
  let newX = dirCoord.x;
  let newY = dirCoord.y;
  if (dirCoord.dir === EnDir.NE || dirCoord.dir === EnDir.E || dirCoord.dir === EnDir.SE)
    newX += 1;
  if (dirCoord.dir === EnDir.SW || dirCoord.dir === EnDir.W || dirCoord.dir === EnDir.NW)
    newX -= 1;
  if (dirCoord.dir === EnDir.SE || dirCoord.dir === EnDir.S || dirCoord.dir === EnDir.SW)
    newY += 1;
  if (dirCoord.dir === EnDir.NW || dirCoord.dir === EnDir.N || dirCoord.dir === EnDir.NE)
    newY -= 1;
  return createDirCoord(dirCoord.dir, newX, newY);
}

export function getOppPiece(state: EnCellState): EnCellState {
  if (state === EnCellState.B) return EnCellState.W;
  if (state === EnCellState.W) return EnCellState.B;
  return state;
}
