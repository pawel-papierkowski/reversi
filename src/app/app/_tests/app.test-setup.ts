import { TestBed, ComponentFixture } from '@angular/core/testing';
import { expect } from 'vitest';

import { Provider } from '@angular/core';
import { provideRouter } from '@angular/router';

import { TranslateModule, provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { routes } from './../app.routes';
import { App } from './../app';

import type { GameState } from "@/code/data/gameState";

import { DebugService } from '@/code/services/debug/debug.service';

import en from '../../../../public/i18n/en.json';
import pl from '../../../../public/i18n/pl.json';

/**
 * Create test bed for App with mock translation.
 * @param mockProviders Mock providers.
 * @returns Fixture from test bed.
 */
export async function setupTestBed(mockProviders: Provider[] = []) {
  await TestBed.configureTestingModule({
    imports: [
      App,
      TranslateModule.forRoot(), // Dummy translation module so TranslatePipe works.
    ],
    providers: [
      provideRouter(routes),
      ...mockProviders, // Allow specific tests to inject their own mocks.
    ]
  }).compileComponents();

  return TestBed.createComponent(App);
}

//

// Needed so ngx-translate works in unit tests:
// we manually load language files instead of http serving them. Compare to app.config.ts.
class StaticTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const translations: Record<string, any> = { en, pl };
    return of(translations[lang] ?? {});
  }
}

/**
 * Create test bed for App with real translation. Use only when real translations are needed.
 * @param mockProviders Mock providers.
 * @returns Fixture from test bed.
 */
export async function setupTestBedTranslate(mockProviders: Provider[] = []) {
  await TestBed.configureTestingModule({
    imports: [
      App,
    ],
    providers: [
      provideRouter(routes),
      provideTranslateService({ // use real translations
        lang: 'en',
        fallbackLang: 'en',
        loader: { provide: TranslateLoader, useClass: StaticTranslateLoader }
      }),
      ...mockProviders, // Allow specific tests to inject their own mocks.
    ]
  }).compileComponents();

  return TestBed.createComponent(App);
}

// //////////////////////////////////////////////////////////////////////////

export async function startGame(fixture: ComponentFixture<App>) {
  // Find the primary Start Game button inside the rendered MainMenu and click it.
  const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
  expect(startButton, 'Start button must exist').not.toBeNullable();
  startButton.click();
  await fixture.whenStable(); // Wait for Angular's async router navigation to finish.
}

/**
 * Clicks on cell indicated by first move.
 * @param gameState Game state.
 * @param playerIx Player index.
 * @param moves Moves as array of coordinates or grid coordinates.
 */
export async function clickOnCell(debugService: DebugService, fixture: ComponentFixture<App>, gameState: GameState, playerIx: number, movesAny: {x:number, y: number}[]|string) {
  const moves = debugService.addToHistory(gameState, playerIx, movesAny); // for move below

  // Find correct cell and click it.
  const testId = `[data-testid="cell-${moves[0].x}x${moves[0].y}"]`
  const cell = fixture.nativeElement.querySelector(testId) as HTMLButtonElement;
  expect(cell, `Cell ${testId} must exist`).not.toBeNullable();
  cell.click();
  await fixture.whenStable();
}

/**
 * Wait until AI trigger is at desired value.
 * @param fixture Component fixture.
 * @param gameState Game state.
 */
export async function waitForAi(fixture: ComponentFixture<any>, gameState: GameState, desiredAiTrigger: number) {
  // We use a small delay to allow the effect() in GameScreenPage and the async maybeMakeMove() to run.
  const start = Date.now();
  const timeout = 2000; // 2 seconds timeout
  while (gameState.statistics.aiTrigger !== desiredAiTrigger) {
    if (Date.now() - start > timeout) throw new Error('Timeout waiting for AI to move');
    // We need to wait for macrotasks (like setTimeout in delay()) to finish.
    await new Promise(resolve => setTimeout(resolve, 20));
    fixture.detectChanges();
  }
}

export async function clickOnPass(debugService: DebugService, fixture: ComponentFixture<App>, gameState: GameState, playerIx: number) {
  debugService.addToHistory(gameState, playerIx, []); // pass generates special history entry

  // Find pass move button and click it.
  const passButton = fixture.nativeElement.querySelector('[data-testid="btn-pass"]') as HTMLButtonElement;
  expect(passButton, 'Pass button must exist').not.toBeNullable();
  passButton.click();
  await fixture.whenStable();
}

//

/**
 * Assert state of pass button.
 * @param fixture App fixture.
 * @param exists If true, pass button should exist. If false, pass button should not exist.
 * @param comment Comment for error message.
 */
