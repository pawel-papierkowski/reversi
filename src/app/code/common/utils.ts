/**
 * Wait some time before continuing.
 * Usage: await delay(1000); // one second
 * @param ms How long delay is supposed to be in milliseconds.
 * @returns Promise.
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
