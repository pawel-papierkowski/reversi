import { signal, WritableSignal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { setupTestBed } from './app.test-setup';

import { App } from '../app';

import { GameService } from '@/code/services/game/game.service';
import { GameStateService } from '@/code/services/gameState/gameState.service';

describe('App (routing)', () => {
  let gameService: GameService;
  let gameStateService: GameStateService;

  let fixture: ComponentFixture<App>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    localStorage.clear(); // Reset local storage before every test to avoid pollution.
    vi.clearAllMocks(); // Clear state of mocks.

    fixture = await setupTestBed([
      GameService,
      GameStateService
    ]);

    gameService = TestBed.inject(GameService);
    gameStateService = TestBed.inject(GameStateService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    // Trigger initial navigation to load the '' (MainMenu) route.
    router.initialNavigation();
    await fixture.whenStable(); // ensure everything is fully loaded on page before continuing
    fixture.detectChanges();
  });

  // //////////////////////////////////////////////////////////////////////////
  // Routing.

  it('should redirect to /board when Start Game button is clicked', async () => {
    const isGameOngoingSpy = vi.spyOn(gameService, 'isGameOngoing');
    const applySettingsSpy = vi.spyOn(gameStateService, 'applySettings');
    const initializeGameSpy = vi.spyOn(gameStateService, 'initializeGame');

    // Assert we start on the main menu.
    expect(location.path()).toBe('');

    // Find the primary Start Game button inside the rendered MainMenu and click it.
    const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
    startButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    // Verify Vitest mock functions were called.
    expect(isGameOngoingSpy).toHaveBeenCalled();
    expect(applySettingsSpy).toHaveBeenCalledTimes(1);
    expect(initializeGameSpy).toHaveBeenCalledTimes(1);

    expect(location.path()).toBe('/board'); // Verify the URL changed successfully.
  });

  it('should redirect to main menu if navigating directly to /board without an ongoing game', async () => {
    const isGameOngoingSpy = vi.spyOn(gameService, 'isGameOngoing');
    const applySettingsSpy = vi.spyOn(gameStateService, 'applySettings');
    const initializeGameSpy = vi.spyOn(gameStateService, 'initializeGame');

    await router.navigate(['/board']); // Attempt to navigate directly to the board (simulating URL entry).
    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    // Verify the guard blocked navigation and kept/redirected the user to the main menu.
    expect(location.path()).toBe('');

    // Verify the guard checked the game state and prevented starting new game.
    expect(isGameOngoingSpy).toHaveBeenCalled();
    expect(applySettingsSpy).toHaveBeenCalledTimes(0);
    expect(initializeGameSpy).toHaveBeenCalledTimes(0);

  });

  it('should be in proper state: start game, back to menu, continue game', async () => {
    const isGameOngoingSpy = vi.spyOn(gameService, 'isGameOngoing');
    const applySettingsSpy = vi.spyOn(gameStateService, 'applySettings');
    const initializeGameSpy = vi.spyOn(gameStateService, 'initializeGame');

    // Assert we start on the main menu.
    expect(location.path()).toBe('');

    // Find the "Start Game" button inside the rendered MainMenu component and click it.
    const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
    startButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    expect(location.path()).toBe('/board'); // Verify the URL changed successfully.

    // Find the "Back to menu" button inside the rendered GameScreen component and click it.
    const backToMenuButton = fixture.nativeElement.querySelector('[data-testid="btn-backToMenu"]') as HTMLButtonElement;
    backToMenuButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    expect(location.path()).toBe(''); // Verify the URL changed successfully.

    // "Continue" button should exist now in main menu.
    const continueButton = fixture.nativeElement.querySelector('[data-testid="btn-continue"]') as HTMLButtonElement;
    continueButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    expect(location.path()).toBe('/board'); // Verify the URL changed successfully.

    // Verify Vitest mock functions were called.
    expect(isGameOngoingSpy).toHaveBeenCalled();
    // called only once - continue game should not start new game
    expect(applySettingsSpy).toHaveBeenCalledTimes(1);
    expect(initializeGameSpy).toHaveBeenCalledTimes(1);
  });
});