export function assertPassButton(fixture: ComponentFixture<App>, exists: boolean, comment: string) {
  if (exists) {
    const passButton = fixture.nativeElement.querySelector('[data-testid="btn-pass"]') as HTMLButtonElement;
    expect(passButton, 'Pass button must exist for this board state: '+comment).not.toBeNullable(); // make sure it exists
  } else {
    const noPassButton = fixture.nativeElement.querySelector('[data-testid="btn-pass"]') as HTMLButtonElement;
    expect(noPassButton, 'Pass button cannot exist for this board state: '+comment).toBeNullable();
  }
}

/**
 * Assert state of cells in browser window. Verifies if cell is empty, contains black piece or white piece.
 * Format of boardStr:
 * - _: empty cell
 * - B: black piece cell
 * - b: potential move for black
 * - W: white piece cell
 * - w: potential move for white
 * Example of use for 4x4 board:
 * const boardStr = "_b__"+ // expected board state
 *                  "bWB_"+
 *                  "_BWb"+
 *                  "__b_";
 * assertDomBoard(fixture, boardStr, true);
 *
 * @param fixture App fixture.
 * @param boardStr Expected state of board as string.
 * @param testHints If true, test for presence of hints too.
 */
export function assertDomBoard(fixture: ComponentFixture<App>, boardStr: string, testHints: boolean=false, comment:string='') {
  boardStr = boardStr.replace(/\s/g, ''); // remove any whitespace/newlines
  const size = Math.sqrt(boardStr.length);
  if (!Number.isInteger(size)) throw new Error(`Board string length ${boardStr.length} is not a perfect square.`);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const expected = boardStr[y * size + x];
      const cellCoord = `${x}x${y}`;
      const cellTestId = `cell-${cellCoord}`;
      const cell = fixture.nativeElement.querySelector(`[data-testid="${cellTestId}"]`);
      expect(cell, `${comment}: Cell ${cellTestId} must exist`).not.toBeNullable();

      const piece = cell.querySelector('reversi-piece') as HTMLElement | null; // null if cell is empty
      const isHint = checkHint(piece);
      const flipper = piece?.querySelector('.flipper');
      const isBlack = flipper?.classList.contains('flipped'); // white is not flipped, black is flipped

      if (expected === '_') { // Empty cell.
        if (testHints) {
          expect(piece, `${comment}: Cell ${cellCoord} should be completely empty (no piece/hint)`).toBeNullable();
        } else { // ignore hints (treat them as empty cell)
          const hasRealPiece = piece !== null && !isHint;
          expect(hasRealPiece, `${comment}: Cell ${cellCoord} should have no real piece`).toBe(false);
        }
      } else if (expected === 'B') { // Black piece.
        expect(piece, `${comment}: Cell ${cellCoord} should have a piece (B)`).not.toBeNullable();
        expect(isHint, `${comment}: Piece at ${cellCoord} should be real, not a hint`).toBe(false);
        expect(isBlack, `${comment}: Piece at ${cellCoord} should be Black (flipped)`).toBe(true);
      } else if (expected === 'W') { // White piece.
        expect(piece, `${comment}: Cell ${cellCoord} should have a piece (W)`).not.toBeNullable();
        expect(isHint, `${comment}: Piece at ${cellCoord} should be real, not a hint`).toBe(false);
        expect(isBlack, `${comment}: Piece at ${cellCoord} should be White (not flipped)`).toBe(false);
      } else if (expected === 'b') { // Potential move for black.
        expect(piece, `${comment}: Cell ${cellCoord} should have a hint (b)`).not.toBeNullable();
        expect(isHint, `${comment}: Piece at ${cellCoord} should be a hint (low opacity)`).toBe(true);
        expect(isBlack, `${comment}: Hint at ${cellCoord} should be Black (flipped)`).toBe(true);
      } else if (expected === 'w') { // Potential move for white.
        expect(piece, `${comment}: Cell ${cellCoord} should have a hint (w)`).not.toBeNullable();
        expect(isHint, `${comment}: Piece at ${cellCoord} should be a hint (low opacity)`).toBe(true);
        expect(isBlack, `${comment}: Hint at ${cellCoord} should be White (not flipped)`).toBe(false);
      }
    }
  }
}

/**
 * Check if this piece is a hint (potential move).
 * Hints have opacity set to 50 in cell.html using [style.opacity.%]="50".
 * @param piece Piece to check.
 * @returns True if it is hint, otherwise false.
 */
function checkHint(piece: HTMLElement | null): boolean {
  if (piece === null) return false; // no piece, no hint
  const opacity = piece.style.opacity; // we recognize hint by opaqueness
  if (opacity === '1' || opacity === '100%') return false; // not a hint
  return true; // anything that is not fully opaque is hint
}
