import { TestBed, ComponentFixture } from '@angular/core/testing';
import { expect } from 'vitest';

import { Provider } from '@angular/core';
import { provideRouter } from '@angular/router';

import { TranslateModule, provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { routes } from './../app.routes';
import { App } from './../app';

import type { GameState } from "@/code/data/gameState";
import { addToHistory } from '@/code/services/gameState/gameState.test-setup';

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
 * Clicks on cell indicated by first move. Moves are provided as string with move sequence using
 * standard grid coordinates.
 * @param gameState Game state.
 * @param playerIx Player index.
 * @param moves String containing moves in standard grid coordinates.
 */
export async function clickOnCellMoves(fixture: ComponentFixture<App>, gameState: GameState, playerIx: number, movesStr: string) {
  const moves: {x:number, y: number}[] = movesStrToMovesCoord(movesStr);
  await clickOnCell(fixture, gameState, playerIx, moves);
}

/**
 * Convert moves as string to moves as array of coordinates.
 * String contains move sequence using standard grid coordinates
 * (columns are a, b, c... and rows are 1, 2, 3...).
 * Example of movesStr: "d5 e3 a1".
 * Expected result: [{3, 4}, {4, 2}, {0, 0}]
 *
 * @param moves String containing moves in standard grid coordinates.
 * @returns Moves as array of coordinates (zero-based).
 */
function movesStrToMovesCoord(movesStr: string): {x:number, y: number}[] {
  if (!movesStr) return [];

  const base = 'a'.charCodeAt(0);
  return movesStr.split(' ').map(move => {
    const x = move.charCodeAt(0) - base;
    const y = parseInt(move.substring(1)) - 1;
    return { x, y };
  });
}

/**
 * Clicks on cell indicated by first move.
 * @param gameState Game state.
 * @param playerIx Player index.
 * @param moves Moves as array of coordinates.
 */
export async function clickOnCell(fixture: ComponentFixture<App>, gameState: GameState, playerIx: number, moves: {x:number, y: number}[]) {
  addToHistory(gameState, playerIx, moves); // for move below

  // Find correct cell and click it.
  const testId = `[data-testid="cell-${moves[0].x}x${moves[0].y}"]`
  const cell = fixture.nativeElement.querySelector(testId) as HTMLButtonElement;
  expect(cell, `Cell ${testId} must exist`).not.toBeNullable();
  cell.click();
  await fixture.whenStable();
}

export async function clickOnPass(fixture: ComponentFixture<App>, gameState: GameState, playerIx: number) {
  addToHistory(gameState, playerIx, []); // pass generates special history entry

  // Find pass move button and click it.
  const passButton = fixture.nativeElement.querySelector('[data-testid="btn-pass"]') as HTMLButtonElement;
  expect(passButton, 'Pass button must exist').not.toBeNullable();
  passButton.click();
  await fixture.whenStable();
}

//

export function assertPassButton(fixture: ComponentFixture<App>, exists: boolean, comment:string) {
  if (exists) {
    const passButton = fixture.nativeElement.querySelector('[data-testid="btn-pass"]') as HTMLButtonElement;
    expect(passButton, 'Pass button must exist for this board state: '+comment).not.toBeNullable(); // make sure it exists
  } else {
    const noPassButton = fixture.nativeElement.querySelector('[data-testid="btn-pass"]') as HTMLButtonElement;
    expect(noPassButton, 'Pass button cannot exist for this board state: '+comment).toBeNullable();
  }
}


