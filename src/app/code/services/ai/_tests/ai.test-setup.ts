import { expect } from 'vitest';

import { MiniMaxResp, MiniMaxResult } from '@/code/data/aiState';

/**
 * Assert MiniMax response.
 * @param actualResponse Actual response.
 * @param expectedResponse Expected response.
 */
export function assertMiniMaxResp(actualResponse: MiniMaxResp, expectedResponse: MiniMaxResp) {
  //expect(actualResponse, 'Response should be same').toEqual(expectedResponse);
  expect(actualResponse.results.length, 'Count of result entries should be same').toEqual(expectedResponse.results.length);
  for (let i=0; i<actualResponse.results.length; i++) {
    const actualResult = actualResponse.results[i];
    const expectedResult = expectedResponse.results[i];
    assertMiniMaxResultEntry(i, actualResult, expectedResult);
  }
}

/**
 * Asserts result entry.
 * @param ix Index.
 * @param actualResult Actual result entry.
 * @param expectedResult Expected result entry.
 */
function assertMiniMaxResultEntry(ix: number, actualResult: MiniMaxResult, expectedResult: MiniMaxResult) {
  expect(actualResult, `Response entry [${ix}] should be same`).toEqual(expectedResult);
}
