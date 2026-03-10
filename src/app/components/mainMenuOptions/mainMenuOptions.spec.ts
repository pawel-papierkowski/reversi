import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';

import { MainMenuOptions } from './mainMenuOptions';
import { GameStateService } from '@/code/services/gameState.service';

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
  let fixture: ComponentFixture<MainMenuOptions>;
  let gameStateService: MockGameStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainMenuOptions,
        TranslateModule.forRoot() // Dummy translation module so TranslatePipe works.
      ],
      providers: [
        // Inject our mock instead of the real service
        { provide: GameStateService, useClass: MockGameStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainMenuOptions);

    // Grab a reference to the mocked service so we can assert against it later.
    gameStateService = TestBed.inject(GameStateService) as unknown as MockGameStateService;

    fixture.detectChanges(); // Initial DOM render.
  });

  /**
   * Helper function to simulate a user changing a combobox selection.
   * Works with disabled combobox.
   * @param comboboxId The HTML id of the combo-box (e.g., 'mode', 'difficulty')
   * @param optionIndex The 0-based index of the option to click
   */
  function selectComboboxOption(comboboxId: string, optionIndex: number) {
    const compiled = fixture.nativeElement as HTMLElement;
    const combobox = compiled.querySelector(`combo-box#${comboboxId}`) as HTMLElement;

    // Click the selected area to open the dropdown.
    const selectedDiv = combobox.querySelector('.selected') as HTMLElement;
    selectedDiv.click();

    // We MUST trigger change detection here so the @if (isOpen()) evaluates to true
    // and renders the .option elements in the DOM.
    fixture.detectChanges();

    // Find the newly rendered options and click the desired one.
    const options = combobox.querySelectorAll('.option');
    const targetOption = options[optionIndex] as HTMLElement;
    targetOption?.click(); // if combobox is disabled, targetOption will be undefined, just move on

    // Trigger change detection again to update the [(selectedOption)] binding.
    fixture.detectChanges();
  }

  //

  it('should update gameState settings when comboboxes are changed', () => {
    // Act: Simulate a user changing the settings.
    // Index 1 for mode is HumanVsAi.
    selectComboboxOption('mode', 1);
    // Index 1 for whoFirst is AI.
    selectComboboxOption('whoFirst', 1);
    // Index 2 for difficulty is Hard.
    selectComboboxOption('difficulty', 2);
    // The fourth board size in gameConfig.boardSizes is 10.
    selectComboboxOption('boardSize', 3);

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
    selectComboboxOption('mode', 2);
    // Index 1 for whoFirst is AI.
    selectComboboxOption('whoFirst', 1); // it will fail to change whoFirst as this combobox is disabled

    // Assert: Verify the two-way binding correctly mutated our service state
    const currentSettings = gameStateService.menuSettings();

    expect(currentSettings.mode).toBe(2);
    expect(currentSettings.whoFirst).toBe(0); // not modified
    expect(currentSettings.difficulty).toBe(0); // no attempt to change
    expect(currentSettings.boardSize).toBe(8); // no attempt to change
  });
});
