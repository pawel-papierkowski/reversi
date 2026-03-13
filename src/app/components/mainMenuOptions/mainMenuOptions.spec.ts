import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';

import { selectComboboxOption } from '@/components/basic/comboBox/_tests/comboBox.test-setup';

import { GameStateService } from '@/code/services/gameState/gameState.service';

import { MainMenuOptionsCmp } from './mainMenuOptions';

// Create a mock service to safely observe the settings state
class MockGameStateService {
  // We recreate the signal structure (menuSettings) your component expects
  menuSettings = signal({
    mode: 1,       // EnMode.HumanVsAi
    whoFirst: 0,   // EnPlayerType.Human
    difficulty: 0, // EnDifficulty.Easy
    boardSize: 8   // 8x8 board
  });
}

describe('MainMenuOptions', () => {
  let fixture: ComponentFixture<MainMenuOptionsCmp>;
  let gameStateService: MockGameStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainMenuOptionsCmp,
        TranslateModule.forRoot() // Dummy translation module so TranslatePipe works.
      ],
      providers: [
        // Inject our mock instead of the real service
        { provide: GameStateService, useClass: MockGameStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainMenuOptionsCmp);

    // Grab a reference to the mocked service so we can assert against it later.
    gameStateService = TestBed.inject(GameStateService) as unknown as MockGameStateService;

    fixture.detectChanges(); // Initial DOM render.
  });

  //

  it('should update gameState settings when comboboxes are changed', () => {
    // Act: Simulate a user changing the settings.
    // Index 1 for mode is HumanVsAi.
    selectComboboxOption(fixture, 'cb-mainMenu-mode', 1);
    // Index 1 for whoFirst is AI.
    selectComboboxOption(fixture, 'cb-mainMenu-whoFirst', 1);
    // Index 2 for difficulty is Hard.
    selectComboboxOption(fixture, 'cb-mainMenu-difficulty', 2);
    // The fourth board size in gameConfig.boardSizes is 10.
    selectComboboxOption(fixture, 'cb-mainMenu-boardSize', 3);

    // Assert: Verify the two-way binding correctly mutated our service state
    const currentSettings = gameStateService.menuSettings();

    expect(currentSettings.mode).toBe(1);
    expect(currentSettings.whoFirst).toBe(1);
    expect(currentSettings.difficulty).toBe(2);
    expect(currentSettings.boardSize).toBe(10);
  });

  it('should not be able to update whoFirst if mode is not HumanVsAi', () => {
    // Act: Simulate a user changing the settings.
    // Index 2 for mode is AiVsAi.
    selectComboboxOption(fixture, 'cb-mainMenu-mode', 2);
    // Index 1 for whoFirst is AI.
    selectComboboxOption(fixture, 'cb-mainMenu-whoFirst', 1); // it will fail to change whoFirst as this combobox is disabled

    // Assert: Verify the two-way binding correctly mutated our service state
    const currentSettings = gameStateService.menuSettings();

    expect(currentSettings.mode).toBe(2);
    expect(currentSettings.whoFirst).toBe(0); // not modified
    expect(currentSettings.difficulty).toBe(0); // no attempt to change
    expect(currentSettings.boardSize).toBe(8); // no attempt to change
  });
});
