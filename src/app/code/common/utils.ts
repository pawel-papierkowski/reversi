/**
 * Wait some time before continuing.
 * Usage: await delay(1000); // one second
 * @param ms How long delay is supposed to be in milliseconds.
 * @returns Promise.
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert x and y coordinates to unique number that encodes these coordinates.
 * @param x X coordinate.
 * @param y Y coordinate.
 * @param size Size of board.
 * @returns Number representing coordinate.
 */
export function genCoordNum(x: number, y: number, size: number): number {
  return x*size + y;
}
