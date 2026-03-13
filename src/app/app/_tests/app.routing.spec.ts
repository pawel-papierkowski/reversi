import { signal, WritableSignal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { setupTestBed } from './app.test-setup';

import { App } from '../app';

import type { GameState, GameSettings, } from "@/code/data/gameState";
import { createGameState, createGameSettings, createPlayer } from "@/code/data/gameState";
import { GameStateService } from '@/code/services/gameState/gameState.service';
import { EnCellState } from '@/code/data/enums';

describe('App (routing)', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let location: Location;

  // Define the mock object using Vitest.
  let mockGameStateService: {
    applySettings: ReturnType<typeof vi.fn>;
    initializeGame: ReturnType<typeof vi.fn>;
    isGameOngoing: ReturnType<typeof vi.fn>;
    getPlayer: ReturnType<typeof vi.fn>;
    getCurrPlayer: ReturnType<typeof vi.fn>;
    gameState: WritableSignal<GameState>;
    menuSettings: WritableSignal<GameSettings>;
  };

  beforeEach(async () => {
    vi.clearAllMocks(); // Clear state of mocks.

    // Initialize Vitest mock functions.
    mockGameStateService = {
      applySettings: vi.fn(),
      initializeGame: vi.fn(),
      isGameOngoing: vi.fn().mockReturnValue(true), // Ensure the guard allows navigation by returning true
      getPlayer: vi.fn().mockReturnValue(createPlayer(EnCellState.B)),
      getCurrPlayer: vi.fn().mockReturnValue(createPlayer(EnCellState.B)),
      gameState: signal<GameState>(createGameState()),
      menuSettings: signal<GameSettings>(createGameSettings()),
    };

    fixture = await setupTestBed([{ provide: GameStateService, useValue: mockGameStateService }]);
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
    // Assert we start on the main menu.
    expect(location.path()).toBe('');

    // Find the primary Start Game button inside the rendered MainMenu and click it.
    const startButton = fixture.nativeElement.querySelector('[data-testid="btn-start"]') as HTMLButtonElement;
    startButton.click();

    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    // Verify Vitest mock functions were called.
    expect(mockGameStateService.isGameOngoing).toHaveBeenCalled();
    expect(mockGameStateService.applySettings).toHaveBeenCalledTimes(1);
    expect(mockGameStateService.initializeGame).toHaveBeenCalledTimes(1);

    expect(location.path()).toBe('/board'); // Verify the URL changed successfully.
  });

  it('should redirect to main menu if navigating directly to /board without an ongoing game', async () => {
    // Override the mock from beforeEach to simulate no active game.
    mockGameStateService.isGameOngoing.mockReturnValue(false);

    await router.navigate(['/board']); // Attempt to navigate directly to the board (simulating URL entry).
    await fixture.whenStable(); // Wait for Angular's async router navigation to finish.

    // Verify the guard blocked navigation and kept/redirected the user to the main menu.
    expect(location.path()).toBe('');

    // Verify the guard checked the game state and prevented starting new game.
    expect(mockGameStateService.isGameOngoing).toHaveBeenCalled();
    expect(mockGameStateService.applySettings).toHaveBeenCalledTimes(0);
    expect(mockGameStateService.initializeGame).toHaveBeenCalledTimes(0);

  });

  it('should be in proper state: start game, back to menu, continue game', async () => {
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
    expect(mockGameStateService.isGameOngoing).toHaveBeenCalled();
    // called only once - continue game should not start new game
    expect(mockGameStateService.applySettings).toHaveBeenCalledTimes(1);
    expect(mockGameStateService.initializeGame).toHaveBeenCalledTimes(1);
  });
});
